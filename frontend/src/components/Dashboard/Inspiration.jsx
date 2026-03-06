import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../Icons';
import { getPosts, incrementPostUsage } from '../../services/firebaseFunctions';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from '../../utils/toast';
import PostModal from './PostModal';
import PostCard, { getThumbnailUrl } from './PostCard';
import { useAuth } from '../../contexts/AuthContext';
import { useInteractions } from '../../hooks/useInteractions';

// ─── UTILS ────────────────────────────────────────────────────────────
const formatNumber = (num) => {
    num = Math.max(0, num || 0);
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return String(num || 0);
};

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

// ─── Skeleton Components ───────────────────────────────────────────────
const SkeletonCard = memo(({ index }) => (
    <div
        className="animate-pulse"
        style={{ animationDelay: `${index * 80} ms` }}
    >
        <div className="aspect-[9/16] rounded-xl bg-gray-200 dark:bg-gray-700/60 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-md w-3/4 mb-2" />
        <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700/60" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-20" />
        </div>
        <div className="flex gap-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-8" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-8" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-8" />
        </div>
    </div>
));
SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTrendingCard = memo(({ index }) => (
    <div
        className="min-w-[320px] bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex gap-4 items-center animate-pulse"
        style={{ animationDelay: `${index * 100} ms` }}
    >
        <div className="w-24 h-32 rounded-lg bg-gray-200 dark:bg-gray-700/60 flex-shrink-0" />
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700/60" />
                <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-24 mb-1" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700/60 rounded w-16" />
                </div>
            </div>
            <div className="flex gap-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-12" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-12" />
            </div>
        </div>
    </div>
));
SkeletonTrendingCard.displayName = 'SkeletonTrendingCard';

