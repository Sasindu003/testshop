const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');

// Customer-facing validation route
router.post(
  '/validate',
  protect,
  validate([
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('cartTotal').isNumeric().withMessage('Valid cart total is required'),
  ]),
  validateCoupon
);

// Admin / Owner CRUD
router.get('/', protect, authorize('admin', 'owner'), getCoupons);
router.get('/:id', protect, authorize('admin', 'owner'), getCoupon);

router.post(
  '/',
  protect,
  authorize('admin', 'owner'),
  validate([
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('validFrom').isISO8601().toDate().withMessage('Valid start date is required'),
    body('validUntil').isISO8601().toDate().withMessage('Valid end date is required'),
  ]),
  createCoupon
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'owner'),
  validate([
    body('type').optional().isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
    body('value').optional().isNumeric().withMessage('Value must be a number'),
    body('validFrom').optional().isISO8601().toDate().withMessage('Valid start date is required'),
    body('validUntil').optional().isISO8601().toDate().withMessage('Valid end date is required'),
  ]),
  updateCoupon
);

router.delete('/:id', protect, authorize('admin', 'owner'), deleteCoupon);

module.exports = router;
