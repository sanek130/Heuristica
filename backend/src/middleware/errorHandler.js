/**
 * Единая точка обработки ошибок API:
 * логирует стек, отвечает статусом из err.status (для ApiError) или 500.
 */
exports.errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message
  });
};
