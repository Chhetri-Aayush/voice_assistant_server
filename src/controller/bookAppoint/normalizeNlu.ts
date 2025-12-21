import { BookingContext } from "./types";

type IntentResponse = {
  intResutl?: {
    intent: string;
    confidence: number;
  };
};

type NerEntity = {
  text: string;
  label: string;
  score: number;
  start?: number;
  end?: number;
};

type NerResponse = {
  nerResult?: {
    entities: NerEntity[];
  };
};

export function buildBookingContext(
  intentRes: IntentResponse | null,
  nerRes: NerResponse | null,
): BookingContext {
  const resIntent = intentRes.intent;
  // console.log(` this is res intent: ${resIntent}`);

  const entitiesPairs = nerRes.entities.map((entity: any) => ({
    text: entity.text,
    label: entity.label,
  }));

  // console.log(` this is entitiesPairs: ${JSON.stringify(entitiesPairs)}`);

  const ctx: BookingContext = {
    intent: resIntent,
    TIME: null,
    // DATE: null,
    PERSON: null,
    DEPARTMENT: null,
  };

  entitiesPairs.forEach((pair: any) => {
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
      // case "DATE":
      //   ctx.DATE= pair.text;
      //   break;
      default:
        break;
    }
  });

  // console.log("Booking Context:", ctx);
  // console.log(`this is the ocntext: ${JSON.stringify(ctx)}`);
  return ctx;
}
