import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import sharp from "sharp";

const avatarsDirectory = path.resolve("uploads/avatars");
const avatarsPublicPath = "/uploads/avatars/";

export const avatarService = {
  async save(userId: string, fileBuffer: Buffer) {
    await mkdir(avatarsDirectory, { recursive: true });

    const filename = `${userId}-${randomUUID()}.webp`;
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

    return `${avatarsPublicPath}${filename}`;
  },

  async remove(avatar: string | null) {
    if (!avatar?.startsWith(avatarsPublicPath)) {
      return;
    }

    const filename = avatar.slice(avatarsPublicPath.length).split("?")[0];

    if (!filename || path.basename(filename) !== filename) {
      return;
    }

    const filePath = path.join(avatarsDirectory, filename);

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
