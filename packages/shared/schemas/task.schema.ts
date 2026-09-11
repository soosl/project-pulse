import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
]);

export const TaskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

const TaskTitleSchema = z
  .string()
  .trim()
  .min(1, "Заголовок обязателен")
  .max(200, "Заголовок не должен превышать 200 символов");

const TaskDescriptionSchema = z.string().trim().max(5000).nullable();
const TaskDeadlineSchema = z.iso.datetime().nullable();
const TaskAssigneeIdSchema = z.string().min(1).nullable();

export const CreateTaskSchema = z
  .object({
    title: TaskTitleSchema,
    description: TaskDescriptionSchema.optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    deadline: TaskDeadlineSchema.optional(),
    assigneeId: TaskAssigneeIdSchema.optional(),
  })
  .strict();

export const UpdateTaskSchema = z
  .object({
    title: TaskTitleSchema.optional(),
    description: TaskDescriptionSchema.optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    deadline: TaskDeadlineSchema.optional(),
    assigneeId: TaskAssigneeIdSchema.optional(),
  })
  .strict()
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    "Необходимо передать хотя бы одно изменяемое поле",
  );

export const TaskParamsSchema = z
  .object({
    projectId: z.string().min(1),
    taskId: z.string().min(1),
  })
  .strict();

export const TaskListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    assigneeId: z.string().min(1).optional(),
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const TaskAssigneeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  })
  .strict();

export const TaskResponseSchema = z
  .object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: TaskStatusSchema,
    priority: TaskPrioritySchema,
    deadline: z.iso.datetime().nullable(),
    assignee: TaskAssigneeSchema.nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const TaskListResponseSchema = z
  .object({
    items: z.array(TaskResponseSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskParams = z.infer<typeof TaskParamsSchema>;
export type TaskListQuery = z.infer<typeof TaskListQuerySchema>;
export type TaskAssignee = z.infer<typeof TaskAssigneeSchema>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
