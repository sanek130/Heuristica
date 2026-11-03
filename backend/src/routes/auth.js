const express = require('express');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');
const { TOKEN_COOKIE_NAME, cookieOptions } = require('../config/constants');

const router = express.Router();

const frontendUrl = () => process.env.FRONTEND_URL;

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl()}/login`,
    session: false
  }),
  (req, res) => {
    res.cookie(TOKEN_COOKIE_NAME, req.user.token, cookieOptions());
    res.redirect(`${frontendUrl()}/dashboard`);
  }
);

router.get('/me', protect, (req, res) => res.json(req.user));

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME);
  res.json({ message: 'Вы вышли из системы' });
});

module.exports = router;
