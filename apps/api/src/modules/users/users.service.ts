import type { UpdateUser } from "@project-pulse/shared";

import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { avatarService } from "../../services/avatar.service.js";
import { publicUserSelect, toUserDto } from "./users.mapper.js";

export const usersService = {
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) {
      throw AppError.notFound("Пользователь не найден");
    }

    return toUserDto(user);
  },

  async updateProfile(userId: string, input: UpdateUser) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
      },
      select: publicUserSelect,
    });

    return toUserDto(user);
  },

  async updateAvatar(userId: string, fileBuffer: Buffer) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!existingUser) {
      throw AppError.notFound("Пользователь не найден");
    }

    const avatar = await avatarService.save(userId, fileBuffer);

    let user;

    try {
      const result = await prisma.user.updateMany({
        where: {
          id: userId,
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
        where: { id: userId },
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
          where: { id: userId, avatar },
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

    return toUserDto(user);
  },

  async removeAvatar(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!existingUser) {
      throw AppError.notFound("Пользователь не найден");
    }

    if (!existingUser.avatar) {
      return toUserDto(existingUser);
    }

    const result = await prisma.user.updateMany({
      where: { id: userId, avatar: existingUser.avatar },
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
          where: { id: userId, avatar: null },
          data: { avatar: existingUser.avatar },
        });
      } catch (rollbackError) {
        console.error("Failed to roll back an avatar deletion:", rollbackError);
      }

      throw error;
    }

    return toUserDto({ ...existingUser, avatar: null });
  },
};
