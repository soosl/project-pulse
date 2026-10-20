import { Prisma } from "@prisma/client";
import { TaskResponseSchema } from "@project-pulse/shared";

export const taskSelect = {
  id: true,
  projectId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  deadline: true,
  createdAt: true,
  updatedAt: true,

  assignee: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
} satisfies Prisma.TaskSelect;

type TaskWithAssignee = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;

export const toTaskDTO = (task: TaskWithAssignee) => {
  return TaskResponseSchema.parse({
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    deadline: task.deadline?.toISOString() ?? null,
    assignee: task.assignee,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  });
};
