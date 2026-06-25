const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { signToken, publicUser } = require('../utils/tokens');

async function signup(req, res, next) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password || password.length < 6) {
      return res.status(400).json({ message: 'Email, username, and 6+ character password are required.' });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'Email or username already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hash, points: 1200 });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    const ok = user && user.password && await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

function googleStart(req, res, next) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ message: 'Google OAuth is not configured yet.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
}

function googleCallback(req, res, next) {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google`;
      return res.redirect(url);
    }

    const token = signToken(user);
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${token}`;
    res.redirect(url);
  })(req, res, next);
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

async function updateProfile(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required.' });
    }
    req.user.username = username;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      req.user.password = await bcrypt.hash(password, 10);
    }
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUserPoints(req, res, next) {
  try {
    const { points } = req.body;
    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({ message: 'Points must be a non-negative number.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { points },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, googleStart, googleCallback, me, updateProfile, listUsers, updateUserPoints };
