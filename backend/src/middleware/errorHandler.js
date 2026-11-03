exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message
  });
};
