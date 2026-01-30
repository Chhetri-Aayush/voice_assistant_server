import { entitiesResponse, intentResponse } from "@/lib/modelApi";
// import { handleUserInput } from "@/controller/bookAppoint/handleUserInput";
import { buildBookingContext } from "./normalizeNlu";
import type { Context } from "hono";
import { createActor } from "xstate";
import { dialogueMachine } from "@/machine/fsm";
import { upgradeWebSocket } from "hono/bun";

// export const appointmentController = async (c: Context) => {
// const { text } = await c.req.json();
// return c.json({ "message:": "This is appointment controller" });

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
  return {
    onOpen: (_, ws) => {
      console.log("WebSocket opened");
      // ws.send("Hello from server");
    },
    onMessage: async (event, ws) => {
      const text = event.data;
      const data = JSON.parse(text as string);
      // const nerResponse = await entitiesResponse(text);
      // const intResponse = await intentResponse(text);
      console.log("Got:", event.data);
      console.log("Parsed data:", data);
      // console.log("Role:", data.role);
      // console.log("Content:", data.content);
      // ws.send("Got your message");
    },
    // onMessage: async (event, ws) => {
    //   console.log("Event object:", event);
    //   console.log("Event.data type:", typeof event.data);
    //   console.log("Event.data:", event.data);

    //   try {
    //     const text = String(event.data);
    //     console.log("After String conversion:", text);

    //     const data = JSON.parse(text);
    //     console.log("Parsed successfully:", data);
    //     console.log("Role:", data.role);
    //     console.log("Content:", data.content);
    //   } catch (err) {
    //     console.error("ERROR:", err);
    //     console.error("Stack:", err instanceof Error ? err.stack : "");
    //   }
    // },
    onClose: () => {
      console.log("Closed");
    },
  };
});
