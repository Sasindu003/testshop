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

/**
 * PATCH /api/products/:id/stock
 * Staff / Admin / Owner. Adjusts one size's stock up or down and records who made the change.
 */
exports.adjustStock = asyncHandler(async (req, res) => {
  const { size, delta } = req.body;

  if (!size) throw createError('Size label is required', 400);
  if (delta === undefined || typeof delta !== 'number') {
    throw createError('Delta numeric value is required', 400);
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw createError('Product not found', 404);

  const sizeEntry = product.sizes.find((s) => s.size === size);
  if (!sizeEntry) {
    throw createError(`Size '${size}' not found on this product`, 404);
  }

  const newStock = sizeEntry.stock + delta;
  if (newStock < 0) {
    throw createError(`Insufficient stock. Current stock for size '${size}' is ${sizeEntry.stock}`, 400);
  }

  sizeEntry.stock = newStock;
  await product.save();

  sendSuccess(
    res,
    {
      productId: product._id,
      size: sizeEntry.size,
      stock: sizeEntry.stock,
      adjustedBy: {
        _id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    },
    'Stock updated successfully'
  );
});

/**
 * GET /api/products/admin/inventory/low-stock
 * Staff / Admin / Owner. Aggregation pipeline unwinding sizes and filtering stock below a threshold.
 */
exports.getLowStockInventory = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 5;

  const lowStockItems = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$sizes' },
    { $match: { 'sizes.stock': { $lte: threshold } } },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        category: 1,
        size: '$sizes.size',
        stock: '$sizes.stock',
        priceOverride: '$sizes.priceOverride',
        basePrice: 1,
      },
    },
    { $sort: { stock: 1, name: 1 } },
  ]);

  sendSuccess(res, { threshold, count: lowStockItems.length, items: lowStockItems });
});

/**
 * GET /api/products
 * Public. Filter by category, size, minPrice, maxPrice, hasDiscount.
 * Sort: price_asc | price_desc | newest | rating.
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    minPrice,
    maxPrice,
    hasDiscount,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.basePrice.$lte = Number(maxPrice);
  }

  // Filter by size availability (at least 1 unit in stock for that size)
  if (size) {
    filter.sizes = { $elemMatch: { size, stock: { $gt: 0 } } };
  }

  // Filter products that currently have an active discount window
  if (hasDiscount === 'true') {
    const now = new Date();
    filter['discount.activeFrom'] = { $lte: now };
    filter['discount.activeUntil'] = { $gte: now };
  }

  const sortMap = {
    price_asc:  { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest:     { createdAt: -1 },
    rating:     { ratingAverage: -1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const pageNumber  = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, parseInt(limit, 10) || 12);
  const skip        = (pageNumber - 1) * limitNumber;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Products retrieved successfully', {
    products,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/**
 * GET /api/products/search?q=
 * Public. Full-text search via the MongoDB text index on name+description.
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || q.trim() === '') {
    throw createError(400, 'Search query is required');
  }

  const pageNumber  = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, parseInt(limit, 10) || 12);
  const skip        = (pageNumber - 1) * limitNumber;

  const filter = { $text: { $search: q }, isActive: true };

  const [products, total] = await Promise.all([
    Product.find(filter, { score: { $meta: 'textScore' } })
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Search results retrieved', {
    query: q,
    products,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});
