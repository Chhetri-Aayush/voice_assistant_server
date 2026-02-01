// import { createMachine, setup } from "xstate";

// const dialogueMachine = setup({
//   types: {
//     context: {} as { },
//     events: {} as { type: "booking" },
//   },
//   actions: {},
//   actors: {},
//   guards: {},
// }).createMachine({
//   initial: "idle",
//   context: { name: "ram" },
//   states: {
//     sate1: {},
//     sate2: {},
//     state3: {},
//   },
// });

import { createMachine, assign, setup } from "xstate";
import { BookingContext } from "@/types/types";
import { calculateMissingSlots } from "@/lib/missingFields";
import { generateMissingFieldMessages } from "@/lib/missingFields";

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
    // | { type: "INTENT_FAQ"; query: string },
  },
}).createMachine({
  id: "dialogueSystem",
  initial: "idle",
  context: {
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
              INTENT: data.INTENT || null,
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
        },
        // INTENT_FAQ: {
        //   target: "faq",
        // },
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
            { target: "confirmBooking" },
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
              target: "checkingSlots",
              actions: assign(({ event, context }) => {
                const updates: Partial<BookingContext> = {};
                (Object.keys(event.data) as Array<keyof BookingContext>).forEach((key) => {
                  if (event.data[key] !== null && event.data[key] !== undefined) {
                    updates[key] = event.data[key];
                  }
                });
                const updatedFields = {
                  ...context,
                  ...event.data,
                };
                return {
                  ...updatedFields,
                  missingSlots: calculateMissingSlots(updatedFields),
                };
              }),
            },
          },
        },
        confirmBooking: { type: "final" },
      },
    },

    cancelAppointment: {
      initial: "askReason",
      states: {
        askReason: {},
      },
    },
    // INTENT_FAQ: {},
  },
});
