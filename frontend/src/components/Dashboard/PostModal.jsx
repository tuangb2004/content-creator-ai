import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getPost, likePost, savePostToFavorites, incrementPostUsage, followUserById, deletePostById } from '../../services/firebaseFunctions';
import CommentSection from './CommentSection';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useInteractions } from '../../hooks/useInteractions';
import toast from '../../utils/toast';

const PostModal = ({ postId, isOpen, onClose, onUsePrompt, initialPost, onLike, onSave }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // Use initialPost immediately so the modal appears instant
    const [post, setPost] = useState(initialPost || null);
    const [isLoading, setIsLoading] = useState(!initialPost);
    const [activeTab, setActiveTab] = useState('comments');
    const [isDeleting, setIsDeleting] = useState(false);
    const [prevPostId, setPrevPostId] = useState(postId);

    // Sync state synchronously when postId changes to prevent flashing old content
    if (postId !== prevPostId) {
        setPost(initialPost || null);
        setPrevPostId(postId);
        setIsLoading(!initialPost);
    }

    // Interactions hook
    const {
        isLiked: checkLiked,
        isSaved: checkSaved,
        isFollowing: checkFollowing,
        toggleLike,
        toggleSave,
        toggleFollow
    } = useInteractions();

    const postIsLiked = checkLiked(postId);
    const postIsSaved = checkSaved(postId);
    const authorIsFollowing = post ? checkFollowing(post.authorId) : false;


    // Query for fresh details (counts, views, etc.)
    const { data: freshPost, isLoading: isQueryLoading } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => getPost(postId).then(res => res.post),
        enabled: !!postId && isOpen,
        staleTime: 1000 * 60, // 1 minute
    });

    // Update local post state when fresh data arrives, but only if we don't already have it
    // or if the ID changed. We merge fresh data but keep local interaction states if possible.
    useEffect(() => {
        if (freshPost) {
            setPost(prev => {
                // If ID is the same, merge. If different, replace.
                if (prev && prev.id === freshPost.id) {
                    return { ...prev, ...freshPost, likes: prev.likes, saves: prev.saves }; // Preserve local counts if they were just updated
                }
                return freshPost;
            });
            setIsLoading(false);
        }
    }, [freshPost]);

    // When initialPost changes (new post clicked), update immediately
    useEffect(() => {
        if (initialPost) {
            setPost(initialPost);
            setIsLoading(false);
        }
    }, [initialPost, postId]);

    // Update local likes/saves if the query cache changes (optimistic updates from useInteractions)
    useEffect(() => {
        if (freshPost) {
            setPost(prev => {
                if (prev && prev.id === freshPost.id) {
                    return { ...prev, likes: freshPost.likes, saves: freshPost.saves };
                }
                return prev;
            });
        }
    }, [freshPost?.likes, freshPost?.saves]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab('comments');
            setPost(null);
            setPrevPostId(null);
            setIsLoading(true);
        }
    }, [isOpen, initialPost]);

    if (!isOpen) return null;

    const handleLike = () => {
        if (!post) return;

        // Optimistically update local post state so the modal count reflects immediately
        const wasLiked = postIsLiked;
        setPost(prev => ({
            ...prev,
            likes: Math.max(0, (prev.likes || 0) + (wasLiked ? -1 : 1))
        }));

        if (onLike) {
            onLike(post.id);
        } else {
            toggleLike(post.id);
        }
    };

    const handleSave = () => {
        if (!post) return;

        const wasSaved = postIsSaved;
        setPost(prev => ({
            ...prev,
            saves: Math.max(0, (prev.saves || 0) + (wasSaved ? -1 : 1))
        }));

        if (onSave) {
            onSave(post.id);
        } else {
            toggleSave(post.id);
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
        num = Math.max(0, num || 0);
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return String(num || 0);
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này sẽ ẩn bài viết trên trang.')) return;
        setIsDeleting(true);
        try {
            await deletePostById(post.id);
            toast.success('Đã xóa bài viết');
            onClose();
            // Optional: trigger a page reload to remove it from feed
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error('Lỗi khi xóa bài viết');
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex">
                {/* Left: Media or Text Content */}
                <div className={`w-1/2 flex items-center justify-center relative ${post?.type === 'text' ? 'bg-gray-900 border-r border-gray-800' : 'bg-black'}`}>
                    {isLoading && !post ? (
                        <div className="flex flex-col items-center gap-3">
                            <Icons.Loader size={32} className="animate-spin text-white/50" />
                            <span className="text-white/30 text-xs">Đang tải...</span>
                        </div>
                    ) : post?.type === 'text' ? (
                        <div className="w-full h-full p-8 flex flex-col justify-center overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-h-full overflow-y-auto border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <Icons.FileText size={28} className="text-white/80" />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-widest">Văn bản</span>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tight">{post.title}</h2>
                                <div className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                    {post.content}
                                </div>
                                {post.prompt && (
                                    <div className="mt-8 pt-6 border-t border-white/20">
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Generation Prompt</p>
                                        <p className="text-white/80 text-base italic leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                                            "{post.prompt}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : post?.type === 'video' ? (
                        <video
                            src={post.mediaUrl}
                            poster={post.thumbnailUrl}
                            className="max-w-full max-h-full object-contain animate-in fade-in duration-500"
                            controls
                            autoPlay
                            playsInline
                        />
                    ) : post?.mediaUrl || post?.thumbnailUrl ? (
                        <img
                            src={post?.mediaUrl || post?.thumbnailUrl}
                            alt={post?.title}
                            className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500"
                        />
                    ) : (
                        <Icons.Loader size={32} className="animate-spin text-white/50" />
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
                    {/* Author Header — show immediately from initialPost */}
                    {post && (
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { onClose(); navigate(`/dashboard?profile=${post.authorId}`); }}
                                    className="shrink-0 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white dark:border-gray-700 overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-700">
                                        {post.authorAvatar || post.authorPhotoURL ? (
                                            <img
                                                src={post.authorAvatar || post.authorPhotoURL}
                                                alt={post.authorName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('bg-gray-800');
                                                    const initials = post.authorName
                                                        ? (post.authorName.split(' ').filter(Boolean).length >= 2
                                                            ? (post.authorName.split(' ').filter(Boolean)[0][0] + post.authorName.split(' ').filter(Boolean).pop()[0]).toUpperCase()
                                                            : post.authorName.substring(0, 2).toUpperCase())
                                                        : 'U';
                                                    e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-white uppercase tracking-tighter">${initials}</span>`;
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-white uppercase tracking-tighter">
                                                {post.authorName
                                                    ? (post.authorName.split(' ').filter(Boolean).length >= 2
                                                        ? (post.authorName.split(' ').filter(Boolean)[0][0] + post.authorName.split(' ').filter(Boolean).pop()[0]).toUpperCase()
                                                        : post.authorName.substring(0, 2).toUpperCase())
                                                    : 'U'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <div className="flex-1">
                                    <button
                                        onClick={() => { onClose(); navigate(`/dashboard?profile=${post.authorId}`); }}
                                        className="font-bold text-gray-900 dark:text-white hover:underline transition-colors"
                                    >
                                        {post.authorName}
                                    </button>
                                    <p className="text-xs text-gray-500">{post.title}</p>
                                </div>
                                {user && user.uid !== post.authorId && (
                                    <button
                                        onClick={() => {
                                            toggleFollow(post.authorId);
                                            toast.success(authorIsFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${authorIsFollowing
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            : 'bg-[#FE2C55] text-white hover:bg-[#ef2950]'
                                            }`}
                                    >
                                        {authorIsFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                    </button>
                                )}
                                {user && user.uid === post.authorId && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="p-2 ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        title="Xóa bài viết"
                                    >
                                        {isDeleting ? <Icons.Loader className="animate-spin" size={18} /> : <Icons.Trash2 size={18} />}
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
                                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-bold'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icons.MessageCircle size={14} className="inline mr-1" />
                            Bình luận ({post?.comments || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'details'
                                ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white font-bold'
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
                                            className="mt-2 text-xs text-gray-900 dark:text-white hover:underline font-semibold flex items-center gap-1"
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
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-800 dark:text-gray-300">
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
                                        className="w-full py-3 bg-[#FE2C55] hover:bg-[#ef2950] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Icons.Wand2 size={16} />
                                        Dùng prompt này
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions — show immediately with optimistic data */}
                    {post && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer select-none ${postIsLiked
                                    ? 'bg-red-50 text-red-500 dark:bg-red-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <Icons.Heart size={16} isActive={postIsLiked} />
                                <span className="text-sm font-bold">{formatNumber(post.likes || 0)}</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer select-none ${postIsSaved
                                    ? 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <Icons.Bookmark size={16} className={postIsSaved ? 'fill-current' : ''} />
                                <span className="text-sm font-bold">{formatNumber(post.saves || 0)}</span>
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
