import { z } from "zod";

export const UserBaseSchema = z.object({
  email: z.email("Некорректный email"),
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(50),
  createdAt: z.date().optional(),
  avatar: z.url().optional(),
});

export const RegisterUserServerSchema = UserBaseSchema.extend({
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

export const RegisterUserSchema = RegisterUserServerSchema.extend({
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

export const LoginUserSchema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

export type User = z.infer<typeof UserBaseSchema>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type RegisterUserServer = z.infer<typeof RegisterUserServerSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
