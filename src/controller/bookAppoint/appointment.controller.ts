import { buildBookingContext } from "@/controller/bookAppoint/normalizeNlu";
import { entitiesResponse, intentResponse } from "@/lib/modelApi";
import type { Context } from "hono";
import { Actor, createActor } from "xstate";
import { dialogueMachine } from "@/machine/fsm";
import { upgradeWebSocket } from "hono/bun";
import { auth } from "@/lib/auth";

export const appointmentController = upgradeWebSocket((c: Context) => {
  let actor: any;
  let id: any;
  return {
    onOpen: async (_, ws) => {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!session) {
        ws.close(1008, "Unauthorized");
        return;
      }
      id = session.user.id;
      actor = createActor(dialogueMachine);
      ws.send(
        JSON.stringify({
          role: "assistant",
          content: "नमस्ते! म तपाईंलाई कसरी सहयोग गर्न सक्छु?",
        }),
      );
      actor.start();
      actor.subscribe((state: any) => {
        const message = state.context.systemMessages[0];

        const isQuietState =
          state.matches("bookingAppointment.confirmingWithDatabase") ||
          state.matches("cancelAppointment.executing");

        if (isQuietState) {
          console.log("finally this triggered ooooollalalalaa");
          return;
        }

        ws.send(
          JSON.stringify({
            role: "assistant",
            content: state.context.systemMessages[0] || "फेरि भन्नुहोस् न",
          }),
        );
      });
    },
    onMessage: async (event, ws) => {
      const text = event.data;
      const data = JSON.parse(text as string);

      const nerResponse = await entitiesResponse(data.content);
      const intResponse = await intentResponse(data.content);

      const normalizedCtx = buildBookingContext(intResponse, nerResponse, id);

      //TODO: based on the intResponse we have to create different normalizedCtx one is when there is booking appoitnemnt and rest is like for the faq or the canacle where we dont
      //  have to have the normalized ctx so that the we dont pass any unnecessary data to the fsm
      //

      console.log("Normalized Context:", normalizedCtx);
      // console.log({ nerResponse, intResponse });

      //after the context is built we dont send it direclty to the state machine first we validate the bookign context like if the department the user has sent is
      // valid or not or if the date the user has sent is valid or not or the time the user has sent is valid or not
      //something like this ....if(!validationcontext(context)) then send some response to the client

      const currentState = actor.getSnapshot();
      const currentStateValue = currentState.value;

      if (currentStateValue === "idle") {
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
        (console.log("the filtered normalized ctx is ", filteredNormalizedCtx),
          actor.send({ type: "UPDATE_FIELD", data: filteredNormalizedCtx }));
      }
    },
    onClose: () => {
      console.log("Closed");
    },
  };
});
