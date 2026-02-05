import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getFollowers, getFollowingList, followUserById } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import toast from '../../utils/toast';

const FollowersModal = ({ isOpen, onClose, userId, type = 'followers', displayName }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !userId) return;
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const result = type === 'followers'
                    ? await getFollowers(userId)
                    : await getFollowingList(userId);
                setUsers(result.followers || result.following || []);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
            setIsLoading(false);
        };
        fetchUsers();
    }, [isOpen, userId, type]);

    const handleFollow = async (targetUserId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const { following } = await followUserById(targetUserId);
            setUsers(prev => prev.map(u =>
                u.id === targetUserId ? { ...u, isFollowing: following } : u
            ));
            toast.success(following ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
        } catch (error) {
            toast.error('Không thể theo dõi');
        }
    };

    const handleUserClick = (targetUserId) => {
        onClose();
        navigate(`/dashboard?profile=${targetUserId}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
                        {displayName && <span className="font-normal text-gray-500"> của {displayName}</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Icons.X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Icons.Loader size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            <Icons.Users size={40} className="mx-auto mb-3 opacity-50" />
                            <p>{type === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}</p>
                        </div>
                    ) : (
                        users.map((u) => (
                            <div
                                key={u.id}
                                className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <button
                                    onClick={() => handleUserClick(u.id)}
                                    className="flex items-center gap-3 flex-1 text-left"
                                >
                                    <img
                                        src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`}
                                        alt={u.displayName}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                            {u.displayName}
                                        </h4>
                                        {u.bio && (
                                            <p className="text-xs text-gray-500 truncate">{u.bio}</p>
                                        )}
                                    </div>
                                </button>

                                {/* Follow Button */}
                                {user && user.uid !== u.id && (
                                    <button
                                        onClick={() => handleFollow(u.id)}
                                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${u.isFollowing
                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                            }`}
                                    >
                                        {u.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowersModal;
