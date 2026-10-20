import type { UpdateProject } from "@project-pulse/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { projectKeys } from "./project.keys";

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: projectKeys.detail(projectId),
    mutationFn: (updateData: UpdateProject) =>
      projectsApi.update(projectId, updateData),
    onSuccess(updatedProject) {
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);

      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
};
