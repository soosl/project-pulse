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

export const tasksRouter = Router({ mergeParams: true });

tasksRouter.use(authMiddleware);

tasksRouter.get("/", async (req, res) => {
  const { projectId } = TaskCollectionParamsSchema.parse(req.params);
  const query = TaskListQuerySchema.parse(req.query);

  const tasks = await taskService.getList(req.userId, projectId, query);

  return res.json(tasks);
});

tasksRouter.get("/:taskId", async (req, res) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);

  const task = await taskService.getById(req.userId, projectId, taskId);

  return res.json(task);
});

tasksRouter.post("/", async (req, res) => {
  const { projectId } = TaskCollectionParamsSchema.parse(req.params);
  const input = CreateTaskSchema.parse(req.body);
  const newTask = await taskService.create(req.userId, projectId, input);

  return res.status(201).json(newTask);
});

tasksRouter.patch("/:taskId", async (req, res) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);
  const input = UpdateTaskSchema.parse(req.body);
  const updatedTask = await taskService.update(
    req.userId,
    projectId,
    taskId,
    input,
  );

  return res.json(updatedTask);
});

tasksRouter.delete("/:taskId", async (req, res) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);

  await taskService.delete(req.userId, projectId, taskId);

  return res.status(204).send();
});
