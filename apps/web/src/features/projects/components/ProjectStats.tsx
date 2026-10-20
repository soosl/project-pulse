import { getApiError } from "../../../lib/getApiError";
import { useGetProjectStats } from "../model/use-get-project-stats";

export const ProjectStats = ({ projectId }: { projectId: string }) => {
  const { data, error, isPending, isError, isFetching, refetch } =
    useGetProjectStats(projectId);

  const metrics = data
    ? [
        { label: "Задачи", value: data.totalTasks },
        { label: "Участники", value: data.totalMembers },
        { label: "Выполнено", value: `${data.completionPercent}%` },
      ]
    : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold text-blue-600">Обзор</p>
      <h2 className="mt-1 text-base font-extrabold">Состояние проекта</h2>

      {isPending && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          Загружаем показатели…
        </p>
      )}

      {isError && (
        <div className="mt-4">
          <p role="alert" className="text-sm text-red-600">
            {getApiError(error, "Не удалось обновить показатели")}
          </p>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-2 text-sm font-semibold text-blue-600 disabled:opacity-50"
          >
            {isFetching ? "Обновляем…" : "Повторить"}
          </button>
        </div>
      )}

      {data && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {metrics.map(({ label, value }) => (
            <article
              key={label}
              className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="break-words text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-black">{value}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
