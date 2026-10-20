import {
  TaskPrioritySchema,
  TaskStatusSchema,
  type TaskPriority,
  type TaskStatus,
} from "@project-pulse/shared";

export const taskStatusMeta = {
  TODO: {
    label: "К выполнению",
    markerClassName: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "В работе",
    markerClassName: "bg-blue-500",
  },
  REVIEW: {
    label: "На проверке",
    markerClassName: "bg-violet-500",
  },
  DONE: {
    label: "Готово",
    markerClassName: "bg-emerald-500",
  },
} satisfies Record<TaskStatus, { label: string; markerClassName: string }>;

export const taskPriorityMeta = {
  LOW: {
    label: "Низкий",
    className: "bg-slate-100 text-slate-600",
  },
  MEDIUM: {
    label: "Средний",
    className: "bg-blue-50 text-blue-700",
  },
  HIGH: {
    label: "Высокий",
    className: "bg-orange-50 text-orange-700",
  },
  CRITICAL: {
    label: "Критический",
    className: "bg-red-50 text-red-700",
  },
} satisfies Record<TaskPriority, { label: string; className: string }>;

export const statusOptions = TaskStatusSchema.options.map((value) => ({
  value,
  label: taskStatusMeta[value].label,
}));

export const priorityOptions = TaskPrioritySchema.options.map((value) => ({
  value,
  label: taskPriorityMeta[value].label,
}));

export const taskColumns = TaskStatusSchema.options.map((status) => ({
  status,
  title: taskStatusMeta[status].label,
  markerClassName: taskStatusMeta[status].markerClassName,
}));

export const realtimeLabels = {
  connecting: "Подключаем обновления…",
  connected: "Обновления подключены",
  offline: "Нет соединения — пробуем восстановить",
  error: "Обновления недоступны — попробуй открыть проект заново",
} as const;
