const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function configurePassport() {
  const hasGoogleConfig = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (!hasGoogleConfig) {
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(null, false, { message: 'Google account has no email.' });
      }

      const user = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            username: (profile.displayName || email.split('@')[0]).replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000), 
            points: 1200,
            role: 'user',
            is_active: true
          },
          $set: { googleId: profile.id } // Gunakan $set secara eksplisit untuk link-kan akaun
        },
        { new: true, upsert: true, runValidators: true }
      );

      done(null, user);
    } catch (err) {
      done(err);
    }
  }));
}

module.exports = configurePassport;
