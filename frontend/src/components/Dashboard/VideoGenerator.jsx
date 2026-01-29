import { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';

const RATIOS = [
    { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4' },
    { id: '4:3', label: '4:3', width: 'w-6', height: 'h-4' },
    { id: '1:1', label: '1:1', width: 'w-5', height: 'h-5' },
    { id: '3:4', label: '3:4', width: 'w-4', height: 'h-5' },
    { id: '9:16', label: '9:16', width: 'w-3', height: 'h-5' },
];

const LANGUAGES = [
    { id: 'EN', label: 'English' },
    { id: 'VI', label: 'Tiếng Việt' },
];

const VideoGenerator = () => {
    const [inputValue, setInputValue] = useState('');
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const [isRatioLangMenuOpen, setIsRatioLangMenuOpen] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState('9:16');
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const menuRef = useRef(null);
    const ratioLangMenuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsPlusMenuOpen(false);
            }
            if (ratioLangMenuRef.current && !ratioLangMenuRef.current.contains(event.target)) {
                setIsRatioLangMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        console.log("Sending video generation prompt:", inputValue);
        // Add actual generation logic here
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-white dark:bg-[#0f172a]">
            {/* Main Content Container */}
            <div className="flex-1 flex flex-col items-center pt-12 md:pt-16 px-6 max-w-5xl mx-auto w-full">

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-black dark:text-white tracking-tight">
                    Biến mọi thứ thành video
                </h1>

                {/* Input Area */}
                <div className="w-full max-w-3xl mx-auto mb-8 relative z-20">
                    <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-16 bg-transparent border-0 focus:border-0 focus:ring-0 ring-0 focus:outline-none outline-none appearance-none text-lg text-gray-600 dark:text-gray-300 placeholder-gray-400 resize-none leading-relaxed shadow-none"
                            placeholder="Hãy mô tả video bạn muốn tạo. Thêm liên kết, hình ảnh hoặc tài liệu để có kết quả chính xác hơn."
                        ></textarea>

                        <div className="flex items-center justify-between mt-4 px-1">
                            <div className="flex items-center gap-2 relative">
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                        className={`w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 flex items-center justify-center transition-all ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-gray-700 rotate-45' : ''}`}
                                    >
                                        <Icons.Plus size={16} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isPlusMenuOpen && (
                                        <div className="absolute top-14 left-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                <Icons.Monitor size={18} className="text-black/60" />
                                                Tải lên từ máy tính
                                            </button>
                                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                <Icons.Folder size={18} className="text-black/60" />
                                                Chọn từ Tài nguyên
                                            </button>
                                            <div className="relative group">
                                                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Icons.MoreHorizontal size={18} className="text-black/60" />
                                                        Thêm
                                                    </div>
                                                    <Icons.ChevronRight size={14} className="text-black/40" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 flex items-center justify-center transition-all" title="Style">
                                    <Icons.Inbox size={16} />
                                </button>
                                <div className="relative">
                                    <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 flex items-center justify-center transition-all" title="Ideas">
                                        <Icons.Lightbulb size={16} />
                                    </button>
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
                                </div>

                                <div className="relative" ref={ratioLangMenuRef}>
                                    <button
                                        onClick={() => setIsRatioLangMenuOpen(!isRatioLangMenuOpen)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isRatioLangMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        <Icons.TuningSquare size={14} isActive={isRatioLangMenuOpen} />
                                        <span>{selectedRatio}</span>
                                        <span className="text-gray-400 dark:text-gray-600 mx-1">|</span>
                                        <span className="text-black/60 dark:text-gray-400">{selectedLanguage}</span>
                                    </button>

                                    {isRatioLangMenuOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 tracking-tight">Tỷ lệ khung hình</h3>
                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {RATIOS.map((r) => (
                                                    <button
                                                        key={r.id}
                                                        onClick={() => setSelectedRatio(r.id)}
                                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${selectedRatio === r.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        <span className={`block border-2 border-current rounded-sm ${r.width} ${r.height}`} />
                                                        <span className="text-xs font-semibold">{r.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 tracking-tight">Ngôn ngữ</h3>
                                            <div className="space-y-0.5">
                                                {LANGUAGES.map((lang) => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => setSelectedLanguage(lang.id)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${selectedLanguage === lang.id ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        {lang.label}
                                                        {selectedLanguage === lang.id && <Icons.CheckCircle size={16} className="text-purple-500 shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-300 text-xs font-bold transition-colors">
                                    <Icons.Clock size={14} />
                                    <span>Lịch đăng</span>
                                </button>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${inputValue.trim() ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Icons.ArrowUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-black/70 dark:text-gray-400 mb-16">
                    <span className="text-black/40 dark:text-gray-600">Lịch sử</span>
                    <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                        Wool-felt winter village <Icons.ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" />
                    </a>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                        TikTok marketing video <Icons.ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" />
                    </a>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                        Santa shop showcase <Icons.ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -rotate-45" />
                    </a>
                </div>

                {/* Popular Tools */}
                <div className="w-full max-w-4xl">
                    <h2 className="text-center text-black dark:text-gray-400 font-medium mb-6">Công cụ phổ biến</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Avatar video */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Bot size={24} className="text-teal-600 dark:text-teal-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Video Avatar</span>
                        </button>

                        {/* AI talking photo */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Mic size={24} className="text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Ảnh nói chuyện AI</span>
                        </button>

                        {/* Product showcase */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Store size={24} className="text-amber-600 dark:text-amber-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Trình diễn sản phẩm</span>
                        </button>

                        {/* Remove background */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Image size={24} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Xóa nền</span>
                        </button>

                        {/* Quick cut */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Scissors size={24} className="text-blue-600 dark:text-blue-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Cắt nhanh</span>
                        </button>

                        {/* Video editor */}
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Clapperboard size={24} className="text-pink-600 dark:text-pink-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">Trình biên tập video</span>
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-20 w-full"></div>
            </div>

            {/* Help Bubble - Matching the HTML position */}
            <button className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50">
                <Icons.HelpCircle size={24} />
            </button>
        </div>
    );
};

export default VideoGenerator;

