import { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { AgentChat } from './AgentChat';
import { getProjects } from '../../services/firebaseFunctions';

const VIDEO_RATIOS = [
  { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4' },
  { id: '4:3', label: '4:3', width: 'w-6', height: 'h-4' },
  { id: '1:1', label: '1:1', width: 'w-5', height: 'h-5' },
  { id: '3:4', label: '3:4', width: 'w-4', height: 'h-5' },
  { id: '9:16', label: '9:16', width: 'w-3', height: 'h-5' },
];

const VIDEO_LANGUAGES = [
  { id: 'EN', label: 'English' },
  { id: 'VI', label: 'Tiếng Việt' },
];

const MODELS = {
  image: [
    { id: 'nano-pro', name: 'Nano Banana Pro', desc: 'Pro image quality', icon: Icons.Banana },
    { id: 'nano', name: 'Nano Banana', desc: 'Fast & efficient', icon: Icons.Banana },
    { id: 'sdxl', name: 'SDXL 1.0', desc: 'High quality stable diffusion', icon: Icons.Stability },
  ],
  text: [
    { id: 'groq', name: 'Groq Llama 3', desc: 'Siêu nhanh & thông minh', icon: Icons.Groq },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Fastest & smartest model', icon: Icons.Gemini },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Next-gen performance', icon: Icons.Gemini },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Reasoning & complexity', icon: Icons.Gemini },
  ],
  video: [
    { id: 'nano-video', name: 'Nano Video', desc: 'Smooth generation', icon: Icons.Video },
    { id: 'runway', name: 'Runway Gen-2', desc: 'Cinematic realism', icon: Icons.Film },
  ]
};

const DashboardHome = ({ onGenerate, onCollapseSidebar, initialPrompt, onChatToggle }) => {
  const [inputType, setInputType] = useState('image');

  // Auto-switch to chat if initialPrompt is present
  useEffect(() => {
    if (initialPrompt) {
      setPromptForChat(initialPrompt);
      setIsChatMode(true);
      if (onChatToggle) onChatToggle(true);
      if (onCollapseSidebar) onCollapseSidebar(true);
    }
  }, [initialPrompt, onCollapseSidebar, onChatToggle, onCollapseSidebar]); // Added dependencies to fix potential lint warning too

  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch real history
        const result = await getProjects();
        if (result.success) {
          // Map raw projects to UI format
          const mapped = result.projects.slice(0, 5).map(p => {
            // Extract a clean title
            let cleanTitle = p.title || 'Sáng tạo mới';
            if (cleanTitle.trim().startsWith('{') || cleanTitle.trim().startsWith('"')) {
              try {
                const parsed = JSON.parse(cleanTitle);
                if (typeof parsed === 'string') {
                  cleanTitle = parsed;
                } else if (typeof parsed === 'object' && parsed !== null) {
                  cleanTitle = parsed.prompt || parsed.text || parsed.title || Object.values(parsed).find(v => typeof v === 'string') || 'Sáng tạo mới';
                }
              } catch (e) {
                // ignore parse error for malformed titles
              }
            }

            return {
              id: p.id,
              title: cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle,
              type: p.type || 'text',
              date: new Date(p.createdAt?._seconds * 1000 || Date.now()).toLocaleDateString(),
              imageUrl: p.content?.imageUrl || p.content?.previewUrl
            };
          });
          setRecentProjects(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchProjects();
  }, []);

  const currentModels = MODELS[inputType] || MODELS.image;
  const [selectedModel, setSelectedModel] = useState(currentModels[0]);

  // Update selected model when input type changes
  useEffect(() => {
    setSelectedModel(MODELS[inputType]?.[0] || MODELS.image[0]);
  }, [inputType]);

  const [inputValue, setInputValue] = useState('');
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isAutoRatio, setIsAutoRatio] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [isVideoRatioLangMenuOpen, setIsVideoRatioLangMenuOpen] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
  const [videoLanguage, setVideoLanguage] = useState('EN');

  // Animation States
  const [isChatMode, setIsChatMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [promptForChat, setPromptForChat] = useState('');
  const [morphOffsetY, setMorphOffsetY] = useState(null); // for Home → AgentChat: form starts here then animates down

  // Refs
  const menuRef = useRef(null);
  const modelMenuRef = useRef(null);
  const ratioMenuRef = useRef(null);
  const videoRatioLangMenuRef = useRef(null);
  const inputRef = useRef(null);
  const holdTimeoutRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsPlusMenuOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target)) {
        setIsRatioMenuOpen(false);
      }
      if (videoRatioLangMenuRef.current && !videoRatioLangMenuRef.current.contains(event.target)) {
        setIsVideoRatioLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Back Navigation Animation
  useEffect(() => {
    if (!isReturning) return;

    let rafId2;
    const rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        // Brief hold at bottom so transition up is visible and smooth
        holdTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 60);
      });
    });

    const returnDuration = 400;
    const doneTimer = setTimeout(() => setIsReturning(false), returnDuration + 150);

    return () => {
      cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      clearTimeout(doneTimer);
    };
  }, [isReturning]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Same pattern as "back": switch view first, then animate (no DOM swap in the middle).
    const rect = inputRef.current?.getBoundingClientRect();
    const fromBottom = 44; // AgentChat: pb-4 + disclaimer block
    const offsetY = rect
      ? rect.top - (window.innerHeight - fromBottom - rect.height)
      : 0;
    // Preserve "distance to bottom" so when user goes back, Dashboard form starts at bottom (translateY) then animates up
    const distanceToBottom = rect
      ? (window.innerHeight - fromBottom - rect.height) - rect.top
      : 400;

    if (onChatToggle) onChatToggle(true);
    if (onCollapseSidebar) onCollapseSidebar(true);
    setTranslateY(distanceToBottom);
    setMorphOffsetY(offsetY);
    setPromptForChat(inputValue);
    setIsChatMode(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBackToDashboard = () => {
    setIsReturning(true);
    setIsTransitioning(true); // Start at "chat position" (translateY)
    setIsChatMode(false);
    setInputValue('');
    setMorphOffsetY(null);
    if (onChatToggle) onChatToggle(false);
    if (onCollapseSidebar) onCollapseSidebar(false);
  };

  if (isChatMode) {
    return (
      <AgentChat
        initialPrompt={promptForChat}
        initialInputType={inputType}
        initialModel={selectedModel}
        initialMorphOffsetY={morphOffsetY}
        onBack={handleBackToDashboard}
      />
    );
  }




  const ratios = [
    { label: '9:16', width: 'w-3', height: 'h-5' },
    { label: '2:3', width: 'w-3.5', height: 'h-5' },
    { label: '3:4', width: 'w-4', height: 'h-5' },
    { label: '1:1', width: 'w-4', height: 'h-4' },
    { label: '4:3', width: 'w-5', height: 'h-4' },
    { label: '3:2', width: 'w-5', height: 'h-3.5' },
    { label: '16:9', width: 'w-6', height: 'h-3.5' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto min-h-screen pb-32 font-sans overflow-hidden">

      {/* Banner */}
      {/* Banner */}
      {/* Banner */}
      <div className={`transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0' : 'opacity-100'}`}>
        {showBanner && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Icons.Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Nano Banana Pro và các mô hình Seedream mới nhất đã sẵn sàng</span>
              <button
                onClick={() => setShowBanner(false)}
                className="ml-2 hover:text-black dark:hover:text-white"
              >
                <Icons.X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Heading */}
      <div className={`text-center mb-14 transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 dark:text-white mb-2 tracking-tight">
          Hãy biến trí tưởng tượng của bạn thành hiện thực.
        </h1>
      </div>

      {/* Input Area - GPU layer and smooth easing for morph */}
      <div
        ref={inputRef}
        className="max-w-3xl mx-auto mb-8 relative z-20"
        style={{
          transform: isTransitioning ? `translate3d(0, ${translateY}px, 0)` : 'none',
          willChange: isTransitioning || isReturning ? 'transform' : 'auto',
          transition: `transform ${isReturning ? 400 : 800}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      >

        {/* Toggle Tabs - Minimalist Style */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex gap-8 transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {[
            { id: 'video', label: 'Video', icon: Icons.ClapperboardPlay },
            { id: 'image', label: 'Image', icon: Icons.Gallery },
            { id: 'text', label: 'Văn bản', icon: Icons.Notebook },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = inputType === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setInputType(item.id)}
                className={`flex items-center gap-2 px-1 py-2 transition-all duration-300 whitespace-nowrap relative group
                  ${isActive
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium'
                  }`}
              >
                <Icon size={18} isActive={isActive} className={`transition-colors duration-300 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                <span className="text-sm tracking-tight capitalize">
                  {item.label}
                </span>

                {/* Minimalist Bottom Indicator */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 rounded-full
                  ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-30'}
                `}></span>
              </button>
            );
          })}
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-6 shadow-lg transition-all duration-200 relative z-20 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200/80 dark:focus-within:ring-gray-600/50 focus-within:shadow-xl">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-16 bg-transparent border-0 focus:border-0 focus:ring-0 ring-0 focus:outline-none outline-none appearance-none text-lg text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:placeholder-gray-500 dark:focus:placeholder-gray-400 resize-none leading-relaxed shadow-none transition-colors duration-200"
            placeholder={
              inputType === 'video'
                ? "Hãy mô tả video bạn muốn tạo. Thêm liên kết, hình ảnh hoặc tài liệu để có kết quả chính xác hơn."
                : inputType === 'image'
                  ? 'Mô tả hình ảnh bạn muốn thiết kế và sử dụng "/" để đánh dấu văn bản cần thêm'
                  : 'Mô tả nội dung bạn muốn viết hoặc chỉnh sửa...'
            }
          />

          <div className="flex items-center justify-between mt-4 px-1 transition-opacity duration-100">
            <div className="flex items-center gap-2 relative">
              {/* Plus Button with Menu (Shared) */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <Icons.PlusCircle size={24} isActive={isPlusMenuOpen} />
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

                    {/* Nested Menu Item */}
                    <div className="relative group">
                      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <Icons.MoreHorizontal size={18} className="text-black/60" />
                          Thêm
                        </div>
                        <Icons.ChevronRight size={14} className="text-black/40" />
                      </button>

                      {/* Nested Menu */}
                      <div className="absolute top-0 left-full ml-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0">
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                          <Icons.Link size={18} className="text-black/60" />
                          Nhập từ liên kết sản phẩm
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                          <Icons.Box size={18} className="text-black/60" />
                          Tải lên từ Dropbox
                        </button>

                        {/* QR Code Hover Item */}
                        <div className="relative group/qr">
                          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                            <div className="flex items-center gap-3">
                              <Icons.Smartphone size={18} className="text-black/60" />
                              Tải lên từ điện thoại
                            </div>
                            <Icons.ChevronRight size={14} className="text-black/40" />
                          </button>

                          {/* QR Code Popup */}
                          <div className="absolute top-0 left-full ml-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 invisible opacity-0 group-hover/qr:visible group-hover/qr:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover/qr:translate-x-0 flex flex-col items-center text-center">
                            <h3 className="font-bold text-black dark:text-white mb-4">Quét mã QR để tải lên</h3>
                            <div className="bg-white p-2 rounded-lg shadow-inner mb-4">
                              <Icons.QrCode size={120} className="text-black" />
                            </div>
                            <p className="text-xs text-black/60 dark:text-gray-400">Sử dụng camera điện thoại để quét mã và tải ảnh lên</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Context Specific Toolbar Buttons */}
              {inputType === 'video' && (
                <>
                  <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-black dark:text-gray-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group">
                    <Icons.Box size={16} isActive={false} />
                  </button>
                  <div className="relative">
                    <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-black dark:text-gray-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group">
                      <Icons.Lightbulb size={16} isActive={false} />
                    </button>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></span>
                  </div>

                  <div className="relative" ref={videoRatioLangMenuRef}>
                    <button
                      onClick={() => setIsVideoRatioLangMenuOpen(!isVideoRatioLangMenuOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isVideoRatioLangMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <Icons.TuningSquare size={14} isActive={isVideoRatioLangMenuOpen} />
                      <span>{videoAspectRatio}</span>
                      <span className="text-gray-400 dark:text-gray-600 mx-1">|</span>
                      <span className="text-black/60 dark:text-gray-400">{videoLanguage}</span>
                    </button>
                    {isVideoRatioLangMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 tracking-tight">Tỷ lệ khung hình</h3>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {VIDEO_RATIOS.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setVideoAspectRatio(r.id)}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${videoAspectRatio === r.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`}
                            >
                              <span className={`block border-2 border-current rounded-sm ${r.width} ${r.height}`} />
                              <span className="text-xs font-semibold">{r.label}</span>
                            </button>
                          ))}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 tracking-tight">Ngôn ngữ</h3>
                        <div className="space-y-0.5">
                          {VIDEO_LANGUAGES.map((lang) => (
                            <button
                              key={lang.id}
                              onClick={() => setVideoLanguage(lang.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${videoLanguage === lang.id ? 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                            >
                              {lang.label}
                              {videoLanguage === lang.id && <Icons.CheckCircle size={16} className="text-purple-500 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group">
                    <Icons.Clock size={14} isActive={false} />
                    <span>Schedule</span>
                  </button>
                </>
              )}

              {(inputType === 'image' || inputType === 'text') && (
                <div className="relative" ref={modelMenuRef}>
                  <button
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isModelMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <selectedModel.icon size={14} isActive />
                    <span>{selectedModel.name}</span>
                  </button>

                  {isModelMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {currentModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelMenuOpen(false);
                          }}
                          className={`flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer text-left transition-colors group ${selectedModel.id === model.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                            <model.icon size={20} isActive={selectedModel.id === model.id} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-black dark:text-white mb-0.5">{model.name}</div>
                            <div className="text-[11px] text-black dark:text-gray-400 leading-tight">{model.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {inputType === 'image' && (
                <>
                  {/* Feature Pills - Ratio */}
                  <div className="relative" ref={ratioMenuRef}>
                    <button
                      onClick={() => setIsRatioMenuOpen(!isRatioMenuOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isRatioMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <Icons.Pip size={14} isActive={isRatioMenuOpen} />
                      <span>{isAutoRatio ? 'Tỉ lệ' : selectedRatio}</span>
                    </button>

                    {/* Ratio Dropdown Menu */}
                    {isRatioMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">Tỉ lệ khung hình</span>
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto</span>
                            <button
                              onClick={() => setIsAutoRatio(!isAutoRatio)}
                              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isAutoRatio ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${isAutoRatio ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                            </button>
                          </div>
                        </div>

                        <div className={`grid grid-cols-4 gap-2 transition-opacity duration-200 ${isAutoRatio ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                          {ratios.map((ratio) => (
                            <button
                              key={ratio.label}
                              onClick={() => {
                                setSelectedRatio(ratio.label);
                                setIsRatioMenuOpen(false);
                              }}
                              className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl transition-all border ${selectedRatio === ratio.label
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                              <div className="h-8 flex items-center justify-center">
                                <div className={`${ratio.width} ${ratio.height} border-[1.5px] rounded-sm transition-colors ${selectedRatio === ratio.label
                                  ? 'border-purple-600 dark:border-purple-400 bg-purple-100/50 dark:bg-purple-400/20'
                                  : 'border-gray-400 dark:border-gray-500'
                                  }`}></div>
                              </div>
                              <span className={`text-[10px] font-bold ${selectedRatio === ratio.label
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>{ratio.label}</span>
                            </button>
                          ))}
                        </div>

                        {isAutoRatio && (
                          <div className="mt-4 p-2.5 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium leading-relaxed">
                              Chế độ tự động sẽ chọn tỉ lệ tối ưu dựa trên nội dung bạn mô tả.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {inputType === 'text' && (
                <>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b]">
                    <Icons.LayoutGrid size={14} />
                    <span>Mẫu</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b]">
                    <Icons.Sliders size={14} />
                    <span>Độ dài</span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleSend}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] ${inputValue.trim() ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
              disabled={!inputValue.trim()}
            >
              <Icons.ArrowUp size={16} />
            </button>
          </div>
        </div>

        {/* History Links */}
        <div className={`flex justify-center gap-6 mt-6 text-xs text-black/50 dark:text-gray-400 font-medium transition-opacity duration-100 ${isTransitioning || isReturning ? 'opacity-0' : ''}`}>
          <div className="flex items-center gap-2">
            <span>Lịch sử</span>
            <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <button className="hover:text-black dark:hover:text-gray-300 flex items-center gap-1 transition-colors">Wool-felt winter village <Icons.ArrowRight size={10} className="-rotate-45" /></button>
          <button className="hover:text-black dark:hover:text-gray-300 flex items-center gap-1 transition-colors">Multiple poster editing <Icons.ArrowRight size={10} className="-rotate-45" /></button>
        </div>
      </div>

      <div className={`transition-opacity duration-300 delay-100 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

        {/* Popular Features Section */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-tight">Tính năng phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature Card 1 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl flex items-center gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="AI Talking Photo" />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                  <Icons.MoreHorizontal size={10} />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-1 truncate">AI talking photo</h3>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  Sử dụng ngay <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl flex items-center gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Avatar Video" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-1 truncate">Avatar video</h3>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  Sử dụng ngay <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl flex items-center gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative shadow-sm group-hover:scale-105 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Product photo" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white mb-1 truncate">Product photo</h3>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  Sử dụng ngay <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl flex items-center gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-16 h-16 rounded-xl bg-orange-100 overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Vibe marketing" />
              </div>
              <div className="min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-[13px] font-bold text-gray-900 dark:text-white truncate">Vibe marketing</h3>
                  <span className="text-[8px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold ml-1">Beta</span>
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  Sử dụng ngay <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Chats Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 tracking-tight">Sáng tạo gần đây</h2>
            <button className="text-[13px] text-purple-600 font-semibold hover:underline">Xem tất cả</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((item) => (
                <div
                  key={item.id}
                  className="group flex-shrink-0 w-[240px] bg-white dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer p-2.5 flex items-center gap-3"
                >
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${item.type === 'image' ? 'bg-purple-50 text-purple-600' :
                    item.type === 'video' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        {item.type === 'image' && <Icons.Image size={18} />}
                        {item.type === 'video' && <Icons.Video size={18} />}
                        {(!item.type || item.type === 'text') && <Icons.FileText size={18} />}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-40">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{item.type || 'text'}</span>
                      <span className="text-[9px] whitespace-nowrap">• {item.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full bg-gray-50 dark:bg-gray-800/40 rounded-3xl py-10 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                <Icons.Inbox className="text-gray-300 dark:text-gray-600 mb-2" size={28} />
                <p className="text-sm text-gray-400 font-medium">Chưa có lịch sử hoạt động</p>
              </div>
            )}
          </div>
        </div>

        {/* Trending Section */}
        <div>
          <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-6">
            <button className="pb-3 text-sm font-bold text-black dark:text-white border-b-2 border-black dark:border-white">
              Thịnh hành trên TikTok
            </button>
            <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              Cảm hứng hình ảnh
            </button>
            <div className="ml-auto">
              <button className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1">
                Xem thêm <Icons.ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { color: 'bg-orange-50', image: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=400&q=80', title: 'Trưng bày sản phẩm' },
              { color: 'bg-gray-50', image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&w=400&q=80', title: 'Tối giản' },
              { color: 'bg-yellow-50', image: 'https://images.unsplash.com/photo-1534067783865-9594047a240d?auto=format&fit=crop&w=400&q=80', title: 'Thiên nhiên' },
              { color: 'bg-blue-50', image: 'https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?auto=format&fit=crop&w=400&q=80', title: 'Đô thị' }
            ].map((item, i) => (
              <div key={i} className={`aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer ${item.color}`}>
                {item.image && <img src={item.image} alt="Trending" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                    <Icons.Wand2 size={10} />
                    {item.title}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40">
                    <Icons.Play size={24} fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Bubble */}
        <div className="fixed bottom-8 right-8">
          <button className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors hover:scale-105 active:scale-95">
            <Icons.HelpCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
