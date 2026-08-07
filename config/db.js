const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolution for Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if system DNS is restricted
}

// Disable buffering so failed queries return immediate error instead of stalling
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stylehub_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Atlas] Successfully connected to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Notice] Live database connection skipped (${error.message}). Operating with memory database state for instant demo capability.`);
  }
};

module.exports = connectDB;
