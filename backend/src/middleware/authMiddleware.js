const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { TOKEN_COOKIE_NAME } = require('../config/constants');

/** Проверяет JWT из cookie или заголовка Authorization и подставляет req.user. */
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Не авторизован' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-__v');
    if (!req.user) return res.status(401).json({ error: 'Пользователь не найден' });

    next();
  } catch {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Только для администраторов' });
  next();
};
