const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

/**
 * Verify JWT from Authorization: Bearer <token>.
 * Attaches full user document (minus passwordHash) to req.user.
 */
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized — no token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User no longer exists' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Not authorized — invalid token';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Restrict access to specific roles.
 * Must be used after protect middleware.
 * @param  {...String} roles - allowed roles, e.g. authorize('admin', 'owner')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
