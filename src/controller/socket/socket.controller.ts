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
