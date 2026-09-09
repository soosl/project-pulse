import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthResponseSchema } from "@project-pulse/shared";

import { prisma } from "../lib/prisma.js";
import { validateEnv } from "../lib/env.js";
import { publicUserSelect, toUserDto } from "../modules/users/users.mapper.js";
import { AppError } from "../lib/app-error.js";

const JWT_SECRET = validateEnv("JWT_SECRET");

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const authService = {
  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw AppError.conflict(
        "USER_ALREADY_EXISTS",
        "Пользователь с таким email уже существует",
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: publicUserSelect,
    });

    return AuthResponseSchema.parse({
      user: toUserDto(user),
      accessToken: generateAccessToken(user.id),
    });
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Неверный email или пароль",
      );
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Неверный email или пароль",
      );
    }
    return AuthResponseSchema.parse({
      user: toUserDto(user),
      accessToken: generateAccessToken(user.id),
    });
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
      };

      return decoded.userId;
    } catch {
      return null;
    }
  },
};
