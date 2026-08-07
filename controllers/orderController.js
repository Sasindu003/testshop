const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// No in-memory fallback — orders require MongoDB for data integrity.
const requireDB = (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Order operations require a live MongoDB connection.'
    });
    return false;
  }
  return true;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Authenticated
const createOrder = async (req, res, next) => {
  try {
    if (!requireDB(req, res)) return;

    const { orderItems, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided.' });
    }

    // --- Stock validation: check every item before creating the order ---
    const insufficientItems = [];

    for (const item of orderItems) {
      if (!item.product) {
        insufficientItems.push({ title: item.title || 'Unknown', reason: 'Missing product reference.' });
        continue;
      }

      const product = await Product.findById(item.product).select('title stockCount');
      if (!product) {
        insufficientItems.push({ title: item.title || item.product, reason: 'Product not found.' });
        continue;
      }

      if (product.stockCount < item.quantity) {
        insufficientItems.push({
          title: product.title,
          requested: item.quantity,
          available: product.stockCount
        });
      }
    }

    if (insufficientItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for one or more items.',
        insufficientItems
      });
    }

    const trackingNumber = 'SH-TRK-' + Math.floor(10000 + Math.random() * 90000);

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      totalAmount,
      status: 'Pending Payment',
      trackingNumber
    });

    return res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Authenticated
const getMyOrders = async (req, res, next) => {
  try {
    if (!requireDB(req, res)) return;

    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin/Staff
const getAllOrders = async (req, res, next) => {
  try {
    if (!requireDB(req, res)) return;

    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin/Staff
const updateOrderStatus = async (req, res, next) => {
  try {
    if (!requireDB(req, res)) return;

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
