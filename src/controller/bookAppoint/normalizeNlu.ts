import type {
  BookingContext,
  IntentResponse,
  NerEntity,
  NerResponse,
} from "@/types/types";
import { parseNepaliTime, resolveNepaliDateToEnglish } from "@/lib/response";

export function buildBookingContext(
  intentRes: IntentResponse,
  nerRes: NerResponse,
  id: any,
): BookingContext {
  const intent = intentRes.intent;
  console.log(` this is res intent: ${JSON.stringify(intentRes)}`);

  const entitiesPairs = nerRes.entities.map((entity: NerEntity) => ({
    text: entity.text,
    label: entity.label,
  }));
  console.log(`this is the nerRes :${JSON.stringify(nerRes)}`);
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
        const doctorPrefixes = /(डॉक्टर|डाक्टर|डक्टर )\s*/g;
        ctx.PERSON = pair.text.replace(doctorPrefixes, "").trim();
        break;

      // ctx.PERSON = pair.text;
      // break;
      case "TIME":
        const parsedTime = parseNepaliTime(pair.text);

        if (parsedTime) {
          ctx.TIME = `${parsedTime}:00`;
        } else {
          ctx.TIME = null;
        }
        break;
      // ctx.TIME = pair.text;
      case "DEPARTMENT":
        ctx.DEPARTMENT = pair.text;
        break;
      case "DATE":
        const result = resolveNepaliDateToEnglish(pair.text);
        ctx.DATE = result.englishDate;
        break;
      default:
        break;
    }
  });

  // console.log("Booking Context:", ctx);
  // console.log(`this is the ocntext: ${JSON.stringify(ctx)}`);
  return ctx;
}
