import axiosClient from './axiosClient';

/**
 * auth.js — wraps all /auth endpoints
 */

export const login = (credentials) =>
  axiosClient.post('/auth/login', credentials);

export const register = (userData) =>
  axiosClient.post('/auth/register', userData);

export const logout = () =>
  axiosClient.post('/auth/logout');

export const refreshToken = () =>
  axiosClient.post('/auth/refresh');

export const getProfile = () =>
  axiosClient.get('/auth/profile');

export const updateProfile = (data) =>
  axiosClient.put('/auth/profile', data);

export const changePassword = (data) =>
  axiosClient.put('/auth/change-password', data);

export const forgotPassword = (email) =>
  axiosClient.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) =>
  axiosClient.post(`/auth/reset-password/${token}`, { password });
