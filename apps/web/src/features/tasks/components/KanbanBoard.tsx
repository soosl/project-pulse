import { useState } from "react";
import type {
  ProjectRole,
  TaskResponse,
  TaskStatus,
} from "@project-pulse/shared";

import { getApiError } from "../../../lib/getApiError";
import { useGetTasks } from "../model/use-get-tasks";
import { CreateTaskForm } from "./CreateTaskForm";
import { EmptyColumn, KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { EditTaskForm } from "./EditTaskForm";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

type ColumnConfig = {
  status: TaskStatus;
  title: string;
  markerClassName: string;
};

const columns = [
  {
    status: "TODO",
    title: "К выполнению",
    markerClassName: "bg-slate-400",
  },
  {
    status: "IN_PROGRESS",
    title: "В работе",
    markerClassName: "bg-blue-500",
  },
  {
    status: "REVIEW",
    title: "На проверке",
    markerClassName: "bg-violet-500",
  },
  {
    status: "DONE",
    title: "Готово",
    markerClassName: "bg-emerald-500",
  },
] satisfies ColumnConfig[];

type KanbanBoardProps = {
  projectId: string;
  currentUserRole: ProjectRole;
};

type TaskEditor =
  | { mode: "create"; status: TaskStatus }
  | { mode: "edit"; task: TaskResponse }
  | { mode: "delete"; task: TaskResponse }
  | null;

export const KanbanBoard = ({
  projectId,
  currentUserRole,
}: KanbanBoardProps) => {
  const [editor, setEditor] = useState<TaskEditor>(null);

  const {
    data,
    error,
    isPending,
    isError,
    isRefetchError,
    isRefetching,
    isFetchNextPageError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetTasks(projectId);

  const canManageTasks =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  const tasksByStatus: Record<TaskStatus, TaskResponse[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };

  for (const task of tasks) {
    tasksByStatus[task.status].push(task);
  }

  const closeEditor = () => setEditor(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-blue-600">Рабочая область</p>

          <h2 className="mt-1 text-xl font-extrabold tracking-tight">
            Задачи проекта
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Задачи и прогресс команды.
          </p>
        </div>

        {canManageTasks && (
          <button
            type="button"
            disabled={editor !== null}
            onClick={() => setEditor({ mode: "create", status: "TODO" })}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Новая задача
          </button>
        )}
      </header>

      <div className="p-5 sm:p-6">
        {canManageTasks && editor?.mode === "create" && (
          <CreateTaskForm
            key={`create:${projectId}:${editor.status}`}
            projectId={projectId}
            initialStatus={editor.status}
            onCreated={closeEditor}
            onCancel={closeEditor}
          />
        )}

        {canManageTasks && editor?.mode === "edit" && (
          <EditTaskForm
            key={`edit:${editor.task.id}`}
            task={editor.task}
            onSaved={closeEditor}
            onCancel={closeEditor}
          />
        )}

        {canManageTasks && editor?.mode === "delete" && (
          <DeleteTaskDialog
            key={`delete:${editor.task.id}`}
            task={editor.task}
            onDeleted={closeEditor}
            onCancel={closeEditor}
          />
        )}

        {isPending && (
          <p role="status" className="py-10 text-center text-sm text-slate-500">
            Загружаем задачи…
          </p>
        )}

        {isError && !data && (
          <div className="py-10 text-center">
            <p role="alert" className="text-sm text-red-600">
              {getApiError(error, "Не удалось загрузить задачи")}
            </p>

            <button
              type="button"
              disabled={isRefetching}
              onClick={() => void refetch()}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isRefetching ? "Загружаем…" : "Повторить"}
            </button>
          </div>
        )}

        {data && (
          <>
            {isRefetchError && (
              <div className="mb-4 rounded-xl bg-red-50 p-4">
                <p role="alert" className="text-sm text-red-700">
                  {getApiError(error, "Не удалось обновить задачи")}
                </p>

                <button
                  type="button"
                  disabled={isRefetching}
                  onClick={() => void refetch()}
                  className="mt-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  {isRefetching ? "Обновляем…" : "Повторить"}
                </button>
              </div>
            )}

            <div className="overflow-x-auto overscroll-x-contain pb-2">
              <div className="grid grid-flow-col auto-cols-[minmax(290px,1fr)] gap-4">
                {columns.map(({ status, title, markerClassName }) => {
                  const columnTasks = tasksByStatus[status];

                  return (
                    <KanbanColumn
                      key={status}
                      title={title}
                      count={columnTasks.length}
                      markerClassName={markerClassName}
                    >
                      {columnTasks.length === 0 ? (
                        <EmptyColumn />
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            actionsDisabled={editor !== null}
                            onEdit={
                              canManageTasks
                                ? () => setEditor({ mode: "edit", task })
                                : undefined
                            }
                            onDelete={
                              canManageTasks
                                ? () => setEditor({ mode: "delete", task })
                                : undefined
                            }
                          />
                        ))
                      )}
                    </KanbanColumn>
                  );
                })}
              </div>
            </div>

            {isFetchNextPageError && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {getApiError(error, "Не удалось загрузить следующие задачи")}
              </p>
            )}

            {(hasNextPage || isFetchNextPageError) && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  disabled={isFetchingNextPage || isRefetching}
                  onClick={() => void fetchNextPage()}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingNextPage
                    ? "Загружаем…"
                    : isFetchNextPageError
                      ? "Повторить загрузку"
                      : "Загрузить ещё"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
