import type { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth.service.js";
import { AppError } from "../lib/app-error.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(AppError.unauthorized());
    return;
  }

  const token = authorization.slice("Bearer ".length);
  const userId = await authService.verifyToken(token);

  if (!userId) {
    next(AppError.unauthorized("Токен недействителен или истёк"));
    return;
  }

  req.userId = userId;
  next();
};
