import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getUserProfile, getUserPosts, followUserById, likePost, savePostToFavorites } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import PostModal from './PostModal';
import ProfileEditModal from './ProfileEditModal';
import FollowersModal from './FollowersModal';
import toast from '../../utils/toast';

const UserProfile = ({ userId: propUserId }) => {
    const { userId: paramUserId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Priority: prop > param > current user
    const userId = propUserId || paramUserId || user?.uid;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [followersModalType, setFollowersModalType] = useState('followers');

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
            }
            setIsLoadingPosts(false);
        };
        fetchPosts();
    }, [userId]);

    const handleFollow = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const { following } = await followUserById(userId);
            setProfile(prev => ({
                ...prev,
                isFollowing: following,
                followersCount: following ? prev.followersCount + 1 : prev.followersCount - 1,
            }));
            toast.success(following ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
        } catch (error) {
            toast.error(error.message || 'Không thể theo dõi');
        }
    };

    const handleLike = async (postId, e) => {
        e?.stopPropagation();
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const { liked } = await likePost(postId);
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, isLiked: liked, likes: liked ? p.likes + 1 : p.likes - 1 } : p
            ));
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    const handleSave = async (postId, e) => {
        e?.stopPropagation();
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const { saved } = await savePostToFavorites(postId);
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, isSaved: saved, saves: saved ? p.saves + 1 : p.saves - 1 } : p
            ));
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return String(num || 0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icons.Loader size={32} className="animate-spin text-purple-500" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Icons.UserX size={48} className="mb-4" />
                <p>Không tìm thấy người dùng</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-purple-500 hover:underline">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&size=128&background=random`}
                            alt={profile.displayName}
                            className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-700 shadow-lg"
                        />
                        {profile.isOwnProfile && (
                            <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                                <Icons.Camera size={14} />
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {profile.displayName}
                        </h1>
                        {profile.bio && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-6 mb-4">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(profile.postCount)}</div>
                                <div className="text-xs text-gray-500">Bài viết</div>
                            </div>
                            <button onClick={() => { setFollowersModalType('followers'); setShowFollowersModal(true); }} className="text-center cursor-pointer hover:opacity-80">
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(profile.followersCount)}</div>
                                <div className="text-xs text-gray-500">Người theo dõi</div>
                            </button>
                            <button onClick={() => { setFollowersModalType('following'); setShowFollowersModal(true); }} className="text-center cursor-pointer hover:opacity-80">
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(profile.followingCount)}</div>
                                <div className="text-xs text-gray-500">Đang theo dõi</div>
                            </button>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(profile.totalLikes)}</div>
                                <div className="text-xs text-gray-500">Lượt thích</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center md:justify-start gap-3">
                            {profile.isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                                >
                                    <Icons.Edit size={16} />
                                    Chỉnh sửa hồ sơ
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-2.5 font-bold rounded-xl transition-colors flex items-center gap-2 ${profile.isFollowing
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    {profile.isFollowing ? (
                                        <>
                                            <Icons.UserCheck size={16} />
                                            Đang theo dõi
                                        </>
                                    ) : (
                                        <>
                                            <Icons.UserPlus size={16} />
                                            Theo dõi
                                        </>
                                    )}
                                </button>
                            )}
                            <button className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <Icons.Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'posts'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Icons.Grid size={16} className="inline mr-2" />
                    Bài viết
                </button>
                <button
                    onClick={() => setActiveTab('liked')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'liked'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Icons.Heart size={16} className="inline mr-2" />
                    Đã thích
                </button>
            </div>

            {/* Posts Grid */}
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => setSelectedPostId(post.id)}
                            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-800"
                        >
                            {post.type === 'video' ? (
                                <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={post.mediaUrl || post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <span className="text-white flex items-center gap-1 font-bold">
                                    <Icons.Heart size={18} className={post.isLiked ? 'fill-white' : ''} />
                                    {formatNumber(post.likes)}
                                </span>
                                <span className="text-white flex items-center gap-1 font-bold">
                                    <Icons.MessageCircle size={18} />
                                    {formatNumber(post.comments)}
                                </span>
                            </div>

                            {/* Video Badge */}
                            {post.type === 'video' && (
                                <div className="absolute top-2 right-2">
                                    <Icons.Play size={16} className="text-white drop-shadow-lg" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Post Modal */}
            <PostModal
                postId={selectedPostId}
                isOpen={!!selectedPostId}
                onClose={() => setSelectedPostId(null)}
                onUsePrompt={(post) => navigate('/dashboard', { state: { initialPrompt: post.prompt } })}
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
