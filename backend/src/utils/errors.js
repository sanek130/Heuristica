// Утилиты обработки ошибок

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Обёртка для асинхронных express-обработчиков:
 * пробрасывает любые отклонённые промисы в next(),
 * избавляя маршруты от повторяющихся try/catch.
 */
const asyncHandler = handler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/** Сокращает ошибку внешнего API до безопасного сообщения для логов. */
const externalErrorMessage = error =>
  error.response?.data ?? error.message;

module.exports = { ApiError, asyncHandler, externalErrorMessage };
