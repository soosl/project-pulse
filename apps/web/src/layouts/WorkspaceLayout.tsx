import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { Loader } from "../components/Loader";
import { createSign } from "../lib/createSign";
import { useAuthStore } from "../store/auth.store";

export const WorkspaceLayout = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Loader label="Загружаем рабочее пространство..." />;
  }

  const projectsActive =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/projects/");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <Link to="/dashboard" className="flex items-center gap-3 px-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white">
              P
            </span>

            <span>
              <span className="block font-extrabold">ProjectPulse</span>
              <span className="block text-xs text-slate-500">Workspace</span>
            </span>
          </Link>

          <nav className="mt-10 space-y-1" aria-label="Основная навигация">
            <Link
              to="/dashboard"
              aria-current={projectsActive ? "page" : undefined}
              className={
                projectsActive
                  ? "block rounded-xl bg-blue-50 px-3 py-2.5 font-semibold text-blue-700"
                  : "block rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100"
              }
            >
              Проекты
            </Link>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? "block rounded-xl bg-blue-50 px-3 py-2.5 font-semibold text-blue-700"
                  : "block rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100"
              }
            >
              Профиль
            </NavLink>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {createSign(user.name)}
              </span>

              <p className="min-w-0 truncate text-sm font-semibold">
                {user.name}
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard"
                className="font-extrabold tracking-tight lg:hidden"
              >
                ProjectPulse
              </Link>

              <Link
                to="/profile"
                className="ml-auto flex size-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                aria-label="Открыть профиль"
              >
                {createSign(user.name)}
              </Link>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
