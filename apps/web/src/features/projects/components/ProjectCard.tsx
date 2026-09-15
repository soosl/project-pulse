import type { ProjectResponse, ProjectRole } from "@project-pulse/shared";
import { Link } from "react-router-dom";

const roleTagClassnames: Record<ProjectRole, string> = {
  OWNER:
    "rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700",
  ADMIN: "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700",
  MEMBER:
    "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600",
};

export const ProjectCard = ({
  id,
  name,
  currentUserRole,
  updatedAt,
  description,
}: ProjectResponse) => {
  const sign = name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2);

  const date = new Date(updatedAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">
          {sign}
        </div>
        <span className={roleTagClassnames[currentUserRole]}>
          {currentUserRole}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight">{name}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
        {description || "Нет описания"}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span>Обновлён {date}</span>

        <Link
          to={`/projects/${id}`}
          className="font-bold text-blue-600"
          aria-label={`Открыть проект ${name}`}
        >
          Открыть →
        </Link>
      </div>
    </article>
  );
};
