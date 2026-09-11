import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import { avatarService } from "./avatar.service.js";
import { publicUserSelect, toUserDto } from "./users.mapper.js";

import type { AvatarAction } from "@project-pulse/shared";

interface UpdateProfileInput {
  name: string;
  avatarAction: AvatarAction;
  avatarFile?: Buffer | null;
}

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

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!existingUser) {
      throw AppError.notFound("Пользователь не найден");
    }

    let newAvatar: string | null = null;

    if (input.avatarFile) {
      newAvatar = await avatarService.save(userId, input.avatarFile);
    }

    const avatarChanged =
      input.avatarFile !== undefined || input.avatarAction === "remove";

    const data: {
      name: string;
      avatar?: string | null;
    } = {
      name: input.name,
    };

    if (input.avatarFile) {
      data.avatar = newAvatar;
    } else if (input.avatarAction === "remove") {
      data.avatar = null;
    }

    let updatedUser;

    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: publicUserSelect,
      });
    } catch (error) {
      // БД не приняла новую ссылку — новый файл никому не нужен.
      if (newAvatar) {
        await avatarService.remove(newAvatar).catch((cleanupError: unknown) => {
          console.error(
            "Failed to remove an uncommitted avatar:",
            cleanupError,
          );
        });
      }

      throw error;
    }

    if (
      avatarChanged &&
      existingUser.avatar &&
      existingUser.avatar !== updatedUser.avatar
    ) {
      // БД уже хранит корректное состояние.
      // Ошибка удаления старого файла не должна откатывать профиль.
      await avatarService
        .remove(existingUser.avatar)
        .catch((cleanupError: unknown) => {
          console.error("Failed to remove an obsolete avatar:", cleanupError);
        });
    }

    return toUserDto(updatedUser);
  },
};
