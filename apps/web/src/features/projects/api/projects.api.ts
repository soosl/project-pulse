import {
  ProjectListResponseSchema,
  ProjectResponseSchema,
  type CreateProject,
  type UpdateProject,
} from "@project-pulse/shared";

import { api } from "../../../lib/api";

type GetProjectsParams = {
  search?: string;
  cursor?: string;
  limit?: number;
};

export const projectsApi = {
  async create(input: CreateProject) {
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

  async getById(id: string, signal: AbortSignal) {
    const response = await api.get(`/projects/${id}`, { signal });

    return ProjectResponseSchema.parse(response.data);
  },

  async update(id: string, input: UpdateProject) {
    const response = await api.patch(`/projects/${id}`, input);

    return ProjectResponseSchema.parse(response.data);
  },

  async delete(id: string) {
    return await api.delete(`/projects/${id}`);
  },
};
