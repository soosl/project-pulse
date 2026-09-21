export const createSign = (name?: string) => {
  if (!name) return "";

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};
