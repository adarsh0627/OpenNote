const Purchase = require("../models/purchase.model");

exports.getMyPurchasesController = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id })
      .populate({
        path: "note",
        select: "title description thumbnail tags price uploadedBy",
        populate: { path: "uploadedBy", select: "userName" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, purchases });
  } catch (error) {
    next(error);
  }
};

exports.checkPurchaseController = async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({
      user: req.user.id,
      note: req.params.noteId,
    });

    res.status(200).json({
      success: true,
      hasPurchased: !!purchase,
      purchase: purchase || null,
    });
  } catch (error) {
    next(error);
  }
};