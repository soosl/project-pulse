import {
  ProjectListResponseSchema,
  ProjectStatsResponseSchema,
  type CreateProject,
  type ProjectListQuery,
  type UpdateProject,
} from "@project-pulse/shared";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { toProjectDTO } from "./projects.mapper.js";

export const projectsService = {
  async create({
    name,
    description,
    userId,
  }: CreateProject & { userId: string }) {
    const newProject = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        owner: {
          connect: { id: userId },
        },
        members: {
          create: {
            user: {
              connect: { id: userId },
            },
            role: "OWNER",
          },
        },
      },
    });

    return toProjectDTO(newProject, "OWNER");
  },

  async getList(userId: string, query: ProjectListQuery) {
    const { search, cursor, limit } = query;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },

        ...(search
          ? {
              OR: [
                {
                  name: {
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

      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,

        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
          take: 1,
        },
      },
    });

    const hasNextPage = projects.length > limit;

    const page = hasNextPage ? projects.slice(0, limit) : projects;

    const items = page.map((project) => {
      const membership = project.members[0]?.role;

      if (!membership) {
        throw new Error(`Project membership invariant violated: ${project.id}`);
      }

      return toProjectDTO(project, membership);
    });

    return ProjectListResponseSchema.parse({
      items,
      nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
    });
  },

  async getById(userId: string, projectId: string) {
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
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,

        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
          take: 1,
        },
      },
    });

    if (!project) {
      throw AppError.notFound("Проект не найден");
    }

    const membership = project.members[0]?.role;

    if (!membership) {
      throw new Error(`Project membership invariant violated: ${project.id}`);
    }

    return toProjectDTO(project, membership);
  },

  async updateProject(userId: string, projectId: string, input: UpdateProject) {
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        ownerId: true,
      },
    });

    if (!existingProject) {
      throw AppError.notFound("Проект не найден");
    }

    if (existingProject.ownerId !== userId) {
      throw AppError.forbidden();
    }

    const updateData = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    } satisfies UpdateProject;

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
        ownerId: userId,
      },
      data: updateData,
    });

    return toProjectDTO(updatedProject, "OWNER");
  },

  async deleteProject(userId: string, projectId: string) {
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        ownerId: true,
      },
    });

    if (!existingProject) {
      throw AppError.notFound("Проект не найден");
    }

    if (existingProject.ownerId !== userId) {
      throw AppError.forbidden();
    }

    await prisma.project.delete({
      where: { id: projectId },
    });
  },

  async getStats(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: { userId },
        },
      },
      select: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw AppError.notFound("Проект не найден");
    }

    const taskGroups = await prisma.task.groupBy({
      by: ["status"],
      where: { projectId },
      _count: {
        _all: true,
      },
    });

    const totalTasks = taskGroups.reduce(
      (total, group) => total + group._count._all,
      0,
    );

    const completedTasks =
      taskGroups.find((group) => group.status === "DONE")?._count._all ?? 0;

    const completionPercent =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return ProjectStatsResponseSchema.parse({
      totalTasks,
      totalMembers: project._count.members,
      completionPercent,
    });
  },
};
