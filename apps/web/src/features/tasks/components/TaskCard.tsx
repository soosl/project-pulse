import type { TaskResponse } from "@project-pulse/shared";
import type { ComponentPropsWithRef } from "react";
import { taskPriorityMeta } from "../constants";

const deadlineFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

type TaskCardProps = {
  task: TaskResponse;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  actionsDisabled?: boolean;
  dragHandleProps?: ComponentPropsWithRef<"button"> | undefined;
  isDragging?: boolean;
};

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  actionsDisabled = false,
  dragHandleProps,
  isDragging = false,
}: TaskCardProps) => {
  const priority = taskPriorityMeta[task.priority];

  return (
    <article
      data-task-id={task.id}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${priority.className}`}
        >
          {priority.label}
        </span>

        {dragHandleProps && (
          <button
            aria-label="Перетащить задачу"
            {...dragHandleProps}
            type="button"
            disabled={dragHandleProps.disabled}
            className="flex size-8 shrink-0 touch-none items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-grab"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="currentColor"
            >
              <circle cx="5" cy="4" r="1.5" />
              <circle cx="11" cy="4" r="1.5" />
              <circle cx="5" cy="10" r="1.5" />
              <circle cx="11" cy="10" r="1.5" />
              <circle cx="5" cy="16" r="1.5" />
              <circle cx="11" cy="16" r="1.5" />
            </svg>
          </button>
        )}
      </div>

      <h4 className="mt-2 break-words text-sm font-bold text-slate-900">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 break-words text-sm text-slate-500">
          {task.description}
        </p>
      )}

      <footer className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <span className="min-w-0 truncate">
          {task.assignee?.name ?? "Без исполнителя"}
        </span>

        {task.deadline && (
          <time dateTime={task.deadline} className="shrink-0">
            {deadlineFormatter.format(new Date(task.deadline))}
          </time>
        )}
      </footer>
      {(onEdit || onDelete) && (
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2">
          {onEdit && (
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={onEdit}
              className="text-sm font-semibold text-blue-600 disabled:opacity-50"
            >
              Редактировать
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={onDelete}
              className="text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </article>
  );
};
