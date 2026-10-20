import type { QueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../projects";
import { taskKeys } from "./task.keys";

export const invalidateTaskQueries = (
  queryClient: QueryClient,
  projectId: string,
) =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: taskKeys.lists(projectId),
    }),
    queryClient.invalidateQueries({
      queryKey: projectKeys.stats(projectId),
    }),
  ]);
