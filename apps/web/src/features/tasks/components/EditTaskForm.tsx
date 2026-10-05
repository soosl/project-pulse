import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema, type TaskResponse } from "@project-pulse/shared";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { getApiError } from "../../../lib/getApiError";
import { useUpdateTask } from "../model/use-update-task";
import { FormModal } from "./FormModal";
import { priorityOptions, statusOptions } from "../constants";

const EditTaskFormSchema = CreateTaskSchema.pick({
  title: true,
  description: true,
  status: true,
  priority: true,
}).required();

type EditTaskValues = z.infer<typeof EditTaskFormSchema>;

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50";

type EditTaskFormProps = {
  task: TaskResponse;
  onSaved: () => void;
  onCancel: () => void;
};

export const EditTaskForm = ({
  task,
  onSaved,
  onCancel,
}: EditTaskFormProps) => {
  const updateTask = useUpdateTask(task.projectId, task.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditTaskValues>({
    resolver: zodResolver(EditTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
    },
  });

  const onSubmit = (values: EditTaskValues) => {
    if (!isDirty || updateTask.isPending) {
      return;
    }

    updateTask.mutate(
      {
        ...values,
        description: values.description || null,
      },
      {
        onSuccess: () => onSaved(),
      },
    );
  };

  return (
    <FormModal
      title="Редактирование задачи"
      onClose={onCancel}
      closeDisabled={updateTask.isPending}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => {
          if (updateTask.isError) {
            updateTask.reset();
          }
        }}
        className="p-5 sm:p-6"
        noValidate
      >
        <fieldset disabled={updateTask.isPending} className="min-w-0 space-y-4">
          <div>
            <label htmlFor="edit-task-title" className="text-sm font-semibold">
              Название
            </label>
            <input
              id="edit-task-title"
              maxLength={200}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? "edit-task-title-error" : undefined
              }
              className={fieldClassName}
              {...register("title")}
            />
            {errors.title && (
              <p
                id="edit-task-title-error"
                className="mt-1 text-sm text-red-600"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="text-sm font-semibold"
            >
              Описание
            </label>
            <textarea
              id="edit-task-description"
              rows={4}
              maxLength={5000}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "edit-task-description-error" : undefined
              }
              className={fieldClassName}
              {...register("description")}
            />
            {errors.description && (
              <p
                id="edit-task-description-error"
                className="mt-1 text-sm text-red-600"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-task-status"
                className="text-sm font-semibold"
              >
                Статус
              </label>
              <select
                id="edit-task-status"
                aria-invalid={Boolean(errors.status)}
                aria-describedby={
                  errors.status ? "edit-task-status-error" : undefined
                }
                className={fieldClassName}
                {...register("status")}
              >
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p
                  id="edit-task-status-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-task-priority"
                className="text-sm font-semibold"
              >
                Приоритет
              </label>
              <select
                id="edit-task-priority"
                aria-invalid={Boolean(errors.priority)}
                aria-describedby={
                  errors.priority ? "edit-task-priority-error" : undefined
                }
                className={fieldClassName}
                {...register("priority")}
              >
                {priorityOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p
                  id="edit-task-priority-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {updateTask.isError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {getApiError(updateTask.error, "Не удалось сохранить задачу")}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={updateTask.isPending}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!isDirty || updateTask.isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {updateTask.isPending ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </form>
    </FormModal>
  );
};
