import { Router } from "express";
import { UpdateUserSchema, type UpdateUser } from "@project-pulse/shared";

import { AppError } from "../../lib/app-error.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadAvatar } from "../../middleware/upload.middleware.js";
import { usersService } from "./users.service.js";

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get("/me", async (req, res) => {
  const user = await usersService.getCurrentUser(req.userId);

  return res.json(user);
});

usersRouter.patch("/me", uploadAvatar.single("avatar"), async (req, res) => {
  const input = UpdateUserSchema.parse(req.body);
  const obj: UpdateUser & { avatarFile?: Buffer | null } = {
    name: input.name,
    avatarAction: input.avatarAction,
  };

  if (input.avatarAction === "remove") {
    if (req.file) {
      throw AppError.badRequest(
        "INVALID_AVATAR_ACTION",
        "Произошла ошибка при удалении аватара",
      );
    }

    obj.avatarFile = null;
  } else if (input.avatarAction === "update") {
    if (!req.file) {
      throw AppError.badRequest(
        "EMPTY_PROFILE_IMAGE",
        "Ошибка при передаче изображения",
      );
    }
    obj.avatarFile = req.file.buffer;
  } else {
    if (req.file) {
      throw AppError.badRequest("INVALID_AVATAR_ACTION", "Произошла ошибка");
    }
  }

  const user = await usersService.updateProfile(req.userId, obj);

  return res.json(user);
});
