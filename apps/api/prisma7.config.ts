import { defineConfig } from "prisma/config";
import { validateEnv } from "./src/lib/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "./prisma/seed.ts",
  },
  datasource: {
    url: validateEnv("DATABASE_URL"),
  },
});
