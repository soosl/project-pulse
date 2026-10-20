import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks.api";
import type { CreateTask } from "@project-pulse/shared";
import { invalidateTaskQueries } from "./invalidate-task-queries";

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTask) => tasksApi.create(projectId, input),
    onSuccess: async () => {
      return await invalidateTaskQueries(queryClient, projectId);
    },
  });
};
