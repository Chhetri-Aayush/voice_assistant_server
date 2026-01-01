import type { BookingContext } from "@/controller/bookAppoint/types";
import { getMissingField } from "@/controller/bookAppoint/misssingField";

export function dialogueEngine(context: BookingContext) {
	const missing = getMissingField(context);
	// console.log(`this is missing:${missing}`);

	if (missing === "department") {
		return {
			type: "ASK",
			message: "Department is missing please enter the department",
		};
	}

	if (missing === "time") {
		return { type: "ASK", message: "Time is missing plese enter time " };
	}

	if (missing === "date") {
		return { type: "ASK", message: "Date is missing please enter date" };
	}

	if (missing === null && context.intent === "BookAppointment") {
		console.log(context.intent);
		return { type: "CHECK_DB" as const };
	}
	if (missing === null && context.intent === "CancelAppointment") {
		// console.log(context.intent);
		return { type: "REMOVE_DB" as const };
	}
}
