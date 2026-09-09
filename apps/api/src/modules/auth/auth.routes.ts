import { Router } from "express";
import {
  LoginUserSchema,
  RegisterUserServerSchema,
} from "@project-pulse/shared";

import { authService } from "../../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const input = RegisterUserServerSchema.parse(req.body);

  const response = await authService.register(
    input.email,
    input.password,
    input.name,
  );

  return res.status(201).json(response);
});

authRouter.post("/login", async (req, res) => {
  const input = LoginUserSchema.parse(req.body);

  const response = await authService.login(input.email, input.password);

  return res.json(response);
});
