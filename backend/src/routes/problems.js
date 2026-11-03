const express = require('express');
const Problem = require('../models/Problem');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const [items, total] = await Promise.all([
      Problem.find(filter).select('-hiddenTests').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      Problem.countDocuments(filter)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).select('-hiddenTests');
    if (!problem) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(problem);
  } catch (error) { next(error); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, author: req.user.displayName });
    res.status(201).json(problem);
  } catch (error) { next(error); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(problem);
  } catch (error) { next(error); }
});

module.exports = router;
