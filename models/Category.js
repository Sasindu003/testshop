const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
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
    imageFileId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before validation
categorySchema.pre('validate', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
