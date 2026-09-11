import { z } from "zod";

const EmailSchema = z.email("Некорректный email");

const NameSchema = z
  .string()
  .trim()
  .min(2, "Имя должно содержать минимум 2 символа")
  .max(50);

export const AvatarActionSchema = z.enum(["keep", "remove", "update"]);

export const RegisterUserServerSchema = z.object({
  email: EmailSchema,
  name: NameSchema,
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

export const RegisterUserSchema = RegisterUserServerSchema.extend({
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"],
});

export const LoginUserSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

export const UpdateUserSchema = z.object({
  name: NameSchema,
  avatarAction: AvatarActionSchema,
});

export const UserSchema = z.object({
  id: z.string(),
  email: EmailSchema,
  name: z.string(),
  avatar: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type AvatarAction = z.infer<typeof AvatarActionSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type RegisterUserServer = z.infer<typeof RegisterUserServerSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
