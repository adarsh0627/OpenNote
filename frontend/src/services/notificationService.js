import { notifications } from "../mock/notifications";

export const getUserNotifications = async (userId) => {
  return notifications.filter((n) => n.userId === userId);
};
