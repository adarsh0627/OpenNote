const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Note = require("../models/note.model");
const Purchase = require("../models/purchase.model");
const User = require("../models/user.model");
const WalletTransaction = require("../models/walletTransaction.model");
const Notification = require("../models/notification.model");

const COMMISSION_PERCENT = parseFloat(process.env.PLATFORM_COMMISSION || "20");

// ── Free note claim ───────────────────────────────────────────────────────────
exports.claimFreeNote = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, isActive: true });
  if (!note) throw new Error("Note not found");

  if (note.uploadedBy.toString() === userId.toString()) {
    throw new Error("You cannot claim your own note");
  }

  if (note.price !== 0) throw new Error("This note is not free");

  const existing = await Purchase.findOne({ user: userId, note: noteId });
  if (existing) throw new Error("You already have this note");

  const purchase = await Purchase.create({
    user: userId,
    note: noteId,
    paymentId: "FREE",
    orderId: "FREE",
    amount: 0,
    sellerAmount: 0,
    platformAmount: 0,
    commissionPercent: COMMISSION_PERCENT,
    status: "FREE",
  });

  await Notification.create({
    user: userId,
    title: "Note Added",
    message: `"${note.title}" has been added to your library for free.`,
    type: "PURCHASE",
  });

  await Note.findByIdAndUpdate(noteId, { $inc: { totalSales: 1 } });

  return purchase;
};

// ── Create Razorpay order ─────────────────────────────────────────────────────
exports.createOrder = async (noteId, userId) => {
  try {
    const note = await Note.findOne({ _id: noteId, isActive: true });
    if (!note) throw new Error("Note not found");

    if (note.uploadedBy.toString() === userId.toString()) {
      throw new Error("You cannot buy your own note");
    }

    if (note.price === 0) throw new Error("Use the free claim endpoint for free notes");

    const existing = await Purchase.findOne({ user: userId, note: noteId });
    if (existing) throw new Error("You have already purchased this note");

    const order = await razorpay.orders.create({
      amount: Math.round(note.price * 100),
      currency: "INR",
      receipt: `order_${Date.now().toString().slice(-10)}`,
      notes: {
        noteId: noteId.toString(),
        userId: userId.toString(),
      },
    });

    return { order, key: process.env.RAZORPAY_KEY_ID, amount: note.price };
  } catch (err) {
    console.error("createOrder ERROR:", err);
    throw err;
  }
};

// ── Verify payment and credit seller wallet ───────────────────────────────────
exports.verifyAndSavePurchase = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  noteId,
  userId,
}) => {
  // 1. Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Payment verification failed — signature mismatch");
  }

  // 2. Load note
  const note = await Note.findOne({ _id: noteId, isActive: true });
  if (!note) throw new Error("Note not found");

  // 3. Prevent buying own note
  if (note.uploadedBy.toString() === userId.toString()) {
    throw new Error("You cannot purchase your own note");
  }

  // 4. Prevent duplicate
  const existing = await Purchase.findOne({ user: userId, note: noteId });
  if (existing) throw new Error("You have already purchased this note");

  // 5. Calculate commission split
  const totalAmount = note.price;
  const platformAmount = parseFloat(
    ((totalAmount * COMMISSION_PERCENT) / 100).toFixed(2)
  );
  const sellerAmount = parseFloat((totalAmount - platformAmount).toFixed(2));

  // 6. Save purchase
  const purchase = await Purchase.create({
    user: userId,
    note: noteId,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    amount: totalAmount,
    sellerAmount,
    platformAmount,
    commissionPercent: COMMISSION_PERCENT,
    status: "SUCCESS",
  });

  // 7. Credit seller wallet
  const seller = await User.findByIdAndUpdate(
    note.uploadedBy,
    {
      $inc: {
        "wallet.balance": sellerAmount,
        "wallet.totalEarned": sellerAmount,
      },
    },
    { new: true }
  );

  // 8. Log wallet transaction
  await WalletTransaction.create({
    user: note.uploadedBy,
    type: "CREDIT",
    amount: sellerAmount,
    description: `Sale of "${note.title}" (after ${COMMISSION_PERCENT}% platform fee)`,
    purchase: purchase._id,
    balanceAfter: seller.wallet.balance,
  });

  // 9. Update note stats
  await Note.findByIdAndUpdate(noteId, {
    $inc: { totalSales: 1, totalRevenue: totalAmount },
  });

  // 10. Notify buyer
  await Notification.create({
    user: userId,
    title: "Purchase Successful",
    message: `You now have access to "${note.title}".`,
    type: "PURCHASE",
    data: { noteId },
  });

  // 11. Notify seller
  await Notification.create({
    user: note.uploadedBy,
    title: "New Sale!",
    message: `Someone bought "${note.title}". ₹${sellerAmount} credited to your wallet.`,
    type: "EARNING",
    data: { noteId, amount: sellerAmount },
  });

  return purchase;
};