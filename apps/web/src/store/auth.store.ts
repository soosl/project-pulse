import { create } from "zustand";
import axios from "axios";
import { api } from "../lib/api";
import type { UpdateUser, User } from "@project-pulse/shared";

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
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      console.log(data);
      localStorage.setItem(ACCESS_TOKEN, data.accessToken);
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
      localStorage.setItem(ACCESS_TOKEN, data.accessToken);
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
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        set({ isLoading: false });
        localStorage.removeItem(ACCESS_TOKEN);
      }
    }
  },

  updateUser: async (user: UpdateUser) => {
    try {
      const { data } = await api.patch("/auth/profile", user);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.log(err);
    }
  },

  updateAvatar: async (formdata: FormData) => {
    try {
      console.log(formdata);

      const { data } = await api.patch("/auth/avatar", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({ user: data });
    } catch (err) {
      console.log(err);
    }
  },

  // removeAvatar: async () => {},
}));
