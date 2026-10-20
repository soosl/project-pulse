import type { ReactNode } from "react";
import { type TaskStatus } from "@project-pulse/shared";

type KanbanColumnProps = {
  title: string;
  count: number;
  markerClassName: string;
  children: ReactNode;
  status: TaskStatus;
  isDropTarget?: boolean;
};

export const KanbanColumn = ({
  title,
  count,
  markerClassName,
  children,
  status,
  isDropTarget = false,
}: KanbanColumnProps) => {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-xl border p-2.5 transition-colors ${
        isDropTarget
          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
          : "border-slate-200 bg-slate-100/70"
      }`}
      data-task-status={status}
    >
      <header className="flex items-center gap-2 px-1 py-1.5">
        <span
          className={`size-2.5 rounded-full ${markerClassName}`}
          aria-hidden="true"
        />

        <h3 className="text-sm font-bold text-slate-800">{title}</h3>

        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
          {count}
        </span>
      </header>

      <div className="mt-2 flex min-h-64 flex-1 flex-col gap-2.5 sm:min-h-80">
        {children}
      </div>
    </section>
  );
};

export const EmptyColumn = () => {
  return (
    <div className="flex min-h-32 flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 text-center">
      <p className="text-sm text-slate-400">Перетащите задачу сюда</p>
    </div>
  );
};
