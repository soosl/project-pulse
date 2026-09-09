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
    return res.status(404).json({
      error: "User not found",
    });
  }

  return res.json(toUserDto(user));
});

usersRouter.patch("/profile", async (req, res) => {
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
