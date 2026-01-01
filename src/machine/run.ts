// run.ts
import { createActor } from "xstate";
import { bookingMachine } from "./test.machine";

const actor = createActor(bookingMachine);

// Log every state change
actor.subscribe((state) => {
  console.log("STATE:", state.value);
  console.log("CONTEXT:", state.context);
  console.log("RESPONSE:", state.context.response);
  console.log("--------------");
});

actor.start();

// Simulate user conversation 👇

// User says nothing useful
actor.send({
  type: "USER_INPUT",
  doctor: null,
  date: null,
});

// FSM decides what to ask
// actor.send({ type: "CHECK" });

// User provides doctor
// actor.send({
//   type: "USER_INPUT",
//   text: "Dr. Strange",
// });
// actor.send({ type: "CHECK" });

// User provides date
// actor.send({
//   type: "USER_INPUT",
//   text: "2025-01-02",
// });
// actor.send({ type: "CHECK" });
