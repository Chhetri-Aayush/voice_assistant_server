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

export const dialogueMachine = setup({
  types: {
    context: {} as BookingContext & {
      lastQuery?: string;
      missingSlots: string[];
      systemMessages: string[];
    },
    events: {} as
      | { type: "INTENT_BOOKING"; data: Partial<BookingContext> }
      | { type: "INTENT_CANCEL" }
      | { type: "UPDATE_FIELD"; data: Partial<BookingContext> },
  },
  actors: {
    createBooking: fromPromise(async ({ input }: { input: any }) => {
      return await db.transaction(async (tx) => {
        const [dept] = await tx
          .select()
          .from(departments)
          .where(eq(sql`TRIM(${departments.name})`, input.DEPARTMENT.trim()));
        // const [dept] = await tx
        //   .select()
        //   .from(departments)
        //   .where(eq(departments.name, input.DEPARTMENT));

        if (!dept) throw new Error(`Department ${input.DEPARTMENT} not found`);
        const [doc] = await tx
          .select()
          .from(doctors)
          .where(eq(sql`TRIM(${doctors.name})`, input.PERSON.trim()));

        // const [doc] = await tx
        //   .select()
        //   .from(doctors)
        //   .where(eq(doctors.name, input.PERSON));

        if (!doc) throw new Error(`Doctor ${input.PERSON} not found`);

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

        if (!slot)
          throw new Error("This specific time slot is no longer available.");

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
          // 1. Fetch the most recent active appointment
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
            throw new Error("No active appointment found to cancel.");
          }

          await tx
            .update(timeSlots)
            .set({ status: "available", updatedAt: new Date() })
            .where(eq(timeSlots.id, latest.timeSlotId));

          await tx.insert(cancellations).values({
            appointmentId: latest.id,
            cancelledBy: input.userId,
            // refundStatus: "pending",
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
            const newContext = {
              ID: data.ID || null,
              INTENT: data.INTENT || "BookAppointment",
              TIME: data.TIME || null,
              DATE: data.DATE || null,
              PERSON: data.PERSON || null,
              DEPARTMENT: data.DEPARTMENT || null,
            };
            return {
              ...newContext,
              missingSlots: calculateMissingSlots(newContext),
            };
          }),
        },
        INTENT_CANCEL: {
          target: "cancelAppointment",
          actions: assign(({ event }) => {
            const data = (event as any).data;
            return {
              ID: data?.ID || null,
              INTENT: "CancelAppointment",
            };
          }),
        },
      },
    },

    bookingAppointment: {
      initial: "checkingSlots",
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
                const updatedContext = { ...context, ...event.data };
                const newMissingSlots = calculateMissingSlots(updatedContext);
                console.log("the prevous context is like :", context);
                console.log(
                  "the updated context is like we are in the updated field state and it is :",
                  updatedContext,
                  newMissingSlots,
                );

                return {
                  ...updatedContext,
                  missingSlots: newMissingSlots,
                };
              }),
              target: "checkingSlots",
            },
            // UPDATE_FIELD: {
            //   target: "checkingSlots",
            //   actions: assign(({ event, context }) => {
            //     const updatedContext = { ...context, ...event.data };
            //     return {
            //       ...updatedContext,
            //       missingSlots: calculateMissingSlots(updatedContext),
            //     };
            //   }),
            // },
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
                  `त्रुटि: ${(event.error as Error).message}`,
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
            UPDATE_FIELD: { target: "checkingSlots" },
          },
        },
      },
    },

    cancelAppointment: {
      initial: "executing",
      states: {
        executing: {
          invoke: {
            src: "cancelRecentBooking",
            // Pass the user ID from context to find their latest booking
            input: ({ context }) => ({ userId: context.ID! }),
            onDone: {
              target: "confirmed",
            },
            onError: {
              target: "failed",
              actions: assign({
                systemMessages: ({ event }) => [
                  `त्रुटि: ${(event.error as Error).message}`,
                ],
              }),
            },
          },
        },
        confirmed: {
          type: "final",
          entry: assign({
            systemMessages: () => [
              "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक रद्द गरिएको छ। समय फेरि उपलब्ध छ।",
            ],
          }),
        },
        failed: {
          on: {
            // Allow them to try again if needed
            INTENT_CANCEL: { target: "executing" },
          },
        },
      },
    },
    // cancelAppointment: {
    //   entry: assign({
    //     systemMessages: () => [
    //       "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक रद्द गरिएको छ।",
    //     ],
    //   }),
    // },
  },
});
