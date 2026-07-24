const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    tags: {
      type: [String],
      required: [true, "At least one tag is required"],
    },
    subject: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    filePublicId: {
      type: String,
      required: [true, "File is required"],
      select: false,
    },
    fileResourceType: {
      type: String,
      default: "raw",
      select: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

noteSchema.index({ tags: 1 });
noteSchema.index({ uploadedBy: 1 });
noteSchema.index({ price: 1 });
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);