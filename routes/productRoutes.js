const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockInventory,
} = require('../controllers/productController');

// GET /api/products/admin/inventory/low-stock
router.get(
  '/admin/inventory/low-stock',
  protect,
  authorize('admin', 'staff', 'owner'),
  getLowStockInventory
);

// Admin / Staff / Owner route definitions
router.post(
  '/',
  protect,
  authorize('admin', 'staff', 'owner'),
  upload.array('images', 5),
  validate([
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category ID is required').isMongoId().withMessage('Invalid Category ID format'),
    body('basePrice').notEmpty().withMessage('Base price is required').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  ]),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'staff', 'owner'),
  upload.array('images', 5),
  validate([
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('category').optional().isMongoId().withMessage('Invalid Category ID format'),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  ]),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'owner'),
  deleteProduct
);

router.patch(
  '/:id/stock',
  protect,
  authorize('admin', 'staff', 'owner'),
  validate([
    body('size').trim().notEmpty().withMessage('Size label is required'),
    body('delta').isNumeric().withMessage('Delta must be a number'),
  ]),
  adjustStock
);

module.exports = router;
