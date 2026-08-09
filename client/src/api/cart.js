import axiosClient from './axiosClient';

/**
 * cart.js — wraps all /cart endpoints (all protected)
 */

export const getCart = () =>
  axiosClient.get('/cart');

export const addToCart = (productId, size, quantity = 1) =>
  axiosClient.post('/cart/items', { productId, size, quantity });

export const updateCartItem = (productId, data) =>
  axiosClient.patch(`/cart/items/${productId}`, data);

export const removeCartItem = (productId) =>
  axiosClient.delete(`/cart/items/${productId}`);

export const clearCart = () =>
  axiosClient.delete('/cart');
