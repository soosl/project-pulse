import {
  ProjectListResponseSchema,
  ProjectResponseSchema,
  type CreateProject,
  type ProjectResponse,
} from "@project-pulse/shared";

import { api } from "../../../lib/api";

type GetProjectsParams = {
  search?: string;
  cursor?: string;
  limit?: number;
};

export const projectsApi = {
  async create(input: CreateProject): Promise<ProjectResponse> {
    const response = await api.post("/projects", input);

    return ProjectResponseSchema.parse(response.data);
  },

  async getAll(params: GetProjectsParams, signal: AbortSignal) {
    const response = await api.get("/projects", {
      params,
      signal,
    });

    return ProjectListResponseSchema.parse(response.data);
  },
};
