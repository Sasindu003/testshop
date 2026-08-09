const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

// GET /api/coupons
// Admin / Owner
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, coupons);
});

// GET /api/coupons/:id
// Admin / Owner
exports.getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw createError('Coupon not found', 404);
  sendSuccess(res, coupon);
});

// POST /api/coupons
// Admin / Owner
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  sendSuccess(res, coupon, 'Coupon created', 201);
});

// PUT /api/coupons/:id
// Admin / Owner
exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw createError('Coupon not found', 404);
  sendSuccess(res, coupon, 'Coupon updated');
});

// DELETE /api/coupons/:id
// Admin / Owner
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw createError('Coupon not found', 404);
  
  coupon.isActive = false;
  await coupon.save();
  sendSuccess(res, null, 'Coupon deactivated');
});

// POST /api/coupons/validate
// Customer (protect)
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) throw createError('Coupon code is required', 400);
  if (cartTotal === undefined || cartTotal < 0) {
      throw createError('Valid cart total is required', 400);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw createError('Invalid coupon code', 404);
  }

  if (!coupon.isActive) {
    throw createError('This coupon is no longer active', 400);
  }

  const now = new Date();
  if (now < coupon.validFrom) {
    throw createError('This coupon is not valid yet', 400);
  }
  if (now > coupon.validUntil) {
    throw createError('This coupon has expired', 400);
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw createError('This coupon has reached its usage limit', 400);
  }

  if (cartTotal < coupon.minOrderValue) {
    throw createError(`Minimum order value for this coupon is ${coupon.minOrderValue}`, 400);
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = cartTotal * (coupon.value / 100);
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(cartTotal, coupon.value); // Don't discount more than the cart total
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  sendSuccess(res, {
    couponId: coupon._id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    finalTotal: Math.round((cartTotal - discountAmount) * 100) / 100
  }, 'Coupon applied successfully');
});
