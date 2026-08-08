const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

const {
  getOrders,
  getOrderById,
  verifyOrder,
  rejectOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// All routes here should be protected and restricted to admin/owner roles
router.use(protect);
router.use(authorize('admin', 'owner'));

// GET /admin/orders
router.get('/admin/orders', getOrders);

// GET /admin/orders/:id
router.get('/admin/orders/:id', getOrderById);

// PATCH /admin/orders/:id/verify
router.patch('/admin/orders/:id/verify', verifyOrder);

// PATCH /admin/orders/:id/reject
router.patch(
  '/admin/orders/:id/reject',
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  validate,
  rejectOrder
);

// PATCH /admin/orders/:id/status
router.patch(
  '/admin/orders/:id/status',
  body('status').notEmpty().withMessage('Status is required'),
  validate,
  updateOrderStatus
);

module.exports = router;
