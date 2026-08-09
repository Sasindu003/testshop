const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getSummary,
  getTopProducts,
  getRevenueTrend,
  getInventoryHealth
} = require('../controllers/dashboardController');

// All routes here should be protected and restricted to admin/owner roles
router.use(protect);
router.use(authorize('admin', 'owner'));

router.get('/admin/dashboard/summary', getSummary);
router.get('/admin/dashboard/top-products', getTopProducts);
router.get('/admin/dashboard/revenue-trend', getRevenueTrend);
router.get('/admin/dashboard/inventory-health', getInventoryHealth);

module.exports = router;
