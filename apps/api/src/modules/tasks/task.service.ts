import {
  TaskListResponseSchema,
  type CreateTask,
  type TaskListQuery,
  type UpdateTask,
} from "@project-pulse/shared";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { taskSelect, toTaskDTO } from "./task.mapper.js";
import { asserProjectAsignee, assertTaskWriteAccess } from "./task.policy.js";

export const taskService = {
  async getList(userId: string, projectId: string, query: TaskListQuery) {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw AppError.notFound("Проект не найден");
    }

    const { search, status, priority, assigneeId, cursor, limit } = query;

    const tasks = await prisma.task.findMany({
      where: {
        projectId,

        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId ? { assigneeId } : {}),

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      select: taskSelect,

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],

      take: limit + 1,

      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
    });

    const hasNextPage = tasks.length > limit;
    const page = hasNextPage ? tasks.slice(0, limit) : tasks;

    return TaskListResponseSchema.parse({
      items: page.map(toTaskDTO),
      nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
    });
  },

  async getById(userId: string, projectId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        projectId,
        id: taskId,
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      select: taskSelect,
    });

    if (!task) {
      throw AppError.notFound("Задача не найдена");
    }

    return toTaskDTO(task);
  },

  async create(userId: string, projectId: string, input: CreateTask) {
    await assertTaskWriteAccess(userId, projectId);

    const { title, description, status, priority, deadline, assigneeId } =
      input;

    await asserProjectAsignee(projectId, assigneeId);

    const newTask = await prisma.task.create({
      data: {
        title,

        project: {
          connect: {
            id: projectId,
          },
        },

        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),

        ...(deadline !== undefined
          ? {
              deadline: deadline === null ? null : new Date(deadline),
            }
          : {}),

        ...(assigneeId
          ? {
              assignee: {
                connect: {
                  id: assigneeId,
                },
              },
            }
          : {}),
      },

      select: taskSelect,
    });

    return toTaskDTO(newTask);
  },

  async update(
    userId: string,
    projectId: string,
    taskId: string,
    input: UpdateTask,
  ) {
    await assertTaskWriteAccess(userId, projectId);

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw AppError.notFound("Задача не найдена");
    }

    const { title, description, status, priority, deadline, assigneeId } =
      input;

    await asserProjectAsignee(projectId, assigneeId);

    const newTask = await prisma.task.update({
      where: {
        id: taskId,
        projectId,
      },
      data: {
        ...(title !== undefined ? { title } : {}),

        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),

        ...(deadline !== undefined
          ? {
              deadline: deadline === null ? null : new Date(deadline),
            }
          : {}),

        ...(assigneeId !== undefined
          ? {
              assignee:
                assigneeId === null
                  ? { disconnect: true }
                  : {
                      connect: {
                        id: assigneeId,
                      },
                    },
            }
          : {}),
      },

      select: taskSelect,
    });

    return toTaskDTO(newTask);
  },

  async delete(userId: string, projectId: string, taskId: string) {
    await assertTaskWriteAccess(userId, projectId);

    await prisma.task.delete({
      where: { id: taskId, projectId },
    });
  },
};
