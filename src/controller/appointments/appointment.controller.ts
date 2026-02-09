import { Context } from "hono";
import { db } from "@/db";
// import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export const delteAppointment = async (c: Context) => {
  try {
    const data = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, 23)); // static ID

    return c.json("Appointment deleted successfully");
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to delete appointment" }, 500);
  }
};
