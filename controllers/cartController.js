const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, createError } = require('../utils/response');

/**
 * Helper to populate cart items with live product data
 */
const populateCart = async (cartQuery) => {
  return cartQuery.populate({
    path: 'items.product',
    populate: { path: 'category', select: 'name slug' },
  });
};

/**
 * GET /api/cart
 * Protected. Cart populated with live product/price/stock so frontend can flag stale items.
 */
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await populateCart(Cart.findOne({ customer: req.user._id }));

  if (!cart) {
    cart = await Cart.create({ customer: req.user._id, items: [] });
  }

  sendSuccess(res, 200, 'Cart retrieved successfully', cart);
});

/**
 * POST /api/cart/items
 * Protected. Add or increment quantity for product + size.
 */
exports.addItem = asyncHandler(async (req, res) => {
  const { productId, size, quantity = 1 } = req.body;

  if (!productId || !size) {
    throw createError(400, 'Product ID and size are required');
  }

  const numQuantity = parseInt(quantity, 10);
  if (isNaN(numQuantity) || numQuantity < 1) {
    throw createError(400, 'Quantity must be at least 1');
  }

  // Check product existence & activity
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw createError(404, 'Product not found or inactive');
  }

  // Check if size is valid for product
  const sizeOption = product.sizes.find((s) => s.size === size);
  if (!sizeOption) {
    throw createError(400, `Size '${size}' is not available for this product`);
  }

  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    cart = new Cart({ customer: req.user._id, items: [] });
  }

  // Check if item with same product + size exists
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString() && item.size === size
  );

  if (existingIndex > -1) {
    // Increment quantity rather than duplicate line item
    cart.items[existingIndex].quantity += numQuantity;
  } else {
    // Add new line item
    cart.items.push({ product: productId, size, quantity: numQuantity });
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  sendSuccess(res, 200, 'Item added to cart', cart);
});

/**
 * PATCH /api/cart/items/:productId
 * Protected. Update quantity/size for an item in cart.
 */
exports.updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, quantity, oldSize } = req.body;

  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    throw createError(404, 'Cart not found');
  }

  // Identify target item by item _id or product ID (+ optional oldSize/size matching)
  const targetSize = oldSize || size;
  let itemIndex = cart.items.findIndex(
    (item) =>
      item._id.toString() === productId ||
      (item.product.toString() === productId && (!targetSize || item.size === targetSize))
  );

  if (itemIndex === -1) {
    // Fallback: match by product ID alone
    itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  }

  if (itemIndex === -1) {
    throw createError(404, 'Item not found in cart');
  }

  const currentItem = cart.items[itemIndex];

  // Updating size
  if (size && size !== currentItem.size) {
    const product = await Product.findById(currentItem.product);
    if (!product || !product.sizes.some((s) => s.size === size)) {
      throw createError(400, `Size '${size}' is not valid for this product`);
    }

    // If new size already exists in cart for this product, merge quantities
    const existingDuplicateIndex = cart.items.findIndex(
      (item, idx) =>
        idx !== itemIndex &&
        item.product.toString() === currentItem.product.toString() &&
        item.size === size
    );

    if (existingDuplicateIndex > -1) {
      const newQty = quantity !== undefined ? parseInt(quantity, 10) : currentItem.quantity;
      cart.items[existingDuplicateIndex].quantity += newQty;
      cart.items.splice(itemIndex, 1);
    } else {
      currentItem.size = size;
      if (quantity !== undefined) {
        currentItem.quantity = parseInt(quantity, 10);
      }
    }
  } else if (quantity !== undefined) {
    const newQty = parseInt(quantity, 10);
    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      currentItem.quantity = newQty;
    }
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  sendSuccess(res, 200, 'Cart item updated', cart);
});

/**
 * DELETE /api/cart/items/:productId
 * Protected. Remove item from cart.
 */
exports.removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size } = req.query;

  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    throw createError(404, 'Cart not found');
  }

  const initialCount = cart.items.length;
  cart.items = cart.items.filter((item) => {
    if (item._id.toString() === productId) return false;
    if (item.product.toString() === productId) {
      if (size && item.size !== size) return true;
      return false;
    }
    return true;
  });

  if (cart.items.length === initialCount) {
    throw createError(404, 'Item not found in cart');
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  sendSuccess(res, 200, 'Item removed from cart', cart);
});

/**
 * DELETE /api/cart
 * Protected. Clear all items from cart.
 */
exports.clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    cart = new Cart({ customer: req.user._id, items: [] });
  } else {
    cart.items = [];
    await cart.save();
  }

  sendSuccess(res, 200, 'Cart cleared', cart);
});
