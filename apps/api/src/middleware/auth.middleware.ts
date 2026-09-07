import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = await authService.verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = userId;
  next();
};
