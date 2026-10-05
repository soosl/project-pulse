import {
  TaskListResponseSchema,
  TaskResponseSchema,
  type CreateTask,
  type TaskListQuery,
  type UpdateTask,
} from "@project-pulse/shared";
import { api } from "../../../lib/api";

export const tasksApi = {
  async create(projectId: string, input: CreateTask) {
    const response = await api.post(`/projects/${projectId}/tasks`, input);

    return TaskResponseSchema.parse(response.data);
  },

  async getAll(projectId: string, params: TaskListQuery, signal: AbortSignal) {
    const response = await api.get(`/projects/${projectId}/tasks`, {
      params,
      signal,
    });

    return TaskListResponseSchema.parse(response.data);
  },

  async getById(projectId: string, taskId: string, signal: AbortSignal) {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`, {
      signal,
    });

    return TaskResponseSchema.parse(response.data);
  },

  async update(projectId: string, taskId: string, input: UpdateTask) {
    const response = await api.patch(
      `/projects/${projectId}/tasks/${taskId}`,
      input,
    );

    return TaskResponseSchema.parse(response.data);
  },

  async delete(projectId: string, taskId: string) {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};
