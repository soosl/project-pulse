import { TaskStatusSchema, type TaskResponse } from "@project-pulse/shared";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";

type MoveTask = {
  taskId: string;
  taskStatus: TaskResponse["status"];
};

type DragOptions = {
  boardRef: RefObject<HTMLDivElement | null>;
  disabled: boolean;
  onDrop: (move: MoveTask) => void;
  onDragStart: () => void;
};

type DragSession = {
  task: TaskResponse;
  handle: HTMLButtonElement;
  pointerId: number;
  startX: number;
  startY: number;
  rect: DOMRect;
  active: boolean;
};

type DragPreview = {
  task: TaskResponse;
  left: number;
  top: number;
  width: number;
  targetStatus: TaskResponse["status"] | null;
};

const ACTIVATION_DISTANCE = 6;

const releaseSession = (session: DragSession | null) => {
  if (session?.handle.hasPointerCapture(session.pointerId)) {
    session.handle.releasePointerCapture(session.pointerId);
  }
};

export const useDragCard = ({
  boardRef,
  disabled,
  onDrop,
  onDragStart,
}: DragOptions) => {
  const sessionRef = useRef<DragSession | null>(null);
  const [preview, setPreview] = useState<DragPreview | null>(null);

  const cleanup = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    setPreview(null);
    releaseSession(session);
  }, []);

  useEffect(() => {
    window.addEventListener("blur", cleanup);

    return () => {
      window.removeEventListener("blur", cleanup);
      const session = sessionRef.current;
      sessionRef.current = null;
      releaseSession(session);
    };
  }, [cleanup]);

  const getTargetStatus = (x: number, y: number) => {
    const column = document
      .elementFromPoint(x, y)
      ?.closest("[data-task-status]");

    if (!column || !boardRef.current?.contains(column)) return null;

    const result = TaskStatusSchema.safeParse(
      column.getAttribute("data-task-status"),
    );

    return result.success ? result.data : null;
  };

  const handleStartDrag =
    (task: TaskResponse) => (event: PointerEvent<HTMLButtonElement>) => {
      if (
        disabled ||
        sessionRef.current ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return;
      }

      const card = event.currentTarget.closest("[data-task-id]");
      if (!card) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      sessionRef.current = {
        task,
        handle: event.currentTarget,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        rect: card.getBoundingClientRect(),
        active: false,
      };
    };

  const handleDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;

    if (disabled) {
      cleanup();
      return;
    }

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;

    if (!session.active) {
      if (Math.hypot(deltaX, deltaY) < ACTIVATION_DISTANCE) return;
      session.active = true;
      onDragStart();
    }

    event.preventDefault();
    setPreview({
      task: session.task,
      left: session.rect.left + deltaX,
      top: session.rect.top + deltaY,
      width: session.rect.width,
      targetStatus: getTargetStatus(event.clientX, event.clientY),
    });
  };

  const handleEndDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current;
    if (!session || event.pointerId !== session.pointerId) return;

    const status =
      session.active && !disabled
        ? getTargetStatus(event.clientX, event.clientY)
        : null;

    cleanup();

    if (status && status !== session.task.status) {
      onDrop({ taskId: session.task.id, taskStatus: status });
    }
  };

  const handleCancelDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerId === sessionRef.current?.pointerId) cleanup();
  };

  return {
    preview,
    handleStartDrag,
    handleDrag,
    handleEndDrag,
    handleCancelDrag,
  };
};
