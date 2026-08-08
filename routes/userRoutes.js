const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getCustomers,
  getCustomerById,
  deactivateCustomer
} = require('../controllers/userController');

// All routes here should be protected and restricted to admin/owner roles
router.use(protect);
router.use(authorize('admin', 'owner'));

// GET /admin/customers
router.get('/admin/customers', getCustomers);

// GET /admin/customers/:id
router.get('/admin/customers/:id', getCustomerById);

// PATCH /admin/customers/:id/deactivate
router.patch('/admin/customers/:id/deactivate', deactivateCustomer);

module.exports = router;
