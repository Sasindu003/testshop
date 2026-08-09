const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

const connectDB = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`[DB] Connection attempt ${attempt}/${MAX_RETRIES}...`);

      const conn = await mongoose.connect(MONGO_URI);

      console.log(`[DB] MongoDB connected: ${conn.connection.host}`);

      // Connection event logging
      mongoose.connection.on('error', (err) => {
        console.error(`[DB] Connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[DB] MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[DB] MongoDB reconnected');
      });

      return conn;
    } catch (err) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.error(
        `[DB] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
      );

      if (attempt >= MAX_RETRIES) {
        console.error('[DB] All connection attempts exhausted. Exiting.');
        process.exit(1);
      }

      console.log(`[DB] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
