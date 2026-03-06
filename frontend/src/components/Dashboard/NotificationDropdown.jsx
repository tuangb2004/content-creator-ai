import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Icons } from '../Icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';

const FILTERS = [
    { id: 'all', label: 'All activity' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'follow', label: 'Followers' },
    { id: 'video_queue', label: 'Video Queue' },
];

const NotificationDropdown = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [videoJobs, setVideoJobs] = useState([]);

    // ─── Realtime unread badge via Firestore onSnapshot ───────────────────────
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('isRead', '==', false),
            orderBy('createdAt', 'desc'),
            limit(99)
        );

        const unsub = onSnapshot(q, (snap) => {
            setUnreadCount(snap.size);
        }, (err) => {
            console.warn('[Notifications] onSnapshot error:', err.message);
        });

        return unsub;
    }, [user]);

    // ─── Realtime video queue via Firestore onSnapshot ────────────────────────
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'video_queue'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snap) => {
            const jobs = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'video_job'
            }));
            setVideoJobs(jobs);
        }, (err) => {
            console.warn('[VideoQueue] onSnapshot error:', err.message);
        });

        return unsub;
    }, [user]);

    // ─── Fetch full notification list when tab is active ──────────────────────
    useEffect(() => {
        if (!isOpen || !user) return;
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const { notifications: data } = await getNotifications(50);
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
            setIsLoading(false);
        };
        fetchNotifications();
    }, [isOpen, user]);

    // ─── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Filter & Group Logic ──────────────────────────────────────────────
    const filteredItems = useMemo(() => {
        if (filter === 'video_queue') {
            return videoJobs;
        }

        let items = notifications;
        if (filter !== 'all') {
            items = notifications.filter(n => n.type === filter);
        }

        if (filter === 'all') {
            const activeJobs = videoJobs.filter(j => j.status === 'processing' || j.status === 'pending');
            return [...activeJobs, ...items].sort((a, b) => {
                const tA = (a.createdAt?.seconds || a.createdAt?._seconds || new Date(a.createdAt).getTime() / 1000) || 0;
                const tB = (b.createdAt?.seconds || b.createdAt?._seconds || new Date(b.createdAt).getTime() / 1000) || 0;
                return tB - tA;
            });
        }

        return items;
    }, [notifications, videoJobs, filter]);

    const groupedContent = useMemo(() => {
        const groups = { 'Today': [], 'This week': [], 'Previous': [] };
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

        filteredItems.forEach(item => {
            const timestamp = (item.createdAt?.seconds || item.createdAt?._seconds) * 1000 || new Date(item.createdAt).getTime();
            if (timestamp >= todayStart) {
                groups['Today'].push(item);
            } else if (timestamp >= weekStart) {
                groups['This week'].push(item);
            } else {
                groups['Previous'].push(item);
            }
        });

        return groups;
    }, [filteredItems]);

    // ─── Derived counts ──────────────────────────────────────────────────────
    const activeVideoJobs = videoJobs.filter(j => j.status === 'processing' || j.status === 'pending');
    const totalBadge = unreadCount + activeVideoJobs.length;

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleItemClick = async (item) => {
        if (item.type === 'video_job') {
            if (item.status === 'completed' && item.result?.videoUrl) {
                window.open(item.result.videoUrl, '_blank');
            } else {
                navigate('/dashboard?tab=assets');
            }
            setIsOpen(false);
            return;
        }

        if (!item.isRead) {
            try {
                await markNotificationAsRead(item.id);
                setNotifications(prev =>
                    prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        setIsOpen(false);
        if (item.postId) {
            navigate(`/dashboard?tab=inspiration`);
        } else if (item.type === 'follow') {
            navigate(`/dashboard?profile=${item.actorId}`);
        } else if (item.type === 'ai_complete') {
            navigate(`/dashboard?tab=assets`);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.seconds ? new Date(ts.seconds * 1000) : ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return date.toLocaleDateString('vi-VN');
    };

    if (!user) return null;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200 ${isOpen
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
            >
                <Icons.Bell size={20} isActive={isOpen} />
                {totalBadge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                        {totalBadge > 99 ? '99+' : totalBadge}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-[340px] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                    style={{ animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                        >
                            <Icons.X size={16} />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="px-5 pb-5 space-y-2">
                        {/* Line 1 */}
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.slice(0, 3).map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${filter === f.id
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {/* Line 2 */}
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.slice(3).map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${filter === f.id
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto pb-2 no-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 grayscale opacity-50">
                                <Icons.Loader size={24} className="animate-spin text-gray-400 mb-2" />
                                <p className="text-gray-400 text-xs font-medium tracking-tight">Loading...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="py-20 text-center px-10">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icons.Bell size={28} className="text-gray-200 dark:text-gray-700" />
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">No activity yet</h3>
                                <p className="text-gray-400 text-xs">Notifications will appear here.</p>
                            </div>
                        ) : (
                            Object.entries(groupedContent).map(([groupName, items]) => (
                                items.length > 0 && (
                                    <div key={groupName} className="mb-4">
                                        <h4 className="px-5 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500">{groupName}</h4>
                                        <div className="space-y-0.5">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-full px-5 py-3 flex items-start gap-3.5 cursor-pointer transition-all hover:bg-gray-50/60 dark:hover:bg-slate-800/40 group relative"
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative shrink-0">
                                                        <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105">
                                                            {item.type === 'video_job' ? (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                                                    <Icons.Video size={18} />
                                                                </div>
                                                            ) : item.actorAvatar ? (
                                                                <img src={item.actorAvatar} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase text-base">
                                                                    {item.actorName?.charAt(0) || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.type === 'like' && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                                                                <Icons.Heart size={9} className="text-white fill-white" isActive />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 min-w-0 pr-1">
                                                        <div className="flex flex-wrap items-baseline gap-x-1">
                                                            {item.type !== 'video_job' && (
                                                                <span className="font-bold text-[13px] text-gray-900 dark:text-white leading-tight">
                                                                    {item.actorName}
                                                                </span>
                                                            )}
                                                            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                                                                {item.type === 'video_job' ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-semibold">
                                                                            {item.status === 'processing' ? 'Processing video...' :
                                                                                item.status === 'pending' ? 'Queued video...' :
                                                                                    item.status === 'failed' ? 'Failed to create video' : 'Video created'}
                                                                        </span>
                                                                        <span className="opacity-80 italic text-xs">
                                                                            {item.statusDetail || (item.request?.prompt?.slice(0, 30) + (item.request?.prompt?.length > 30 ? '...' : ''))}
                                                                        </span>
                                                                        {item.status === 'processing' && item.processingAttempt && (
                                                                            <span className="text-[10px] text-blue-500 font-bold mt-0.5">
                                                                                Progress: {Math.min(100, Math.round((item.processingAttempt / 42) * 100))}%
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : item.type === 'like' ? (
                                                                    'liked your post.'
                                                                ) : item.type === 'follow' ? (
                                                                    'started following you.'
                                                                ) : item.type === 'comment' ? (
                                                                    `commented: "${item.commentPreview?.slice(0, 20)}..."`
                                                                ) : item.message || 'notified you.'}
                                                            </span>
                                                            <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-auto">
                                                                {formatTime(item.createdAt)}
                                                            </span>
                                                        </div>

                                                        {item.type === 'follow' && (
                                                            <button className="mt-2 px-3 py-1 bg-gray-100/80 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                                                                <Icons.ArrowLeftRight size={12} />
                                                                Friends
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Thumbnail */}
                                                    {item.postThumbnail && (
                                                        <div className="shrink-0 w-11 h-13 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 group-hover:rotate-1 transition-transform">
                                                            <img src={item.postThumbnail} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                    )}

                                                    {/* Unread indicator */}
                                                    {item.type !== 'video_job' && !item.isRead && (
                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {unreadCount > 0 && (
                        <div className="px-5 py-3 bg-gray-50/30 dark:bg-slate-800/20 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: translateY(-15px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default NotificationDropdown;
