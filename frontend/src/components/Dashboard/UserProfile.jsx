import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getUserProfile, getUserPosts, followUserById, likePost, savePostToFavorites } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInteractions } from '../../hooks/useInteractions';
import PostModal from './PostModal';
import ProfileEditModal from './ProfileEditModal';
import FollowersModal from './FollowersModal';
import PostCard from './PostCard';
import toast from '../../utils/toast';

const UserProfile = ({ userId: propUserId, onBack, onOpenSettings }) => {
    const { userId: paramUserId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    // Priority: prop > param > current user
    const userId = propUserId || paramUserId || user?.uid;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [followersModalType, setFollowersModalType] = useState('followers');

    // 1. Get Interaction status and toggle functions
    const { isLiked, isSaved, isFollowing, toggleLike, toggleSave, toggleFollow } = useInteractions();

    const profileIsFollowing = isFollowing(userId);
    const moreMenuRef = useRef(null);


    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { profile: data } = await getUserProfile(userId);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Không thể tải hồ sơ');
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const fetchPosts = async () => {
            setIsLoadingPosts(true);
            try {
                const { posts: data } = await getUserPosts(userId);
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
                toast.error(`Lỗi tải bài viết: ${error.message || error}`);
            }
            setIsLoadingPosts(false);
        };
        fetchPosts();
    }, [userId]);

    const handleFollow = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        // Optimistic count update (optional, but keep for visual feedback)
        setProfile(prev => ({
            ...prev,
            followersCount: !profileIsFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
        }));

        toggleFollow(userId);
        toast.success(!profileIsFollowing ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
    };

    const handleLike = (postId, e) => {
        e?.stopPropagation();
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        // Optimistically update local posts state
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const wasLiked = isLiked(postId);
                return {
                    ...post,
                    likes: Math.max(0, (post.likes || 0) + (wasLiked ? -1 : 1))
                };
            }
            return post;
        }));

        toggleLike(postId);
    };

    const handleSave = (postId, e) => {
        e?.stopPropagation();
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        // Optimistically update local posts state
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const wasSaved = isSaved(postId);
                return {
                    ...post,
                    saves: Math.max(0, (post.saves || 0) + (wasSaved ? -1 : 1))
                };
            }
            return post;
        }));

        toggleSave(postId);
    };

    const formatNumber = (num) => {
        num = Math.max(0, num || 0);
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return String(num || 0);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icons.Loader size={32} className="animate-spin text-gray-900 dark:text-white" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Icons.UserX size={48} className="mb-4" />
                <p>Không tìm thấy người dùng</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-gray-900 dark:text-white hover:underline">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1100px] px-4 md:px-8 pt-2 md:pt-4 pb-8">
            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                    <Icons.ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Quay lại</span>
                </button>
            )}

            {/* Profile Header */}
            <div className="mb-6 pt-2">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-[140px] h-[140px] md:w-[152px] md:h-[152px] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {profile.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt={profile.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const parent = e.target.parentElement;
                                        parent.innerHTML = `<span class="text-3xl font-bold text-gray-500 uppercase tracking-tighter">${profile.displayName ? (profile.displayName.split(' ').length >= 2 ? (profile.displayName.split(' ')[0][0] + profile.displayName.split(' ').pop()[0]).toUpperCase() : profile.displayName.substring(0, 2).toUpperCase()) : 'U'}</span>`;
                                    }}
                                />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400 capitalize">
                                    {profile.displayName ? profile.displayName.substring(0, 2) : 'U'}
                                </span>
                            )}
                        </div>
                        {profile.isOwnProfile && (
                            <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Icons.Camera size={14} />
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left pt-1">
                        <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 dark:text-white mb-2 md:mb-3 tracking-tight leading-none">
                            {profile.displayName}
                        </h1>

                        {/* Action Buttons */}
                        <div className="flex justify-center md:justify-start gap-2 mb-4">
                            {profile.isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#ffffff1f] dark:hover:bg-[#ffffff33] text-gray-900 dark:text-white font-semibold rounded text-[15px] transition-colors min-w-[140px]"
                                >
                                    Sửa hồ sơ
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 md:px-10 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${profileIsFollowing
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        : 'bg-[#FE2C55] text-white hover:bg-[#ef2950]'
                                        }`}
                                >
                                    {profileIsFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                </button>
                            )}
                            {profile.isOwnProfile === false && profileIsFollowing && (
                                <button
                                    onClick={() => { /* Handle message click */ }}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#ffffff1f] dark:hover:bg-[#ffffff33] rounded transition-colors"
                                >
                                    <Icons.MessageSquare size={20} className="text-gray-900 dark:text-white" />
                                </button>
                            )}
                            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#ffffff1f] dark:hover:bg-[#ffffff33] text-gray-900 dark:text-white rounded transition-colors">
                                <Icons.Share2 size={20} />
                            </button>
                            {/* More / settings menu */}
                            <div className="relative" ref={moreMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsMoreMenuOpen((v) => !v)}
                                    className="px-3 py-2 bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ml-1"
                                >
                                    <Icons.MoreHorizontal size={20} />
                                </button>
                                {isMoreMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#020617] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-30 py-1 text-left">
                                        {profile.isOwnProfile && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsMoreMenuOpen(false);
                                                    if (onOpenSettings) onOpenSettings();
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <Icons.Settings size={16} className="text-gray-500" />
                                                <span>Cài đặt tài khoản</span>
                                            </button>
                                        )}
                                        {/* Future: report/block for other profiles */}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats TikTok Style */}
                        <div className="flex justify-center md:justify-start items-center gap-5 md:gap-6 text-[15px] mb-4">
                            <button onClick={() => { setFollowersModalType('following'); setShowFollowersModal(true); }} className="hover:underline flex items-baseline gap-1.5 outline-none">
                                <strong className="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{formatNumber(profile.followingCount)}</strong>
                                <span className="text-gray-600 dark:text-gray-400">Đang follow</span>
                            </button>
                            <button onClick={() => { setFollowersModalType('followers'); setShowFollowersModal(true); }} className="hover:underline flex items-baseline gap-1.5 outline-none">
                                <strong className="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{formatNumber(profile.followersCount)}</strong>
                                <span className="text-gray-600 dark:text-gray-400">Follower</span>
                            </button>
                            <div className="flex items-baseline gap-1.5">
                                <strong className="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{formatNumber(profile.totalLikes)}</strong>
                                <span className="text-gray-600 dark:text-gray-400">Thích</span>
                            </div>
                        </div>

                        {profile.bio ? (
                            <p className="text-gray-900 dark:text-gray-200 whitespace-pre-line text-[15px] max-w-lg leading-snug">{profile.bio}</p>
                        ) : (
                            <p className="text-gray-500 text-[15px]">Chưa có tiểu sử</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-full gap-4 md:gap-8 justify-start">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 md:flex-none py-3 text-center font-semibold text-[15px] transition-colors relative ${activeTab === 'posts'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <Icons.Grid size={18} className="inline mr-2 -mt-0.5" />
                    Video
                    {activeTab === 'posts' && <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gray-900 dark:bg-white" />}
                </button>
                <button
                    onClick={() => setActiveTab('liked')}
                    className={`flex-1 md:flex-none py-3 text-center font-semibold text-[15px] transition-colors relative ${activeTab === 'liked'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <Icons.Heart size={18} className="inline mr-2 -mt-0.5" />
                    Đã thích
                    {activeTab === 'liked' && <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gray-900 dark:bg-white" />}
                </button>
            </div>

            {/* Posts Grid - Using Masonry Layout matching Inspiration Page */}
            {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                    <Icons.Loader size={24} className="animate-spin text-gray-400" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Icons.Image size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Chưa có bài viết nào</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 max-w-[1600px] mx-auto pb-24">
                    {posts.map((post, index) => (
                        <div key={post.id} className="break-inside-avoid">
                            <PostCard
                                key={post.id}
                                post={post}
                                isLiked={isLiked(post.id)}
                                isSaved={isSaved(post.id)}
                                onLike={(e) => handleLike(post.id, e)}
                                onSave={(e) => handleSave(post.id, e)}
                                onCopyPrompt={() => { }}
                                onUsePrompt={(post) => navigate('/dashboard', { state: { initialPrompt: post.prompt } })}
                                onClick={() => setSelectedPost(post)}
                                onAvatarClick={() => { }}
                                t={t}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Post Modal */}
            <PostModal
                postId={selectedPost?.id}
                initialPost={selectedPost}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                onUsePrompt={(post) => navigate('/dashboard', { state: { initialPrompt: post.prompt } })}
                onLike={handleLike}
                onSave={handleSave}
            />

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                profile={profile}
                onProfileUpdated={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
            />

            {/* Followers/Following Modal */}
            <FollowersModal
                isOpen={showFollowersModal}
                onClose={() => setShowFollowersModal(false)}
                userId={userId}
                type={followersModalType}
                displayName={profile?.displayName}
            />
        </div>
    );
};

export default UserProfile;
