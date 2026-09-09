import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});
