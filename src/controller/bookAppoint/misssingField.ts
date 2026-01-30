// import type { BookingContext } from "@/controller/bookAppoint/types";
import { BookingContext } from "@/types/types";

export function getMissingField(context: BookingContext) {
  if (!context.intent) return "intent";
  //   if (!context.DATE) return "date";
  if (!context.DEPARTMENT) return "department";
  if (!context.TIME) return "time";
  return null;
}
