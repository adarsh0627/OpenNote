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
      default: "FREE", 
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
    sellerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformAmount: {
      type: Number,
      required: true,
      min: 0,
    },
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

purchaseSchema.index({ user: 1, note: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);