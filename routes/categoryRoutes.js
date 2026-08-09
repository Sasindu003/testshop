const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const nameRule = validate([
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be blank')
    .isLength({ max: 100 })
    .withMessage('Name must be under 100 characters'),
]);

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin / Owner only
router.post(
  '/',
  protect,
  authorize('admin', 'owner'),
  upload.single('image'),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  ]),
  createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'owner'),
  upload.single('image'),
  nameRule,
  updateCategory
);

router.delete('/:id', protect, authorize('admin', 'owner'), deleteCategory);

module.exports = router;
