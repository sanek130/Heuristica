require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectDB = require('./config/db');
require('./config/passport');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(passport.initialize());

connectDB();

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/judge', require('./routes/judge'));

app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
app.use(require('./middleware/errorHandler').errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Heuristica backend running on port ${PORT}`));
