import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projects.api";
import { projectKeys } from "./project.keys";

export const useGetProjectStats = (projectId: string) =>
  useQuery({
    queryKey: projectKeys.stats(projectId),
    queryFn: ({ signal }) => projectsApi.getStats(projectId, signal),
    enabled: Boolean(projectId),
  });
