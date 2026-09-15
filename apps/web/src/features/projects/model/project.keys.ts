export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (search: string) => [...projectKeys.lists(), { search }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
};
