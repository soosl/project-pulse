import type { TaskPriority, TaskResponse } from "@project-pulse/shared";

type PriorityPresentation = {
  label: string;
  className: string;
};

const priorityPresentation = {
  LOW: {
    label: "Низкий",
    className: "bg-slate-100 text-slate-600",
  },
  MEDIUM: {
    label: "Средний",
    className: "bg-blue-50 text-blue-700",
  },
  HIGH: {
    label: "Высокий",
    className: "bg-orange-50 text-orange-700",
  },
  CRITICAL: {
    label: "Критический",
    className: "bg-red-50 text-red-700",
  },
} satisfies Record<TaskPriority, PriorityPresentation>;

const deadlineFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
});

type TaskCardProps = {
  task: TaskResponse;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  actionsDisabled?: boolean;
};

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: TaskCardProps) => {
  const priority = priorityPresentation[task.priority];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-bold ${priority.className}`}
      >
        {priority.label}
      </span>

      <h4 className="mt-3 break-words font-bold text-slate-900">
        {task.title}
      </h4>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {task.description}
        </p>
      )}

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
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
        <div className="mt-3 flex flex-wrap gap-4">
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
