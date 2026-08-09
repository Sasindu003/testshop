import axiosClient from './axiosClient';

/**
 * wishlist.js — wraps all /wishlist endpoints (all protected)
 */

export const getWishlist = () =>
  axiosClient.get('/wishlist');

export const addToWishlist = (productId) =>
  axiosClient.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
  axiosClient.delete(`/wishlist/${productId}`);
