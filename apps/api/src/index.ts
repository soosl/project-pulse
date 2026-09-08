import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
  RegisterUserServerSchema,
  LoginUserSchema,
  UpdateUserSchema,
} from "@project-pulse/shared";
import { authService } from "./services/auth.service.js";
import { prisma } from "./lib/prisma.js";
import { validateEnv } from "./lib/env.js";
import path from "node:path";
import { uploadAvatar } from "./middleware/upload.middleware.js";
import { avatarService } from "./services/avatar.service.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: validateEnv("FRONTEND_URL"),
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    fallthrough: false,
    maxAge: "7d",
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Регистрация
app.post("/auth/register", async (req, res) => {
  const result = RegisterUserServerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const { email, password, name } = result.data;
    const tokens = await authService.register(email, password, name);
    res.status(201).json({ user: { email, name }, ...tokens });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({ error: message });
  }
});

// Логин
app.post("/auth/login", async (req, res) => {
  const result = LoginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  try {
    const { email, password } = result.data;
    const tokens = await authService.login(email, password);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, avatar: true },
    });
    res.json({ user, ...tokens });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({ error: message });
  }
});

// Получить текущего пользователя (защищённый маршрут)
app.get("/auth/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
    },
  });
  res.json(user);
});

// Обновить профиль (защищённый маршрут)
app.patch("/auth/profile", authMiddleware, async (req, res) => {
  const result = UpdateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues,
    });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      name: result.data.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
    },
  });

  return res.json(user);
});

app.patch(
  "/auth/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Файл аватара не передан",
        });
      }

      const avatar = await avatarService.save(req.userId, req.file.buffer);

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { avatar },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

const PORT = validateEnv("PORT");
app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
