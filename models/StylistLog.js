const mongoose = require('mongoose');

const stylistLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    query: {
      type: String,
      required: true,
    },
    recommendedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    rawResponseSummary: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StylistLog', stylistLogSchema);
