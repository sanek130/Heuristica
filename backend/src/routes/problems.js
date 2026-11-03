const express = require('express');
const Problem = require('../models/Problem');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { asyncHandler, ApiError } = require('../utils/errors');
const { PAGINATION } = require('../config/constants');

const router = express.Router();

/** Разбирает параметры пагинации из query строки. */
const parsePagination = query => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(PAGINATION.maxLimit, Number(query.limit) || PAGINATION.defaultLimit);
  return { page, limit };
};

/** Собирает фильтр каталога из query строки. */
const buildFilter = ({ topic, difficulty }) => {
  const filter = {};
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  return filter;
};

// Каталог задач: скрытые тесты никогда не отдаются на фронтенд
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = buildFilter(req.query);
    const { page, limit } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      Problem.find(filter)
        .select('-hiddenTests')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Problem.countDocuments(filter)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) || PAGINATION.fallbackTotalPages });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const problem = await Problem.findOne({ slug: req.params.slug }).select('-hiddenTests');
    if (!problem) throw new ApiError(404, 'Задача не найдена');
    res.json(problem);
  })
);

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const problem = await Problem.create({ ...req.body, author: req.user.displayName });
    res.status(201).json(problem);
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!problem) throw new ApiError(404, 'Задача не найдена');
    res.json(problem);
  })
);

module.exports = router;
