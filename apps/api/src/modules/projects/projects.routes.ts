import { Router } from "express";
import {
  CreateProjectSchema,
  ProjectListQuerySchema,
  ProjectParamsSchema,
  UpdateProjectSchema,
} from "@project-pulse/shared";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { projectsService } from "./projects.service.js";

export const projectsRouter = Router();

projectsRouter.use(authMiddleware);

projectsRouter.get("/", async (req, res) => {
  const query = ProjectListQuerySchema.parse(req.query);

  const projects = await projectsService.getList(req.userId, query);

  return res.json(projects);
});

projectsRouter.get("/:projectId", async (req, res) => {
  const params = ProjectParamsSchema.parse(req.params);
  const project = await projectsService.getById(req.userId, params.projectId);

  return res.json(project);
});

projectsRouter.post("/", async (req, res) => {
  const input = CreateProjectSchema.parse(req.body);

  const newProject = await projectsService.create({
    ...input,
    userId: req.userId,
  });

  return res.status(201).json(newProject);
});

projectsRouter.patch("/:projectId", async (req, res) => {
  const input = UpdateProjectSchema.parse(req.body);
  const params = ProjectParamsSchema.parse(req.params);

  const updatedProject = await projectsService.updateProject(
    req.userId,
    params.projectId,
    input,
  );

  return res.json(updatedProject);
});

projectsRouter.delete("/:projectId", async (req, res) => {
  const params = ProjectParamsSchema.parse(req.params);

  await projectsService.deleteProject(req.userId, params.projectId);

  return res.status(204).send();
});
