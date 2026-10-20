import { createServer } from "node:http";

import { createApp } from "./app.js";
import { validateEnv } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { createSocketServer } from "./realtime/socket.js";
import { getProjectRoom } from "./realtime/project-room.handlers.js";

const port = Number(validateEnv("PORT"));

const app = createApp({
  onTasksChanged: (projectId) => {
    try {
      io.to(getProjectRoom(projectId)).emit("tasks:changed", {
        projectId,
      });
    } catch (error) {
      console.error("Failed to publish tasks:changed:", error);
    }
  },
});

const server = createServer(app);
const io = createSocketServer(server);

server.listen(port, () => {
  console.log(`API started on http://localhost:${port}`);
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  try {
    await io.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Shutdown failed:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
