import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { upgradeWebSocket, websocket } from "hono/bun";

import { env } from "@/config/env";
import apiRoutes from "@/routes/index";
import { auth } from "./lib/auth";

const app = new Hono();

app.use(logger());

app.use(
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .get("/", (c) => {
    return c.text("Hello Hono!");
  });
app.route("/api", apiRoutes);

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  websocket,
});

console.log(` Server running on http://localhost:${env.PORT}`);
