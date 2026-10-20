import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectSchema, type CreateProject } from "@project-pulse/shared";
import { useForm, useWatch } from "react-hook-form";

import { getApiError } from "../../../lib/getApiError";
import { useCreateProject } from "../model/use-create-project";

export const CreateProjectForm = () => {
  const { mutate, isError, isSuccess, reset, error, data, isPending } =
    useCreateProject();
  const {
    register,
    handleSubmit,
    reset: resetForm,
    control,
    formState: { errors },
  } = useForm<CreateProject>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const description = useWatch({ control, name: "description" });
  const descriptionLength = description?.length ?? 0;

  const onSubmit = (input: CreateProject) => {
    mutate(
      {
        ...input,
        description: input.description || null,
      },
      {
        onSuccess: () => resetForm(),
      },
    );
  };

  const resetMutationState = () => {
    if (isError || isSuccess) {
      reset();
    }
  };

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <form
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        onSubmit={handleSubmit(onSubmit)}
        onChange={resetMutationState}
        noValidate
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-2xl font-light text-white">
          +
        </div>
        <h2 className="mt-5 text-xl font-extrabold tracking-tight">
          Новый проект
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Создайте рабочее пространство и пригласите команду позже.
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
              id="project-name"
              type="text"
              maxLength={100}
              placeholder="Например, ProjectPulse"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "project-name-error" : undefined}
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register("name")}
            />
            {errors.name && (
              <p
                id="project-name-error"
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <label
                htmlFor="project-description"
                className="text-sm font-semibold text-slate-700"
              >
                Описание
              </label>
              <span className="text-xs text-slate-400">Необязательно</span>
            </div>
            <textarea
              id="project-description"
              rows={4}
              maxLength={500}
              placeholder="Коротко расскажите о проекте"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "project-description-error" : undefined
              }
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register("description")}
            />
            <div className="mt-1.5 flex items-center justify-between gap-4 text-xs">
              <span id="project-description-error" className="text-red-600">
                {errors.description?.message}
              </span>
              <span className="ml-auto text-slate-400">
                {descriptionLength}/500
              </span>
            </div>
          </div>
        </div>

        {isError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {getApiError(error, "Не удалось создать проект")}
          </p>
        )}

        {isSuccess && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            Проект «{data.name}» создан
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Создаём…" : "Создать проект"}
          {!isPending && <span aria-hidden="true">→</span>}
        </button>
      </form>
    </aside>
  );
};
