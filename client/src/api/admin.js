import axiosClient from './axiosClient';

/**
 * admin.js — wraps all /admin/* endpoints (admin/owner only)
 */

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardSummary = () =>
  axiosClient.get('/admin/dashboard/summary');

export const getTopProducts = (params = {}) =>
  axiosClient.get('/admin/dashboard/top-products', { params });

export const getRevenueTrend = (params = {}) =>
  axiosClient.get('/admin/dashboard/revenue-trend', { params });

export const getInventoryHealth = () =>
  axiosClient.get('/admin/dashboard/inventory-health');

// ── Orders ────────────────────────────────────────────────────────────────────
export const getAdminOrders = (params = {}) =>
  axiosClient.get('/admin/orders', { params });

export const updateOrderStatus = (id, status) =>
  axiosClient.patch(`/admin/orders/${id}/status`, { status });

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params = {}) =>
  axiosClient.get('/admin/users', { params });

export const updateUserRole = (id, role) =>
  axiosClient.patch(`/admin/users/${id}/role`, { role });

export const deleteUser = (id) =>
  axiosClient.delete(`/admin/users/${id}`);

// ── AI Stylist Logs ───────────────────────────────────────────────────────────
export const getStylistLogs = (params = {}) =>
  axiosClient.get('/admin/ai-stylist/logs', { params });
