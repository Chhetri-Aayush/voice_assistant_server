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

export const dialogueMachine = setup({
  types: {
    context: {} as BookingContext & { lastQuery?: string },
    events: {} as 
      | { type: "INTENT_BOOKING"; data: BookingContext }
      | { type: "INTENT_CANCEL"; data: BookingContext },
      // | { type: "INTENT_FAQ"; query: string },
  },
}).createMachine({
  id: "dialogueSystem",
  initial: "idle",
  context: {
    intent: "none",
    TIME: null,
    DATE: null,
    PERSON: null,
    DEPARTMENT: null,
  },
  states: {
    idle: {
      on: {
        INTENT_BOOKING: {
          target: "bookingApointmet",
          
          actions: assign(({ event }) => ({ ...event.data })),
        },
        INTENT_CANCEL: {
          target: "cancelAppointment",
          actions: assign(({ event }) => ({ ...event.data })),
        },
        INTENT_FAQ: {
          target: "faqFlow",
          actions: assign({ lastQuery: ({ event }) => event.query })
        },
      },
    },

    
    bookingApointmet: {
      initial: "checkingSlots",
      states: {
        checkingSlots: {
          always: [
            { target: "askDepartment", guard: ({ context }) => !context.DEPARTMENT },
            { target: "askDate", guard: ({ context }) => !context.DATE },
            { target: "askTime", guard: ({ context }) => !context.TIME },
            {target: "askPerson", guard: ({ context }) => !context.PERSON },  
            { target: "confirmed" },
          ],
        },
        askDepartment: {  },
        askDate: { },
        confirmed: { type: "final" },
      },
    },

    cancelAppointment: {
      initial: "askReason",
      states: {
        
      }
    },

    // faqFlow: {
    //   entry: () => console.log("Searching knowledge base..."),
    //   after: { 500: "idle" } 
    // }
  },
});