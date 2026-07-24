const express = require("express");
const router = express.Router();
const {
  getWalletController,
  updatePaymentDetailsController,
  requestRedemptionController,
  getMyRedemptionsController,
} = require("../controllers/wallet.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, getWalletController);
router.patch("/payment-details", authMiddleware, updatePaymentDetailsController);
router.post("/redeem", authMiddleware, requestRedemptionController);
router.get("/redemptions", authMiddleware, getMyRedemptionsController);

module.exports = router;