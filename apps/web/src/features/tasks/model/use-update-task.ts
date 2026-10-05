import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "./task.keys";
import type { UpdateTask } from "@project-pulse/shared";
import { tasksApi } from "../api/tasks.api";

export const useUpdateTask = (projectId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: taskKeys.detail(projectId, taskId),
    mutationFn: (updateData: UpdateTask) =>
      tasksApi.update(projectId, taskId, updateData),
    onSuccess(updatedTask) {
      queryClient.setQueryData(taskKeys.detail(projectId, taskId), updatedTask);

      return queryClient.invalidateQueries({
        queryKey: taskKeys.lists(projectId),
      });
    },
  });
};
