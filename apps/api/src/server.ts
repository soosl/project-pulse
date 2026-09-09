import { createApp } from "./app.js";
import { validateEnv } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

const port = Number(validateEnv("PORT"));
const app = createApp();

const server = app.listen(port, () => {
  console.log(`API started on http://localhost:${port}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
