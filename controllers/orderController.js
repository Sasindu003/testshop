const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');
const { uploadToGridFS } = require('../middleware/upload');

/**
 * POST /api/orders
 * Protected (Customer). Re-validates stock, applies optional coupon, snapshots item details,
 * requires payment slip upload via GridFS, computes totals server-side only,
 * creates order at status pending, increments coupon usedCount, and clears customer cart.
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  // 1. Fetch customer cart
  const cart = await Cart.findOne({ customer: customerId }).populate('items.product');
  if (!cart || !cart.items || cart.items.length === 0) {
    throw createError(400, 'Cart is empty. Cannot checkout.');
  }

  // 2. Validate payment slip upload
  if (!req.file) {
    throw createError(400, 'Payment slip upload is required');
  }

  // 3. Parse shipping address
  let shippingAddress = req.body.shippingAddress;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (_e) {
      throw createError(400, 'Invalid shipping address format');
    }
  }
  if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postalCode) {
    throw createError(400, 'Complete shipping address (line1, city, postalCode) is required');
  }

  // 4. Re-validate stock for every cart item & snapshot order items
  const outOfStockItems = [];
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      outOfStockItems.push({
        productId: item.product ? item.product._id : null,
        name: product ? product.name : 'Unknown Product',
        size: item.size,
        reason: 'Product no longer available',
      });
      continue;
    }

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (!sizeEntry || sizeEntry.stock < item.quantity) {
      outOfStockItems.push({
        productId: product._id,
        name: product.name,
        size: item.size,
        requestedQuantity: item.quantity,
        availableStock: sizeEntry ? sizeEntry.stock : 0,
        reason: 'Insufficient stock',
      });
    } else {
      // Compute unit price server-side
      const unitPrice = product.computeFinalPrice(item.size);
      orderItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        unitPrice,
        quantity: item.quantity,
      });
    }
  }

  if (outOfStockItems.length > 0) {
    throw createError(400, 'Some items in your cart are out of stock or unavailable', { outOfStockItems });
  }

  // 5. Calculate subtotal server-side
  let subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  subtotal = Math.round(subtotal * 100) / 100;

  // 6. Handle optional coupon
  const couponCode = req.body.couponCode;
  let discountTotal = 0;
  let appliedCoupon = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
    const now = new Date();

    if (!coupon || !coupon.isActive) {
      throw createError(400, 'Invalid or inactive coupon code');
    }
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw createError(400, 'Coupon has expired or is not active yet');
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw createError(400, 'Coupon maximum usage limit reached');
    }
    if (subtotal < coupon.minOrderValue) {
      throw createError(400, `Minimum order value for coupon is ${coupon.minOrderValue}`);
    }

    if (coupon.type === 'percentage') {
      discountTotal = subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      discountTotal = Math.min(subtotal, coupon.value);
    }
    discountTotal = Math.round(discountTotal * 100) / 100;
    appliedCoupon = coupon;
  }

  // 7. Compute total server-side
  const total = Math.max(0, Math.round((subtotal - discountTotal) * 100) / 100);

  // 8. Upload payment slip to GridFS
  const paymentSlipFileId = await uploadToGridFS(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );

  // 9. Create Order
  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    shippingAddress,
    paymentSlipFileId,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    subtotal,
    discountTotal,
    total,
    status: 'pending',
  });

  // 10. Increment coupon usedCount on success
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
  }

  // 11. Clear customer cart
  cart.items = [];
  await cart.save();

  sendSuccess(res, 201, 'Order placed successfully', order);
});

/**
 * GET /api/orders
 * Protected (Customer). Returns the authenticated customer's own orders, paginated, filterable by status.
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { customer: req.user._id };
  if (status) {
    filter.status = status;
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, parseInt(limit, 10) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('items.product', 'name images'),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Customer orders retrieved successfully', {
    orders,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/**
 * GET /api/orders/:id
 * Protected (Customer / Admin). Returns order details by ID.
 * Returns 404 if the order doesn't belong to req.user, unless requester is admin/owner.
 */
exports.getMyOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('items.product', 'name images');

  if (!order) {
    throw createError(404, 'Order not found');
  }

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isAdminOrOwner = ['admin', 'owner'].includes(req.user.role);

  if (!isOwner && !isAdminOrOwner) {
    throw createError(404, 'Order not found');
  }

  const orderObj = order.toObject();
  if (order.paymentSlipFileId) {
    const protocol = req.protocol;
    const host = req.get('host');
    orderObj.paymentSlipUrl = `${protocol}://${host}/api/files/${order.paymentSlipFileId}`;
  }

  sendSuccess(res, 200, 'Order retrieved successfully', orderObj);
});



/**
 * GET /api/admin/orders
 * Filter by status/date range, paginated
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('customer', 'name email'),
    Order.countDocuments(filter)
  ]);

  sendSuccess(res, 200, 'Orders retrieved successfully', {
    orders,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }
  });
});

/**
 * GET /api/admin/orders/:id
 * Includes the streamable payment-slip link via Step 3's /api/files/:id
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('items.product', 'name images');

  if (!order) {
    throw createError(404, 'Order not found');
  }

  const orderObj = order.toObject();
  
  // Append payment slip streamable URL if it exists
  if (order.paymentSlipFileId) {
    const protocol = req.protocol;
    const host = req.get('host');
    orderObj.paymentSlipUrl = `${protocol}://${host}/api/files/${order.paymentSlipFileId}`;
  }

  sendSuccess(res, 200, 'Order retrieved successfully', orderObj);
});

/**
 * PATCH /api/admin/orders/:id/verify
 * pending→verified, appends statusHistory
 */
exports.verifyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    throw createError(400, 'Only pending orders can be verified');
  }

  order.status = 'verified';
  order.statusHistory.push({
    status: 'verified',
    changedAt: new Date(),
    changedBy: req.user._id
  });

  await order.save();

  sendSuccess(res, 200, 'Order verified successfully', order);
});

/**
 * PATCH /api/admin/orders/:id/reject
 * with a required reason
 */
exports.rejectOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim() === '') {
    throw createError(400, 'Rejection reason is required');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  if (['shipped', 'delivered', 'cancelled', 'rejected'].includes(order.status)) {
    throw createError(400, `Cannot reject an order that is already ${order.status}`);
  }

  order.status = 'rejected';
  order.statusHistory.push({
    status: 'rejected',
    changedAt: new Date(),
    changedBy: req.user._id,
    note: reason
  });

  await order.save();

  sendSuccess(res, 200, 'Order rejected successfully', order);
});

/**
 * PATCH /api/admin/orders/:id/status
 * only allows forward progression verified→shipped→delivered
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validTransitions = {
    verified: 'shipped',
    shipped: 'delivered'
  };

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createError(404, 'Order not found');
  }

  const expectedNextStatus = validTransitions[order.status];

  if (!expectedNextStatus || status !== expectedNextStatus) {
    throw createError(400, `Invalid status transition. From '${order.status}', you can only transition to '${expectedNextStatus || 'none'}'`);
  }

  order.status = status;
  order.statusHistory.push({
    status: status,
    changedAt: new Date(),
    changedBy: req.user._id
  });

  await order.save();

  sendSuccess(res, 200, 'Order status updated successfully', order);
});
