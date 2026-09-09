import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const TaskSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен").max(200),
  description: z.string().optional(),
  status: TaskStatusEnum.default("TODO"),
  priority: TaskPriorityEnum.default("MEDIUM"),
  deadline: z.iso.datetime().optional(),
  assigneeId: z.cuid2().optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;
