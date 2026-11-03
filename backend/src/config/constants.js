// Централизованные настройки приложения (магические значения больше не раскиданы по коду)

const TOKEN_COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней
const TOKEN_EXPIRES_IN = '7d';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: TOKEN_MAX_AGE_MS
});

const DEFAULT_PORT = 5000;
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

// Пагинация каталога задач
const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 50,
  fallbackTotalPages: 1
};

// Лимиты Judge0 и значений по умолчанию для задач
const JUDGE0 = {
  pythonLanguageId: 71,
  minCpuTimeLimitSec: 1,
  kbPerMb: 1024
};

const DEFAULT_MAX_SCORE = 100;

module.exports = {
  TOKEN_COOKIE_NAME,
  TOKEN_MAX_AGE_MS,
  TOKEN_EXPIRES_IN,
  cookieOptions,
  DEFAULT_PORT,
  DEFAULT_FRONTEND_URL,
  PAGINATION,
  JUDGE0,
  DEFAULT_MAX_SCORE
};
