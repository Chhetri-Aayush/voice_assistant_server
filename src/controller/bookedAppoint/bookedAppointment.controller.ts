import { Context } from "hono";
import { db } from "@/db/index";
import { appointments, doctors, departments, timeSlots } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

const successResponse = (data: any, message: string) => ({
  success: true,
  data,
  message,
});
const errorResponse = (message: string, code: number) => ({
  success: false,
  message,
  code,
});

export const bookedAppointmentController = async (c: Context) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return c.json(errorResponse("Unauthorized", 401), 401);
    }

    const userId = session.user.id;

    const results = await db
      .select({
        appointment: appointments,
        doctor: {
          id: doctors.id,
          name: doctors.name,
          specialization: doctors.specialization,
        },
        department: {
          id: departments.id,
          name: departments.name,
        },
        timeSlot: {
          id: timeSlots.id,
          slotDate: timeSlots.slotDate,
          slotTime: timeSlots.slotTime,
          status: timeSlots.status,
        },
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(departments, eq(appointments.departmentId, departments.id))
      .leftJoin(timeSlots, eq(appointments.timeSlotId, timeSlots.id))
      .where(
        and(eq(appointments.userId, userId), eq(appointments.status, "booked")),
      )
      .orderBy(desc(appointments.createdAt));

    if (!results || results.length === 0) {
      return c.json(
        successResponse([], "No appointments found for this user"),
        200,
      );
    }

    const enrichedAppointments = results.map((row) => ({
      ...row.appointment,
      doctor: row.doctor,
      department: row.department,
      timeSlot: row.timeSlot,
    }));

    return c.json(
      successResponse(
        enrichedAppointments,
        "Booked appointments retrieved successfully",
      ),
      200,
    );
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    return c.json(
      errorResponse("Failed to fetch booked appointments", 500),
      500,
    );
  }
};
