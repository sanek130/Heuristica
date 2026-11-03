const express = require('express');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    res.cookie('token', req.user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.get('/me', protect, (req, res) => res.json(req.user));

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Вы вышли из системы' });
});

module.exports = router;
