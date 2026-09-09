import path from "node:path";
import { mkdir, unlink } from "node:fs/promises";
import sharp from "sharp";

const avatarsDirectory = path.resolve("uploads/avatars");

export const avatarService = {
  async save(userId: string, fileBuffer: Buffer) {
    await mkdir(avatarsDirectory, { recursive: true });

    const filename = `${userId}.webp`;
    const filePath = path.join(avatarsDirectory, filename);

    await sharp(fileBuffer)
      .rotate()
      .resize(512, 512, {
        fit: "cover",
        position: "centre",
      })
      .webp({
        quality: 85,
      })
      .toFile(filePath);

    return `/uploads/avatars/${filename}`;
  },

  async remove(userId: string) {
    const filePath = path.join(avatarsDirectory, `${userId}.webp`);

    try {
      await unlink(filePath);
    } catch (error) {
      const isMissingFile =
        error instanceof Error && "code" in error && error.code === "ENOENT";

      if (!isMissingFile) {
        throw error;
      }
    }
  },
};
