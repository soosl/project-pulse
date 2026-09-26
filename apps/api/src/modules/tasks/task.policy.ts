import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";

export const assertTaskWriteAccess = async (
  userId: string,
  projectId: string,
) => {
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

  if (membership.role === "MEMBER") {
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
