import { entitiesResponse, intentResponse } from "@/lib/modelApi";
import { handleUserInput } from "@/controller/bookAppoint/handleUserInput";
import { buildBookingContext } from "./normalizeNlu";
import { Context } from "hono";

export const bookingController = async (c: Context) => {
  const { text } = await c.req.json();

  const nerResult = await entitiesResponse(text);
  const intResutl = await intentResponse(text);

  // console.log(nerResult, intResutl);

  const ctx = buildBookingContext(intResutl, nerResult);
  // console.log(ctx);
  const answer = await handleUserInput(ctx);
  // console.log(answer);
  return c.json(answer);
};
