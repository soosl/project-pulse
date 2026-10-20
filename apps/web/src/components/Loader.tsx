interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader = ({
  label = "Загрузка...",
  fullScreen = true,
}: LoaderProps) => {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-slate-50 px-4"
          : "flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 shadow-sm"
      }
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex size-14 items-center justify-center">
          <div
            className="absolute inset-0 animate-spin rounded-2xl border-2 border-slate-200 border-t-blue-600"
            aria-hidden="true"
          />

          <span
            className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-sm"
            aria-hidden="true"
          >
            P
          </span>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>

        <p className="mt-1 text-xs text-slate-400">
          Это займёт совсем немного времени
        </p>
      </div>
    </div>
  );
};
