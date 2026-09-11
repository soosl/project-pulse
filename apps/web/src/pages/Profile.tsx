import { useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { useAuthStore } from "../store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateUserSchema,
  type AvatarAction,
  type UpdateUser,
} from "@project-pulse/shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { getApiError } from "../lib/getApiError";
import { isBlob } from "../lib/isBlob";
import { getAvatarUrl } from "../lib/getAvatarUrl";

export const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();

  const navigate = useNavigate();

  const avatarUrl = getAvatarUrl(user?.avatar);
  // const avatarUrl = user?.avatar
  //   ? user.avatar.startsWith("http")
  //     ? user.avatar
  //     : `${API_URL}${user.avatar}`
  //   : null;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
          <span>👤</span> Мой профиль
        </h1>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:px-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-md ring-4 ring-white">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Аватар пользователя ${user.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">📧 {user.email}</span>
                <span className="hidden sm:inline">•</span>
                {user.createdAt && (
                  <span className="flex items-center gap-1">
                    📅 Участник с{" "}
                    {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form
            className="px-6 py-8 sm:px-8"
            onSubmit={handleSubmit(handleUpdateUser)}
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Имя
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    defaultValue={user.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔒
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Email нельзя изменить
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аватар
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.name}
                      className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden ring-2 ring-gray-200">
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      onClick={handleChangeAvatarBtn}
                      disabled={isSubmitting}
                    >
                      🖼️ Загрузить
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
                        className="text-sm text-red-600 hover:text-red-800 font-medium transition"
                        onClick={handleRemoveAvatar}
                        disabled={isSubmitting}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Рекомендуемый размер: 200*200 px
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                onClick={handleResetForm}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                Сохранить <span>→</span>
              </button>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
          </form>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200 shadow-sm hover:shadow transition flex items-center justify-center gap-2"
            onClick={handleLogoutBtn}
            disabled={isSubmitting}
          >
            🚪 Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};
