import axios from "axios";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { getApiError } from "../lib/getApiError";
import { Loader } from "../components/Loader";
import { type ProjectRole } from "@project-pulse/shared";
import { localeDate, localeTime } from "../lib/formatDate";
import {
  DeleteProjectForm,
  UpdateProjectForm,
  useGetProjectById,
} from "../features/projects";
import { useAuthStore } from "../store/auth.store";
import { createSign } from "../lib/createSign";

const roleMap: Record<ProjectRole, string> = {
  ADMIN: "Администратор проекта",
  MEMBER: "Участник проекта",
  OWNER: "Владелец проекта",
};

export const Project = () => {
  const params = useParams<"projectId">();

  if (!params.projectId) {
    return <Navigate to={"/dashboard"} replace />;
  }

  return <ProjectContent projectId={params.projectId} />;
};

const ProjectContent = ({ projectId }: { projectId: string }) => {
  const { data, isError, error, isRefetching, refetch, isLoading } =
    useGetProjectById(projectId);
  const userData = useAuthStore((store) => store.user);
  const navigate = useNavigate();

  if (isLoading || !userData) {
    return <Loader fullScreen={true} />;
  }

  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return (
      <ErrorState
        title="Проект не найден"
        message={getApiError(
          error,
          "Проект не существует, был удалён или у вас нет к нему доступа.",
        )}
        handleErrorBtnClick={() => navigate("/dashboard", { replace: true })}
        errorBtnText="Вернуться к проектам"
      />
    );
  }

  if (isError && !data) {
    return (
      <ErrorState
        title="Не удалось загрузить проект"
        message={getApiError(
          error,
          "Во время загрузки проекта произошла ошибка.",
        )}
        isErrorBtnLoading={isRefetching}
        handleErrorBtnClick={refetch}
        errorBtnText={isRefetching ? "Загрузка" : "Повторить попытку"}
      />
    );
  }

  if (!data) {
    return (
      <ErrorState
        title="Проект не найден"
        message="Произошла неизвестная ошибка"
        handleErrorBtnClick={() => navigate("/dashboard", { replace: true })}
        errorBtnText="Вернуться к проектам"
      />
    );
  }

  const { name, createdAt, currentUserRole, description, updatedAt } = data;
  const isOwner = currentUserRole === "OWNER";

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <nav
        className="flex items-center gap-2 text-sm text-slate-500"
        aria-label="Хлебные крошки"
      >
        <Link to="/dashboard" className="transition hover:text-blue-600">
          Проекты
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-slate-900">{name}</span>
      </nav>

      <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black ring-1 ring-white/20 backdrop-blur">
                {createSign(name)}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {name}
                  </h1>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                    {currentUserRole}
                  </span>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  {description || "Нет описания"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Создан
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {localeDate(createdAt)}
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Обновлён
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {localeTime(updatedAt)}
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ваша роль
            </p>
            <p className="mt-1 text-sm font-semibold text-violet-700">
              {roleMap[currentUserRole]}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-sm font-semibold text-blue-600">Обзор</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                Состояние проекта
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-sm font-medium text-slate-500">
                  Задачи
                </span>
                <p className="mt-3 text-3xl font-black tracking-tight">0</p>
                <p className="mt-1 text-xs text-slate-400">Пока не добавлены</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-sm font-medium text-slate-500">
                  Участники
                </span>
                <p className="mt-3 text-3xl font-black tracking-tight">1</p>
                <p className="mt-1 text-xs text-slate-400">Включая владельца</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-sm font-medium text-slate-500">
                  Выполнено
                </span>
                <p className="mt-3 text-3xl font-black tracking-tight">0%</p>
                <p className="mt-1 text-xs text-slate-400">Общий прогресс</p>
              </article>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Рабочая область
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                  Задачи проекта
                </h2>
              </div>

              <button
                type="button"
                disabled
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
              >
                Добавить задачу
              </button>
            </div>

            <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                ✓
              </span>
              <h3 className="mt-4 font-bold">Задач пока нет</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Kanban-доска и управление задачами появятся на следующем этапе
                разработки.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          {isOwner && data && (
            <>
              <UpdateProjectForm data={data} projectId={projectId} />
              <DeleteProjectForm projectId={projectId} />
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
