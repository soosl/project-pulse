import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Создаём пользователей
  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
      name: "Alice Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
      name: "Bob Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "carol@example.com",
      passwordHash,
      name: "Carol White",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  });

  console.log("✅ Users created:", [user1.email, user2.email, user3.email]);

  // 2. Создаём проект
  const project = await prisma.project.create({
    data: {
      name: "Project Pulse Alpha",
      description: "Первый проект для демонстрации",
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: "OWNER" },
          { userId: user2.id, role: "ADMIN" },
          { userId: user3.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✅ Project created:", project.name);

  // 3. Создаём задачи
  const task1 = await prisma.task.create({
    data: {
      title: "Настроить инфраструктуру",
      description:
        "Создать монорепу, настроить Docker, Prisma, Express и React",
      status: "DONE",
      priority: "HIGH",
      projectId: project.id,
      assigneeId: user1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Реализовать аутентификацию",
      description: "JWT, регистрация, логин, защита роутов",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: project.id,
      assigneeId: user2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Создать Kanban-доску",
      description: "Drag-n-drop задачи, колонки статусов",
      status: "TODO",
      priority: "MEDIUM",
      projectId: project.id,
      assigneeId: user3.id,
    },
  });

  console.log("✅ Tasks created:", task1.title, task2.title, task3.title);

  // 4. Комментарии к задачам
  await prisma.taskComment.create({
    data: {
      content: "Я уже настроил монорепу и Docker, всё работает!",
      taskId: task1.id,
      authorId: user1.id,
    },
  });

  await prisma.taskComment.create({
    data: {
      content: "Заберу себе, уже начал писать эндпоинты для auth",
      taskId: task2.id,
      authorId: user2.id,
    },
  });

  console.log("✅ Comments added");

  // 5. Сообщения в чате
  await prisma.chatMessage.createMany({
    data: [
      {
        content: "Привет всем! Добро пожаловать в Project Pulse!",
        projectId: project.id,
        authorId: user1.id,
      },
      {
        content: "Спасибо! Уже приступаю к задачам.",
        projectId: project.id,
        authorId: user2.id,
      },
    ],
  });

  console.log("✅ Chat messages added");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
