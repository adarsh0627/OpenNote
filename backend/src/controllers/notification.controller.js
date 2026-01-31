const {
  getUserNotifications,
  markAsRead,
} = require("../services/notification.service");

exports.getNotificationsController = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markNotificationReadController = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await markAsRead(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
