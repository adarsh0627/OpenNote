const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [50, "Minimum redemption amount is ₹50"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "BANK"],
      required: true,
    },
    paymentDetails: {
      upiId: { type: String, default: null },
      bankAccount: { type: String, default: null },
      ifsc: { type: String, default: null },
    },
    adminNote: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

redemptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("RedemptionRequest", redemptionSchema);