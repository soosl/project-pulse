import { useInfiniteQuery } from "@tanstack/react-query";
import type { TaskListQuery } from "@project-pulse/shared";

import { tasksApi } from "../api/tasks.api";
import { taskKeys } from "./task.keys";

type TaskListFilters = Omit<TaskListQuery, "cursor">;

export const useGetTasks = (
  projectId: string,
  filters: TaskListFilters = { limit: 20 },
) => {
  const normalizedFilters: TaskListFilters = {
    ...filters,
    search: filters.search?.trim() || undefined,
  };

  return useInfiniteQuery({
    queryKey: taskKeys.list(projectId, normalizedFilters),

    queryFn: ({ pageParam, signal }) =>
      tasksApi.getAll(
        projectId,
        {
          ...normalizedFilters,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor,

    enabled: Boolean(projectId),
  });
};
