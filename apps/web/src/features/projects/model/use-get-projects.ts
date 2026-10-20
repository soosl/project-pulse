import { useInfiniteQuery } from "@tanstack/react-query";

import { projectsApi } from "../api/projects.api";
import { projectKeys } from "./project.keys";

const PROJECTS_PAGE_SIZE = 6;

export const useGetProjects = (search: string) => {
  const normalizedSearch = search.trim();

  return useInfiniteQuery({
    queryKey: projectKeys.list(normalizedSearch),

    queryFn: ({ pageParam, signal }) =>
      projectsApi.getAll(
        {
          limit: PROJECTS_PAGE_SIZE,

          ...(normalizedSearch ? { search: normalizedSearch } : {}),

          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};
