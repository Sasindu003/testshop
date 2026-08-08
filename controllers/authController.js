const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

/**
 * POST /api/auth/register
 * Forces role=customer regardless of request body.
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw createError('Name, email, and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw createError('Email already registered', 409);
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // pre-save hook hashes this
    phone,
    role: 'customer', // forced — client-supplied role ignored
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  sendSuccess(
    res,
    {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
    'Registration successful',
    201
  );
});

/**
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required');
  }

  // Explicitly select passwordHash for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated. Contact support.', 403);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  sendSuccess(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/auth/refresh
 * Rotates access token from a valid refresh token.
 */
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (_err) {
    throw createError('Invalid or expired refresh token', 401);
  }

  if (decoded.type !== 'refresh') {
    throw createError('Invalid token type', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw createError('User not found or deactivated', 401);
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
});

/**
 * POST /api/auth/logout
 * Stateless JWT — client discards tokens. Server acknowledges.
 */
exports.logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, null, 'Logged out successfully');
});
