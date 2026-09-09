import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUserSchema } from "@project-pulse/shared";
import { useAuthStore } from "../store/auth.store";
import { Link, useNavigate } from "react-router-dom";
import type { LoginUser } from "@project-pulse/shared";
import { useState } from "react";
import axios from "axios";

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginUserSchema),
  });
  const { login: loginUser } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data: LoginUser) => {
    try {
      await loginUser(data.email, data.password);
      navigate("/profile");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message);
      }
    }
  };

  const handleFormChange = () => {
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={handleFormChange}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 transition-all"
      >
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          <span>🔐</span> Вход
        </h1>

        {/* Поле email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            {...register("email")}
            placeholder="example@mail.ru"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* Поле пароля */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Пароль
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            placeholder="Введите пароль"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* Общая ошибка от сервера */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <span>❌</span> {error}
          </p>
        )}

        {/* Ссылка на регистрацию */}
        <Link
          to="/register"
          className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-800 font-medium transition-colors gap-1"
        >
          <span>←</span> На форму регистрации
        </Link>

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2"
        >
          Войти в аккаунт <span>→</span>
        </button>
      </form>
    </div>
  );
};
