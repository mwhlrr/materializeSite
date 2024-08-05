const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');

const pool = require('../config/db'); // Adjust the path to your db.js

const router = express.Router();

module.exports = router;

// Configure session middleware
router.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, results[0]);
  } catch (err) {
    done(err);
  }
});

// Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
    if (rows.length > 0) {
      return done(null, rows[0]); // User exists, return user
    } else {
      // Create a new user if one doesn't exist
      const [result] = await pool.query(
        'INSERT INTO users (google_id, email, username) VALUES (?, ?, ?)',
        [profile.id, profile.emails[0].value, profile.displayName]
      );
      const newUser = { id: result.insertId, google_id: profile.id, email: profile.emails[0].value, username: profile.displayName };
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
}));

// Apple OAuth setup
passport.use(new AppleStrategy({
  clientID: 'YOUR_APPLE_CLIENT_ID',
  teamID: 'YOUR_APPLE_TEAM_ID',
  keyID: 'YOUR_APPLE_KEY_ID',
  privateKeyLocation: 'path/to/your/apple/key.p8',
  callbackURL: 'http://localhost:3000/auth/apple/callback'
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE apple_id = ?', [profile.id]);
    if (rows.length > 0) {
      return done(null, rows[0]); // User exists, return user
    } else {
      // Create a new user if one doesn't exist
      const [result] = await pool.query(
        'INSERT INTO users (apple_id, email, username) VALUES (?, ?, ?)',
        [profile.id, profile.email, profile.name]
      );
      const newUser = { id: result.insertId, apple_id: profile.id, email: profile.email, username: profile.name };
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
}));

// OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/register' }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/apple', passport.authenticate('apple'));
router.get('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/register' }), (req, res) => {
  res.redirect('/dashboard');
});

// Non google/apple routes
router.post('/register', async (req, res) => {
    const { username, password, email, name, lastName } = req.body;

    // Validate input (e.g., check for valid email, password criteria)
  if (!/^[a-zA-Z0-9]+$/.test(username) || username.length > 20) {
    return res.status(400).json({ error: 'Invalid username format' });
  }
  if (!/\d/.test(password) || !/[!@#$%^&*]/.test(password) || password.length < 10) {
    return res.status(400).json({ error: 'Password does not meet criteria' });
  }

  try {
    // Check if the user already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.query(
      'INSERT INTO users (username, password, email, name, last_name, affiliate) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, name, lastName, false]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
