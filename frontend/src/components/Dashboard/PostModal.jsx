import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getPost, likePost, savePostToFavorites, incrementPostUsage, followUserById } from '../../services/firebaseFunctions';
import CommentSection from './CommentSection';
import { useAuth } from '../../contexts/AuthContext';
import toast from '../../utils/toast';

const PostModal = ({ postId, isOpen, onClose, onUsePrompt }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('comments');

    useEffect(() => {
        if (!isOpen || !postId) return;
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                const { post: data } = await getPost(postId);
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
                toast.error('Không thể tải bài viết');
            }
            setIsLoading(false);
        };
        fetchPost();
    }, [postId, isOpen]);

    if (!isOpen) return null;

    const handleLike = async () => {
        if (!post) return;
        try {
            const { liked } = await likePost(post.id);
            setPost(prev => ({ ...prev, isLiked: liked, likes: liked ? prev.likes + 1 : prev.likes - 1 }));
        } catch (error) {
            toast.error('Vui lòng đăng nhập');
        }
    };

    const handleSave = async () => {
        if (!post) return;
        try {
            const { saved } = await savePostToFavorites(post.id);
            setPost(prev => ({ ...prev, isSaved: saved, saves: saved ? prev.saves + 1 : prev.saves - 1 }));
            toast.success(saved ? 'Đã lưu' : 'Đã bỏ lưu');
        } catch (error) {
            toast.error('Vui lòng đăng nhập');
        }
    };

    const handleCopyPrompt = async () => {
        if (!post?.prompt) return;
        try {
            await navigator.clipboard.writeText(post.prompt);
            await incrementPostUsage(post.id);
            toast.success('Đã sao chép prompt!');
        } catch (error) {
            toast.error('Không thể sao chép');
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return String(num || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex">
                {/* Left: Media or Text Content */}
                <div className={`w-1/2 flex items-center justify-center relative ${post?.type === 'text' ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' : 'bg-black'}`}>
                    {isLoading ? (
                        <Icons.Loader size={32} className="animate-spin text-white/50" />
                    ) : post?.type === 'text' ? (
                        // Text post display
                        <div className="w-full h-full p-8 flex flex-col justify-center overflow-y-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-h-full overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <Icons.FileText size={24} className="text-white/80" />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-wide">Văn bản</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{post.title}</h2>
                                <div className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                                    {post.content}
                                </div>
                                {post.prompt && (
                                    <div className="mt-6 pt-4 border-t border-white/20">
                                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-2">Prompt</p>
                                        <p className="text-white/80 text-sm italic">"{post.prompt}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : post?.type === 'video' ? (
                        <video src={post.mediaUrl} className="max-w-full max-h-full" controls autoPlay />
                    ) : (
                        <img src={post?.mediaUrl} alt={post?.title} className="max-w-full max-h-full object-contain" />
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>

                {/* Right: Info & Comments */}
                <div className="w-1/2 flex flex-col">
                    {/* Author Header */}
                    {post && (
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { onClose(); navigate(`/dashboard?profile=${post.authorId}`); }}
                                    className="shrink-0 hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`}
                                        alt={post.authorName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                </button>
                                <div className="flex-1">
                                    <button
                                        onClick={() => { onClose(); navigate(`/dashboard?profile=${post.authorId}`); }}
                                        className="font-bold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
                                    >
                                        {post.authorName}
                                    </button>
                                    <p className="text-xs text-gray-500">{post.title}</p>
                                </div>
                                {user && user.uid !== post.authorId && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { following } = await followUserById(post.authorId);
                                                setPost(prev => ({ ...prev, isFollowing: following }));
                                                toast.success(following ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
                                            } catch (e) {
                                                toast.error('Không thử theo dõi');
                                            }
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${post.isFollowing
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                            }`}
                                    >
                                        {post.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'comments'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icons.MessageCircle size={14} className="inline mr-1" />
                            Bình luận ({post?.comments || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'details'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icons.Info size={14} className="inline mr-1" />
                            Chi tiết
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'comments' ? (
                            <CommentSection postId={postId} />
                        ) : (
                            <div className="p-4 space-y-4 overflow-y-auto h-full">
                                {/* Prompt */}
                                {post?.prompt && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Prompt</label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                                            {post.prompt}
                                        </div>
                                        <button
                                            onClick={handleCopyPrompt}
                                            className="mt-2 text-xs text-purple-600 hover:underline flex items-center gap-1"
                                        >
                                            <Icons.Copy size={12} /> Sao chép prompt
                                        </button>
                                    </div>
                                )}

                                {/* Model & Category */}
                                <div className="flex gap-2 flex-wrap">
                                    {post?.model && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                            Model: {post.model}
                                        </span>
                                    )}
                                    {post?.category && (
                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs text-purple-600 dark:text-purple-400">
                                            {post.category}
                                        </span>
                                    )}
                                </div>

                                {/* Tags */}
                                {post?.tags?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Use Prompt Button */}
                                {post?.prompt && (
                                    <button
                                        onClick={() => onUsePrompt && onUsePrompt(post)}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Icons.Wand2 size={16} />
                                        Dùng prompt này
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    {post && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${post.isLiked
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <Icons.Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                                <span className="text-sm font-bold">{formatNumber(post.likes)}</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${post.isSaved
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <Icons.Bookmark size={16} className={post.isSaved ? 'fill-current' : ''} />
                                <span className="text-sm font-bold">{formatNumber(post.saves)}</span>
                            </button>
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm ml-auto">
                                <Icons.Eye size={14} />
                                {formatNumber(post.views)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostModal;
