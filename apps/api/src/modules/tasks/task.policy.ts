import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";

const getProjectMembership = async (userId: string, projectId: string) => {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw AppError.notFound("Проект не найден");
  }

  return membership;
};

export const assertTaskWriteAccess = async (
  userId: string,
  projectId: string,
) => {
  await getProjectMembership(userId, projectId);
};

export const assertTaskDeleteAccess = async (
  userId: string,
  projectId: string,
) => {
  const membership = await getProjectMembership(userId, projectId);

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw AppError.forbidden();
  }
};

export const asserProjectAsignee = async (
  projectId: string,
  assigneeId: string | null | undefined,
) => {
  if (assigneeId) {
    const assigneeMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: assigneeId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!assigneeMembership) {
      throw AppError.badRequest(
        "INVALID_ASSIGNEE",
        "Исполнитель должен быть участником проекта",
      );
    }
  }
};
