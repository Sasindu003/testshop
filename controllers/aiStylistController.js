const aiStylistService = require('../services/aiStylistService');
const StylistLog = require('../models/StylistLog');
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

  // Fetch recent log entries for light personalization if user is logged in
  let previousLogs = [];
  if (req.user && req.user._id) {
    previousLogs = await StylistLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);
  }

  const result = await aiStylistService.getStylingRecommendation({
    prompt: prompt.trim(),
    budget,
    category,
    sessionId: sessionId || req.headers['x-session-id'],
    previousLogs,
  });

  // Persist exactly one StylistLog entry per call
  await StylistLog.create({
    user: req.user ? req.user._id : null,
    query: prompt.trim(),
    recommendedProducts: result.recommendedProducts.map((p) => p._id),
    rawResponseSummary: result.rationale,
  });

  sendSuccess(res, 200, 'AI Stylist recommendation generated', result);
});

/**
 * GET /api/admin/ai-stylist/logs
 * Admin / Owner. Paginated review of AI Stylist interaction logs.
 */
exports.getStylistLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, parseInt(limit, 10) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [logs, total] = await Promise.all([
    StylistLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('user', 'name email role')
      .populate('recommendedProducts', 'name basePrice'),
    StylistLog.countDocuments(),
  ]);

  sendSuccess(res, 200, 'Stylist interaction logs retrieved', {
    logs,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

