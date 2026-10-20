interface EmptyProjectsProps {
  search: string;
  onClearSearch: () => void;
}

export const EmptyProjects = ({
  search,
  onClearSearch,
}: EmptyProjectsProps) => {
  const normalizedSearch = search.trim();
  const hasSearch = normalizedSearch.length > 0;

  return (
    <section
      className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="empty-projects-title"
    >
      <div
        className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
        aria-hidden="true"
      >
        {hasSearch ? (
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4M8.5 11h5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3l2 2h6A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 10.5v5M9.5 13h5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h2
        id="empty-projects-title"
        className="mt-5 text-xl font-extrabold tracking-tight text-slate-950"
      >
        {hasSearch ? "Проекты не найдены" : "Создайте первый проект"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasSearch
          ? `По запросу «${normalizedSearch}» ничего не найдено. Попробуйте изменить запрос или сбросить поиск.`
          : "Объедините задачи, команду и рабочий процесс в одном пространстве."}
      </p>

      <div className="mt-6">
        {hasSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Сбросить поиск
          </button>
        )}
      </div>
    </section>
  );
};
