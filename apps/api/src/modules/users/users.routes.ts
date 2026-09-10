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

    const existingUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { avatar: true },
    });

    if (!existingUser) {
      throw AppError.notFound("Пользователь не найден");
    }

    const avatar = await avatarService.save(req.userId, req.file.buffer);

    let user;

    try {
      const result = await prisma.user.updateMany({
        where: {
          id: req.userId,
          avatar: existingUser.avatar,
        },
        data: {
          avatar,
        },
      });

      if (result.count === 0) {
        throw AppError.conflict(
          "AVATAR_CHANGED",
          "Аватар уже был изменён другим запросом",
        );
      }

      user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: publicUserSelect,
      });

      if (!user) {
        throw AppError.notFound("Пользователь не найден");
      }
    } catch (error) {
      await avatarService.remove(avatar).catch((cleanupError: unknown) => {
        console.error("Failed to remove an uncommitted avatar:", cleanupError);
      });

      throw error;
    }

    try {
      await avatarService.remove(existingUser.avatar);
    } catch (error) {
      try {
        const rollback = await prisma.user.updateMany({
          where: { id: req.userId, avatar },
          data: { avatar: existingUser.avatar },
        });

        if (rollback.count > 0) {
          await avatarService.remove(avatar);
        }
      } catch (rollbackError) {
        console.error("Failed to roll back an avatar update:", rollbackError);
      }

      throw error;
    }

    return res.json(toUserDto(user));
  },
);

usersRouter.delete("/avatar", async (req, res) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
    select: publicUserSelect,
  });

  if (!existingUser) {
    throw AppError.notFound("Пользователь не найден");
  }

  if (!existingUser.avatar) {
    return res.json(toUserDto(existingUser));
  }

  const result = await prisma.user.updateMany({
    where: { id: req.userId, avatar: existingUser.avatar },
    data: {
      avatar: null,
    },
  });

  if (result.count === 0) {
    throw AppError.conflict(
      "AVATAR_CHANGED",
      "Аватар уже был изменён другим запросом",
    );
  }

  try {
    await avatarService.remove(existingUser.avatar);
  } catch (error) {
    try {
      await prisma.user.updateMany({
        where: { id: req.userId, avatar: null },
        data: { avatar: existingUser.avatar },
      });
    } catch (rollbackError) {
      console.error("Failed to roll back an avatar deletion:", rollbackError);
    }

    throw error;
  }

  return res.json(toUserDto({ ...existingUser, avatar: null }));
});
