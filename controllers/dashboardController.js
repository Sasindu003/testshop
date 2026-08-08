const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * GET /api/admin/dashboard/summary
 * Total revenue, order count by status, customer count.
 */
exports.getSummary = asyncHandler(async (req, res) => {
  const [revenueData, orderCounts, customerCount] = await Promise.all([
    // Total revenue (only for non-cancelled/rejected orders usually, but let's just group by status or calculate for successful ones)
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'rejected'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ role: 'customer' })
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
  
  const ordersByStatus = orderCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  sendSuccess(res, 200, 'Dashboard summary retrieved', {
    totalRevenue,
    ordersByStatus,
    customerCount
  });
});

/**
 * GET /api/admin/dashboard/top-products
 * By units sold from Order.items.
 */
exports.getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { status: { $nin: ['cancelled', 'rejected'] } } },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } }
      }
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit }
  ]);

  sendSuccess(res, 200, 'Top products retrieved', topProducts);
});

/**
 * GET /api/admin/dashboard/revenue-trend
 * Revenue grouped by day/week/month over a date range param.
 */
exports.getRevenueTrend = asyncHandler(async (req, res) => {
  const { interval = 'day', startDate, endDate } = req.query;

  const matchStage = { status: { $nin: ['cancelled', 'rejected'] } };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  let dateFormat;
  if (interval === 'month') {
    dateFormat = '%Y-%m';
  } else if (interval === 'week') {
    dateFormat = '%Y-%U';
  } else {
    dateFormat = '%Y-%m-%d';
  }

  const trend = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  sendSuccess(res, 200, 'Revenue trend retrieved', trend);
});

/**
 * GET /api/admin/dashboard/inventory-health
 * Out-of-stock and low-stock counts.
 */
exports.getInventoryHealth = asyncHandler(async (req, res) => {
  const lowStockThreshold = parseInt(req.query.threshold, 10) || 10;

  const healthData = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $project: {
        name: 1,
        totalStock: { $sum: '$sizes.stock' }
      }
    },
    {
      $group: {
        _id: null,
        outOfStock: {
          $sum: { $cond: [{ $eq: ['$totalStock', 0] }, 1, 0] }
        },
        lowStock: {
          $sum: { $cond: [{ $and: [{ $gt: ['$totalStock', 0] }, { $lt: ['$totalStock', lowStockThreshold] }] }, 1, 0] }
        }
      }
    }
  ]);

  const result = healthData.length > 0 ? healthData[0] : { outOfStock: 0, lowStock: 0 };
  delete result._id;

  sendSuccess(res, 200, 'Inventory health retrieved', result);
});
