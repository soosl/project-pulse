import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "./project.keys";
import { projectsApi } from "../api/projects.api";

export const useGetProjectById = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => projectsApi.getById(id, signal),
  });
};
