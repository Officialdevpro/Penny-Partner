const app = require("../app");
const passport = require("passport");
const session = require("express-session");
const User = require("../models/userModel");
const { createSendToken } = require("../controllers/authController");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        displayName: profile.displayName, // Full name of the user
        email: profile.emails[0].value, // Primary email (first one in the array)
        provider: profile.provider, // Provider name, e.g., "google"
      };
      
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {

  // Replace the below line with actual user fetching logic if needed.
  done(null, { id });
});

module.exports = passport;
