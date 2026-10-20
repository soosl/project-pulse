import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import { validateEnv } from "../lib/env.js";
import { socketAuthMiddleware } from "./socket-auth.middleware.js";
import { registerProjectRoomHandlers } from "./project-room.handlers.js";
import type { RealtimeServer } from "./socket.types.js";

export const createSocketServer = (httpServer: HttpServer) => {
  const io: RealtimeServer = new Server(httpServer, {
    cors: {
      origin: validateEnv("FRONTEND_URL"),
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    registerProjectRoomHandlers(socket);
  });

  return io;
};
