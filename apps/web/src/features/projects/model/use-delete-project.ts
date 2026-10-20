import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "./project.keys";
import { projectsApi } from "../api/projects.api";

export const useDeleteProject = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: projectKeys.detail(projectId),
    mutationFn: () => projectsApi.delete(projectId),
    onSuccess() {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });

      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
};
