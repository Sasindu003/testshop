const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * Helper to recompute and persist product's ratingAverage and ratingCount
 */
const updateProductRatingStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        ratingCount: { $sum: 1 },
        ratingAverage: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(stats[0].ratingAverage * 10) / 10,
      ratingCount: stats[0].ratingCount,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: 0,
      ratingCount: 0,
    });
  }
};

/**
 * GET /api/products/:productId/reviews
 * Public. Paginated list of reviews for a product.
 */
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw createError(404, 'Product not found');
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, parseInt(limit, 10) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('customer', 'name'),
    Review.countDocuments({ product: productId }),
  ]);

  sendSuccess(res, 200, 'Product reviews retrieved successfully', {
    reviews,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/**
 * POST /api/products/:productId/reviews
 * Protected (Customer). Requires a delivered order containing that product.
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const customerId = req.user._id;

  if (!rating || rating < 1 || rating > 5) {
    throw createError(400, 'Rating is required and must be between 1 and 5');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw createError(404, 'Product not found');
  }

  // Verify that customer has a delivered order containing this product
  const hasPurchased = await Order.findOne({
    customer: customerId,
    status: 'delivered',
    'items.product': productId,
  });

  if (!hasPurchased) {
    throw createError(
      403,
      'You can only review products that you have purchased and had delivered'
    );
  }

  // Check if review already exists for this product and customer
  const existingReview = await Review.findOne({
    product: productId,
    customer: customerId,
  });

  if (existingReview) {
    throw createError(400, 'You have already submitted a review for this product');
  }

  const review = await Review.create({
    product: productId,
    customer: customerId,
    rating: Number(rating),
    comment,
  });

  // Recompute and persist product rating stats
  await updateProductRatingStats(productId);

  sendSuccess(res, 201, 'Review submitted successfully', review);
});

/**
 * PUT /api/reviews/:id
 * Protected (Author only). Update an existing review.
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw createError(404, 'Review not found');
  }

  // Author restriction check
  if (review.customer.toString() !== req.user._id.toString()) {
    throw createError(403, 'You are not authorized to update this review');
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw createError(400, 'Rating must be between 1 and 5');
    }
    review.rating = Number(rating);
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  await review.save();

  // Recompute product rating stats
  await updateProductRatingStats(review.product);

  sendSuccess(res, 200, 'Review updated successfully', review);
});

/**
 * DELETE /api/reviews/:id
 * Protected (Author only). Delete a review.
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw createError(404, 'Review not found');
  }

  // Author restriction check
  if (review.customer.toString() !== req.user._id.toString()) {
    throw createError(403, 'You are not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();

  // Recompute product rating stats
  await updateProductRatingStats(productId);

  sendSuccess(res, 200, 'Review deleted successfully');
});
