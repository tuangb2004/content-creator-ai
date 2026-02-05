import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (!isOpen || !user) return;
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const { notifications: data, unreadCount: count } = await getNotifications(30);
                setNotifications(data);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
            setIsLoading(false);
        };
        fetchNotifications();
    }, [isOpen, user]);

    // Poll for unread count every 30 seconds
    useEffect(() => {
        if (!user) return;
        const fetchUnreadCount = async () => {
            try {
                const { unreadCount: count } = await getNotifications(1, true);
                setUnreadCount(count);
            } catch (error) {
                // Silent fail
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        // Navigate based on type
        setIsOpen(false);
        if (notification.postId) {
            navigate(`/dashboard?tab=inspiration`);
        } else if (notification.type === 'follow') {
            navigate(`/dashboard?profile=${notification.actorId}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationMessage = (n) => {
        switch (n.type) {
            case 'like':
                return <><strong>{n.actorName}</strong> đã thích bài viết của bạn</>;
            case 'comment':
                return <><strong>{n.actorName}</strong> đã bình luận: "{n.commentPreview?.slice(0, 30)}..."</>;
            case 'follow':
                return <><strong>{n.actorName}</strong> đã theo dõi bạn</>;
            case 'mention':
                return <><strong>{n.actorName}</strong> đã nhắc đến bạn</>;
            default:
                return n.message || 'Thông báo mới';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return <Icons.Heart size={14} className="text-red-500" />;
            case 'comment': return <Icons.MessageCircle size={14} className="text-blue-500" />;
            case 'follow': return <Icons.UserPlus size={14} className="text-purple-500" />;
            default: return <Icons.Bell size={14} className="text-gray-500" />;
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`;
        return date.toLocaleDateString('vi-VN');
    };

    if (!user) return null;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <Icons.Bell size={20} className="text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-purple-600 hover:underline"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[50vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Icons.Loader size={20} className="animate-spin text-gray-400" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <Icons.Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Chưa có thông báo</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full px-4 py-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${!n.isRead ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <img
                                        src={n.actorAvatar || `https://ui-avatars.com/api/?name=${n.actorName}`}
                                        alt={n.actorName}
                                        className="w-10 h-10 rounded-full shrink-0"
                                    />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                            {getNotificationMessage(n)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getNotificationIcon(n.type)}
                                            <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Post Thumbnail */}
                                    {n.postThumbnail && (
                                        <img
                                            src={n.postThumbnail}
                                            alt=""
                                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                                        />
                                    )}

                                    {/* Unread Dot */}
                                    {!n.isRead && (
                                        <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 self-center" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
