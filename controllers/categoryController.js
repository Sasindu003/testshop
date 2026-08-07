const mongoose = require('mongoose');
const Category = require('../models/Category');

const fallbackCategories = [
  { name: 'Streetwear & Hoodies', slug: 'streetwear-hoodies', description: 'Modern Urban Fashion & Oversized Hoodies' },
  { name: 'Formal & Suits', slug: 'formal-suits', description: 'Tailored Suits, Blazers & Silk Shirts' },
  { name: 'Casual Apparel & Tees', slug: 'casual-tees', description: 'Organic Cotton Tees & Casual Shirts' },
  { name: 'Selvedge Denim & Jeans', slug: 'selvedge-denim', description: 'Shuttle-Loomed Japanese Selvedge Denim' },
  { name: 'Luxury Accessories & Caps', slug: 'accessories', description: 'Leather Accessories, Caps & Belts' }
];

const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find();
      return res.json({ success: true, count: categories.length, categories });
    } else {
      return res.json({ success: true, count: fallbackCategories.length, categories: fallbackCategories });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories };
