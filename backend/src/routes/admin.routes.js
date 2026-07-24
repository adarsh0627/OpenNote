const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { adminMiddleware } = require("../middlewares/admin.middleware");
const {
  getStats,
  getAllUsers,
  getAllNotes,
  deleteNote,
  getAllPurchases,
  getRedemptions,
  approveRedemption,
  rejectRedemption,
} = require("../controllers/admin.controller");

// All admin routes require auth + admin check
router.use(authMiddleware, adminMiddleware);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/notes", getAllNotes);
router.delete("/notes/:id", deleteNote);
router.get("/purchases", getAllPurchases);
router.get("/redemptions", getRedemptions);
router.patch("/redemptions/:id/approve", approveRedemption);
router.patch("/redemptions/:id/reject", rejectRedemption);

module.exports = router;