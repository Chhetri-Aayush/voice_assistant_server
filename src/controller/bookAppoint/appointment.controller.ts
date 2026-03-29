// controller/appointmentController.ts
import { buildBookingContext } from "@/controller/bookAppoint/normalizeNlu";
import { buildRescheduleContext } from "./normalizeReschudle";
import { entitiesResponse, intentResponse } from "@/lib/modelApi";
import type { Context } from "hono";
import { createActor } from "xstate";
import { dialogueMachine } from "@/machine/fsm";
import { upgradeWebSocket } from "hono/bun";
import { auth } from "@/lib/auth";

export const appointmentController = upgradeWebSocket((c: Context) => {
  let actor: any;
  let id: string;

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
        // const isQuietState =
        //   state.matches("bookingAppointment.confirmingWithDatabase") ||
        //   state.matches("cancelAppointment.executing") ||
        //   state.matches("rescheduleAppointment.executing");
        const isQuietState =
          state.matches("bookingAppointment.confirmingWithDatabase") ||
          state.matches("cancelAppointment.executing") ||
          state.matches("rescheduleAppointment.executing") ||
          state.matches({ faq: "answering" }) ||
          state.matches({ faq: "done" }) ||
          state.matches({ faq: "failed" });

        if (isQuietState) return;

        const message = state.context.systemMessages[0];

        ws.send(
          JSON.stringify({
            role: "assistant",
            content: message ?? "फेरि भन्नुहोस् न",
          }),
        );
      });
    },

    onMessage: async (event, ws) => {
      try {
        const data = JSON.parse(event.data as string);

        const [nerResponse, intResponse] = await Promise.all([
          entitiesResponse(data.content),
          intentResponse(data.content),
        ]);
        let normalizedCtx;

        if (intResponse.intent === "RescheduleAppointment") {
          normalizedCtx = buildRescheduleContext(intResponse, nerResponse, id);
        } else {
          normalizedCtx = buildBookingContext(intResponse, nerResponse, id);
        }

        console.log(
          "the normalized ctx before sendign to the fsm is ",
          normalizedCtx,
        );
        console.log("<-------------------->");

        const snapshot = actor.getSnapshot();
        console.log(
          "this is the snapshot right before we ennter the fsm ",
          snapshot.value,
        );
        console.log("<-------------------->");
        const intent = normalizedCtx.INTENT;

        if (snapshot.matches("idle")) {
          if (intent === "BookAppointment") {
            actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
          } else if (intent === "CancelAppointment") {
            actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
          } else if (intent === "RescheduleAppointment") {
            actor.send({ type: "RESCHEDULE_APPOINTMENT", data: normalizedCtx });
          } else {
            actor.send({ type: "INTENT_FAQ", query: data.content });
          }
          return;
        }

        if (
          snapshot.matches({ bookingAppointment: "askMissingSlots" }) ||
          snapshot.matches({ bookingAppointment: "bookingFailed" })
        ) {
          if (intent === "FAQ") {
            actor.send({ type: "INTENT_FAQ", query: data.content });
            return;
          }
          if (intent === "CancelAppointment") {
            actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
            return;
          }
          const fields = Object.fromEntries(
            Object.entries(normalizedCtx).filter(
              ([key, value]) => key !== "INTENT" && value !== null,
            ),
          );
          if (Object.keys(fields).length > 0) {
            actor.send({ type: "UPDATE_FIELD", data: fields });
          } else {
            actor.send({ type: "INTENT_FAQ", query: data.content });
          }
          return;
        }
        if (snapshot.matches("faq")) {
          if (intent === "BookAppointment") {
            actor.send({ type: "INTENT_BOOKING", data: normalizedCtx });
            return;
          }

          if (intent === "CancelAppointment") {
            actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
            return;
          }

          actor.send({ type: "INTENT_FAQ", query: data.content });
          return;
        }

        if (snapshot.matches("cancelAppointment.failed")) {
          if (intent === "CancelAppointment") {
            actor.send({ type: "INTENT_CANCEL", data: normalizedCtx });
          }
          return;
        }
      } catch (err) {
        console.error("onMessage error:", err);

        ws.send(
          JSON.stringify({
            role: "assistant",
            content: "माफ गर्नुहोस्, केही समस्या भयो। फेरि प्रयास गर्नुहोस्।",
          }),
        );
      }
      const snapshot = actor.getSnapshot();
      console.log(
        "this is the snapshot right after we leave the fsm ",
        snapshot.value,
      );
      console.log("<-------------------->");
    },

    onClose: () => {
      console.log(`WebSocket closed for user: ${id}`);
    },
  };
});
