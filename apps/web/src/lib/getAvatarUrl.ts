import { API_URL } from "./api";

export const getAvatarUrl = (str: unknown) => {
  if (typeof str === "string") {
    return str && str.startsWith("http") ? str : `${API_URL}${str}`;
  }
  return null;
};
