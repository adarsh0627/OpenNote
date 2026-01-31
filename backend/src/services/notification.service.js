const Notification = require("../models/notification.model");

exports.createNotification = async ({ userId, message }) => {
  if (!userId || !message) {
    throw new Error("Notification data missing");
  }

  return await Notification.create({
    user: userId,
    message,
  });
};

exports.getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 });
};

exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};
