const User = require("../models/user.model");
const WalletTransaction = require("../models/walletTransaction.model");
const RedemptionRequest = require("../models/redemption.model");
const Notification = require("../models/notification.model");

const MIN_REDEMPTION = 50;

exports.getWalletInfo = async (userId) => {
  const user = await User.findById(userId).select("wallet paymentDetails");
  if (!user) throw new Error("User not found");

  const transactions = await WalletTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return { wallet: user.wallet, paymentDetails: user.paymentDetails, transactions };
};

exports.updatePaymentDetails = async (userId, { upiId, bankAccount, ifsc }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { paymentDetails: { upiId, bankAccount, ifsc } },
    { new: true, runValidators: true }
  ).select("paymentDetails");

  return user.paymentDetails;
};

exports.requestRedemption = async (userId, { amount, paymentMethod }) => {
  if (amount < MIN_REDEMPTION)
    throw new Error(`Minimum redemption amount is ₹${MIN_REDEMPTION}`);

  const user = await User.findById(userId).select("wallet paymentDetails");
  if (!user) throw new Error("User not found");

  if (user.wallet.balance < amount)
    throw new Error("Insufficient wallet balance");

  const pendingRequest = await RedemptionRequest.findOne({
    user: userId,
    status: "PENDING",
  });
  if (pendingRequest)
    throw new Error("You already have a pending redemption request");

  if (paymentMethod === "UPI" && !user.paymentDetails?.upiId)
    throw new Error("Please add a UPI ID in your profile first");
  if (paymentMethod === "BANK" && (!user.paymentDetails?.bankAccount || !user.paymentDetails?.ifsc))
    throw new Error("Please add bank details in your profile first");

  await User.findByIdAndUpdate(userId, {
    $inc: { "wallet.balance": -amount },
  });

  const redemption = await RedemptionRequest.create({
    user: userId,
    amount,
    paymentMethod,
    paymentDetails: user.paymentDetails,
    status: "PENDING",
  });

  const updatedUser = await User.findById(userId).select("wallet");
  await WalletTransaction.create({
    user: userId,
    type: "DEBIT",
    amount,
    description: `Redemption request via ${paymentMethod}`,
    redemption: redemption._id,
    balanceAfter: updatedUser.wallet.balance,
  });

  await Notification.create({
    user: userId,
    title: "Redemption Requested",
    message: `Your request to redeem ₹${amount} is under review.`,
    type: "REDEMPTION",
  });

  return redemption;
};

exports.getMyRedemptions = async (userId) => {
  return RedemptionRequest.find({ user: userId }).sort({ createdAt: -1 });
};