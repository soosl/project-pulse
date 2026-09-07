import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { authService } from "./services/auth.service.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
  RegisterUserServerSchema,
  LoginUserSchema,
} from "@project-pulse/shared";
import { PrismaPgClient } from "./lib/prisma.js";
import "dotenv/config";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", async (req, res) => {
  try {
    await PrismaPgClient.$queryRaw`SELECT 1`;
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
    const user = await PrismaPgClient.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, avatar: true },
    });
    res.json({ user, ...tokens });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Получить текущего пользователя (защищённый маршрут)
app.get("/auth/me", authMiddleware, async (req, res) => {
  const user = await PrismaPgClient.user.findUnique({
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
  const { name, avatar } = req.body;
  const user = await PrismaPgClient.user.update({
    where: { id: req.userId },
    data: { name, avatar },
    select: { id: true, email: true, name: true, avatar: true },
  });
  res.json(user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Started on http://localhost:${PORT}`));
