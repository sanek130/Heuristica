require('dotenv').config();
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

// Базовые middleware: безопасность, CORS, JSON, cookies, логи, passport
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
    credentials: true
  })
);
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

// 404 и единый обработчик ошибок
app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
app.use(require('./middleware/errorHandler').errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT, () => console.log(`Heuristica backend running on port ${PORT}`));

module.exports = app;
