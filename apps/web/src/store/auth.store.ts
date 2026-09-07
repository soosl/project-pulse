import { create } from "zustand";
import { api } from "../lib/api";
import type { User } from "@project-pulse/shared";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("accessToken", data.accessToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error: any) {
      let errMessage = "Не удалось совершить вход";

      if (error.status === 401) {
        errMessage = "Неверный логин или пароль";
      }

      throw new Error(errMessage);
    }
  },

  register: async (email, password, name) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        name,
      });
      localStorage.setItem("accessToken", data.accessToken);
      set({ user: data.user, isAuthenticated: true });
    } catch (error: any) {
      let errMessage = "Не удалось зарегистрироваться";

      if (error.status === 400) {
        errMessage = "Пользователь уже существует";
      }

      throw new Error(errMessage);
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
