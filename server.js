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
const fileRoutes = require('./routes/fileRoutes');

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

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/files', fileRoutes);

// -- 404 handler --
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// -- Centralized error handler --
app.use(errorHandler);

// -- Boot --
const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`[Server] Running in ${env.NODE_ENV} on port ${env.PORT}`);
  });
};

start();

// Export for serverless (Vercel)
module.exports = app;
