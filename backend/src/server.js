/**
 * ============================================================================
 * ⚠️  ВНИМАНИЕ: ЭФЕМЕРНАЯ ФАЙЛОВАЯ СИСТЕМА RENDER  (WARNING: EPHEMERAL FS)
 * ============================================================================
 * Инфраструктура Render (free/container plan) использует ЭФЕМЕРНУЮ файловую
 * систему: весь контент вне Docker-образа пересоздаётся при каждом деплое,
 * рестарте, idle-sleep или миграции контейнера между хостами.
 *
 * Любые данные, сохранённые в локальные JSON-файлы (records, sessions,
 * uploads и т.п.), БУДУТ БЕЗВОЗВРАТНО ПОТЕРЯНЫ при перезапуске сервиса.
 * Это не баг кода — это свойство платформы.
 *
 * ЕДИНСТВЕННЫЕ РАБОЧИЕ ВАРИАНТЫ ПЕРСИСТЕНТНОГО ХРАНЕНИЯ:
 *   1. Render Disk  — постоянный том, подключается в render.yaml
 *      (persistentDiskPath: "/var/data") либо через Dashboard → Disks.
 *      Файлы переживают рестарты и редеплои, но привязаны к ОДНОМУ сервису.
 *   2. MongoDB (рекомендуется) — проект уже использует mongoose/connectDB;
 *      полностью переведите все JSON-хранилища на модели MongoDB Atlas /
 *      Render Data API. Это единственный вариант, устойчивый к масштабированию.
 *
 * Запрещено использовать process.cwd() и относительные пути для записи данных
 * в production. При использовании Render Disk путь должен браться из env
 * (например, DATA_DIR=/var/data).
 * ============================================================================
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectDB = require('./config/db');
const { DEFAULT_PORT, DEFAULT_FRONTEND_URL } = require('./config/constants');

require('./config/passport');

const app = express();

// В прод-сборке фронтенд отдаётся тем же Express-приложением (same-origin),
// поэтому CORS нужен только при локальной разработке (Vite на другом порту).
const isProduction = process.env.NODE_ENV === 'production';

// Базовые middleware: безопасность, CORS, JSON, cookies, логи, passport
app.use(
  helmet({
    // Monaco (CDN-воркеры), Pyodide и Google OAuth требуют внешних скриптов/соединений
    contentSecurityPolicy: false
  })
);
if (!isProduction) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
      credentials: true
    })
  );
}
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(passport.initialize());

connectDB();

// Healthcheck для Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API-маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/judge', require('./routes/judge'));

// Неизвестные /api-маршруты — всегда JSON 404 (а не index.html)
app.use('/api', (req, res) => res.status(404).json({ error: 'Маршрут не найден' }));

// Статика собранного фронтенда (frontend/dist): JS/CSS-ассеты и favicon
const distDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(distDir));

// Все остальные GET-страницы React Router отдаются через index.html (SPA fallback)
app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));

// Единый обработчик ошибок
app.use(require('./middleware/errorHandler').errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT, () => console.log(`Heuristica backend running on port ${PORT}`));

module.exports = app;
