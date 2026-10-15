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
import { KanbanBoard } from "../features/tasks";

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
    <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <nav
        className="flex items-center gap-2 text-sm text-slate-500"
        aria-label="Хлебные крошки"
      >
        <Link to="/dashboard" className="transition hover:text-blue-600">
          Проекты
        </Link>
        <span aria-hidden="true">/</span>
        <span className="min-w-0 truncate text-slate-900">{name}</span>
      </nav>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-4 text-white sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg font-black ring-1 ring-white/20 backdrop-blur">
                {createSign(name)}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="min-w-0 break-words text-2xl font-black tracking-tight sm:text-3xl">
                    {name}
                  </h1>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                    {currentUserRole}
                  </span>
                </div>

                <p className="mt-2 max-w-3xl break-words text-sm leading-5 text-blue-100">
                  {description || "Нет описания"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Создан
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {localeDate(createdAt)}
            </p>
          </div>

          <div className="px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Обновлён
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {localeTime(updatedAt)}
            </p>
          </div>

          <div className="px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ваша роль
            </p>
            <p className="mt-1 text-sm font-semibold text-violet-700">
              {roleMap[currentUserRole]}
            </p>
          </div>
        </div>
      </section>

      <div className="min-w-0 space-y-4">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">Обзор</p>
            <h2 className="mt-1 text-base font-extrabold tracking-tight">
              Состояние проекта
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <article className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="block break-words text-xs font-medium text-slate-500 sm:text-sm">
                Задачи
              </span>
              <p className="mt-1 text-xl font-black tracking-tight">0</p>
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                Пока не добавлены
              </p>
            </article>

            <article className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="block break-words text-xs font-medium text-slate-500 sm:text-sm">
                Участники
              </span>
              <p className="mt-1 text-xl font-black tracking-tight">1</p>
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                Включая владельца
              </p>
            </article>

            <article className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="block break-words text-xs font-medium text-slate-500 sm:text-sm">
                Выполнено
              </span>
              <p className="mt-1 text-xl font-black tracking-tight">0%</p>
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                Общий прогресс
              </p>
            </article>
          </div>
        </div>
        <KanbanBoard
          currentUserRole={currentUserRole}
          projectId={projectId}
          key={projectId}
        />
      </div>

      {isOwner && (
        <aside className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <UpdateProjectForm data={data} projectId={projectId} />
          <DeleteProjectForm projectId={projectId} />
        </aside>
      )}
    </div>
  );
};
