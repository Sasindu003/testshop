const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const { protect, authorize } = require('../middleware/auth');
const {
  getRecommendation,
  getStylistLogs,
} = require('../controllers/aiStylistController');

/**
 * Optional authentication middleware:
 * Attaches user to req.user if a valid token is provided,
 * but allows guest users (e.g. with a session ID) to proceed.
 */
const optionalProtect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (_err) {
      // Ignore token errors for guest access
    }
  }
  next();
};

// POST /ai-stylist/recommend (guest or customer)
router.post('/ai-stylist/recommend', optionalProtect, getRecommendation);

// GET /admin/ai-stylist/logs (admin / owner)
router.get(
  '/admin/ai-stylist/logs',
  protect,
  authorize('admin', 'owner'),
  getStylistLogs
);

module.exports = router;

