import { z } from "zod";

export const ProjectRoomSchema = z
  .object({
    projectId: z.string().trim().min(1),
  })
  .strict();

export const ProjectRoomAckSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
  }),
  z.object({
    ok: z.literal(false),
    code: z.enum(["VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"]),
  }),
]);

export type ProjectRoomPayload = z.infer<typeof ProjectRoomSchema>;
export type ProjectRoomAck = z.infer<typeof ProjectRoomAckSchema>;

export interface ClientToServerEvents {
  "project:join": (
    payload: ProjectRoomPayload,
    acknowledge: (result: ProjectRoomAck) => void,
  ) => void;
}

export const TasksChangedSchema = z
  .object({
    projectId: z.string().trim().min(1),
  })
  .strict();

export type TasksChanged = z.infer<typeof TasksChangedSchema>;

export interface ServerToClientEvents {
  "tasks:changed": (payload: TasksChanged) => void;
}
