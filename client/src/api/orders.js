import axiosClient from './axiosClient';

/**
 * orders.js — wraps all /orders endpoints
 */

/**
 * Customer checkout: submits cart + payment slip + optional coupon.
 * @param {FormData} formData - contains couponCode, shippingAddress, paymentSlip file
 */
export const createOrder = (formData) =>
  axiosClient.post('/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Customer: list own orders.
 * @param {Object} params - { status, page, limit }
 */
export const getMyOrders = (params = {}) =>
  axiosClient.get('/orders', { params });

export const getOrderById = (id) =>
  axiosClient.get(`/orders/${id}`);

// ── Admin / Owner ────────────────────────────────────────────────────────────
export const getAllOrders = (params = {}) =>
  axiosClient.get('/admin/orders', { params });

export const updateOrderStatus = (id, status) =>
  axiosClient.patch(`/admin/orders/${id}/status`, { status });
