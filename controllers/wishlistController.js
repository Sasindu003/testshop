const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * GET /api/wishlist
 * Protected. Returns populated wishlist from User.wishlist.
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' },
  });

  if (!user) {
    throw createError(404, 'User not found');
  }

  sendSuccess(res, 200, 'Wishlist retrieved successfully', user.wishlist);
});

/**
 * POST /api/wishlist/:productId
 * Protected. Adds a product to user's wishlist (prevents duplicates using $addToSet).
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw createError(404, 'Product not found or inactive');
  }

  // Use $addToSet to prevent duplicate entries
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } },
    { new: true }
  ).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' },
  });

  sendSuccess(res, 200, 'Product added to wishlist', user.wishlist);
});

/**
 * DELETE /api/wishlist/:productId
 * Protected. Removes a product from user's wishlist using $pull.
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  ).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' },
  });

  sendSuccess(res, 200, 'Product removed from wishlist', user.wishlist);
});
