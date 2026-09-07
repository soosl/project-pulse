import { useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import { useAuthStore } from "../store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema } from "@project-pulse/shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const Profile = () => {
  const { user, logout, updateUser, updateAvatar } = useAuthStore();

  const navigate = useNavigate();

  const [userName, setUserName] = useState(user?.name || "");

  const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : null;
  const [userAvatar, setUserAvatar] = useState(avatarUrl);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UpdateUserSchema),
  });

  const handleLogoutBtn = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateUser = async () => {
    if (userAvatar) {
      const imgResponse = await fetch(userAvatar);
      const imgBlob = await imgResponse.blob();
      const file = new File([imgBlob], "img", { type: imgBlob.type });
      const formdata = new FormData();
      formdata.append('file', file);

      updateAvatar(formdata);
    }

    updateUser({ name: userName });
  };

  const handleResetForm = () => {
    setUserName(user?.name || "");
    setUserAvatar(user?.avatar || "");
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleChangeAvatar = () => {
    avatarInputRef.current?.click();
  };

  const handleResetAvatar = async () => {
    setUserAvatar("");
  };

  useEffect(() => {
    const uploadAvatar = async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input?.files?.[0];

      if (!file) return;

      const objectURL = URL.createObjectURL(file);

      setUserAvatar(objectURL);
    };

    avatarInputRef.current?.addEventListener("change", uploadAvatar);

    return () =>
      avatarInputRef.current?.removeEventListener("change", uploadAvatar);
  }, []);

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
                {user.name.charAt(0).toUpperCase()}
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
                  value={userName}
                  onChange={handleChangeName}
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
                  {userAvatar ? (
                    <img
                      src={userAvatar}
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
                      onClick={handleChangeAvatar}
                    >
                      🖼️ Загрузить
                    </button>
                    <input
                      type="file"
                      id="file-input"
                      accept="image/*"
                      className="hidden"
                      ref={avatarInputRef}
                    />
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800 font-medium transition"
                      onClick={handleResetAvatar}
                    >
                      Удалить
                    </button>
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
              >
                Отмена
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2"
              >
                Сохранить <span>→</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200 shadow-sm hover:shadow transition flex items-center justify-center gap-2"
            onClick={handleLogoutBtn}
          >
            🚪 Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};
