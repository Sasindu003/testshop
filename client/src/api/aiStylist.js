import axiosClient from './axiosClient';

/**
 * aiStylist.js — wraps all /ai-stylist endpoints
 */

/**
 * @param {Object} data - { query: string, budget?: number, sessionId?: string }
 */
export const getRecommendation = (data) =>
  axiosClient.post('/ai-stylist/recommend', data);
