const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const couponRoutes = require('./routes/couponRoutes');
const fileRoutes = require('./routes/fileRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const aiStylistRoutes = require('./routes/aiStylistRoutes');

const app = express();

// -- CORS --
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// -- Security headers --
app.use(helmet());

// -- NoSQL injection defense --
app.use(mongoSanitize());

// -- Body parsers --
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -- Logging (dev only) --
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// -- Rate limiters --
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

app.use('/api/', generalLimiter);

// -- Routes --
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ok' });
});

app.get('/api/db-status', (_req, res) => {
  const state = require('mongoose').connection.readyState;
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    success: true,
    connected: state === 1,
    status: states[state] || 'Unknown',
  });
});


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/files', fileRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', aiStylistRoutes);

// -- 404 handler --
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// -- Centralized error handler --
app.use(errorHandler);

// -- Boot (local dev / standalone server)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      console.log(`[Server] Running on port ${env.PORT}`);
    });
  });
} else {
  // Ensure DB connects in serverless environment
  connectDB();
}

// Export for serverless (Vercel)
module.exports = app;

