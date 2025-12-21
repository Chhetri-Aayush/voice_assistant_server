import { Hono } from "hono";
import { bookingController } from "@/controller/bookAppoint/bookingController";
import { testController } from "@/controller/test/testController";

const v1Routes = new Hono();

v1Routes.get("/hello", (c) => {
  return c.text("hello there");
});

v1Routes.post("/bookAppointment", bookingController);
v1Routes.get("/testing", testController);

export default v1Routes;
