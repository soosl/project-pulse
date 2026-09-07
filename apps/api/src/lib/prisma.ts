import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { validateEnv } from "./env.js";

const adapter = new PrismaPg({
  connectionString: validateEnv("DATABASE_URL"),
});

export const prisma = new PrismaClient({ adapter });
