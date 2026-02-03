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
      missingSlots?: string[];
      systemMessages?: string[];
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
          },
        },
        confirmBooking: {
          type: "final",
          entry: assign({
            systemMessages: () => [
              "तपाईंको अपोइन्टमेन्ट सफलतापूर्वक बुक गरिएको छ। धन्यवाद!",
            ],
          }),
        },
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
