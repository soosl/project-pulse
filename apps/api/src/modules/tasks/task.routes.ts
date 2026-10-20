import { Router } from "express";
import {
  CreateTaskSchema,
  TaskCollectionParamsSchema,
  TaskListQuerySchema,
  TaskParamsSchema,
  UpdateTaskSchema,
} from "@project-pulse/shared";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { taskService } from "./task.service.js";

export const createTasksRouter = (
  onTasksChanged: (projectId: string) => void,
) => {
  const router = Router({ mergeParams: true });

  router.use(authMiddleware);

  router.get("/", async (req, res) => {
    const { projectId } = TaskCollectionParamsSchema.parse(req.params);
    const query = TaskListQuerySchema.parse(req.query);

    const tasks = await taskService.getList(req.userId, projectId, query);

    return res.json(tasks);
  });

  router.get("/:taskId", async (req, res) => {
    const { projectId, taskId } = TaskParamsSchema.parse(req.params);

    const task = await taskService.getById(req.userId, projectId, taskId);

    return res.json(task);
  });

  router.post("/", async (req, res) => {
    const { projectId } = TaskCollectionParamsSchema.parse(req.params);
    const input = CreateTaskSchema.parse(req.body);

    const newTask = await taskService.create(req.userId, projectId, input);

    onTasksChanged(projectId);

    return res.status(201).json(newTask);
  });

  router.patch("/:taskId", async (req, res) => {
    const { projectId, taskId } = TaskParamsSchema.parse(req.params);
    const input = UpdateTaskSchema.parse(req.body);

    const updatedTask = await taskService.update(
      req.userId,
      projectId,
      taskId,
      input,
    );

    onTasksChanged(projectId);

    return res.json(updatedTask);
  });

  router.delete("/:taskId", async (req, res) => {
    const { projectId, taskId } = TaskParamsSchema.parse(req.params);

    await taskService.delete(req.userId, projectId, taskId);

    onTasksChanged(projectId);

    return res.status(204).send();
  });

  return router;
};
