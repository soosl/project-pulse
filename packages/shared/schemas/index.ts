import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().optional(),
  email: z.email(),
  name: z.string(),
});

export const CreateUserSchema = UserSchema.omit({ id: true });

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
