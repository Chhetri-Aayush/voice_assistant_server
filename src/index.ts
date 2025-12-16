import { Hono } from "hono";
import { env } from "@/utils/env";
import { auth } from "./utils/auth";

const app = new Hono();

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .get("/", (c) => {
    return c.text("Hello Hono!");
  });

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});
