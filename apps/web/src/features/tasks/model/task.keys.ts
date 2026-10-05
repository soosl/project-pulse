import type { TaskListQuery } from "@project-pulse/shared";

export const taskKeys = {
  all: ["tasks"] as const,
  project: (projectId: string) => [...taskKeys.all, projectId] as const,
  lists: (projectId: string) =>
    [...taskKeys.project(projectId), "list"] as const,
  list: (projectId: string, query: TaskListQuery) =>
    [...taskKeys.lists(projectId), query] as const,
  details: (projectId: string) =>
    [...taskKeys.project(projectId), "detail"] as const,
  detail: (projectId: string, taskId: string) =>
    [...taskKeys.details(projectId), taskId] as const,
};
