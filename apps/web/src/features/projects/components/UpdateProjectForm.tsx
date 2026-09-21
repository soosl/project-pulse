import {
  UpdateProjectSchema,
  type ProjectResponse,
  type UpdateProject,
} from "@project-pulse/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProject } from "../model/use-update-project";
import { getApiError } from "../../../lib/getApiError";

export const UpdateProjectForm = ({
  projectId,
  data,
}: {
  projectId: string;
  data: Pick<ProjectResponse, "name" | "description">;
}) => {
  const updateProject = useUpdateProject(projectId);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<UpdateProject>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues: {
      name: data.name,
      description: data.description,
    },
  });

  const handleSubmitForm = (updateData: UpdateProject) => {
    const payload: UpdateProject = {};

    if (dirtyFields.name && updateData.name) {
      payload.name = updateData.name;
    }

    if (dirtyFields.description) {
      payload.description = updateData.description || null;
    }

    updateProject.mutate(payload, {
      onSuccess(updatedProject) {
        resetForm({
          name: updatedProject.name,
          description: updatedProject.description,
        });
      },
    });
  };

  const handleFormChange = () => {
    if (updateProject.isError || updateProject.isSuccess) {
      updateProject.reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      onChange={handleFormChange}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <h2 className="text-lg font-extrabold tracking-tight">
        Настройки проекта
      </h2>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        Измените основные данные рабочего пространства.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="project-name"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Название
          </label>
          <input
            {...register("name")}
            id="project-name"
            type="text"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "project-name-error" : undefined}
            className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {errors.name && (
            <p id="project-name-error" className="mt-1.5 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="project-description"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Описание
          </label>
          <textarea
            {...register("description")}
            id="project-description"
            rows={5}
            maxLength={500}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "project-description-error" : undefined
            }
            placeholder="Нет описания"
            className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {errors.description && (
            <p
              id="project-description-error"
              className="mt-1.5 text-sm text-red-600"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        {updateProject.isError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {getApiError(
              updateProject.error,
              "Не удалось сохранить изменения. Попробуйте ещё раз.",
            )}
          </p>
        )}

        {updateProject.isSuccess && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            Изменения сохранены
          </p>
        )}

        <button
          type="submit"
          disabled={updateProject.isPending || !isDirty}
          aria-busy={updateProject.isPending}
          className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateProject.isPending ? "Сохраняем…" : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
};
