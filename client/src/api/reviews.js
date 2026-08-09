import axiosClient from './axiosClient';

/**
 * reviews.js — wraps all /products/:id/reviews endpoints
 */

export const getProductReviews = (productId, params = {}) =>
  axiosClient.get(`/products/${productId}/reviews`, { params });

export const createReview = (productId, data) =>
  axiosClient.post(`/products/${productId}/reviews`, data);

export const updateReview = (productId, reviewId, data) =>
  axiosClient.put(`/products/${productId}/reviews/${reviewId}`, data);

export const deleteReview = (productId, reviewId) =>
  axiosClient.delete(`/products/${productId}/reviews/${reviewId}`);
