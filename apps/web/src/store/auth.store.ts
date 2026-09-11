import { create } from "zustand";
import { api, setUnauthorizedHandler } from "../lib/api";
import {
  AuthResponseSchema,
  UserSchema,
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
  updateUser: (formData: FormData) => Promise<User>;
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
    set({ user: null, isAuthenticated: false, isLoading: false });
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
      const response = await api.get<unknown>("/users/me");
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

  updateUser: async (formData) => {
    const response = await api.patch<unknown>("/users/me", formData);
    const updatedUser = UserSchema.parse(response.data);

    set({ user: updatedUser });

    return updatedUser;
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
