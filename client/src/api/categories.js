import axiosClient from './axiosClient';

/**
 * categories.js — wraps all /categories endpoints
 */

export const getCategories = () =>
  axiosClient.get('/categories');

export const getCategoryById = (id) =>
  axiosClient.get(`/categories/${id}`);

// ── Admin / Owner ────────────────────────────────────────────────────────────
export const createCategory = (data) =>
  axiosClient.post('/categories', data);

export const updateCategory = (id, data) =>
  axiosClient.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  axiosClient.delete(`/categories/${id}`);
