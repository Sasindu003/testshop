const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: [true, 'Size label is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    priceOverride: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { _id: true }
);

const discountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    activeFrom: {
      type: Date,
      required: true,
    },
    activeUntil: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    discount: discountSchema,
    sizes: [sizeSchema],
    imageFileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

// Auto-generate slug from name
productSchema.pre('validate', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

/**
 * Compute final price for a given size, applying the discount
 * only if the current time falls within the active window.
 * @param {String} sizeLabel - size to look up (uses priceOverride if set)
 * @returns {Number} final price after discount (floored to 2 decimals)
 */
productSchema.methods.computeFinalPrice = function (sizeLabel) {
  let price = this.basePrice;

  // Use size-specific priceOverride if present
  if (sizeLabel && this.sizes.length) {
    const variant = this.sizes.find((s) => s.size === sizeLabel);
    if (variant && variant.priceOverride != null) {
      price = variant.priceOverride;
    }
  }

  // Apply discount only within active window
  if (this.discount) {
    const now = new Date();
    if (now >= this.discount.activeFrom && now <= this.discount.activeUntil) {
      if (this.discount.type === 'percentage') {
        price = price * (1 - this.discount.value / 100);
      } else if (this.discount.type === 'fixed') {
        price = Math.max(0, price - this.discount.value);
      }
    }
  }

  return Math.round(price * 100) / 100;
};

module.exports = mongoose.model('Product', productSchema);
