import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../Icons';
import { getTemplates } from '../../services/firebaseFunctions';

const Inspiration = () => {
    const navigate = useNavigate();
    const categories = ['Trending on TikTok', 'Video templates', 'Image templates', 'Writing templates', 'Favorites'];
    const [activeTab, setActiveTab] = useState('Trending on TikTok');
    const [textTemplates, setTextTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const creators = [
        { name: 'Sarah Jenkins', role: 'Pro Creator', views: '1.2M', likes: '45K', img: 'https://picsum.photos/id/64/100/100', bg: 'https://picsum.photos/id/20/300/400' },
        { name: 'Davide M.', role: 'AI Artist', views: '890K', likes: '22K', img: 'https://picsum.photos/id/91/100/100', bg: 'https://picsum.photos/id/30/300/400' },
        { name: 'Elena Code', role: 'Prompt Eng.', views: '650K', likes: '15K', img: 'https://picsum.photos/id/65/100/100', bg: 'https://picsum.photos/id/40/300/400' },
    ];

    const templates = [
        { title: 'Cozy Holiday Vlog', views: '14k', uses: '240', image: 'https://picsum.photos/id/50/300/500', trending: true },
        { title: 'Santa Surprise', views: '82k', uses: '1.2k', image: 'https://picsum.photos/id/60/300/500', trending: false },
        { title: 'Winter Aesthetic', views: '45k', uses: '890', image: 'https://picsum.photos/id/70/300/500', trending: true },
        { title: 'Festive Promo', views: '9k', uses: '150', image: 'https://picsum.photos/id/80/300/500', trending: false },
        { title: 'Snowy Adventures', views: '22k', uses: '600', image: 'https://picsum.photos/id/90/300/500', trending: false },
    ];

    useEffect(() => {
        if (activeTab === 'Writing templates') {
            const fetchTemplates = async () => {
                setIsLoading(true);
                const data = await getTemplates({ isPublic: true });
                setTextTemplates(data);
                setIsLoading(false);
            };
            fetchTemplates();
        }
    }, [activeTab]);

    const handleUseTemplate = (template) => {
        // Navigate to dashboard with prompt
        // We can pass state via router or URL query
        // Using URL parameters for better shareability if implemented later, but state is cleaner
        navigate('/dashboard', {
            state: {
                initialPrompt: template.content,
                autoFocus: true
            }
        });
    };

    return (
        <div className="p-8 pb-20">
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span className="text-yellow-500"><Icons.Wand2 /></span> Weekly Top Creators
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                    {creators.map((creator, i) => (
                        <div key={i} className="min-w-[320px] bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={creator.bg} alt="work" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Icons.Play className="text-white drop-shadow-lg" size={32} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={creator.img} alt={creator.name} className="w-8 h-8 rounded-full border border-white dark:border-gray-600" />
                                    <div>
                                        <h4 className="text-sm font-bold dark:text-white">{creator.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{creator.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Icons.Users size={12} /> {creator.views}</span>
                                    <span className="flex items-center gap-1"><Icons.CheckCircle size={12} /> {creator.likes}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex gap-8 overflow-x-auto no-scrollbar">
                {categories.map((cat, i) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat ? 'text-gray-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 mb-8">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    Industry <Icons.ChevronRight size={14} className="rotate-90" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    Duration <Icons.ChevronRight size={14} className="rotate-90" />
                </button>
                <div className="relative ml-auto">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search for inspiration"
                        className="pl-9 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white w-64 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
            </div>

            {activeTab === 'Writing templates' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Writing Templates Grid */}
                    {textTemplates.length === 0 && !isLoading ? (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <Icons.FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Chưa có mẫu nào được chia sẻ. Hãy là người đầu tiên!</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold"
                            >
                                Tạo mẫu ngay
                            </button>
                        </div>
                    ) : (
                        textTemplates.map((template) => (
                            <div key={template.id} className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                            {template.authorName?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-900 dark:text-white">{template.authorName || 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-500">@{template.authorId?.slice(0, 6)}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400">
                                        {template.category || 'General'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{template.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{template.content}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Icons.Heart size={14} /> {template.likes || 0}</span>
                                        <span className="flex items-center gap-1"><Icons.Download size={14} /> {template.usageCount || 0}</span>
                                    </div>
                                    <button
                                        onClick={() => handleUseTemplate(template)}
                                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                    >
                                        Use <Icons.ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Existing Image/Video Templates */}
                    {templates.map((template, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="relative aspect-[9/16] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                                <img src={template.image} alt={template.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                {template.trending && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        Trending
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg text-xs">
                                        Try this style
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{template.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Icons.Users size={10} /> {template.views}</span>
                                    <span className="flex items-center gap-1"><Icons.Download size={10} /> {template.uses}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inspiration;
