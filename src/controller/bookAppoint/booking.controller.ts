import { buildBookingContext } from "@/controller/bookAppoint/normalizeNlu";
import { entitiesResponse, intentResponse } from "@/lib/modelApi";
import type { Context } from "hono";
import { Actor, createActor } from "xstate";
import { dialogueMachine } from "@/machine/fsm";
import { upgradeWebSocket } from "hono/bun";
import { mac } from "zod";

// export const appointmentController = async (c: Context) => {
// const { text } = await c.req.json();

// const nerResponse = await entitiesResponse(text);
// const intResponse = await intentResponse(text);

// console.log(nerResponse);
// console.log("anohter line");
// console.log(intResponse);

// const normalizedCtx = buildBookingContext(intResponse, nerResponse);
// console.log(normalizedCtx);

// const actor = createActor(dialogueMachine);
// actor.start();

// if (intResponse.intent === "BookAppointment") {
//   actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
// } else if (intResponse.intent === "CancelAppointment") {
//   actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
// }
// else if (intResponse.intent === "faq") {
//   actor.send({ type: "INTENT_FAQ", query: text });
// }

// const snapshot = actor.getSnapshot();

// let chatResponse = "";
// const answer = await handleUserInput(ctx);
// console.log(answer);
// return c.json({ nerResponse, intResponse, normalizedCtx });
// };

export const appointmentController = upgradeWebSocket((c) => {
  let actor: any;
  return {
    onOpen: (_, ws) => {
      actor = createActor(dialogueMachine);
      ws.send(
        JSON.stringify({
          role: "assistant",
          content: "नमस्ते! म तपाईंलाई कसरी सहयोग गर्न सक्छु?",
        }),
      );
      actor.start();
      actor.subscribe((state: any) => {
        // console.log("1-------------------------->");
        console.log(
          "we are in the subscribe of the fsm this will only trigger when the state chantes",
        );
        console.log("FSM State changed:", state.value);
        console.log("FSM Context:", state.context);
        // console.log("fsm state is : ", state);
        // console.log(
        //   "this is the sate nowdeestate.StateNode:",
        //   state._nodes.StateNode,
        // );
        console.log("response is :", state.context.systemMessages[0]);
        ws.send(
          JSON.stringify({
            role: "assistant",
            content: state.context.systemMessages[0] || "फेरि भन्नुहोस् न",
          }),
        );

        // if (state.matches("bookingAppointment.askMissingField")) {
        //   console.log("we are here");
        //   const response = state.context.systemMessages;
        //   console.log("Sending response:", response);
        // ws.send(JSON.stringify({ response }));
        // }

        console.log(
          "we are in the subscribe of the fsm this will only trigger when the state chantes this will stop here tho",
        );
        // console.log("<2--------------------------->");
      });
      // console.log("WebSocket opened");
      // ws.send("Hello from server");
    },
    onMessage: async (event, ws) => {
      // console.log("hye iam in OnMessage in the socket");

      // console.log("<3--------------------------->");
      console.log(
        "we are in the on message of the socket of the fsm this will trigger when the message comes every time ",
      );
      const text = event.data;
      const data = JSON.parse(text as string);

      const nerResponse = await entitiesResponse(data.content);
      const intResponse = await intentResponse(data.content);

      const normalizedCtx = buildBookingContext(intResponse, nerResponse);

      console.log("Normalized Context:", normalizedCtx);
      console.log({ nerResponse, intResponse });

      //after the context is built we dont send it direclty to the state machine first we validate the bookign context like if the department the user has sent is
      // valid or not or if the date the user has sent is valid or not or the time the user has sent is valid or not
      //something like this ....if(!validationcontext(context)) then send some response to the client

      const currentState = actor.getSnapshot();
      const currentStateValue = currentState.value;

      // console.log("we are in the state :", currentStateValue);
      console.log(
        "the state that we are in is ahile kosate is ",
        currentStateValue,
      );

      if (currentStateValue === "idle") {
        // console.log("we are in teh current state one ");
        if (normalizedCtx.INTENT === "BookAppointment") {
          actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
        } else if (normalizedCtx.INTENT === "CancelAppointment") {
          actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
        }
      } else {
        const filteredNormalizedCtx = Object.fromEntries(
          Object.entries(normalizedCtx).filter(
            ([key, value]) => key !== "INTENT" && value !== null,
          ),
        );

        console.log(
          "this is the new filteredNormalized Ctx:",
          filteredNormalizedCtx,
        );
        actor.send({ type: "UPDATE_FIELD", data: filteredNormalizedCtx });
        console.log("this is the data that we will send)");
        console.log("update data :", filteredNormalizedCtx);

        // console.log("<4------------------------->");
        // if (
        //   normalizedCtx.INTENT === "BookAppointment" ||
        //   normalizedCtx.INTENT === "CancelAppointment"
        // ) {
        //   if (intent.intent === "BookAppointment") {
        //     actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
        //   } else {
        //     actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
        //   }
        // } else {
        //   actor.send({ type: "UPDATE_CONTEXT", data: normalizedCtx });
        // }
      }
      console.log(
        "we are out of the on message of the socket and we run out of it tho ",
      );
      // const machineState = actor.getSnapshot();
      // let response = "";
      // if (machineState.matches("bookingAppointment.askMissingField")) {
      // response = machineState.context.systemMessages.slice(-1)[0];
      // response = machineState.context.systemMessages;
      // }

      // console.log("Machine State:", response);
      // ws.send("Got your message");
    },
    onClose: () => {
      console.log("Closed");
    },
  };
});
