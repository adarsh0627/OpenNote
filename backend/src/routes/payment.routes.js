const express = require("express");
const router = express.Router();
const {
  createOrderController,
  verifyPaymentController,
  claimFreeNoteController,
} = require("../controllers/payment.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { paymentLimiter } = require("../middlewares/rateLimiter.middleware");

router.post("/create-order", authMiddleware, paymentLimiter, createOrderController);
router.post("/verify", authMiddleware, verifyPaymentController);
router.post("/claim-free", authMiddleware, claimFreeNoteController);

module.exports = router;