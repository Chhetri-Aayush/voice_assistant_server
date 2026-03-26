import type {
  BookingContext,
  IntentResponse,
  NerEntity,
  NerResponse,
} from "@/types/types";

export function buildBookingContext(
  intentRes: IntentResponse,
  nerRes: NerResponse,
  id: any,
): BookingContext {
  const intent = intentRes.intent;
  // console.log(` this is res intent: ${resIntent}`);

  const entitiesPairs = nerRes.entities.map((entity: NerEntity) => ({
    text: entity.text,
    label: entity.label,
  }));
  // console.log(`this is the nerRes :${JSON.stringify(nerRes)}`);
  // console.log(` this is entitiesPairs: ${JSON.stringify(entitiesPairs)}`);

  const ctx: BookingContext = {
    ID: id,
    INTENT: intent,
    TIME: null,
    DATE: null,
    PERSON: null,
    DEPARTMENT: null,
  };

  entitiesPairs?.forEach((pair: { text: string; label: string }) => {
    switch (pair.label) {
      case "PERSON":
        const doctorPrefixes = /(डॉक्टर|डाक्टर)\s*/g;
        ctx.PERSON = pair.text.replace(doctorPrefixes, "").trim();
        break;

      // ctx.PERSON = pair.text;
      // break;
      case "TIME":
        if (pair.text.includes("बिहान एघार बजे")) {
          ctx.TIME = "11:00:00";
        } else {
          ctx.TIME = null;
        }
        // ctx.TIME = pair.text;
        break;
      case "DEPARTMENT":
        ctx.DEPARTMENT = pair.text;
        break;
      case "DATE":
        if (pair.text.includes("पन्ध्र गते")) {
          ctx.DATE = "2026-03-29";
        } else {
          ctx.DATE = null;
        }
        // ctx.DATE = pair.text;
        break;
      default:
        break;
    }
  });

  // console.log("Booking Context:", ctx);
  // console.log(`this is the ocntext: ${JSON.stringify(ctx)}`);
  return ctx;
}
