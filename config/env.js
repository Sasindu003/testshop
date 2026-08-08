const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT',
  'NODE_ENV',
  'CLIENT_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n╔══════════════════════════════════════════════════╗');
  console.error('║        MISSING ENVIRONMENT VARIABLES             ║');
  console.error('╠══════════════════════════════════════════════════╣');
  missing.forEach((key) => {
    console.error(`║  ✗  ${key.padEnd(43)}║`);
  });
  console.error('╠══════════════════════════════════════════════════╣');
  console.error('║  Copy .env.example → .env and fill in values    ║');
  console.error('╚══════════════════════════════════════════════════╝\n');
  process.exit(1);
}

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL,
};
