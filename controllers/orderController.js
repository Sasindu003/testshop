const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

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
