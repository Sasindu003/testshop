const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

// Public route: Get all reviews for a product
router.get('/products/:productId/reviews', getProductReviews);

// Protected routes
router.post(
  '/products/:productId/reviews',
  protect,
  validate([
    body('rating')
      .notEmpty()
      .withMessage('Rating is required')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
  ]),
  createReview
);

router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
