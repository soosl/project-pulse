import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTaskSchema,
  type CreateTask,
  type TaskStatus,
} from "@project-pulse/shared";
import { useForm } from "react-hook-form";

import { getApiError } from "../../../lib/getApiError";
import { useCreateTask } from "../model/use-create-task";
import { FormModal } from "./FormModal";
import { priorityOptions, statusOptions } from "../constants";

const fieldClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

type CreateTaskFormProps = {
  projectId: string;
  initialStatus?: TaskStatus;
  onCreated: () => void;
  onCancel: () => void;
};

export const CreateTaskForm = ({
  projectId,
  initialStatus = "TODO",
  onCreated,
  onCancel,
}: CreateTaskFormProps) => {
  const createTask = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTask>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: initialStatus,
      priority: "MEDIUM",
    },
  });

  const onSubmit = (input: CreateTask) => {
    createTask.mutate(
      {
        ...input,
        description: input.description || null,
      },
      {
        onSuccess: () => onCreated(),
      },
    );
  };

  return (
    <FormModal
      title="Новая задача"
      onClose={onCancel}
      closeDisabled={createTask.isPending}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => {
          if (createTask.isError) {
            createTask.reset();
          }
        }}
        className="p-5 sm:p-6"
        noValidate
      >
        <fieldset disabled={createTask.isPending} className="min-w-0 space-y-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Название
            </label>

            <input
              id="task-title"
              type="text"
              placeholder="Что нужно сделать?"
              maxLength={200}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              className={fieldClassName}
              {...register("title")}
            />

            {errors.title && (
              <p id="task-title-error" className="mt-1.5 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="task-description"
                className="text-sm font-semibold text-slate-700"
              >
                Описание
              </label>
              <span className="text-xs text-slate-400">Необязательно</span>
            </div>

            <textarea
              id="task-description"
              rows={4}
              maxLength={5000}
              placeholder="Детали задачи и ожидаемый результат"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "task-description-error" : undefined
              }
              className={`${fieldClassName} resize-y`}
              {...register("description")}
            />

            {errors.description && (
              <p
                id="task-description-error"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Статус
              </label>

              <select
                id="task-status"
                aria-invalid={Boolean(errors.status)}
                aria-describedby={
                  errors.status ? "task-status-error" : undefined
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
                  id="task-status-error"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Приоритет
              </label>

              <select
                id="task-priority"
                aria-invalid={Boolean(errors.priority)}
                aria-describedby={
                  errors.priority ? "task-priority-error" : undefined
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
                  id="task-priority-error"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {createTask.isError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {getApiError(createTask.error, "Не удалось создать задачу")}
          </p>
        )}

        <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={createTask.isPending}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отмена
          </button>

          <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createTask.isPending ? "Создаём…" : "Создать задачу"}
          </button>
        </footer>
      </form>
    </FormModal>
  );
};
