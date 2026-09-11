import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateEnv } from "./lib/env.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const uploadsDirectory = fileURLToPath(new URL("../uploads", import.meta.url));

export const createApp = () => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: validateEnv("FRONTEND_URL"),
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    "/uploads",
    express.static(path.resolve(uploadsDirectory), {
      fallthrough: false,
      maxAge: "7d",
      setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    }),
  );

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
