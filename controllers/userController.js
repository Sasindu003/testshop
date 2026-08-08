const User = require('../models/User');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * GET /api/admin/customers
 * Paginated, search by partial name/email
 */
exports.getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const filter = { role: 'customer' };

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex }
    ];
  }

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const [customers, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    User.countDocuments(filter)
  ]);

  sendSuccess(res, 200, 'Customers retrieved successfully', {
    customers,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber)
    }
  });
});

/**
 * GET /api/admin/customers/:id
 * Profile plus order history
 */
exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });

  if (!customer) {
    throw createError(404, 'Customer not found');
  }

  // Fetch order history
  const orders = await Order.find({ customer: customer._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');

  const customerObj = customer.toObject();
  customerObj.orders = orders;

  sendSuccess(res, 200, 'Customer retrieved successfully', customerObj);
});

/**
 * PATCH /api/admin/customers/:id/deactivate
 */
exports.deactivateCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });

  if (!customer) {
    throw createError(404, 'Customer not found');
  }

  if (!customer.isActive) {
    throw createError(400, 'Customer is already deactivated');
  }

  customer.isActive = false;
  await customer.save();

  sendSuccess(res, 200, 'Customer deactivated successfully', customer);
});
