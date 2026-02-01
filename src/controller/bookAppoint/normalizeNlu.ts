import type {
  BookingContext,
  IntentResponse,
  NerEntity,
  NerResponse,
} from "@/types/types";

export function buildBookingContext(
  intentRes: IntentResponse,
  nerRes: NerResponse,
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
    INTENT: intent,
    TIME: null,
    DATE: null,
    PERSON: null,
    DEPARTMENT: null,
  };

  entitiesPairs?.forEach((pair: { text: string; label: string }) => {
    switch (pair.label) {
      case "PERSON":
        ctx.PERSON = pair.text;
        break;
      case "TIME":
        ctx.TIME = pair.text;
        break;
      case "DEPARTMENT":
        ctx.DEPARTMENT = pair.text;
        break;
      case "DATE":
        ctx.DATE = pair.text;
        break;
      default:
        break;
    }
  });

  // console.log("Booking Context:", ctx);
  // console.log(`this is the ocntext: ${JSON.stringify(ctx)}`);
  return ctx;
}
