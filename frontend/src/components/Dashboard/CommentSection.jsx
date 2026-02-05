import { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { addComment, getComments, likeCommentById, deleteCommentById } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import toast from '../../utils/toast';

const CommentSection = ({ postId, onClose }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!postId) return;
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const { comments: data } = await getComments(postId);
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
            setIsLoading(false);
        };
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) {
            if (!user) toast.error('Vui lòng đăng nhập để bình luận');
            return;
        }

        setIsSubmitting(true);
        try {
            const { comment } = await addComment(postId, newComment.trim());
            setComments(prev => [{
                ...comment,
                id: comment.id || Date.now().toString(),
                authorName: user.displayName || user.email?.split('@')[0] || 'Bạn',
                authorAvatar: user.photoURL,
                createdAt: { _seconds: Date.now() / 1000 },
                likes: 0,
                isLiked: false,
            }, ...prev]);
            setNewComment('');
            toast.success('Đã thêm bình luận!');
        } catch (error) {
            toast.error(error.message || 'Không thể thêm bình luận');
        }
        setIsSubmitting(false);
    };

    const handleLike = async (commentId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const { liked } = await likeCommentById(commentId, postId);
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c, isLiked: liked, likes: liked ? (c.likes || 0) + 1 : (c.likes || 1) - 1 }
                    : c
            ));
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Xóa bình luận này?')) return;
        try {
            await deleteCommentById(commentId, postId);
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Đã xóa bình luận');
        } catch (error) {
            toast.error(error.message || 'Không thể xóa');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp._seconds ? timestamp._seconds * 1000 : timestamp);
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return `${Math.floor(diff / 86400)} ngày trước`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.MessageCircle size={18} />
                    Bình luận ({comments.length})
                </h3>
                {onClose && (
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Icons.X size={18} className="text-gray-500" />
                    </button>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Icons.Loader size={24} className="animate-spin text-gray-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Icons.MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có bình luận nào</p>
                        <p className="text-xs">Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group">
                            <div className="flex gap-3">
                                {/* Avatar */}
                                <img
                                    src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`}
                                    alt={comment.authorName}
                                    className="w-8 h-8 rounded-full shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.authorName}</span>
                                        <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <button
                                            onClick={() => handleLike(comment.id)}
                                            className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                                }`}
                                        >
                                            <Icons.Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
                                            {comment.likes > 0 && comment.likes}
                                        </button>
                                        {user?.uid === comment.authorId && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Xóa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-3 items-start">
                    {user && (
                        <img
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`}
                            alt="You"
                            className="w-8 h-8 rounded-full shrink-0"
                        />
                    )}
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                            disabled={!user}
                            rows={1}
                            className="w-full px-4 py-2.5 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting || !user}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <Icons.Loader size={16} className="animate-spin" />
                            ) : (
                                <Icons.Send size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CommentSection;
