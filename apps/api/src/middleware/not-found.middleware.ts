import type { RequestHandler } from "express";

import { AppError } from "../lib/app-error.js";

export const notFoundHandler: RequestHandler = (req, _, next) => {
  next(AppError.notFound(`Маршрут ${req.method} ${req.originalUrl} не найден`));
};
