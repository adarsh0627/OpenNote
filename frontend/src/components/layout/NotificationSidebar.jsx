import { Bell, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/apis'

const NotificationSidebar = (props) => {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data.notifications || []);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [])

    const hasUnread = notifications.some((n) => !n.isRead);

    const handleNotificationClick = async (notification) => {
        if (notification.isRead) return;
        setNotifications((prev) =>
            prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        try {
            await markNotificationRead(notification._id);
        } catch {
            // revert on failure
            setNotifications((prev) =>
                prev.map((n) => (n._id === notification._id ? { ...n, isRead: false } : n))
            );
        }
    };

    const handleMarkAllRead = async () => {
        const previous = notifications;
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await markAllNotificationsRead();
        } catch {
            setNotifications(previous);
        }
    };

  return (
    <div className='bg-white fixed right-0 border md:h-screen rounded-l-lg md:w-[350px] w-full px-4 py-2 z-50'>
        <div className='flex items-center justify-between mt-2'>
            <div className='flex items-center gap-2'>
                <span className='text-orange-500 bg-gray-100 rounded-lg p-1 border'><Bell size={20}/></span>
                <h1 className='text-gray-900 font-semibold text-xl'>Notifications</h1>
            </div>
            <X 
                className='cursor-pointer'
                onClick={props.closePanelHandler}
            />
        </div>

        {hasUnread && (
            <button
                onClick={handleMarkAllRead}
                className='text-sm text-indigo-600 hover:text-indigo-700 mt-2'
            >
                Mark all as read
            </button>
        )}

        <ul className='flex flex-col gap-2 mt-5'>
            {loading && (
                <li className='text-gray-400 text-sm text-center py-4'>Loading...</li>
            )}
            {!loading && notifications.length === 0 && (
                <li className='text-gray-400 text-sm text-center py-4'>No notifications yet</li>
            )}
            {notifications.map((notification) => (
                <li
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`text-gray-700 text-base py-2 px-2 border rounded-lg cursor-pointer transition-colors ${
                        notification.isRead ? 'bg-gray-50' : 'bg-indigo-50 border-indigo-200 font-medium'
                    }`}
                >
                    {notification.title && (
                        <p className='text-sm text-gray-900 mb-0.5'>{notification.title}</p>
                    )}
                    {notification.message}
                </li>
            ))}
        </ul>
    </div>
  )
}

export default NotificationSidebar