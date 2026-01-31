const express = require("express");
const {
  getNotificationsController,
  markNotificationReadController,
} = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getNotificationsController);

router.patch("/:id/read", authMiddleware, markNotificationReadController);

module.exports = router;
