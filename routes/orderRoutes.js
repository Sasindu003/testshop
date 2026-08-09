const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

const {
  createOrder,
  getOrders,
  getOrderById,
  verifyOrder,
  rejectOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

// ── Customer routes ─────────────────────────────────────────────────────────

// POST /orders (or /api/orders)
router.post('/orders', upload.single('paymentSlip'), createOrder);

// ── Admin / Owner routes ────────────────────────────────────────────────────

// GET /admin/orders
router.get('/admin/orders', authorize('admin', 'owner'), getOrders);

// GET /admin/orders/:id
router.get('/admin/orders/:id', authorize('admin', 'owner'), getOrderById);

// PATCH /admin/orders/:id/verify
router.patch('/admin/orders/:id/verify', authorize('admin', 'owner'), verifyOrder);

// PATCH /admin/orders/:id/reject
router.patch(
  '/admin/orders/:id/reject',
  authorize('admin', 'owner'),
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  validate,
  rejectOrder
);

// PATCH /admin/orders/:id/status
router.patch(
  '/admin/orders/:id/status',
  authorize('admin', 'owner'),
  body('status').notEmpty().withMessage('Status is required'),
  validate,
  updateOrderStatus
);

module.exports = router;

