const mongoose = require('mongoose');
const User = require('../models/User');

// Reference to memoryUsers in authController for fallback mode
const authController = require('./authController');

// @desc    Get all users with pagination and optional filters
// @route   GET /api/admin/users
// @access  Admin/Staff
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || '').trim();
    const roleFilter = (req.query.role || '').trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      // --- MongoDB path ---
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (roleFilter && ['customer', 'admin', 'staff'].includes(roleFilter)) {
        query.role = roleFilter;
      }

      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const safePage = Math.min(page, totalPages);
      const skip = (safePage - 1) * limit;

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        success: true,
        users,
        page: safePage,
        totalPages,
        total
      });
    } else {
      // --- Memory fallback path ---
      let list = (authController._getMemoryUsers ? authController._getMemoryUsers() : [])
        .map(({ passwordHash, ...rest }) => rest);

      if (roleFilter && ['customer', 'admin', 'staff'].includes(roleFilter)) {
        list = list.filter(u => u.role === roleFilter);
      }

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      }

      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const safePage = Math.min(page, totalPages);
      const skip = (safePage - 1) * limit;
      const users = list.slice(skip, skip + limit);

      return res.json({
        success: true,
        users,
        page: safePage,
        totalPages,
        total
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/status
// @access  Admin/Staff
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean value.' });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === userId && !isActive) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    if (mongoose.connection.readyState === 1) {
      // --- MongoDB path ---
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      user.isActive = isActive;
      await user.save();

      return res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
        user
      });
    } else {
      // --- Memory fallback path ---
      const memoryUsers = authController._getMemoryUsers ? authController._getMemoryUsers() : [];
      const user = memoryUsers.find(u => u._id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      user.isActive = isActive;
      const { passwordHash, ...userClean } = user;

      return res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
        user: userClean
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus
};
