const express = require('express');
const router = express.Router();
const { getAdminStats, getEmployees, createEmployee, getCoupons, createCoupon } = require('../controllers/adminController');
const { getUsers, toggleUserStatus } = require('../controllers/userController');
const { adjustStock } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/stats', getAdminStats);
router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);

// Customer management (S1-E1)
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);

// Product stock adjustment (S1-E2)
router.patch('/products/:id/stock', adjustStock);

module.exports = router;

