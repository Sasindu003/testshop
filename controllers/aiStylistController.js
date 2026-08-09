const aiStylistService = require('../services/aiStylistService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * POST /api/ai-stylist/recommend
 * Accepts a free-text styling request (e.g. casual outfit request under a budget)
 */
exports.getRecommendation = asyncHandler(async (req, res) => {
  const { prompt, budget, category, sessionId } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw createError(400, 'Free-text styling request prompt is required');
  }

  const result = await aiStylistService.getStylingRecommendation({
    prompt: prompt.trim(),
    budget,
    category,
    sessionId: sessionId || req.headers['x-session-id'],
  });

  sendSuccess(res, 200, 'AI Stylist recommendation generated', result);
});
