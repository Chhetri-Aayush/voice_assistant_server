import { entitiesResponse, intentResponse } from "@/lib/modelApi";
// import { handleUserInput } from "@/controller/bookAppoint/handleUserInput";
import { buildBookingContext } from "./normalizeNlu";
import type { Context } from "hono";
import { createActor } from "xstate";
import { dialogueMachine } from "@/machine/fsm";

export const appointmentController = async (c: Context) => {
  const { text } = await c.req.json();

  const nerResponse = await entitiesResponse(text);
  const intResponse = await intentResponse(text);

  // console.log(nerResponse);
  // console.log("anohter line");
  // console.log(intResponse);

  const normalizedCtx = buildBookingContext(intResponse, nerResponse);
  console.log(normalizedCtx);

  const actor = createActor(dialogueMachine);
  actor.start();

  if (intResponse.intent === "BookAppointment") {
    actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
  } else if (intResponse.intent === "CancelAppointment") {
    actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
  } 
  // else if (intResponse.intent === "faq") {
  //   actor.send({ type: "INTENT_FAQ", query: text });
  // }

  const snapshot = actor.getSnapshot();

  let chatResponse = "";
  // const answer = await handleUserInput(ctx);
  // console.log(answer);
  return c.json({ nerResponse, intResponse, normalizedCtx });
};
