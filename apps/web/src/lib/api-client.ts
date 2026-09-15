import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 2) {
    return false;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  // Сетевые ошибки без HTTP-ответа можно повторить.
  if (status === undefined) {
    return true;
  }

  // Повторяем только временные серверные ошибки.
  return status >= 500;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1_000,
      gcTime: 5 * 60 * 1_000,

      retry: shouldRetryQuery,

      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },

    mutations: {
      retry: false,
    },
  },
});
