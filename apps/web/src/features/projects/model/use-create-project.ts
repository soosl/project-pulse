import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectsApi } from "../api/projects.api";
import { projectKeys } from "./project.keys";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
