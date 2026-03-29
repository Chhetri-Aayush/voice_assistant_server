import type { IntentResponse, NerEntity, NerResponse } from "@/types/types";
import { parseNepaliTime, resolveNepaliDateToEnglish } from "@/lib/response";

export interface RescheduleContext {
  ID: any;
  INTENT: string;
  TIME: string | null;
  DATE: string | null;
  PERSON: null;
  DEPARTMENT: null;
}

export function buildRescheduleContext(
  intentRes: IntentResponse,
  nerRes: NerResponse,
  id: any,
): RescheduleContext {
  const intent = intentRes.intent;

  console.log(` this is res intent in rescheule: ${JSON.stringify(intentRes)}`);

  console.log(`this is the nerRes resscheule  :${JSON.stringify(nerRes)}`);
  // console.log(` this is entitiesPairs: ${JSON.stringify(entitiesPairs)}`);
  const entitiesPairs = nerRes.entities.map((entity: NerEntity) => ({
    text: entity.text,
    label: entity.label,
  }));

  const lastDate = [...entitiesPairs].reverse().find((p) => p.label === "DATE");
  const lastTime = [...entitiesPairs].reverse().find((p) => p.label === "TIME");

  const ctx: RescheduleContext = {
    ID: id,
    INTENT: intent,
    TIME: null,
    DATE: null,
    PERSON: null,
    DEPARTMENT: null,
  };

  if (lastTime) {
    const parsedTime = parseNepaliTime(lastTime.text);
    ctx.TIME = parsedTime ? `${parsedTime}:00` : null;
  }

  if (lastDate) {
    const result = resolveNepaliDateToEnglish(lastDate.text);
    ctx.DATE = result.englishDate;
  }

  return ctx;
}
