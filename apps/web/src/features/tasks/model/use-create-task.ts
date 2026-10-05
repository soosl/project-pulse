import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks.api";
import { taskKeys } from "./task.keys";
import type { CreateTask } from "@project-pulse/shared";

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTask) => tasksApi.create(projectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskKeys.lists(projectId),
      });
    },
  });
};
