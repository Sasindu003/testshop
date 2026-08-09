import axiosClient from './axiosClient';

/**
 * products.js — wraps all /products endpoints
 */

/**
 * @param {Object} params - { category, size, minPrice, maxPrice, hasDiscount, sort, page, limit }
 */
export const getProducts = (params = {}) =>
  axiosClient.get('/products', { params });

export const searchProducts = (q, params = {}) =>
  axiosClient.get('/products/search', { params: { q, ...params } });

export const getProductById = (id) =>
  axiosClient.get(`/products/${id}`);

// ── Admin / Owner ────────────────────────────────────────────────────────────
export const createProduct = (formData) =>
  axiosClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, formData) =>
  axiosClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id) =>
  axiosClient.delete(`/products/${id}`);

export const deleteProductImage = (id, imageId) =>
  axiosClient.delete(`/products/${id}/images/${imageId}`);
