import { Link } from "react-router-dom";
import { CreateProjectForm, ProjectsList } from "../features/projects";
import { useAuthStore } from "../store/auth.store";

export const Dashboard = () => {
  const userData = useAuthStore((store) => store.user);
  const initials = userData?.name
    .split(" ")
    .slice(0, 2)
    .map((item) => item.charAt(0));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <Link to="/dashboard" className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-sm">
              P
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight">
                ProjectPulse
              </span>
              <span className="block text-xs text-slate-500">Workspace</span>
            </span>
          </Link>

          <nav className="mt-10 space-y-1" aria-label="Основная навигация">
            <Link
              to="/dashboard"
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z" />
              </svg>
              Проекты
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
              </svg>
              Профиль
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Рабочее пространство
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {userData?.name}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-extrabold tracking-tight lg:hidden"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  P
                </span>
                ProjectPulse
              </Link>
              <Link
                to="/profile"
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-4 ring-slate-100"
                aria-label="Открыть профиль"
              >
                {initials}
              </Link>
            </div>
          </header>

          <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">Workspace</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Мои проекты
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Управляйте рабочими пространствами, задачами и командой в
                  одном месте.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="order-2 min-w-0 xl:order-1">
                <ProjectsList />
              </div>

              <div className="order-1 xl:order-2">
                <CreateProjectForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
