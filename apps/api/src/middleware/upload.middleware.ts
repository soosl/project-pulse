import multer from "multer";
import { AppError } from "../lib/app-error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        AppError.badRequest(
          "INVALID_AVATAR_TYPE",
          "Допустимы только JPEG, PNG и WebP",
        ),
      );

      return;
    }

    callback(null, true);
  },
});
