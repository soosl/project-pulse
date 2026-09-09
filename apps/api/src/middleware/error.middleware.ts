import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "../lib/app-error.js";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
) => {
  const response: ErrorResponse = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.code, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Переданы некорректные данные",
      error.issues,
    );
    return;
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Размер файла не должен превышать 5 МБ"
        : "Не удалось загрузить файл";

    sendError(res, statusCode, "UPLOAD_ERROR", message);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      sendError(res, 409, "RESOURCE_ALREADY_EXISTS", "Ресурс уже существует");
      return;
    }

    if (error.code === "P2025") {
      sendError(res, 404, "RESOURCE_NOT_FOUND", "Ресурс не найден");
      return;
    }
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    sendError(res, 400, "INVALID_JSON", "Некорректный JSON");
    return;
  }

  console.error("Unhandled error:", error);

  sendError(res, 500, "INTERNAL_SERVER_ERROR", "Внутренняя ошибка сервера");
};
