import express, { type Application } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const PORT = process.env.PORT || 4000;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  password: process.env.DATABASE_PASSWORD,
});
const prisma = new PrismaClient({ adapter });

const app: Application = express();
app.use(express.json());

app.get("/", (_, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.get("/health", async (_, res) => {
  try {
    await prisma.$connect();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    let errMessage = err;
    if (err instanceof Error) {
      errMessage = err.message;
    }

    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      message: errMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
