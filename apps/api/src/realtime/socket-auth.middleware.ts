import type { RealtimeSocket } from "./socket.types.js";
import { z } from "zod";

import { authService } from "../modules/auth/auth.service.js";

const SocketAuthSchema = z.object({
  token: z.string().trim().min(1),
});

export const socketAuthMiddleware = (
  socket: RealtimeSocket,
  next: (error?: Error) => void,
) => {
  const result = SocketAuthSchema.safeParse(socket.handshake.auth);

  if (!result.success) {
    next(new Error("UNAUTHORIZED"));
    return;
  }

  const userId = authService.verifyToken(result.data.token);

  if (!userId) {
    next(new Error("UNAUTHORIZED"));
    return;
  }

  socket.data.userId = userId;
  next();
};
