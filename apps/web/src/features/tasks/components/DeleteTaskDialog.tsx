import type { TaskResponse } from "@project-pulse/shared";

import { getApiError } from "../../../lib/getApiError";
import { useDeleteTask } from "../model/use-delete-task";
import { FormModal } from "./FormModal";

type DeleteTaskDialogProps = {
  task: TaskResponse;
  onDeleted: () => void;
  onCancel: () => void;
};

export const DeleteTaskDialog = ({
  task,
  onDeleted,
  onCancel,
}: DeleteTaskDialogProps) => {
  const deleteTask = useDeleteTask(task.projectId, task.id);

  const handleDelete = () => {
    if (deleteTask.isPending) {
      return;
    }

    deleteTask.mutate(undefined, {
      onSuccess: () => onDeleted(),
    });
  };

  return (
    <FormModal
      title="Удалить задачу?"
      onClose={onCancel}
      closeDisabled={deleteTask.isPending}
    >
      <div className="p-5 sm:p-6">
        <p className="break-words font-semibold text-slate-900">{task.title}</p>

        <p className="mt-2 text-sm text-slate-500">
          Задача будет удалена без возможности восстановления.
        </p>

        {deleteTask.isError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {getApiError(deleteTask.error, "Не удалось удалить задачу")}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleteTask.isPending}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Отмена
          </button>

          <button
            type="button"
            disabled={deleteTask.isPending}
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleteTask.isPending ? "Удаляем…" : "Удалить"}
          </button>
        </div>
      </div>
    </FormModal>
  );
};
