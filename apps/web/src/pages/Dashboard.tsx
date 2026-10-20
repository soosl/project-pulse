import { CreateProjectForm, ProjectsList } from "../features/projects";
import { useAuthStore } from "../store/auth.store";
import { Loader } from "../components/Loader";

export const Dashboard = () => {
  const userData = useAuthStore((store) => store.user);

  if (!userData) {
    return <Loader fullScreen={true} />;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Workspace</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Мои проекты
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Управляйте рабочими пространствами, задачами и командой в одном
            месте.
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
  );
};
