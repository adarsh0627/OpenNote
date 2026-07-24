const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    paymentId: {
      type: String,
      default: "FREE", // for free notes
    },
    orderId: {
      type: String,
      default: "FREE",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Amount that goes to the seller after commission
    sellerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Platform commission amount
    platformAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Commission % at time of purchase (stored for audit)
    commissionPercent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FREE"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

// ── Prevent duplicate purchases ──────────────────────────────
// A user can only buy a note once
purchaseSchema.index({ user: 1, note: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);