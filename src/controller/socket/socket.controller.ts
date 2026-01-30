// import { Context } from "hono";
// import { upgradeWebSocket } from "hono/bun";

// export const socketController = upgradeWebSocket((c) => {
//   console.log("we are in the websocket upgrading controller");
//   return {
//     onOpen: (_, ws) => {
//       console.log("WebSocket connection opened");
//       ws.send("Welcome to the WebSocket server!");
//     },

//     //     onMessage: (event, ws) => {
//     //       console.log("Received message:", event.data);
//     //       ws.send(`Echo: ${event.data} i got the message`);
//     //     },
//   };
// });

import { upgradeWebSocket } from "hono/bun";

export const socketController = upgradeWebSocket((c) => {
  return {
    onOpen: (_, ws) => {
      console.log("WebSocket opened");
      // ws.send("Hello from server");
    },
    onMessage: (event, ws) => {
      console.log("Got:", event.data);
      console.log("Type of data:", typeof event.data);
      // ws.send("Got your message");
    },
    onClose: () => {
      console.log("Closed");
    },
  };
});

// import type { HonoRequest, Context } from "hono";
// import type { ServerWebSocket } from "bun";

// export interface SocketHandler {
//   onOpen: (c: Context, ws: any) => void;
//   onMessage: (event: any, ws: any) => void;
//   onClose: (c: Context, ws: any) => void;
// }

// export const createSocketHandler = (): SocketHandler => {
//   return {
//     onOpen: (event, ws: any) => {
//       const rawWs = ws.raw as ServerWebSocket;
//       console.log("WebSocket opened and subscribed to topic");
//       // ws.send("Welcome to the WebSocket server!");
//     },

//     onMessage: (event: any, ws: any) => {
//       console.log("Received message:", event.data);
//       // ws.send(`Echo: ${event.data}`);
//     },

//     onClose: (event, ws: any) => {
//       const rawWs = ws.raw as ServerWebSocket;
//       console.log("WebSocket closed and unsubscribed from topic");
//     },
//   };
// };
