import { z } from "zod";

export const ProjectRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);

const ProjectNameSchema = z
  .string()
  .trim()
  .min(1, "Название обязательно")
  .max(100, "Название не должно превышать 100 символов");

const ProjectDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Описание не должно превышать 500 символов")
  .nullable();

export const CreateProjectSchema = z
  .object({
    name: ProjectNameSchema,
    description: ProjectDescriptionSchema.optional(),
  })
  .strict();

export const UpdateProjectSchema = z
  .object({
    name: ProjectNameSchema.optional(),
    description: ProjectDescriptionSchema.optional(),
  })
  .strict()
  .refine(
    ({ name, description }) => name !== undefined || description !== undefined,
    "Необходимо передать хотя бы одно изменяемое поле",
  );

export const ProjectParamsSchema = z
  .object({
    projectId: z.string().min(1),
  })
  .strict();

export const ProjectListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(100).optional(),
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const ProjectResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    ownerId: z.string(),
    currentUserRole: ProjectRoleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const ProjectListResponseSchema = z
  .object({
    items: z.array(ProjectResponseSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export type ProjectRole = z.infer<typeof ProjectRoleSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectParams = z.infer<typeof ProjectParamsSchema>;
export type ProjectListQuery = z.infer<typeof ProjectListQuerySchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
