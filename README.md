# Heuristica

Бесплатная платформа для подготовки к ВсОШ по программированию на Python: React + Vite, Node.js/Express, MongoDB Atlas, Google OAuth, Pyodide для локального запуска и Judge0 для официальной проверки.

## Что уже реализовано

- Google-авторизация через OAuth 2.0 и JWT в httpOnly cookie.
- Каталог задач, фильтры по теме и этапу, прогресс пользователя.
- Monaco Editor с Python.
- Локальный запуск Python в браузере через Pyodide.
- Официальная проверка скрытых тестов через Judge0 CE (RapidAPI).
- Скрытые тесты никогда не отправляются на фронтенд.
- Конфигурация Render Blueprint для бесплатного деплоя.

## Локальный запуск

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Заполните `.env` реальными значениями.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Откройте http://localhost:5173.

## Бесплатная настройка

1. **MongoDB Atlas** — создайте бесплатный кластер M0, пользователя БД и network access `0.0.0.0/0`; скопируйте URI в `MONGODB_URI`.
2. **Google Cloud Console** — создайте OAuth Client ID типа Web application; добавьте redirect URI локального бэкенда и продакшн-бэкенда.
3. **RapidAPI / Judge0 CE** — подпишитесь на бесплатный план и скопируйте ключ в `JUDGE0_API_KEY`.
4. **Render** — подключите GitHub-репозиторий и создайте Blueprint из `render.yaml`.

## Переменные окружения

Все значения указываются в Render Dashboard, не в Git:

- `MONGODB_URI`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `JWT_SECRET`
- `JUDGE0_API_KEY`
- `ADMIN_EMAILS`
- `VITE_API_URL`

## Важно

- Не публикуйте `.env`.
- Сервер не исполняет пользовательский Python напрямую: локально — Pyodide в браузере, официально — Judge0.
- Для доступа к созданию задач добавьте свой Google email в `ADMIN_EMAILS`.
