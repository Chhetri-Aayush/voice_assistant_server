import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { upgradeWebSocket, websocket } from "hono/bun";
// import { createBunWebSocket } from "hono/bun";
// import { createSocketHandler } from "@/controller/socket/socket.controller";
// import { socketController } from "@/controller/socket/socket.controller";

import { env } from "@/config/env";
import apiRoutes from "@/routes/index";
import { auth } from "./lib/auth";

const app = new Hono();

app.use(logger());

app.use(
  cors({
    origin: "*",
  }),
);

app
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .get("/", (c) => {
    return c.text("Hello Hono!");
  });
app.route("/api", apiRoutes);

// const { upgradeWebSocket, websocket } = createBunWebSocket();
// const socketHandler = createSocketHandler();
// app.get("/api/v1/testSocket", socketController);
Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  websocket,
});

// Bun.serve({
//   port: env.PORT,
//   fetch: app.fetch,
//   websocket: {
//     open() {
//       console.log("WebSocket opened");
//     },
//     message() {
//       console.log("WebSocket message received");
//     },
//     close() {},
//   },
// });
console.log(` Server running on http://localhost:${env.PORT}`);
