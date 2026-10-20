# ProjectPulse

Учебное full-stack приложение для управления проектами и задачами.

## Возможности

- Регистрация, вход и редактирование профиля.
- Создание, редактирование и удаление проектов.
- Kanban-доска с созданием, редактированием и удалением задач.
- Перетаскивание задач между статусами с оптимистическим обновлением.
- Синхронизация доски между вкладками через WebSocket.
- Метрики проекта: количество задач, участников и процент выполнения.
- Разграничение доступа по ролям.

## Стек

**Frontend:** React 19, TypeScript, Vite, TanStack Query, Zustand,
React Hook Form, Zod, Tailwind CSS.

**Backend:** Node.js, Express 5, Prisma, PostgreSQL, Socket.io,
JWT и bcrypt.

## Структура

- `apps/web` — фронтенд.
- `apps/api` — бэкенд.
- `packages/shared` — общие схемы валидации и типы.

## Локальный запуск

Понадобятся Node.js, npm и Docker с Docker Compose.

Все команды выполняются из корня проекта.

1. Установите зависимости:

   ```sh
   npm ci
   ```

2. Создайте файлы окружения из примеров:

   - `apps/api/.env.example` → `apps/api/.env`
   - `apps/web/.env.example` → `apps/web/.env`

   В `apps/api/.env` задайте собственный `JWT_SECRET`.

3. Запустите PostgreSQL:

   ```sh
   npm run infra:up
   ```

4. После готовности БД примените миграции и соберите общий пакет:

   ```sh
   npm run db:deploy
   npm run build:shared
   ```

5. Запустите приложение:

   ```sh
   npm run dev
   ```

По умолчанию:

- Приложение: http://localhost:5173
- API: http://localhost:5000
- Проверка API: http://localhost:5000/health

При изменении shared-схем пересоберите пакет командой
`npm run build:shared` или запустите его в режиме наблюдения:

```sh
npm run dev --workspace=@project-pulse/shared
```

## Полезные команды

```sh
npm run lint           # Проверка ESLint
npm run format:check   # Проверка форматирования
npm run format         # Форматирование
npm run build          # Сборка всех пакетов
npm run infra:down     # Остановка PostgreSQL
```