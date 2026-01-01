import { assign, createMachine, fromPromise, createActor } from "xstate";

async function delay(ms: number, errorProbability: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorProbability) {
        reject({ type: "ServiceNotAvailable" });
      } else {
        resolve();
      }
    }, ms);
  });
}

// Custom retry logic without Cockatiel
async function executeWithRetry(
  operation: () => Promise<void>,
  maxAttempts: number = 10,
  delayMs: number = 3000,
): Promise<void> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await operation();
      return; // Success - exit the function
    } catch (error: any) {
      lastError = error;

      // Check if it's the type of error we want to retry
      if (error.type !== "ServiceNotAvailable") {
        throw error; // Non-retryable error
      }

      console.log("Retrying...", { attempt, error });

      // If not the last attempt, wait before retrying
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // If we get here, all attempts failed
  throw lastError;
}

// https://github.com/serverlessworkflow/specification/blob/main/examples/README.md#New-Patient-Onboarding
export const workflow = createMachine(
  {
    id: "patientonboarding",
    types: {} as {
      events: { type: "NewPatientEvent"; name: string; condition: string };
      context: {
        patient: {
          name: string;
          condition: string;
        } | null;
      };
    },
    initial: "Idle",
    context: {
      patient: null,
    },
    states: {
      Idle: {
        on: {
          NewPatientEvent: {
            target: "Onboard",
            actions: assign({
              patient: ({ event }) => ({
                name: event.name,
                condition: event.condition,
              }),
            }),
          },
        },
      },
      Onboard: {
        initial: "StorePatient",
        states: {
          StorePatient: {
            invoke: {
              src: "StoreNewPatientInfo",
              input: ({ context }) => context.patient,
              onDone: {
                target: "AssignDoctor",
              },
              onError: {
                target: "#End",
              },
            },
          },
          AssignDoctor: {
            invoke: {
              src: "AssignDoctor",
              onDone: {
                target: "ScheduleAppt",
              },
              onError: {
                target: "#End",
              },
            },
          },
          ScheduleAppt: {
            invoke: {
              src: "ScheduleAppt",
              onDone: {
                target: "Done",
              },
              onError: {
                target: "#End",
              },
            },
          },
          Done: {
            type: "final",
          },
        },
        onDone: {
          target: "End",
          actions: assign({
            patient: null,
          }),
        },
      },
      End: {
        id: "End",
        type: "final",
      },
    },
  },
  {
    actors: {
      StoreNewPatientInfo: fromPromise(async ({ input }) => {
        console.log("Starting StoreNewPatientInfo", input);
        await executeWithRetry(() => delay(1000, 0.5));
        console.log("Completed StoreNewPatientInfo");
      }),
      AssignDoctor: fromPromise(async () => {
        console.log("Starting AssignDoctor");
        await executeWithRetry(() => delay(1000, 0.5));
        console.log("Completed AssignDoctor");
      }),
      ScheduleAppt: fromPromise(async () => {
        console.log("Starting ScheduleAppt");
        await executeWithRetry(() => delay(1000, 0.5));
        console.log("Completed ScheduleAppt");
      }),
    },
  },
);

const actor = createActor(workflow);

actor.subscribe({
  complete() {
    console.log("workflow completed", actor.getSnapshot().output);
  },
});

actor.start();

actor.send({
  type: "NewPatientEvent",
  name: "John Doe",
  condition: "Broken Arm",
});
