import type { ReactNode } from "react";

type KanbanColumnProps = {
  title: string;
  count: number;
  markerClassName: string;
  children: ReactNode;
};

export const KanbanColumn = ({
  title,
  count,
  markerClassName,
  children,
}: KanbanColumnProps) => {
  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
      <header className="flex items-center gap-2.5 px-1 py-2">
        <span
          className={`size-2.5 rounded-full ${markerClassName}`}
          aria-hidden="true"
        />

        <h3 className="text-sm font-bold text-slate-800">{title}</h3>

        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">
          {count}
        </span>
      </header>

      <div className="mt-2 flex min-h-40 flex-1 flex-col gap-3">{children}</div>
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
