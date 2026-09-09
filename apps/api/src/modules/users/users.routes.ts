import { Router } from "express";
import { UpdateUserSchema } from "@project-pulse/shared";

import { prisma } from "../../lib/prisma.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadAvatar } from "../../middleware/upload.middleware.js";
import { avatarService } from "../../services/avatar.service.js";
import { publicUserSelect, toUserDto } from "./users.mapper.js";
import { AppError } from "../../lib/app-error.js";

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw AppError.notFound("Пользователь не найден");
  }

  return res.json(toUserDto(user));
});

usersRouter.patch("/profile", async (req, res) => {
  const input = UpdateUserSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      name: input.name,
    },
    select: publicUserSelect,
  });

  return res.json(toUserDto(user));
});

usersRouter.patch(
  "/avatar",
  uploadAvatar.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest("AVATAR_REQUIRED", "Файл аватара не передан");
    }

    const avatar = await avatarService.save(req.userId, req.file.buffer);

    const user = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatar,
      },
      select: publicUserSelect,
    });

    return res.json(toUserDto(user));
  },
);

usersRouter.delete("/avatar", async (req, res) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
    select: {
      id: true,
      avatar: true,
    },
  });

  if (!existingUser) {
    throw AppError.notFound("Пользователь не найден");
  }

  if (existingUser.avatar) {
    await avatarService.remove(req.userId);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: req.userId,
    },
    data: {
      avatar: null,
    },
    select: publicUserSelect,
  });

  return res.json(toUserDto(updatedUser));
});
