const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    education: {
      type: String,
      trim: true,
      maxlength: [100, "Education field too long"],
    },
    avatar: {
      type: String,
      default: null,
    },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
      totalEarned: { type: Number, default: 0 },
      totalRedeemed: { type: Number, default: 0 },
    },
    paymentDetails: {
      upiId: { type: String, trim: true, default: null },
      bankAccount: { type: String, trim: true, default: null },
      ifsc: { type: String, trim: true, default: null },
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
