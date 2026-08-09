const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');
const { uploadToGridFS } = require('../middleware/upload');

/**
 * GET /api/categories
 * Public — active categories only, with optional tree (populated parent).
 */
exports.getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ name: 1 })
    .lean();
  sendSuccess(res, categories);
});

/**
 * GET /api/categories/:id
 * Public.
 */
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parentCategory', 'name slug')
    .lean();

  if (!category) throw createError('Category not found', 404);
  if (!category.isActive) throw createError('Category not found', 404);

  sendSuccess(res, category);
});

/**
 * POST /api/categories
 * Admin / Owner only. Accepts multipart/form-data with optional image.
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;

  if (!name) throw createError('Name is required');

  let imageFileId;
  if (req.file) {
    imageFileId = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
  }

  const category = await Category.create({
    name,
    description,
    parentCategory: parentCategory || null,
    imageFileId,
  });

  sendSuccess(res, category, 'Category created', 201);
});

/**
 * PUT /api/categories/:id
 * Admin / Owner only.
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory, isActive } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) throw createError('Category not found', 404);

  // Prevent self-referencing parent
  if (parentCategory && parentCategory === req.params.id) {
    throw createError('A category cannot be its own parent');
  }

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (isActive !== undefined) category.isActive = isActive;

  if (req.file) {
    category.imageFileId = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
  }

  await category.save();
  sendSuccess(res, category, 'Category updated');
});

/**
 * DELETE /api/categories/:id
 * Admin / Owner only — soft-delete (isActive=false).
 * Returns 409 if any active Product references this category.
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw createError('Category not found', 404);

  const productCount = await Product.countDocuments({
    category: req.params.id,
    isActive: true,
  });

  if (productCount > 0) {
    throw createError(
      `Cannot delete category — ${productCount} active product(s) still reference it. Reassign or deactivate them first.`,
      409
    );
  }

  category.isActive = false;
  await category.save();

  sendSuccess(res, null, 'Category deactivated');
});
