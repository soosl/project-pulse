import { Router } from "express";
import { UpdateUserSchema } from "@project-pulse/shared";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { uploadAvatar } from "../../middleware/upload.middleware.js";
import { AppError } from "../../lib/app-error.js";
import { usersService } from "./users.service.js";

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get("/me", async (req, res) => {
  const user = await usersService.getCurrentUser(req.userId);

  return res.json(user);
});

usersRouter.patch("/profile", async (req, res) => {
  const input = UpdateUserSchema.parse(req.body);
  const user = await usersService.updateProfile(req.userId, input);

  return res.json(user);
});

usersRouter.patch(
  "/avatar",
  uploadAvatar.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest("AVATAR_REQUIRED", "Файл аватара не передан");
    }

    const user = await usersService.updateAvatar(req.userId, req.file.buffer);

    return res.json(user);
  },
);

usersRouter.delete("/avatar", async (req, res) => {
  const user = await usersService.removeAvatar(req.userId);

  return res.json(user);
});
