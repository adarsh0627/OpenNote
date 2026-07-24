const express = require("express");
const router = express.Router();

const {
  signUpController,
  signInController,
  refreshTokenController,
  logoutController,
  getProfileController,
  updateProfileController,
} = require("../controllers/auth.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.post("/refresh", refreshTokenController);
router.post("/logout", authMiddleware, logoutController);
router.get("/profile", authMiddleware, getProfileController);
router.patch("/profile", authMiddleware, updateProfileController);

module.exports = router;
