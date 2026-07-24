const express = require("express");
const router = express.Router();
const {
  getMyPurchasesController,
  checkPurchaseController,
} = require("../controllers/purchase.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, getMyPurchasesController);
router.get("/check/:noteId", authMiddleware, checkPurchaseController);

module.exports = router;