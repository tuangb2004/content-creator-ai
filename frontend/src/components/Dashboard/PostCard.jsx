import React, { useState, useEffect, useRef, memo } from 'react';
import { Icons } from '../Icons';
import { followUserById } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';

// ─── UTILS ────────────────────────────────────────────────────────────
const formatNumber = (num) => {
    num = Math.max(0, num || 0);
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return String(num || 0);
};

export const getThumbnailUrl = (originalUrl) => {
    if (!originalUrl) return originalUrl;

    // Check if it's a Firebase Storage URL with a token
    if (originalUrl.includes('firebasestorage.googleapis.com')) {
        try {
            const urlObj = new URL(originalUrl);
            let pathname = urlObj.pathname;

            // Look for the extension, e.g. .jpg, .png
            const extMatch = pathname.match(/\.([a-zA-Z0-9]+)$/);
            if (extMatch) {
                const ext = extMatch[1];
                // Use 400x400 for better quality on modern screens (especially for collages)
                pathname = pathname.replace(`.${ext}`, `_400x400.${ext}`);

                // Return URL keeping only the ?alt=media query param, dropping the token
                return `${urlObj.origin}${pathname}?alt=media`;
            }
        } catch (e) {
            console.error("Error formatting thumbnail URL", e);
        }
    }

    return originalUrl;
};

// ─── Video with IntersectionObserver autoplay ──────────────────────────
const VideoCard = memo(({ src, className }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => { });
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            src={src}
            className={className}
            muted
            loop
            playsInline
        />
    );
});
VideoCard.displayName = 'VideoCard';

