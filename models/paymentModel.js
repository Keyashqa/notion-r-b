const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR", // Most Razorpay payments use INR; update if needed
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Make it a proper reference
    ref: 'User',
    required: false,
  },
  status: {
    type: String,
    enum: ["paid", "failed", "pending"],
    default: "paid",
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Payment', paymentSchema);
