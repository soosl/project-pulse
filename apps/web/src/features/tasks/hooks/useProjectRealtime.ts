import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  ProjectRoomAckSchema,
  TasksChangedSchema,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@project-pulse/shared";

import { API_URL } from "../../../lib/api";
import { taskKeys } from "../model/task.keys";
import { invalidateTaskQueries } from "../model/invalidate-task-queries";

type RealtimeStatus = "connecting" | "connected" | "offline" | "error";

type ProjectSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const useProjectRealtime = (projectId: string) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  useEffect(() => {
    let disposed = false;
    let needsSync = false;

    const moveKey = [...taskKeys.project(projectId), "move"];

    const socket: ProjectSocket = io(API_URL, {
      autoConnect: false,
      forceNew: true,
      withCredentials: true,
      auth: (callback) => {
        callback({
          token: localStorage.getItem("accessToken") ?? "",
        });
      },
    });

    const flushSync = () => {
      if (
        disposed ||
        !needsSync ||
        queryClient.isMutating({ mutationKey: moveKey }) > 0
      ) {
        return;
      }

      needsSync = false;

      return invalidateTaskQueries(queryClient, projectId);
    };

    const requestSync = () => {
      needsSync = true;
      flushSync();
    };

    // Если событие пришло во время переноса, обновим список
    // после завершения мутации, включая её откат и onSettled.
    const unsubscribe = queryClient
      .getMutationCache()
      .subscribe(() => flushSync());

    const handleConnect = async () => {
      const connectionId = socket.id;

      setStatus("connecting");

      try {
        const response = await socket
          .timeout(5_000)
          .emitWithAck("project:join", { projectId });

        if (disposed || !socket.connected || socket.id !== connectionId) {
          return;
        }

        const result = ProjectRoomAckSchema.safeParse(response);

        if (!result.success || !result.data.ok) {
          setStatus("error");
          return;
        }

        setStatus("connected");

        // За время отсутствия соединения могли произойти изменения.
        requestSync();
      } catch {
        if (!disposed && socket.connected && socket.id === connectionId) {
          setStatus("error");
        }
      }
    };

    const handleTasksChanged = (payload: unknown) => {
      const result = TasksChangedSchema.safeParse(payload);

      if (!result.success || result.data.projectId !== projectId) {
        return;
      }

      requestSync();
    };

    const handleDisconnect = () => {
      setStatus("offline");
    };

    const handleConnectError = () => {
      setStatus(socket.active ? "offline" : "error");
    };

    socket.on("connect", handleConnect);
    socket.on("tasks:changed", handleTasksChanged);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.connect();

    return () => {
      disposed = true;
      unsubscribe();

      socket.off("connect", handleConnect);
      socket.off("tasks:changed", handleTasksChanged);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.disconnect();
    };
  }, [projectId, queryClient]);

  return { status };
};
