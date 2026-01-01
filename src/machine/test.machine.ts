import { createMachine, assign } from "xstate";

type BookingEvent =
  | { type: "USER_INPUT"; doctor?: string; date?: string; text?: string }
  | { type: "CHECK" };

interface BookingContext {
  doctor: string | null;
  date: string | null;
  response: string | null;
}

export const bookingMachine = createMachine({
  id: "booking",
  initial: "waitingForInput",
  context: {
    doctor: null,
    date: null,
    response: null,
  } as BookingContext,
  states: {
    waitingForInput: {
      on: {
        USER_INPUT: {
          target: "decide",
          actions: assign(({ context, event }) => {
            // Guard against the event type for TS safety
            if (event.type !== "USER_INPUT") return {};
            return {
              doctor: event.doctor ?? context.doctor,
              date: event.date ?? context.date,
            };
          }),
        },
      },
    },

    decide: {
      // Use 'always' to automatically check guards upon entering
      always: [
        { guard: ({ context }) => !context.doctor, target: "askDoctor" },
        { guard: ({ context }) => !context.date, target: "askDate" },
        { target: "confirm" },
      ],
    },

    askDoctor: {
      entry: assign({
        response: "Which doctor do you want?",
      }),
      on: {
        USER_INPUT: {
          target: "decide",
          actions: assign(({ event }) => {
            if (event.type !== "USER_INPUT") return {};
            return {
              doctor: event.text || event.doctor,
            };
          }),
        },
      },
    },

    askDate: {
      entry: assign({
        response: "What date do you want?",
      }),
      on: {
        USER_INPUT: {
          target: "decide",
          actions: assign(({ event }) => {
            if (event.type !== "USER_INPUT") return {};
            return {
              date: event.text || event.date,
            };
          }),
        },
      },
    },

    confirm: {
      entry: assign({
        response: ({ context }) =>
          `Appointment confirmed with ${context.doctor} on ${context.date}`,
      }),
    },
  },
});
