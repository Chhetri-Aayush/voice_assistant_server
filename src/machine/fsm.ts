import { createMachine, assign, setup, fromPromise } from "xstate";
import { db } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  appointments,
  doctors,
  departments,
  timeSlots,
  cancellations,
} from "@/db/schema";
import { BookingContext } from "@/types/types";
import {
  calculateMissingSlots,
  generateMissingFieldMessages,
} from "@/lib/missingFields";
import { answerQuery } from "@/lib/rag";

export const dialogueMachine = setup({
  types: {
    context: {} as BookingContext & {
      lastQuery?: string;
      missingSlots: string[];
      systemMessages: string[];
    },

    events: {} as
      | { type: "INTENT_BOOKING"; data: Partial<BookingContext> }
      | { type: "INTENT_CANCEL"; data?: Partial<BookingContext> }
      | { type: "INTENT_FAQ"; query: string }
      // | { type: "INTENT_FAQ" }
      | { type: "UPDATE_FIELD"; data: Partial<BookingContext> }
      | { type: "RESUME_BOOKING" }
      // | { type: "RETRY" }
      | { type: "RESCHEDULE_APPOINTMENT"; data: Partial<BookingContext> },
  },

  actors: {
    createBooking: fromPromise(async ({ input }: { input: any }) => {
      return await db.transaction(async (tx) => {
        const [dept] = await tx
          .select()
          .from(departments)
          .where(eq(sql`TRIM(${departments.name})`, input.DEPARTMENT.trim()));
        if (!dept) {
          const doctorDepts = await tx
            .select({ name: departments.name })
            .from(departments)
            .innerJoin(doctors, eq(doctors.departmentId, departments.id))
            .where(eq(sql`TRIM(${doctors.name})`, input.PERSON.trim()));

          if (doctorDepts.length === 0) {
            throw new Error(
              ` डाक्टर ${input.PERSON} कुनै पनि विभागमा दर्ता हुनुहुन्न।`,
            );
          }

          const deptList = doctorDepts.map((d) => d.name).join(", ");
          throw new Error(
            `डाक्टर ${input.PERSON} "${input.DEPARTMENT}" विभागमा हुनुहुन्न। उपलब्ध विभागहरू: ${deptList}`,
          );
        }

        const [doc] = await tx
          .select()
          .from(doctors)
          .where(eq(sql`TRIM(${doctors.name})`, input.PERSON.trim()));

        if (!doc) {
          const deptDoctors = await tx
            .select({ name: doctors.name })
            .from(doctors)
            .where(eq(doctors.departmentId, dept.id));

          if (deptDoctors.length === 0) {
            throw new Error(
              `"${input.DEPARTMENT}" विभागमा कुनै पनि डाक्टर उपलब्ध हुनुहुन्न।`,
            );
          }

          const docList = deptDoctors.map((d) => d.name).join(", ");
          throw new Error(
            `डाक्टर "${input.PERSON}" भेटिनुभएन| "${input.DEPARTMENT}" विभागका उपलब्ध डाक्टरहरू: ${docList}`,
          );
        }

        const [slot] = await tx
          .select()
          .from(timeSlots)
          .where(
            and(
              eq(timeSlots.doctorId, doc.id),
              eq(timeSlots.slotDate, input.DATE),
              eq(timeSlots.slotTime, input.TIME),
              eq(timeSlots.status, "available"),
            ),
          );
        if (!slot) {
          const availableSlots = await tx
            .select({ time: timeSlots.slotTime })
            .from(timeSlots)
            .where(
              and(
                eq(timeSlots.doctorId, doc.id),
                eq(timeSlots.slotDate, input.DATE),
                eq(timeSlots.status, "available"),
              ),
            );

          if (availableSlots.length === 0) {
            throw new Error(
              `${input.DATE} मा डाक्टर ${input.PERSON} को कुनै पनि समय उपलब्ध छैन। कृपया अर्को दिन छनौट गर्नुहोस्।`,
            );
          }

          const timeList = availableSlots.map((s) => s.time).join(", ");
          throw new Error(
            `${input.TIME} मा समय उपलब्ध छैन। उपलब्ध समयहरू: ${timeList}`,
          );
        }

        const [newAppointment] = await tx
          .insert(appointments)
          .values({
            userId: input.ID,
            doctorId: doc.id,
            departmentId: dept.id,
            timeSlotId: slot.id,
            appointmentDate: input.DATE,
            appointmentTime: input.TIME,
            consultationFee: doc.consultationFee,
            status: "booked",
          })
          .returning();

        await tx
          .update(timeSlots)
          .set({ status: "booked" })
          .where(eq(timeSlots.id, slot.id));

        return newAppointment;
      });
    }),

    cancelRecentBooking: fromPromise(
      async ({ input }: { input: { userId: string } }) => {
        return await db.transaction(async (tx) => {
          const [latest] = await tx
            .select()
            .from(appointments)
            .where(
              and(
                eq(appointments.userId, input.userId),
                eq(appointments.status, "booked"),
              ),
            )
            .orderBy(desc(appointments.createdAt))
            .limit(1);

          if (!latest) {
            throw new Error("रद्द गर्नको लागि कुनै सक्रिय अपोइन्टमेन्ट छैन।");
          }

          await tx
            .update(timeSlots)
            .set({ status: "available", updatedAt: new Date() })
            .where(eq(timeSlots.id, latest.timeSlotId));

          await tx.insert(cancellations).values({
            appointmentId: latest.id,
            cancelledBy: input.userId,
          });

          await tx
            .update(appointments)
            .set({
              status: "cancelled",
              updatedAt: new Date(),
            })
            .where(eq(appointments.id, latest.id));

          return { success: true, appointmentId: latest.id };
        });
      },
    ),
    rescheduleBooking: fromPromise(async ({ input }: { input: any }) => {
      return await db.transaction(async (tx) => {
        const [latest] = await tx
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.userId, input.ID),
              eq(appointments.status, "booked"),
            ),
          )
          .orderBy(desc(appointments.createdAt))
          .limit(1);

        if (!latest) {
          throw new Error(
            "तपाईंको कुनै सक्रिय अपोइन्टमेन्ट छैन जुन परिवर्तन गर्न सकियोस्।",
          );
        }

        let doctorId = latest.doctorId;

        if (input.PERSON) {
          const [newDoc] = await tx
            .select()
            .from(doctors)
            .where(eq(sql`TRIM(${doctors.name})`, input.PERSON.trim()));

          if (!newDoc) {
            throw new Error(`डाक्टर "${input.PERSON}" भेटिनुभएन।`);
          }
          doctorId = newDoc.id;
        }

        const targetDate = input.DATE ?? latest.appointmentDate;
        const targetTime = input.TIME ?? latest.appointmentTime;

        const [slot] = await tx
          .select()
          .from(timeSlots)
          .where(
            and(
              eq(timeSlots.doctorId, doctorId),
              eq(timeSlots.slotDate, targetDate),
              eq(timeSlots.slotTime, targetTime),
              eq(timeSlots.status, "available"),
            ),
          );

        if (!slot) {
          const availableSlots = await tx
            .select({ time: timeSlots.slotTime })
            .from(timeSlots)
            .where(
              and(
                eq(timeSlots.doctorId, doctorId),
                eq(timeSlots.slotDate, targetDate),
                eq(timeSlots.status, "available"),
              ),
            );

          if (availableSlots.length === 0) {
            throw new Error(
              `${targetDate} मा यस डाक्टरको कुनै समय उपलब्ध छैन। कृपया अर्को मिति छनौट गर्नुहोस्।`,
            );
          }

          const timeList = availableSlots.map((s) => s.time).join(", ");
          throw new Error(
            `${targetTime} मा समय उपलब्ध छैन। उपलब्ध समयहरू: ${timeList}`,
          );
        }

        await tx
          .update(timeSlots)
          .set({ status: "available", updatedAt: new Date() })
          .where(eq(timeSlots.id, latest.timeSlotId));

        const [updated] = await tx
          .update(appointments)
          .set({
            doctorId,
            timeSlotId: slot.id,
            appointmentDate: targetDate,
            appointmentTime: targetTime,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, latest.id))
          .returning();

        await tx
          .update(timeSlots)
          .set({ status: "booked", updatedAt: new Date() })
          .where(eq(timeSlots.id, slot.id));

        return updated;
      });
    }),
    answerFaq: fromPromise(async ({ input }: { input: { query: string } }) => {
      return await answerQuery(input.query);
    }),
  },
}).createMachine({
  id: "dialogueSystem",
  initial: "idle",

  context: {
    ID: null,
    INTENT: null,
    TIME: null,
    DATE: null,
    PERSON: null,
    DEPARTMENT: null,
    missingSlots: [],
    systemMessages: [],
  },

  states: {
    idle: {
      on: {
        INTENT_BOOKING: {
          target: "bookingAppointment",
          actions: assign(({ event }) => {
            const data = event.data;

            const newCtx = {
              ID: data.ID ?? null,
              INTENT: "BookAppointment",
              TIME: data.TIME ?? null,
              DATE: data.DATE ?? null,
              PERSON: data.PERSON ?? null,
              DEPARTMENT: data.DEPARTMENT ?? null,
            };

            return {
              ...newCtx,
              missingSlots: calculateMissingSlots(newCtx),
            };
          }),
        },

        INTENT_CANCEL: {
          target: "cancelAppointment",
          actions: assign(({ event, context }) => ({
            ...context,
            ID: event.data?.ID ?? context.ID ?? null,
            INTENT: "CancelAppointment",
          })),
        },

        INTENT_FAQ: {
          target: "faq",
          actions: assign({
            lastQuery: ({ event }) => event.query,
          }),
        },

        RESCHEDULE_APPOINTMENT: {
          target: "rescheduleAppointment",

          actions: assign(({ event }) => {
            const data = event.data;

            const newCtx = {
              ID: data.ID ?? null,
              INTENT: data.INTENT ?? null,
              TIME: data.TIME ?? null,
              DATE: data.DATE ?? null,
              PERSON: data.PERSON ?? null,
              DEPARTMENT: data.DEPARTMENT ?? null,
            };

            return {
              ...newCtx,
            };
          }),
        },
      },
    },

    bookingAppointment: {
      initial: "checkingSlots",

      onDone: {
        target: "idle",
        actions: assign({
          INTENT: null,
          TIME: null,
          DATE: null,
          PERSON: null,
          DEPARTMENT: null,
          missingSlots: [],
          // systemMessages: [],
        }),
      },

      on: {
        INTENT_FAQ: { target: "#dialogueSystem.faq" },
      },

      states: {
        checkingSlots: {
          always: [
            {
              target: "askMissingSlots",
              guard: ({ context }) => context.missingSlots.length > 0,
            },
            { target: "confirmingWithDatabase" },
          ],
        },

        askMissingSlots: {
          entry: assign({
            systemMessages: ({ context }) => [
              generateMissingFieldMessages(context.missingSlots[0]),
            ],
          }),

          on: {
            UPDATE_FIELD: {
              actions: assign(({ event, context }) => {
                const updated = { ...context, ...event.data };
                console.log("the prevous context is like :", context);
                console.log(
                  "the updated context is like we are in the updated field state and it is :",
                  updated,
                );
                return {
                  ...updated,
                  missingSlots: calculateMissingSlots(updated),
                };
              }),
              target: "checkingSlots",
            },
          },
        },

        confirmingWithDatabase: {
          invoke: {
            src: "createBooking",
            input: ({ context }) => ({
              ID: context.ID,
              PERSON: context.PERSON,
              DEPARTMENT: context.DEPARTMENT,
              TIME: context.TIME,
              DATE: context.DATE,
            }),
            onDone: {
              target: "bookingSuccess",
            },
            onError: {
              target: "bookingFailed",
              actions: assign({
                systemMessages: ({ event }) => [
                  `${(event.error as Error).message}`,
                ],
              }),
            },
          },
        },

        bookingSuccess: {
          type: "final",
          entry: assign({
            systemMessages: () => [
              "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक बुक गरिएको छ। धन्यवाद!",
            ],
          }),
        },

        bookingFailed: {
          on: {
            UPDATE_FIELD: {
              target: "checkingSlots",
              actions: assign(({ event, context }) => {
                const updated = { ...context, ...event.data };
                return {
                  ...updated,
                  missingSlots: calculateMissingSlots(updated),
                };
              }),
            },
            RETRY: { target: "confirmingWithDatabase" },
          },
        },
      },
    },

    faq: {
      initial: "answering",

      onDone: {
        target: "idle",
        actions: assign({
          INTENT: null,
          TIME: null,
          DATE: null,
          PERSON: null,
          DEPARTMENT: null,
          missingSlots: [],
        }),
      },

      states: {
        answering: {
          entry: assign({ systemMessages: [] }),

          invoke: {
            src: "answerFaq",
            input: ({ context }) => ({
              query: context.lastQuery ?? "",
            }),
            onDone: {
              target: "done",
              actions: assign({
                systemMessages: ({ event }) => [event.output as string],
              }),
            },
            onError: {
              target: "failed",
              actions: assign({
                systemMessages: () => ["माफ गर्नुहोस्, जानकारी उपलब्ध छैन।"],
              }),
            },
          },
        },

        done: {
          type: "final",
        },

        failed: {
          type: "final",
        },
      },
    },

    cancelAppointment: {
      initial: "executing",

      onDone: {
        target: "idle",
        actions: assign({
          INTENT: null,
          TIME: null,
          DATE: null,
          PERSON: null,
          DEPARTMENT: null,
          missingSlots: [],
          // systemMessages: [],
        }),
      },
      on: {
        INTENT_FAQ: { target: "#dialogueSystem.faq" },
      },

      states: {
        executing: {
          invoke: {
            src: "cancelRecentBooking",
            input: ({ context }) => ({
              userId: context.ID!,
            }),
            onDone: {
              target: "confirmed",
            },
            onError: {
              target: "failed",
              actions: assign({
                systemMessages: ({ event }) => [
                  `${(event.error as Error).message}`,
                ],
              }),
            },
          },
        },

        confirmed: {
          type: "final",
          entry: assign({
            systemMessages: () => [
              "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक रद्द गरिएको छ।",
            ],
          }),
        },

        failed: {
          on: {
            INTENT_CANCEL: { target: "executing" },
          },
        },
      },
    },

    rescheduleAppointment: {
      initial: "executing",

      onDone: {
        target: "idle",
        actions: assign({
          INTENT: null,
          TIME: null,
          DATE: null,
          PERSON: null,
          DEPARTMENT: null,
          missingSlots: [],
          // systemMessages: [],
        }),
      },

      states: {
        executing: {
          invoke: {
            src: "rescheduleBooking",
            input: ({ context }) => ({
              ID: context.ID,
              DATE: context.DATE,
              TIME: context.TIME,
              PERSON: context.PERSON,
              DEPARTMENT: context.DEPARTMENT,
            }),
            onDone: {
              target: "success",
            },
            onError: {
              target: "failed",
              actions: assign({
                systemMessages: ({ event }) => [
                  `${(event.error as Error).message}`,
                ],
              }),
            },
          },
        },

        success: {
          type: "final",
          entry: assign({
            systemMessages: () => [
              "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक परिवर्तन गरिएको छ।",
            ],
          }),
        },

        failed: {
          on: {
            UPDATE_FIELD: {
              target: "executing",
              actions: assign(({ event, context }) => ({
                ...context,
                ...event.data,
              })),
            },
            RETRY: { target: "executing" },
          },
        },
      },
    },
  },
});