const TrendingCard = memo(({ post, index, isLiked, onClick }) => {
    const defaultImg = 'https://placehold.co/200x260/f3f4f6/9ca3af?text=No+Preview';

    // Sử dụng state để quản lý việc fallback ảnh (thử thumbnail trước, nếu lỗi thì quay về mediaUrl)
    const [imgSource, setImgSource] = useState(post.thumbnailUrl || getThumbnailUrl(post.mediaUrl) || post.mediaUrl || defaultImg);

    useEffect(() => {
        setImgSource(post.thumbnailUrl || getThumbnailUrl(post.mediaUrl) || post.mediaUrl || defaultImg);
    }, [post.id, post.mediaUrl, post.thumbnailUrl, defaultImg]);

    const handleImgError = () => {
        // Nếu ảnh hiện tại đang là thumbnail và bị lỗi, thử chuyển sang mediaUrl gốc
        if (imgSource !== post.mediaUrl && post.mediaUrl && post.mediaUrl !== 'undefined' && post.mediaUrl !== 'null') {
            setImgSource(post.mediaUrl);
        } else if (imgSource !== defaultImg) {
            // Nếu mediaUrl cũng lỗi, dùng ảnh placeholder
            setImgSource(defaultImg);
        }
    };

    return (
        <div
            className="min-w-[320px] bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onClick(post)}
        >
            {/* Media Container */}
            <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-50 dark:border-gray-700">
                {post.type === 'text' ? (
                    <div className="w-full h-full flex items-center justify-center p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                        <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-5 text-center leading-tight">
                            {post.content || post.prompt || post.title}
                        </p>
                    </div>
                ) : post.type === 'video' ? (
                    <div className="w-full h-full relative">
                        <VideoCard src={post.mediaUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
                            <Icons.Play className="text-white opacity-90" size={32} />
                        </div>
                    </div>
                ) : (
                    <img
                        src={imgSource}
                        alt={post.title}
                        className="w-full h-full object-cover block"
                        onError={handleImgError}
                    />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'U')}&background=random&size=32`}
                        alt={post.authorName}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="min-w-0 overflow-hidden">
                        <h4 className="text-sm font-bold dark:text-white truncate">{post.authorName || 'Anonymous'}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Creator</p>
                    </div>
                </div >
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Icons.Eye size={12} /> {formatNumber(post.views || 0)}</span>
                    <span className="flex items-center gap-1"><Icons.Heart size={12} isActive={isLiked} noHover={true} /> {formatNumber(post.likes || 0)}</span>
                </div>
            </div >
        </div >
    );
});
TrendingCard.displayName = 'TrendingCard';

// ─── Main Component ────────────────────────────────────────────────────
const Inspiration = ({ onTabChange }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    // Helper to handle navigation to dashboard tab
    const navigateToDashboard = useCallback(() => {
        if (onTabChange) {
            onTabChange('dashboard');
        } else {
            navigate('/dashboard');
        }
    }, [onTabChange, navigate]);

    // Map categories to translation keys
    const categoryKeys = {
        'Trending on TikTok': 'trendingOnTikTok',
        'Video templates': 'videoTemplates',
        'Image templates': 'imageTemplates',
        'Writing templates': 'writingTemplates',
        'Favorites': 'favorites'
    };

    const getCategoryLabel = (key) => t.dashboard.inspiration[categoryKeys[key]] || key;

    const categories = ['Trending on TikTok', 'Video templates', 'Image templates', 'Writing templates', 'Favorites'];
    const [activeTab, setActiveTab] = useState('Trending on TikTok');
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const [selectedSortBy, setSelectedSortBy] = useState('recent');

    const loadMoreRef = useRef(null);
    const queryClient = useQueryClient();

    // 1. Get Interaction status and toggle functions
    const { isLiked, isSaved, toggleLike, toggleSave } = useInteractions();

    const categoryOptions = [
        { value: '', label: 'Tất cả ngành' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'art', label: 'Nghệ thuật' },
        { value: 'product', label: 'Sản phẩm' },
        { value: 'fashion', label: 'Thời trang' },
        { value: 'food', label: 'Ẩm thực' },
        { value: 'travel', label: 'Du lịch' },
        { value: 'technology', label: 'Công nghệ' },
    ];

    const timeRangeOptions = [
        { value: 'all', label: 'Mọi lúc' },
        { value: 'today', label: 'Hôm nay' },
        { value: 'week', label: 'Tuần này' },
        { value: 'month', label: 'Tháng này' },
    ];

    const sortByOptions = [
        { value: 'recent', label: 'Mới nhất' },
        { value: 'popular', label: 'Phổ biến nhất' },
        { value: 'views', label: 'Xem nhiều nhất' },
    ];

    const fetchPostsPage = async ({ pageParam = null }) => {
        if (activeTab === 'Favorites') {
            const { posts: savedPosts } = await getPosts({ savedByMe: true });
            return { posts: savedPosts, hasMore: false, lastId: null };
        }

        let typeFilter;
        if (activeTab === 'Video templates') typeFilter = 'video';
        else if (activeTab === 'Image templates') typeFilter = 'image';
        else if (activeTab === 'Writing templates') typeFilter = 'text';

        const params = {
            type: typeFilter,
            category: selectedCategory || undefined,
            sortBy: selectedSortBy,
            timeRange: selectedTimeRange,
            limit: 20,
            ...(pageParam ? { startAfter: pageParam } : {})
        };

        const { posts: fetchedPosts, hasMore: moreAvailable } = await getPosts(params);
        const lastId = fetchedPosts.length > 0 ? fetchedPosts[fetchedPosts.length - 1].id : null;
        return { posts: fetchedPosts, hasMore: moreAvailable, lastId };
    };

    const queryKey = ['posts', activeTab, selectedCategory, selectedSortBy, selectedTimeRange];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey,
        queryFn: fetchPostsPage,
        getNextPageParam: (lastPage) => lastPage?.hasMore ? lastPage.lastId : undefined,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    const posts = data?.pages.flatMap(page => page.posts) || [];
    const isLoading = status === 'pending';
    const hasMore = hasNextPage;
    const isLoadingMore = isFetchingNextPage;

    // Infinite scroll – IntersectionObserver for "load more"
    useEffect(() => {
        if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Fetch trending posts on mount
    // We fetch recent posts (which has a working Firestore index) then sort by views client-side
    useEffect(() => {
        const fetchTrendingPosts = async () => {
            setIsTrendingLoading(true);
            try {
                // Fetch a batch of recent posts (default sort = createdAt, has index)
                const { posts: allPosts } = await getPosts({ limit: 20 });
                // Sort by views descending and pick top 3
                const sorted = (allPosts || [])
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 3);
                setTrendingPosts(sorted);
            } catch (error) {
                console.error('Error fetching trending posts:', error);
                setTrendingPosts([]);
            }
            setIsTrendingLoading(false);
        };
        fetchTrendingPosts();
    }, []);

    // ── Interactions ────────────────────────────────────────────────

    const handleLike = useCallback((postId) => {
        const currentInteractions = queryClient.getQueryData(['userInteractions', user?.uid]);
        const wasLiked = currentInteractions?.likedPostIds?.includes(postId);

        setTrendingPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    likes: Math.max(0, (post.likes || 0) + (wasLiked ? -1 : 1))
                };
            }
            return post;
        }));

        toggleLike(postId);
    }, [queryClient, user?.uid, toggleLike]);

    const handleSave = useCallback((postId) => {
        setTrendingPosts(prev => prev.map(post => {
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

        setTimeout(() => {
            const currentInteractions = queryClient.getQueryData(['userInteractions', user?.uid]);
            const currentlySaved = currentInteractions?.savedPostIds?.includes(postId);
            toast.success(currentlySaved ? 'Đã lưu vào yêu thích' : 'Đã xóa khỏi yêu thích');
        }, 100);
    }, [queryClient, user?.uid, isSaved, toggleSave]);

    const handleUsePrompt = useCallback(async (post) => {
        if (!post?.prompt) {
            toast.error('Bài viết này không có prompt');
            return;
        }

        try { await incrementPostUsage(post.id); } catch { }

        navigate('/dashboard', {
            state: { prefillPrompt: post.prompt, prefillType: post.type === 'video' ? 'video' : 'image' }
        });
        toast.success('Đã chuyển đến bảng điều khiển với prompt!');
    }, [navigate]);

    const handleCopyPrompt = useCallback(async (post) => {
        try {
            await navigator.clipboard.writeText(post.prompt);
            await incrementPostUsage(post.id);
            toast.success('Đã sao chép prompt!');
        } catch {
            toast.error('Không thể sao chép');
        }
    }, []);

    const handleTrendingPostClick = useCallback((post) => setSelectedPost(post), []);

    const handlePostClick = useCallback((post) => {
        setSelectedPost(post);
    }, []);

    const handleAvatarClick = useCallback((authorId) => {
        navigate(`/dashboard?profile=${authorId}`);
    }, [navigate]);

    // Filter posts by search query (client-side)
    const filteredPosts = searchQuery.trim()
        ? posts.filter(post => {
            const q = searchQuery.toLowerCase();
            return (
                (post.title && post.title.toLowerCase().includes(q)) ||
                (post.prompt && post.prompt.toLowerCase().includes(q)) ||
                (post.description && post.description.toLowerCase().includes(q)) ||
                (post.authorName && post.authorName.toLowerCase().includes(q)) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(q)))
            );
        })
        : posts;

    return (
        <div className="px-4 md:px-8 pt-2 md:pt-4 pb-20">
            {/* ── Inline CSS for animations ── */}
            <style>{`
@keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
}
`}</style>

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icons.Lightbulb size={24} className="text-yellow-500" />
                        {t.dashboard.inspiration.title || 'Cảm Hứng'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Khám phá xu hướng, mẫu sáng tạo và prompt từ cộng đồng
                    </p>
                </div>
                <button
                    onClick={navigateToDashboard}
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-sm font-bold transition-all shadow-md"
                >
                    <Icons.Wand2 size={16} />
                    Tạo nội dung
                </button>
            </div>

            {/* ── Weekly Trending Posts ── */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <span className="text-yellow-500">🏆</span> {t.dashboard.inspiration.weeklyTopCreators}
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                    {isTrendingLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonTrendingCard key={i} index={i} />
                        ))
                    ) : trendingPosts.length === 0 ? (
                        <div className="w-full py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                            Chưa có bài viết xu hướng nào trong tuần này
                        </div>
                    ) : trendingPosts.map((post, i) => (
                        <TrendingCard
                            key={post.id}
                            post={post}
                            index={i}
                            isLiked={isLiked(post.id)}
                            onClick={handleTrendingPostClick}
                        />
                    ))}
                </div>
            </div>

            {/* ── Category Tabs ── */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-6 overflow-x-auto no-scrollbar">
                {
                    categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`pb-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${activeTab === cat
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            {getCategoryLabel(cat)}
                            {activeTab === cat && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 dark:bg-white rounded-full" />
                            )}
                        </button>
                    ))
                }
            </div>

            {/* ── Filters ── */}
            <div className="flex gap-3 mb-8 flex-wrap items-center">
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all hover:border-gray-400 dark:hover:border-gray-500"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Icons.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all hover:border-gray-400 dark:hover:border-gray-500"
                    >
                        {timeRangeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Icons.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={selectedSortBy}
                        onChange={(e) => setSelectedSortBy(e.target.value)}
                        className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all hover:border-gray-400 dark:hover:border-gray-500"
                    >
                        {sortByOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Icons.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {
                    !isLoading && (
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-xs font-bold">
                            {filteredPosts.length} bài viết
                        </span>
                    )
                }

                <div className="relative ml-auto">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={t.dashboard.inspiration.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-white w-64 focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:border-purple-300 dark:hover:border-purple-600"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <Icons.X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Posts Grid ── */}
            {
                isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <SkeletonCard key={i} index={i} />
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Icons.Image size={32} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? `Không tìm thấy kết quả` : 'Chưa có bài đăng nào'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? `Không có bài viết nào phù hợp với "${searchQuery}". Thử từ khóa khác nhé.`
                                : 'Hãy là người đầu tiên chia sẻ tác phẩm sáng tạo của bạn!'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={navigateToDashboard}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Icons.Wand2 size={16} className="inline mr-2" />
                                Tạo và chia sẻ ngay
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {filteredPosts.map((post, index) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                index={index}
                                isLiked={isLiked(post.id)}
                                isSaved={isSaved(post.id)}
                                onLike={handleLike}
                                onSave={handleSave}
                                onCopyPrompt={handleCopyPrompt}
                                onUsePrompt={handleUsePrompt}
                                onClick={handlePostClick}
                                onAvatarClick={handleAvatarClick}
                                t={t}
                            />
                        ))}
                    </div>
                )
            }

            {/* ── Load More / Infinite Scroll ── */}
            {
                hasMore && !searchQuery && (
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                        {isLoadingMore ? (
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Icons.Loader size={20} className="animate-spin text-purple-500" />
                                <span className="text-sm">Đang tải thêm...</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => fetchNextPage()}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Xem thêm
                            </button>
                        )}
                    </div>
                )
            }

            {/* ── Post Detail Modal ── */}
            <PostModal
                postId={selectedPost?.id}
                initialPost={selectedPost}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                onUsePrompt={handleUsePrompt}
                onLike={handleLike}
                onSave={handleSave}
            />
        </div>
    );
};

export default Inspiration;
