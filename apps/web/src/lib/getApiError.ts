import axios from "axios";

export const getApiError = (error: unknown, fallback?: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message || fallback;
  }

  return fallback;
};