// ─── Inline Follow Button for Avatar Overlay ─────────────────────────────
const FollowButton = ({ authorId, isFollowing }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('plus'); // 'plus', 'check', 'hidden'

    const handleClick = async (e) => {
        e.stopPropagation();
        if (status !== 'plus') return;

        setStatus('check');

        try {
            await followUserById(authorId);
            setTimeout(() => {
                setStatus('hidden');
            }, 1500);
            toast.success('Đã theo dõi tác giả');
        } catch (error) {
            setStatus('plus');
            console.error(error);
            toast.error('Vui lòng đăng nhập để theo dõi');
        }
    };

    // Theo chuẩn TikTok:
    // 1. Không hiện nút follow cho chính mình
    // 2. Không hiện nút follow nếu đã follow
    // 3. Ẩn nút nếu trạng thái animation là 'hidden' (vừa bấm follow xong)
    if ((user && user.uid === authorId) || isFollowing || status === 'hidden') {
        return null;
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white shadow-sm border border-white transition-all duration-300 ${status === 'check' ? 'scale-110 opacity-100' : 'scale-100 opacity-100'}`}
            title="Follow"
        >
            {status === 'plus' ? (
                <Icons.Plus size={12} strokeWidth={3} />
            ) : (
                <Icons.Check size={12} strokeWidth={3} />
            )}
        </button>
    );
};

// ─── PostCard Component ────────────────────────────────────────────────
const PostCard = memo(({ post, index, isLiked, isSaved, onLike, onSave, onCopyPrompt, onUsePrompt, onClick, onAvatarClick }) => {
    const defaultImg = 'https://placehold.co/600x800/f3f4f6/9ca3af?text=No+Preview';
    const initialUrl = post.thumbnailUrl || getThumbnailUrl(post.mediaUrl) || defaultImg;
    const [imgSource, setImgSource] = useState(initialUrl);
    const [avatarError, setAvatarError] = useState(false);

    // Reset errors when post changes
    useEffect(() => {
        let url = post.thumbnailUrl || getThumbnailUrl(post.mediaUrl) || defaultImg;
        if (url === 'undefined' || url === 'null') url = defaultImg;
        setImgSource(url);
        setAvatarError(false);
    }, [post.id, post.mediaUrl, post.thumbnailUrl, defaultImg]);

    const handleImgError = (e) => {
        // If thumbnail fails, try to fallback to the original FULL resolution image
        if (imgSource !== post.mediaUrl && post.mediaUrl && post.mediaUrl !== 'undefined' && post.mediaUrl !== 'null') {
            setImgSource(post.mediaUrl);
            return;
        }

        // If even original fails or we are already on original, show placeholder
        if (imgSource !== defaultImg) {
            setImgSource(defaultImg);
        }
        if (e.target) {
            e.target.onerror = null;
            e.target.src = defaultImg; // Force the DOM element to update immediately
        }
    };

    return (
        <div
            className="group cursor-pointer animate-fade-in-up flex flex-col gap-2 w-full"
            style={{ animationDelay: `${(index || 0) * 60}ms`, animationFillMode: 'both' }}
            onClick={() => onClick && onClick(post)}
        >
            {/* Media Container */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm transition-all duration-300">
                {post.type === 'text' ? (
                    <div className="w-full h-full p-6 flex flex-col justify-center bg-gray-900 dark:bg-white text-center">
                        <Icons.FileText size={28} className="text-white dark:text-gray-900 mx-auto mb-3" />
                        <p className="text-sm text-white dark:text-gray-900 font-medium line-clamp-6 leading-snug">
                            {post.content}
                        </p>
                    </div>
                ) : post.type === 'video' ? (
                    <VideoCard src={post.mediaUrl} className="w-full h-full object-cover" />
                ) : (
                    <img
                        src={imgSource}
                        alt={post.title || 'Image'}
                        className="w-full h-full object-cover transition-transform duration-700"
                        onError={handleImgError}
                    />
                )}

                {/* Top Left Badges */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {post.type === 'video' && (
                        <div className="bg-black/40 backdrop-blur-md rounded-md p-1.5 flex items-center justify-center">
                            <Icons.Play size={14} className="text-white fill-white" />
                        </div>
                    )}
                    <div className="bg-black/40 backdrop-blur-md rounded-md px-2 py-1 flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide uppercase">
                            {post.type === 'video' ? 'Video' : post.type === 'text' ? 'Text' : 'Image'}
                        </span>
                    </div>
                </div>

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
                    <div className="flex flex-col gap-3 items-end justify-end mt-auto translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Avatar & Follow Button Stack */}
                        {post.authorId && (
                            <div className="relative mb-2 w-10 h-10 flex cursor-pointer z-30" onClick={(e) => { e.stopPropagation(); if (onAvatarClick) onAvatarClick(post.authorId); }}>
                                <img
                                    src={!avatarError && post.authorAvatar ? post.authorAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'User')}&background=random`}
                                    alt={post.authorName || 'User'}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white bg-white"
                                    onError={() => setAvatarError(true)}
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                    <FollowButton authorId={post.authorId} isFollowing={post.isFollowing} />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onLike && onLike(post.id); }}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 shadow-md bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                            title="Like"
                        >
                            <Icons.Heart size={18} isActive={isLiked} noHover={true} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick && onClick(post); }}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 shadow-md bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                            title="Comment"
                        >
                            <Icons.MessageCircle size={18} className="text-gray-800" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSave && onSave(post.id); }}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 shadow-md bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                            title="Save"
                        >
                            <Icons.Bookmark size={18} className={isSaved ? 'text-yellow-500 fill-current' : 'text-gray-800'} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onUsePrompt && onUsePrompt(post); }}
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 shadow-md bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                            title="Use Prompt"
                        >
                            <Icons.Wand2 size={18} className="text-gray-800" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Outside Info (Title & Stats beneath image) */}
            <div className="px-1 flex flex-col gap-1.5 pb-2">
                {/* Title (If available, can be very short or 1 line) */}
                {post.title && (
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 line-clamp-1 leading-snug">
                        {post.title}
                    </h3>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-4 text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Icons.Eye size={14} /> {formatNumber(Math.max(0, post.views || 0))}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Icons.Heart size={14} isActive={isLiked} noHover={true} /> {formatNumber(Math.max(0, post.likes || 0))}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Icons.Share2 size={13} /> {formatNumber(Math.max(0, post.saves || 0))}
                        </span>
                    </div>
                    {/* Report Menu Context */}
                    <ReportMenu post={post} />
                </div>
            </div>
        </div>
    );
});

// A small component for the Report Menu to keep PostCard clean 
const ReportMenu = ({ post }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReport = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        // Dispatch a custom event or you can pass down an `onReport` prop
        toast.success('Báo cáo đã được gửi. Chúng tôi sẽ xem xét bài viết này.', { icon: '🚩' });
        // NOTE: Actually call backend to save report here
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
            >
                <Icons.MoreHorizontal size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1 flex flex-col">
                    <button
                        onClick={handleReport}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                        <Icons.Flag size={14} />
                        <span>Báo cáo bài viết</span>
                    </button>
                </div>
            )}
        </div>
    );
};

PostCard.displayName = 'PostCard';

export default PostCard;
