import { BookingContext } from "@/types/types";
import {
  askTimeResponse,
  askDateResponse,
  askDepartmentResponse,
  askDoctorResponse,
} from "./response";

export function calculateMissingSlots(
  context: Partial<BookingContext>,
): string[] {
  const required = ["DATE", "TIME", "DEPARTMENT", "PERSON"];
  return required.filter((field) => !context[field as keyof BookingContext]);
}

export function generateMissingFieldMessages(slotName: string): string {
  let message: string;
  switch (slotName) {
    case "DATE":
      message = askDateResponse();
      break;
    case "TIME":
      message = askTimeResponse();
      break;
    case "DEPARTMENT":
      message = askDepartmentResponse();
      break;
    case "PERSON":
      message = askDoctorResponse();
      break;
    default:
      message = "";
  }
  return message;
}
