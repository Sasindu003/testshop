import axiosClient from './axiosClient';

/**
 * coupons.js — wraps all /coupons endpoints
 */

// ── Customer ──────────────────────────────────────────────────────────────────
export const validateCoupon = (data) =>
  axiosClient.post('/coupons/validate', data);

// ── Admin / Owner ────────────────────────────────────────────────────────────
export const getCoupons = (params = {}) =>
  axiosClient.get('/coupons', { params });

export const getCouponById = (id) =>
  axiosClient.get(`/coupons/${id}`);

export const createCoupon = (data) =>
  axiosClient.post('/coupons', data);

export const updateCoupon = (id, data) =>
  axiosClient.put(`/coupons/${id}`, data);

export const deleteCoupon = (id) =>
  axiosClient.delete(`/coupons/${id}`);
