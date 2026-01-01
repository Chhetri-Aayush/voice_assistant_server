import { Hono } from "hono";
import { appointmentController } from "@/controller/bookAppoint/booking.controller";
import { testController } from "@/controller/test/testController";

const v1Routes = new Hono();

v1Routes.get("/hello", (c) => {
  return c.text("hello there");
});

v1Routes.post("/appointment", appointmentController);
v1Routes.get("/testing", testController);

export default v1Routes;
