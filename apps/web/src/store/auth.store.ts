import { create } from "zustand";
import { api } from "../lib/api";
import {
  AuthResponseSchema,
  UserSchema,
  type UpdateUser,
  type User,
} from "@project-pulse/shared";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (user: UpdateUser) => Promise<void>;
  updateAvatar: (formData: FormData) => Promise<void>;
  removeAvatar: () => Promise<void>;
}

const ACCESS_TOKEN = "accessToken";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post<unknown>("/auth/login", {
      email,
      password,
    });

    const data = AuthResponseSchema.parse(response.data);

    localStorage.setItem(ACCESS_TOKEN, data.accessToken);

    set({
      user: data.user,
      isAuthenticated: true,
    });
  },

  register: async (email, password, name) => {
    const response = await api.post<unknown>("/auth/register", {
      email,
      password,
      name,
    });

    const data = AuthResponseSchema.parse(response.data);

    localStorage.setItem(ACCESS_TOKEN, data.accessToken);

    set({
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await api.get<unknown>("/auth/me");
      const user = UserSchema.parse(response.data);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem(ACCESS_TOKEN);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: async (user) => {
    const response = await api.patch<unknown>("/auth/profile", user);
    const updatedUser = UserSchema.parse(response.data);

    set({ user: updatedUser });
  },

  updateAvatar: async (formData: FormData) => {
    const response = await api.patch<unknown>("/auth/avatar", formData);
    const updatedUser = UserSchema.parse(response.data);

    set({ user: updatedUser });
  },

  removeAvatar: async () => {
    const response = await api.delete("/auth/avatar");
    const updatedUser = UserSchema.parse(response.data);

    set({ user: updatedUser });
  },
}));
