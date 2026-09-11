import { Router } from "express";
import {
  LoginUserSchema,
  RegisterUserServerSchema,
} from "@project-pulse/shared";
import { authService } from "./auth.service.js";
import { rateLimit } from "express-rate-limit";
import { AppError } from "../../lib/app-error.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_req, _res, next) => {
    next(AppError.tooManyRequests());
  },
});

authRouter.post("/register", authLimiter, async (req, res) => {
  const input = RegisterUserServerSchema.parse(req.body);

  const response = await authService.register(
    input.email,
    input.password,
    input.name,
  );

  return res.status(201).json(response);
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const input = LoginUserSchema.parse(req.body);

  const response = await authService.login(input.email, input.password);

  return res.json(response);
});
