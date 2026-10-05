import type { TaskPriority, TaskStatus } from "@project-pulse/shared";

export const statusOptions = [
  { value: "TODO", label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "REVIEW", label: "На проверке" },
  { value: "DONE", label: "Готово" },
] satisfies { value: TaskStatus; label: string }[];

export const priorityOptions = [
  { value: "LOW", label: "Низкий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "HIGH", label: "Высокий" },
  { value: "CRITICAL", label: "Критический" },
] satisfies { value: TaskPriority; label: string }[];
