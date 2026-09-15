import { useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { useAuthStore } from "../store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateUserSchema,
  type AvatarAction,
  type UpdateUser,
} from "@project-pulse/shared";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { getApiError } from "../lib/getApiError";
import { isBlob } from "../lib/isBlob";
import { getAvatarUrl } from "../lib/getAvatarUrl";

export const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();

  const navigate = useNavigate();

  const avatarUrl = getAvatarUrl(user?.avatar);
  // File - обновляет аватар, null - удаляет, undefined - оставляет как есть
  const [avatarFile, setAvatarFile] = useState<File | null | undefined>();
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUser>({
    resolver: zodResolver(UpdateUserSchema),
    values: {
      name: user?.name ?? "",
      avatarAction: "keep",
    },
  });

  const handleUpdateUser = async (data: { name: string }) => {
    try {
      setError(null);
      let avatarAction: AvatarAction = "keep";
      const formData = new FormData();

      if (avatarFile) {
        avatarAction = "update";
        formData.append("avatar", avatarFile);
      } else if (avatarFile === null) {
        avatarAction = "remove";
      }

      formData.append("name", data.name);
      formData.append("avatarAction", avatarAction);

      const updatedUser = await updateUser(formData);

      setAvatarFile(undefined);
      setAvatarPreview((prevAvatarPreview) => {
        if (isBlob(prevAvatarPreview)) {
          URL.revokeObjectURL(prevAvatarPreview);
        }
        return updatedUser.avatar ? getAvatarUrl(updatedUser.avatar) : null;
      });
    } catch (err) {
      setError(
        getApiError(err, "При обновлении данных пользователя произошла ошибка"),
      );
    }
  };

  const handleLogoutBtn = () => {
    logout();
    navigate("/login");
  };

  const handleResetForm = () => {
    reset({ name: user?.name ?? "" });

    setAvatarFile(undefined);
    setAvatarPreview((prevAvatarPreview) => {
      if (isBlob(prevAvatarPreview)) {
        URL.revokeObjectURL(prevAvatarPreview);
      }
      return avatarUrl;
    });

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleChangeAvatarBtn = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
      avatarInputRef.current.click();
    }
  };

  const handleRemoveAvatar = () => {
    setError(null);

    setAvatarFile(null);
    setAvatarPreview((prevAvatarPreview) => {
      if (isBlob(prevAvatarPreview)) {
        URL.revokeObjectURL(prevAvatarPreview);
      }
      return null;
    });
  };

  const handleChangeAvatarInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview((prevAvatarPreview) => {
      if (isBlob(prevAvatarPreview)) {
        URL.revokeObjectURL(prevAvatarPreview);
      }
      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    if (!isBlob(avatarPreview)) {
      return;
    }

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white shadow-sm">
              P
            </span>
            <span className="hidden font-extrabold tracking-tight sm:block">
              ProjectPulse
            </span>
          </Link>

          <nav
            className="ml-auto flex items-center gap-1"
            aria-label="Основная навигация"
          >
            <Link
              to="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Проекты
            </Link>
            <Link
              to="/profile"
              aria-current="page"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
            >
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div>
          <p className="text-sm font-semibold text-blue-600">Аккаунт</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Настройки профиля
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Обновите публичные данные аккаунта и управляйте изображением
            профиля.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
              <div className="px-5 pb-5">
                <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-3xl font-black text-white ring-4 ring-white">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={`Аватар пользователя ${user.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="mt-4 truncate text-xl font-extrabold tracking-tight">
                  {user.name}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {user.email}
                </p>

                <dl className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-slate-500">В ProjectPulse</dt>
                    <dd className="font-semibold text-slate-700">
                      с{" "}
                      {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <Link
              to="/dashboard"
              className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Workspace
                </span>
                <span className="mt-1 block font-bold">Перейти к проектам</span>
              </span>
              <span
                className="text-xl transition group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogoutBtn}
              disabled={isSubmitting}
            >
              Выйти из аккаунта
            </button>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <h2 className="text-xl font-extrabold tracking-tight">
                Личные данные
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Эти данные используются во всех ваших проектах.
              </p>
            </div>

            <form
              className="p-5 sm:p-7"
              onSubmit={handleSubmit(handleUpdateUser)}
              noValidate
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.name}
                      className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 text-2xl font-black text-slate-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Изображение профиля
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      JPEG, PNG или WebP, не более 5 МБ. Рекомендуемый размер —
                      200×200 px.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleChangeAvatarBtn}
                        disabled={isSubmitting}
                      >
                        Загрузить новое
                      </button>
                      <input
                        type="file"
                        id="file-input"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleChangeAvatarInput}
                        ref={avatarInputRef}
                      />
                      {avatarPreview && (
                        <button
                          type="button"
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleRemoveAvatar}
                          disabled={isSubmitting}
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Имя
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    maxLength={50}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1.5 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={user.email}
                    readOnly
                    aria-describedby="email-hint"
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500 outline-none"
                  />
                  <p id="email-hint" className="mt-1.5 text-xs text-slate-400">
                    Email нельзя изменить
                  </p>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-6 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Сбросить изменения
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Сохраняем…" : "Сохранить изменения"}
                  {!isSubmitting && <span aria-hidden="true">→</span>}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};
