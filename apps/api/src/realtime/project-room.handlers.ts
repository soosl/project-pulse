import { ProjectRoomSchema } from "@project-pulse/shared";

import { AppError } from "../lib/app-error.js";
import { projectsService } from "../modules/projects/projects.service.js";
import type { RealtimeSocket } from "./socket.types.js";

export const getProjectRoom = (projectId: string) => `project:${projectId}`;

export const registerProjectRoomHandlers = (socket: RealtimeSocket) => {
  socket.on("project:join", async (payload, acknowledge) => {
    if (typeof acknowledge !== "function") {
      return;
    }

    const result = ProjectRoomSchema.safeParse(payload);

    if (!result.success) {
      acknowledge({
        ok: false,
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const { projectId } = result.data;

    try {
      await projectsService.getById(socket.data.userId, projectId);

      if (!socket.connected) {
        return;
      }

      await socket.join(getProjectRoom(projectId));

      acknowledge({ ok: true });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        acknowledge({
          ok: false,
          code: "NOT_FOUND",
        });
        return;
      }

      console.error("Failed to join project room:", error);

      acknowledge({
        ok: false,
        code: "INTERNAL_ERROR",
      });
    }
  });
};
