const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// -- CORS --
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// -- Body parsers --
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -- Logging (dev only) --
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// -- Routes --
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ok' });
});

app.use('/api/auth', authRoutes);
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
