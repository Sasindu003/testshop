const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');
const { uploadToGridFS } = require('../middleware/upload');

/**
 * Helper to parse JSON string fields from multipart/form-data
 */
const parseJSONField = (field, fallback = undefined) => {
  if (field === undefined || field === null) return fallback;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (_e) {
      return fallback;
    }
  }
  return field;
};

/**
 * POST /api/products
 * Admin / Staff / Owner. Multi-image upload to GridFS (up to 5 images).
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, basePrice } = req.body;
  const sizes = parseJSONField(req.body.sizes, []);
  const discount = parseJSONField(req.body.discount, undefined);

  if (!category) throw createError('Category is required', 400);

  // Validate Category exists
  const catExists = await Category.findById(category);
  if (!catExists || !catExists.isActive) {
    throw createError('Invalid or inactive Category ID', 400);
  }

  // Validate sizes is not empty
  if (!Array.isArray(sizes) || sizes.length === 0) {
    throw createError('At least one size entry is required', 400);
  }

  // Handle uploaded files (up to 5)
  const imageFileIds = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files.slice(0, 5)) {
      const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
      imageFileIds.push(fileId);
    }
  }

  const product = await Product.create({
    name,
    description,
    category,
    basePrice: Number(basePrice),
    discount,
    sizes,
    imageFileIds,
  });

  sendSuccess(res, product, 'Product created successfully', 201);
});

/**
 * PUT /api/products/:id
 * Admin / Staff / Owner. Supports partial updates, sizes update, and image additions/removals.
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw createError('Product not found', 404);

  const { name, description, category, basePrice } = req.body;
  const sizes = parseJSONField(req.body.sizes, undefined);
  const discount = parseJSONField(req.body.discount, undefined);
  const keepImageIds = parseJSONField(req.body.keepImageIds, undefined);

  if (category) {
    const catExists = await Category.findById(category);
    if (!catExists || !catExists.isActive) {
      throw createError('Invalid or inactive Category ID', 400);
    }
    product.category = category;
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (basePrice !== undefined) product.basePrice = Number(basePrice);
  if (discount !== undefined) product.discount = discount;

  if (sizes !== undefined) {
    if (!Array.isArray(sizes) || sizes.length === 0) {
      throw createError('Sizes array cannot be empty', 400);
    }
    product.sizes = sizes;
  }

  // Manage image array
  let updatedImageIds = product.imageFileIds.map((id) => id.toString());

  // Filter images if keepImageIds is provided
  if (Array.isArray(keepImageIds)) {
    updatedImageIds = updatedImageIds.filter((id) => keepImageIds.includes(id));
  }

  // Append new uploads up to total max of 5
  if (req.files && req.files.length > 0) {
    const spaceLeft = 5 - updatedImageIds.length;
    if (spaceLeft > 0) {
      for (const file of req.files.slice(0, spaceLeft)) {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        updatedImageIds.push(fileId.toString());
      }
    }
  }

  product.imageFileIds = updatedImageIds;
  await product.save();

  sendSuccess(res, product, 'Product updated successfully');
});

/**
 * DELETE /api/products/:id
 * Admin / Owner. Soft delete (isActive = false).
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw createError('Product not found', 404);

  product.isActive = false;
  await product.save();

  sendSuccess(res, null, 'Product deactivated');
});
