const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

connectDB();
configurePassport();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/redeem', require('./routes/redeemRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const path = require('path');

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});