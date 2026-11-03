const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { TOKEN_EXPIRES_IN } = require('./constants');

/** Список адресов из ADMIN_EMAILS в нижнем регистре. */
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

/** Находит пользователя по Google-профилю или создаёт нового; выдаёт JWT. */
const verifyGoogleProfile = async (profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error('Google account has no email');

  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value
    });
  }

  // Роли администратора назначаются через ADMIN_EMAILS
  if (adminEmails().includes(email.toLowerCase()) && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return { user, token };
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, await verifyGoogleProfile(profile));
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
