import { Hono } from "hono";
import { appointmentController } from "@/controller/bookAppoint/booking.controller";
import { testController } from "@/controller/test/testController";
import { socketController } from "@/controller/socket/socket.controller";
import { delteAppointment } from "@/controller/appointments/appointment.controller";

const v1Routes = new Hono();

v1Routes.get("/hello", (c) => {
  return c.text("hello there");
});

v1Routes.get("/appointment", appointmentController);
v1Routes.get("/testing", testController);
v1Routes.get("/testSocket", socketController);
// v1Routes.delete("/deleteAppointment", delteAppointment);

export default v1Routes;
