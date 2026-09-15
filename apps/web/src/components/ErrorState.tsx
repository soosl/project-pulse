type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export const ErrorState = ({
  title = "Не удалось загрузить данные",
  message,
  onRetry,
  isRetrying = false,
}: Props) => {
  return (
    <section
      className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"
      role="alert"
      aria-labelledby="error-state-title"
    >
      <div
        className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600"
        aria-hidden="true"
      >
        <svg
          className="size-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 8v5" strokeLinecap="round" />
          <path d="M12 16.5v.1" strokeLinecap="round" />
          <path
            d="M10.15 4.2 2.8 17a2 2 0 0 0 1.73 3h14.94a2 2 0 0 0 1.73-3L13.85 4.2a2.13 2.13 0 0 0-3.7 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2
        id="error-state-title"
        className="mt-5 text-xl font-extrabold tracking-tight text-slate-950"
      >
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying && (
            <span
              className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
              aria-hidden="true"
            />
          )}

          {isRetrying ? "Повторяем..." : "Попробовать снова"}
        </button>
      )}
    </section>
  );
};
