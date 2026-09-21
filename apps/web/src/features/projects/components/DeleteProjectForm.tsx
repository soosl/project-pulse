import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteProject } from "../model/use-delete-project";
import { getApiError } from "../../../lib/getApiError";

export const DeleteProjectForm = ({ projectId }: { projectId: string }) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const deleteProject = useDeleteProject(projectId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConfirmationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirmationOpen]);

  const openConfirmation = () => {
    deleteProject.reset();
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    if (!deleteProject.isPending) {
      setIsConfirmationOpen(false);
    }
  };

  const handleDeleteProject = () => {
    deleteProject.mutate(undefined, {
      onSuccess() {
        navigate("/dashboard", { replace: true });
      },
    });
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold text-red-600">Опасная зона</p>
      <h2 className="mt-1 text-lg font-extrabold tracking-tight">
        Удаление проекта
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Проект, его задачи, комментарии и сообщения будут удалены без
        возможности восстановления.
      </p>

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={openConfirmation}
      >
        Удалить проект
      </button>

      {isConfirmationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirmation();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              <span aria-hidden="true">!</span>
            </div>

            <h3
              id="delete-project-title"
              className="mt-5 text-xl font-extrabold tracking-tight"
            >
              Удалить проект?
            </h3>
            <p
              id="delete-project-description"
              className="mt-2 text-sm leading-6 text-slate-500"
            >
              Проект и все связанные данные будут удалены без возможности
              восстановления.
            </p>

            {deleteProject.isError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {getApiError(
                  deleteProject.error,
                  "Не удалось удалить проект. Попробуйте ещё раз.",
                )}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={deleteProject.isPending}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deleteProject.isPending}
                aria-busy={deleteProject.isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteProject.isPending ? "Удаляем…" : "Удалить проект"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
