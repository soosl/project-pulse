import type { Project } from "@prisma/client";
import { ProjectResponseSchema, type ProjectRole } from "@project-pulse/shared";

export const toProjectDTO = (project: Project, membership: ProjectRole) => {
  return ProjectResponseSchema.parse({
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    currentUserRole: membership,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
};
