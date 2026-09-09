import { UserSchema, type User } from "@project-pulse/shared";

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  createdAt: true,
} as const;

type UserRecord = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
};

export const toUserDto = (user: UserRecord): User => {
  return UserSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
  });
};
