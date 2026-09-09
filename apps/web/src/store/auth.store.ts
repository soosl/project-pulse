import { create } from "zustand";
import axios from "axios";
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
}

const ACCESS_TOKEN = "accessToken";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
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
    } catch (error: unknown) {
      let errMessage = "Не удалось совершить вход";

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        errMessage = "Неверный логин или пароль";
      }

      throw new Error(errMessage, { cause: error });
    }
  },

  register: async (email, password, name) => {
    try {
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
    } catch (error: unknown) {
      let errMessage = "Не удалось зарегистрироваться";

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        errMessage = "Пользователь уже существует";
      }

      throw new Error(errMessage, { cause: error });
    }
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

  updateUser: async (user: UpdateUser) => {
    try {
      const response = await api.patch<unknown>("/auth/profile", user);
      const updatedUser = UserSchema.parse(response.data);

      set({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.log(err);
    }
  },

  updateAvatar: async (formData: FormData) => {
    try {
      const response = await api.patch<unknown>("/auth/avatar", formData);

      const updatedUser = UserSchema.parse(response.data);

      set({ user: updatedUser });
    } catch (err) {
      console.log(err);
    }
  },

  // removeAvatar: async () => {},
}));
