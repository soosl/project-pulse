import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import type { TaskListResponse, TaskStatus } from "@project-pulse/shared";

import { tasksApi } from "../api/tasks.api";
import { taskKeys } from "./task.keys";

type MoveTaskVariables = {
  taskId: string;
  taskStatus: TaskStatus;
};

type TasksData = InfiniteData<TaskListResponse>;

export const useMutateDragCard = (projectId: string) => {
  const queryClient = useQueryClient();
  const listsKey = taskKeys.lists(projectId);

  return useMutation({
    mutationKey: [...taskKeys.project(projectId), "move"],

    mutationFn: ({ taskId, taskStatus }: MoveTaskVariables) =>
      tasksApi.update(projectId, taskId, {
        status: taskStatus,
      }),

    onMutate: async ({ taskId, taskStatus }) => {
      await queryClient.cancelQueries({
        queryKey: listsKey,
      });

      const previousLists = queryClient.getQueriesData<TasksData>({
        queryKey: listsKey,
      });

      queryClient.setQueriesData<TasksData>(
        { queryKey: listsKey },
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              items: page.items.map((task) =>
                task.id === taskId ? { ...task, status: taskStatus } : task,
              ),
            })),
          };
        },
      );

      return { previousLists };
    },

    onError: (_, __, context) => {
      if (!context) {
        return;
      }

      for (const [queryKey, previousData] of context.previousLists) {
        if (previousData !== undefined) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }
    },

    onSuccess: (updatedTask) => {
      queryClient.setQueryData(
        taskKeys.detail(projectId, updatedTask.id),
        updatedTask,
      );
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: listsKey,
      }),
  });
};
