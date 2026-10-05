import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "./task.keys";
import { tasksApi } from "../api/tasks.api";

export const useDeleteTask = (projectId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: taskKeys.detail(projectId, taskId),
    mutationFn: () => tasksApi.delete(projectId, taskId),
    onSuccess() {
      queryClient.removeQueries({
        queryKey: taskKeys.detail(projectId, taskId),
        exact: true,
      });

      return queryClient.invalidateQueries({
        queryKey: taskKeys.lists(projectId),
      });
    },
  });
};
