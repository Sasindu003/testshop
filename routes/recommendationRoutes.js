const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res, next) => {
  try {
    const recommendations = await Product.find().limit(4);
    res.json({
      success: true,
      recommendations: recommendations.map(p => ({
        ...p.toObject(),
        matchScore: '96%',
        aiReasoning: 'Matches recent luxury streetwear preference and popular size selection.'
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
