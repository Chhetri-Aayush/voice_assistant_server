// import { values } from "@/controller/bookAppoint/types";
// import type { BookingContext } from "@/controller/bookAppoint/types";
import { BookingContext } from "@/types/types";
import { dialogueEngine } from "@/controller/bookAppoint/dialogueManager";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";

let id = 21;

export async function handleUserInput(ctx: BookingContext) {
  // console.log(ctx);
  const decision = dialogueEngine(ctx);

  console.log(`this is decision:${JSON.stringify(decision)}`);

  if (decision?.type === "ASK") {
    return {
      reply: decision.message,
      // context,
    };
  }

  if (decision?.type === "CHECK_DB") {
    // const available = checkAvailability(
    //   context.department!,
    //   context.date!,
    //   context.time!,
    // );
    // const available = true;
    let dbInsert = await db.insert(appointments).values({
      doctorName: `${ctx.PERSON}`,
      patientName: `${values.name}`,
      appointmentDate: `${values.date}`,
      appointmentTime: `${ctx.TIME}`,
    });
    console.log(`this is the database insert:${JSON.stringify(dbInsert)}`);

    // if (!available) {
    //   // context.time = null; // force re-ask
    //   return {
    //     reply:
    //       "The appointment you wish is not available ,please choose another time ",
    //     // context,
    //   };
    // }
    const data = await callMT5Appointment(ctx);
    // console.log(data);
    // console.log("we reaced ot the appointment booking poitn ");
    return {
      reply: data.output,
      // context,
    };
  }

  if (decision?.type === "REMOVE_DB") {
    // const available = checkAvailability(
    //   context.department!,
    //   context.date!,
    //   context.time!,
    // );
    // const available = true;
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    // if (!available) {
    //   // context.time = null; // force re-ask
    //   return {
    //     reply: "the appintmetn couldn't be cancled please try again later",
    //     // context,
    //   };
    // }
    // const data = await callMT5Appointment(ctx);
    // console.log(data);
    // console.log("we reaced ot the appointment booking poitn ");
    return {
      reply:
        "ठिक छ, मैले ३० डिसेम्बर २ बजे डाक्टर सिता संगको अपॉइंटमेन्ट रद्द गरें।",
      // context,
    };
  }
  return {
    reply: "this failed in after the database is not queried",
  };
}
