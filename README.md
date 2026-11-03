# Heuristica

Бесплатная платформа для подготовки к ВсОШ по программированию на Python: React + Vite, Node.js/Express, MongoDB Atlas, Google OAuth, Pyodide для локального запуска и Judge0 для официальной проверки.

Фронтенд и бэкенд — **один проект и один сервис** на Render: Express раздаёт собранную статику `frontend/dist` и API с одного домена (same-origin), отдельных статических хостингов больше нет.

## Что уже реализовано

- Google-авторизация через OAuth 2.0 и JWT в httpOnly cookie.
- Каталог задач, фильтры по теме и этапу, прогресс пользователя.
- Monaco Editor с Python.
- Локальный запуск Python в браузере через Pyodide.
- Официальная проверка скрытых тестов через Judge0 CE (RapidAPI).
- Скрытые тесты никогда не отправляются на фронтенд.
- Единый Blueprint Render (`render.yaml`): сборка frontend + backend из корня репозитория, запуск `node backend/src/server.js`.

## Как устроен единый сервис

`backend/src/server.js` обслуживает всё:

1. `/health` — healthcheck для Render.
2. Маршруты `/api/auth`, `/api/problems`, `/api/judge` — JSON API.
3. Неизвестные `/api/*`-маршруты возвращают **JSON 404** (никогда не HTML).
4. После API-маршрутов Express раздаёт статику из `frontend/dist` (JS/CSS-ассеты).
5. Все остальные GET-страницы отдаются через `frontend/dist/index.html` — SPA-fallback для React Router (глубокие ссылки вида `/problems/two-sum` открываются напрямую).
6. Фронтенд обращается к API того же origin: при сборке `VITE_API_URL` пустой, axios использует относительные URL (`/api/...`).

## Локальная разработка (два процесса)

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:5000
```

Заполните `.env` реальными значениями.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev            # http://localhost:5173
```

Откройте http://localhost:5173 — Vite проксирует `/api` на бэкенд, CORS в разработке включён.

## Продакшен-сборка локально (один процесс, как на Render)

```bash
npm install    # postinstall ставит зависимости backend и frontend
npm run build  # собирает фронтенд в frontend/dist через Vite
npm start      # node backend/src/server.js -> API и фронтенд на одном порту
```

## Деплой на Render (один сервис)

1. **Render → New → Blueprint**, подключите GitHub-репозиторий; Render сам найдёт `render.yaml` и создаст **один** web-сервис `heuristica` (Node runtime, корень репозитория).
   - Build command: `npm install && npm run build` — из корня репозитория ставит зависимости backend и frontend (через `postinstall` в корневом `package.json`) и собирает фронтенд через Vite в `frontend/dist`.
   - Start command: `node backend/src/server.js` — единый Express-сервер раздаёт и API, и собранный фронтенд.
   - Health check path: `/health`.
2. После первого деплоя скопируйте публичный URL сервиса (например, `https://heuristica.onrender.com`) и заполните переменные окружения в Dashboard:
   - `FRONTEND_URL` = этот же URL (нужен для редиректов после Google OAuth);
   - `GOOGLE_CALLBACK_URL` = `https://<ваш-url>/api/auth/google/callback`;
   - `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JUDGE0_API_KEY`, `ADMIN_EMAILS` — ваши значения (`JWT_SECRET` Blueprint генерирует сам);
   - `VITE_API_URL` оставьте **пустым** — фронтенд ходит в API того же origin.
3. **Google Cloud Console** — в OAuth Client ID добавьте Authorized redirect URI: `https://<ваш-url>/api/auth/google/callback`.
4. Перезапустите сервис (Render → Restart), чтобы новые env применились.

Если старый проект на Render был создан вручную как два сервиса (`heuristica-backend` + `heuristica-frontend`) — удалите оба и создайте один Blueprint из этого репозитория.

## Бесплатная настройка внешних сервисов

1. **MongoDB Atlas** — бесплатный кластер M0, пользователь БД и network access `0.0.0.0/0`; скопируйте URI в `MONGODB_URI`.
2. **Google Cloud Console** — OAuth Client ID типа Web application; redirect URI: локальный `http://localhost:5000/api/auth/google/callback` и продакшн `https://<ваш-url>/api/auth/google/callback`.
3. **RapidAPI / Judge0 CE** — бесплатный план, ключ в `JUDGE0_API_KEY`.

## Переменные окружения

Все секреты указываются в Render Dashboard (Blueprint запрашивает их при первом деплое), не в Git:

| Переменная | Значение на Render |
|---|---|
| `NODE_ENV` | `production` (задан в render.yaml) |
| `MONGODB_URI` | URI кластера Atlas |
| `FRONTEND_URL` | публичный URL этого же сервиса |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | из Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://<ваш-url>/api/auth/google/callback` |
| `JWT_SECRET` | генерируется Blueprint автоматически |
| `JUDGE0_URL` | `https://judge0-ce.p.rapidapi.com` (в render.yaml) |
| `JUDGE0_API_KEY` | ключ RapidAPI |
| `ADMIN_EMAILS` | Google-email через запятую |
| `VITE_API_URL` | пусто (same-origin API) |

## Важно

- Не публикуйте `.env`.
- Сервер не исполняет пользовательский Python напрямую: локально — Pyodide в браузере, официально — Judge0.
- Для доступа к созданию задач добавьте свой Google email в `ADMIN_EMAILS`.
- На бесплатном плане Render сервис «засыпает» после простоя — первый запрос может идти ~30–60 секунд.
