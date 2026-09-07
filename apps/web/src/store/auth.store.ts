import { create } from "zustand";
import axios from "axios";
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

const ACCESS_TOKEN = "accessToken";

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
      localStorage.setItem(ACCESS_TOKEN, data.ACCESS_TOKEN);
      set({ user: data.user, isAuthenticated: true });
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
      const { data } = await api.post("/auth/register", {
        email,
        password,
        name,
      });
      localStorage.setItem(ACCESS_TOKEN, data.ACCESS_TOKEN);
      set({ user: data.user, isAuthenticated: true });
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
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
      localStorage.removeItem(ACCESS_TOKEN);
    }
  },
}));
