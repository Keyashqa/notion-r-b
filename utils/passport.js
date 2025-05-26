const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Look for existing user by email
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          return done(null, existingUser);
        }

        // If not found, create new user
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          passwordHash: null, // No password for OAuth
          profilePicUrl: profile.photos[0]?.value || '',
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
