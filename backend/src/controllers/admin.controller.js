const User = require("../models/user.model");
const Note = require("../models/note.model");
const Purchase = require("../models/purchase.model");
const RedemptionRequest = require("../models/redemption.model");
const WalletTransaction = require("../models/walletTransaction.model");
const Notification = require("../models/notification.model");

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalNotes, totalPurchases, pendingRedemptions] =
      await Promise.all([
        User.countDocuments(),
        Note.countDocuments({ isActive: true }),
        Purchase.countDocuments(),
        RedemptionRequest.countDocuments({ status: "PENDING" }),
      ]);

    const revenueData = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: "$platformAmount" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalNotes,
        totalPurchases,
        pendingRedemptions,
        platformRevenue: revenueData[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

exports.getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Note.countDocuments();
    const notes = await Note.find()
      .populate("uploadedBy", "userName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-filePublicId -fileResourceType");

    res.status(200).json({ success: true, notes, total });
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    await Note.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Note removed" });
  } catch (error) {
    next(error);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Purchase.countDocuments();
    const purchases = await Purchase.find()
      .populate("user", "userName email")
      .populate("note", "title price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, purchases, total });
  } catch (error) {
    next(error);
  }
};

exports.getRedemptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await RedemptionRequest.countDocuments(query);
    const redemptions = await RedemptionRequest.find(query)
      .populate("user", "userName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, redemptions, total });
  } catch (error) {
    next(error);
  }
};

exports.approveRedemption = async (req, res, next) => {
  try {
    const redemption = await RedemptionRequest.findById(req.params.id).populate("user", "userName email");
    if (!redemption) return res.status(404).json({ success: false, message: "Request not found" });
    if (redemption.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Request is not pending" });
    }

    redemption.status = "PAID";
    redemption.processedAt = new Date();
    redemption.adminNote = req.body.adminNote || "Payment processed";
    await redemption.save();

    await User.findByIdAndUpdate(redemption.user._id, {
      $inc: { "wallet.totalRedeemed": redemption.amount },
    });

    const user = await User.findById(redemption.user._id).select("wallet");
    await WalletTransaction.create({
      user: redemption.user._id,
      type: "DEBIT",
      amount: redemption.amount,
      description: `Redemption paid via ${redemption.paymentMethod}`,
      redemption: redemption._id,
      balanceAfter: user.wallet.balance,
    });

    await Notification.create({
      user: redemption.user._id,
      title: "Payout Processed!",
      message: `₹${redemption.amount} has been sent to your ${redemption.paymentMethod}.`,
      type: "REDEMPTION",
    });

    res.status(200).json({ success: true, message: "Redemption approved and marked as paid", redemption });
  } catch (error) {
    next(error);
  }
};

exports.rejectRedemption = async (req, res, next) => {
  try {
    const redemption = await RedemptionRequest.findById(req.params.id).populate("user");
    if (!redemption) return res.status(404).json({ success: false, message: "Request not found" });
    if (redemption.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Request is not pending" });
    }

    redemption.status = "REJECTED";
    redemption.processedAt = new Date();
    redemption.adminNote = req.body.adminNote || "Rejected by admin";
    await redemption.save();

    await User.findByIdAndUpdate(redemption.user._id, {
      $inc: { "wallet.balance": redemption.amount },
    });

    const user = await User.findById(redemption.user._id).select("wallet");
    await WalletTransaction.create({
      user: redemption.user._id,
      type: "CREDIT",
      amount: redemption.amount,
      description: `Redemption rejected — ₹${redemption.amount} refunded to wallet`,
      redemption: redemption._id,
      balanceAfter: user.wallet.balance,
    });

    await Notification.create({
      user: redemption.user._id,
      title: "Payout Rejected",
      message: `Your redemption request of ₹${redemption.amount} was rejected. Amount refunded to wallet. Reason: ${redemption.adminNote}`,
      type: "REDEMPTION",
    });

    res.status(200).json({ success: true, message: "Redemption rejected and amount refunded", redemption });
  } catch (error) {
    next(error);
  }
};