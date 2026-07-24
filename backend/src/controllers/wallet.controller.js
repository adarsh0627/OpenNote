const {
  getWalletInfo,
  updatePaymentDetails,
  requestRedemption,
  getMyRedemptions,
} = require("../services/wallet.service");

exports.getWalletController = async (req, res, next) => {
  try {
    const data = await getWalletInfo(req.user.id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentDetailsController = async (req, res, next) => {
  try {
    const { upiId, bankAccount, ifsc } = req.body;
    const details = await updatePaymentDetails(req.user.id, { upiId, bankAccount, ifsc });
    res.status(200).json({ success: true, paymentDetails: details });
  } catch (error) {
    next(error);
  }
};

exports.requestRedemptionController = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "amount and paymentMethod are required",
      });
    }

    if (!["UPI", "BANK"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "paymentMethod must be UPI or BANK",
      });
    }

    const redemption = await requestRedemption(req.user.id, { amount, paymentMethod });

    res.status(201).json({
      success: true,
      message: "Redemption request submitted. We will process it within 3–5 business days.",
      redemption,
    });
  } catch (error) {
    if (
      error.message.includes("Insufficient") ||
      error.message.includes("pending") ||
      error.message.includes("Minimum") ||
      error.message.includes("Please add")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getMyRedemptionsController = async (req, res, next) => {
  try {
    const redemptions = await getMyRedemptions(req.user.id);
    res.status(200).json({ success: true, redemptions });
  } catch (error) {
    next(error);
  }
};