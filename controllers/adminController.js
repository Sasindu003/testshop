const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const memoryEmployees = [
  { _id: 'emp_1', name: 'Alexander Wright', email: 'alex@stylehub.com', department: 'Fashion Design', designation: 'Lead Stylist', salary: 4500.00, hireDate: '2024-01-15' },
  { _id: 'emp_2', name: 'Elena Rostova', email: 'elena@stylehub.com', department: 'Inventory & Operations', designation: 'Warehouse Manager', salary: 3800.00, hireDate: '2024-06-01' }
];

const memoryCoupons = [
  { _id: 'coup_1', code: 'STYLE25', discountPercentage: 25, expiryDate: '2026-12-31', minPurchase: 50, isActive: true },
  { _id: 'coup_2', code: 'LUXURY25', discountPercentage: 25, expiryDate: '2026-12-31', minPurchase: 100, isActive: true }
];

const getAdminStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // 1. Total revenue excluding cancelled orders
      const revenueAgg = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
      ]);
      const totalSales = revenueAgg.length > 0 ? revenueAgg[0].totalSales : 0;

      // 2. Total order count
      const totalOrders = await Order.countDocuments();

      // 3. Order count grouped by status
      const ordersByStatusAgg = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const ordersByStatus = {
        'Pending Payment': 0,
        'Processing': 0,
        'Shipped': 0,
        'Delivered': 0,
        'Cancelled': 0
      };
      ordersByStatusAgg.forEach(item => {
        if (item._id) {
          ordersByStatus[item._id] = item.count;
        }
      });

      // 4. Low stock products count (stockCount <= lowStockThreshold)
      const lowStockProducts = await Product.countDocuments({
        $expr: {
          $lte: ['$stockCount', { $ifNull: ['$lowStockThreshold', 5] }]
        }
      });

      // 5. Total customers count
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      return res.json({
        success: true,
        stats: {
          totalSales,
          totalOrders,
          totalCustomers,
          lowStockProducts,
          ordersByStatus
        }
      });
    } else {
      return res.json({
        success: true,
        stats: {
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: 0,
          lowStockProducts: 0,
          ordersByStatus: {
            'Pending Payment': 0,
            'Processing': 0,
            'Shipped': 0,
            'Delivered': 0,
            'Cancelled': 0
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res) => {
  res.json({ success: true, count: memoryEmployees.length, employees: memoryEmployees });
};

const createEmployee = async (req, res) => {
  const newEmp = { _id: 'emp_' + Date.now(), ...req.body, hireDate: new Date().toISOString().split('T')[0] };
  memoryEmployees.unshift(newEmp);
  res.status(201).json({ success: true, message: 'Employee added successfully', employee: newEmp });
};

const getCoupons = async (req, res) => {
  res.json({ success: true, count: memoryCoupons.length, coupons: memoryCoupons });
};

const createCoupon = async (req, res) => {
  const newCoup = { _id: 'coup_' + Date.now(), ...req.body, isActive: true };
  memoryCoupons.unshift(newCoup);
  res.status(201).json({ success: true, message: 'Coupon created successfully', coupon: newCoup });
};

module.exports = {
  getAdminStats,
  getEmployees,
  createEmployee,
  getCoupons,
  createCoupon
};
