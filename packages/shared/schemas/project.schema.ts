import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  description: z.string().max(500).optional(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
