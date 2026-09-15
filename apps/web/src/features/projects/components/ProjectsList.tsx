import { useState, type ChangeEvent } from "react";
import { useGetProjects } from "../model/use-get-projects";
import { Loader } from "../../../components/Loader";
import { ProjectCard } from "./ProjectCard";
import { EmptyProjects } from "./EmptyProjects";
import { ErrorState } from "../../../components/ErrorState";
import { getApiError } from "../../../lib/getApiError";
import { useDebounce } from "../../../lib/useDebounce";

export const ProjectsList = () => {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
  const searchWithDebounce = search === "" ? search : debouncedSearch;

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefetchError,
    hasNextPage,
  } = useGetProjects(searchWithDebounce);

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  const handleRefetch = () => {
    refetch();
  };

  if (isError && !data) {
    return (
      <ErrorState
        title="Не удалось загрузить проекты"
        message={getApiError(
          error,
          "Во время загрузки проектов произошла ошибка.",
        )}
        isRetrying={isRefetching}
        onRetry={refetch}
      />
    );
  }

  const projects = data?.pages.flatMap((page) => page.items);

  const showLoadingState = isPending;
  const showEmptyState = !projects?.length && !showLoadingState;
  const showProjects = !showEmptyState && !showLoadingState;

  return (
    <section className="min-w-0" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="sr-only">
        Список проектов
      </h2>
      <label className="relative block" htmlFor="project-search">
        <span className="sr-only">Найти проект</span>
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          id="project-search"
          type="search"
          placeholder="Поиск по названию или описанию"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          value={search}
          onChange={handleSearchInput}
        />
      </label>
      <div className="pt-5">
        {showEmptyState && (
          <EmptyProjects search={search} onClearSearch={() => setSearch("")} />
        )}

        {showLoadingState && (
          <Loader fullScreen={false} label="Загружаем проекты..." />
        )}

        {showProjects && (
          <div className="grid gap-4 md:grid-cols-2">
            {projects?.map((project) => (
              <ProjectCard {...project} key={project.id} />
            ))}
          </div>
        )}
      </div>

      {isRefetchError && (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            Не удалось обновить список. Показаны ранее загруженные данные.
          </span>

          <button
            type="button"
            disabled={isRefetching}
            onClick={handleRefetch}
            className="font-semibold text-amber-950 disabled:opacity-60"
          >
            {isRefetching ? "Обновляем…" : "Повторить"}
          </button>
        </div>
      )}

      {isFetchNextPageError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {getApiError(error, "Не удалось загрузить следующую страницу.")}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={handleFetchNextPage}
          disabled={isFetchingNextPage}
          aria-busy={isFetchingNextPage}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetchingNextPage
            ? "Загружаем…"
            : isFetchNextPageError
              ? "Повторить загрузку"
              : "Загрузить ещё"}
        </button>
      )}
    </section>
  );
};
