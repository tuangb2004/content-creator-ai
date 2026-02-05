import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getPosts, getTopCreators, likePost, savePostToFavorites, incrementPostUsage } from '../../services/firebaseFunctions';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from '../../utils/toast';
import PostModal from './PostModal';

const Inspiration = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

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
    const [posts, setPosts] = useState([]);
    const [creators, setCreators] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPostId, setSelectedPostId] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const [selectedSortBy, setSelectedSortBy] = useState('recent');

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

    // Fetch posts based on active tab and filters
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (activeTab === 'Favorites') {
                    const { posts: savedPosts } = await getPosts({ savedByMe: true });
                    setPosts(savedPosts);
                } else {
                    // Map tab to type filter
                    let typeFilter;
                    if (activeTab === 'Video templates') typeFilter = 'video';
                    else if (activeTab === 'Image templates') typeFilter = 'image';
                    else if (activeTab === 'Writing templates') typeFilter = 'text';

                    const { posts: fetchedPosts } = await getPosts({
                        type: typeFilter,
                        category: selectedCategory || undefined,
                        sortBy: selectedSortBy,
                        timeRange: selectedTimeRange,
                        limit: 20
                    });
                    setPosts(fetchedPosts);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [activeTab, selectedCategory, selectedSortBy, selectedTimeRange]);

    // Fetch top creators on mount
    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const { creators: topCreators } = await getTopCreators(6);
                if (topCreators.length > 0) {
                    setCreators(topCreators);
                } else {
                    // Fallback mock data if no creators yet
                    setCreators([
                        { id: '1', displayName: 'Sarah Jenkins', role: 'Pro Creator', totalLikes: 45000, followersCount: 1200000, avatar: 'https://picsum.photos/id/64/100/100', coverImage: 'https://picsum.photos/id/20/300/400' },
                        { id: '2', displayName: 'Davide M.', role: 'AI Artist', totalLikes: 22000, followersCount: 890000, avatar: 'https://picsum.photos/id/91/100/100', coverImage: 'https://picsum.photos/id/30/300/400' },
                        { id: '3', displayName: 'Elena Code', role: 'Prompt Eng.', totalLikes: 15000, followersCount: 650000, avatar: 'https://picsum.photos/id/65/100/100', coverImage: 'https://picsum.photos/id/40/300/400' },
                    ]);
                }
            } catch (error) {
                console.error('Error fetching creators:', error);
            }
        };
        fetchCreators();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return String(num || 0);
    };

    // Optimistic Like - UI updates instantly
    const handleLike = async (postId, e) => {
        e.stopPropagation();

        // 1. Get current state for potential rollback
        const currentPost = posts.find(p => p.id === postId);
        const wasLiked = currentPost?.isLiked;

        // 2. Optimistic update - UI changes immediately
        setPosts(prev => prev.map(p =>
            p.id === postId
                ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? (p.likes || 1) - 1 : (p.likes || 0) + 1 }
                : p
        ));

        // 3. Sync with server in background
        try {
            await likePost(postId);
        } catch (error) {
            // 4. Rollback on error
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, isLiked: wasLiked, likes: wasLiked ? (p.likes || 0) + 1 : (p.likes || 1) - 1 }
                    : p
            ));
            toast.error('Vui lòng đăng nhập để thích bài viết');
        }
    };

    // Optimistic Save - UI updates instantly
    const handleSave = async (postId, e) => {
        e.stopPropagation();

        // 1. Get current state for potential rollback
        const currentPost = posts.find(p => p.id === postId);
        const wasSaved = currentPost?.isSaved;

        // 2. Optimistic update - UI changes immediately
        setPosts(prev => prev.map(p =>
            p.id === postId
                ? { ...p, isSaved: !p.isSaved, saves: p.isSaved ? (p.saves || 1) - 1 : (p.saves || 0) + 1 }
                : p
        ));
        toast.success(!wasSaved ? 'Đã lưu vào yêu thích' : 'Đã xóa khỏi yêu thích');

        // 3. Sync with server in background
        try {
            await savePostToFavorites(postId);
        } catch (error) {
            // 4. Rollback on error
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, isSaved: wasSaved, saves: wasSaved ? (p.saves || 0) + 1 : (p.saves || 1) - 1 }
                    : p
            ));
            toast.error('Vui lòng đăng nhập để lưu bài viết');
        }
    };

    // Use prompt - navigate to dashboard with prefilled prompt (no auto-send)
    const handleUsePrompt = async (post, e) => {
        e.stopPropagation();
        if (!post?.prompt) {
            toast.error('Bài viết này không có prompt');
            return;
        }

        // Track usage
        try {
            await incrementPostUsage(post.id);
        } catch (error) {
            console.error('Error tracking usage:', error);
        }

        // Navigate to dashboard with prefillPrompt (won't auto-send)
        navigate('/dashboard', {
            state: {
                prefillPrompt: post.prompt,
                prefillType: post.type === 'video' ? 'video' : 'image'
            }
        });
        toast.success('Đã chuyển đến bảng điều khiển với prompt!');
    };

    const handleCopyPrompt = async (post, e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(post.prompt);
            await incrementPostUsage(post.id);
            toast.success('Đã sao chép prompt!');
        } catch (error) {
            toast.error('Không thể sao chép');
        }
    };

    const handleUseTemplate = (template) => {
        navigate('/dashboard', {
            state: {
                initialPrompt: template.content,
                autoFocus: true
            }
        });
    };

    const handlePostClick = (post) => {
        setSelectedPostId(post.id);
    };

    // PostCard Component
    const PostCard = ({ post }) => (
        <div className="group cursor-pointer" onClick={() => handleUsePrompt(post)}>
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                {post.type === 'text' ? (
                    // Text post display
                    <div className="w-full h-full p-6 flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Icons.FileText size={20} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Văn bản</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                        {post.prompt && (
                            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
                                    Prompt: "{post.prompt}"
                                </p>
                            </div>
                        )}
                    </div>
                ) : post.type === 'video' ? (
                    <video
                        src={post.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                ) : (
                    <img src={post.mediaUrl || post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}

                {/* Trending Badge */}
                {post.isTrending && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <Icons.TrendingUp size={10} />
                        {t.dashboard.inspiration.trending}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={(e) => handleLike(post.id, e)}
                            className={`p-2 rounded-full transition-all ${post.isLiked ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
                        >
                            <Icons.Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                        </button>
                        <button
                            onClick={(e) => handleSave(post.id, e)}
                            className={`p-2 rounded-full transition-all ${post.isSaved ? 'bg-purple-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
                        >
                            <Icons.Bookmark size={16} className={post.isSaved ? 'fill-current' : ''} />
                        </button>
                        <button
                            onClick={(e) => handleCopyPrompt(post, e)}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                            title="Sao chép prompt"
                        >
                            <Icons.Copy size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePostClick(post); }}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                            title="Bình luận"
                        >
                            <Icons.MessageCircle size={16} />
                        </button>
                    </div>

                    {/* Use Button */}
                    <button
                        onClick={(e) => handleUsePrompt(post, e)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                        <Icons.Wand2 size={14} />
                        {post.type === 'text' ? 'Sử dụng ngay' : t.dashboard.inspiration.tryThisStyle}
                    </button>
                </div>
            </div>

            {/* Post Info with Avatar */}
            <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-1">{post.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}&size=32&background=random`}
                        alt={post.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                        loading="lazy"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">{post.authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Icons.Heart size={10} className={post.isLiked ? 'text-red-500 fill-red-500' : ''} />
                        {formatNumber(post.likes || 0)}
                    </span>
                    <span className="flex items-center gap-1"><Icons.Eye size={10} /> {formatNumber(post.views || 0)}</span>
                    <span className="flex items-center gap-1"><Icons.MessageCircle size={10} /> {formatNumber(post.comments || 0)}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 pb-20">
            {/* Weekly Top Creators */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span className="text-yellow-500"><Icons.Wand2 /></span> {t.dashboard.inspiration.weeklyTopCreators}
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                    {creators.map((creator, i) => (
                        <div key={creator.id || i} className="min-w-[320px] bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={creator.coverImage || 'https://picsum.photos/id/20/300/400'} alt="work" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Icons.Play className="text-white drop-shadow-lg" size={32} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={creator.avatar || creator.photoURL || `https://ui-avatars.com/api/?name=${creator.displayName}`} alt={creator.displayName} className="w-8 h-8 rounded-full border border-white dark:border-gray-600" />
                                    <div>
                                        <h4 className="text-sm font-bold dark:text-white">{creator.displayName}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{creator.role || 'Creator'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Icons.Users size={12} /> {formatNumber(creator.followersCount || 0)}</span>
                                    <span className="flex items-center gap-1"><Icons.Heart size={12} /> {formatNumber(creator.totalLikes || 0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-8 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat ? 'text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {getCategoryLabel(cat)}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-8 flex-wrap">
                {/* Category Filter */}
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none flex items-center gap-2 px-4 py-2 pr-8 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Icons.ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>

                {/* Time Range Filter */}
                <div className="relative">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="appearance-none flex items-center gap-2 px-4 py-2 pr-8 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        {timeRangeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Icons.ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                </div>

                {/* Search */}
                <div className="relative ml-auto">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={t.dashboard.inspiration.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white w-64 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <Icons.Loader size={32} className="animate-spin text-purple-500" />
                </div>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {posts.length === 0 && !isLoading ? (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <Icons.Image size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t.dashboard.inspiration.noTemplates || 'Chưa có bài đăng nào'}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700"
                        >
                            {t.dashboard.inspiration.createTemplate || 'Tạo và chia sẻ ngay'}
                        </button>
                    </div>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>

            {/* Post Detail Modal */}
            <PostModal
                postId={selectedPostId}
                isOpen={!!selectedPostId}
                onClose={() => setSelectedPostId(null)}
                onUsePrompt={handleUsePrompt}
            />
        </div>
    );
};

export default Inspiration;
