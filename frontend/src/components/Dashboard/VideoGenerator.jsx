// Video Generator - Copy 100% từ DashboardHome tab Video
import { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { AgentChat } from './AgentChat';
import { uploadFile } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const VIDEO_RATIOS = [
  { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4', desc: 'Landscape' },
  { id: '9:16', label: '9:16', width: 'w-4', height: 'h-7', desc: 'Portrait' },
];

const VIDEO_MODES = [
  { id: 'text-to-video', label: 'Từ văn bản sang video', icon: Icons.Notebook, desc: 'Tạo video từ prompt text' },
  { id: 'frame-to-video', label: 'Tạo video từ các khung hình', icon: Icons.Gallery, desc: '2 ảnh đầu/cuối' },
  { id: 'ingredients-to-video', label: 'Tạo video từ các thành phần', icon: Icons.Layers, desc: 'Tối đa 3 ảnh tham chiếu' },
];

const VIDEO_LANGUAGES = [
  { id: 'EN', label: 'English' },
  { id: 'VI', label: 'Tiếng Việt' },
];

const MODELS = {
  video: [
    { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', desc: 'Nhanh, tiết kiệm', icon: Icons.Veo, credits: 300 },
    { id: 'veo-3.1-standard', name: 'Veo 3.1 Standard', desc: 'Chất lượng cao', icon: Icons.Veo, credits: 500 },
  ]
};

const VIDEO_DURATIONS = [4, 6, 8];

const VideoGenerator = () => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [videoMode, setVideoMode] = useState('text-to-video');
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
  const [videoDuration, setVideoDuration] = useState(8);
  const [videoX2, setVideoX2] = useState(false);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [selectedModel, setSelectedModel] = useState(MODELS.video[0]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Menu states
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tuningSubMenu, setTuningSubMenu] = useState(null);
  const [plusMenuFrameSlot, setPlusMenuFrameSlot] = useState(null);

  // Chat mode
  const [isChatMode, setIsChatMode] = useState(false);
  const [promptForChat, setPromptForChat] = useState('');
  const [initialFileUrls, setInitialFileUrls] = useState([]);

  // Refs
  const menuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const tuningMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const plusMenuFrameSlotRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target)) {
        setIsModeMenuOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsPlusMenuOpen(false);
        setPlusMenuFrameSlot(null);
        plusMenuFrameSlotRef.current = null;
      }
      if (tuningMenuRef.current && !tuningMenuRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
        setTuningSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxH = 12 * 16;
    const h = Math.min(ta.scrollHeight, maxH);
    ta.style.height = `${h}px`;
  }, [inputValue]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsPlusMenuOpen(false);
    setPlusMenuFrameSlot(null);
    plusMenuFrameSlotRef.current = null;

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error((t.dashboard.uploadModal?.fileTooLarge || 'File {name} exceeds 20MB').replace('{name}', file.name));
        continue;
      }
      toast.loading(t.dashboard.chat?.uploadingImage || 'Uploading...', { id: `uploading-${file.name}` });
      try {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes(',')) throw new Error('Invalid file data format');
        const base64 = base64Data.split(',')[1];
        const result = await uploadFile({ fileName: file.name, fileType: file.type || 'application/octet-stream', fileSize: file.size, fileData: base64 });
        if (result.success) {
          setUploadedFiles(prev => [...prev, { url: result.fileUrl, name: file.name, type: file.type }]);
          toast.dismiss(`uploading-${file.name}`);
          toast.success(t.dashboard.chat?.fileUploaded || 'File uploaded');
        } else throw new Error(result.message || 'Upload failed');
      } catch (err) {
        console.error('File upload error:', err);
        toast.dismiss(`uploading-${file.name}`);
        toast.error((t.dashboard.chat?.uploadError || 'Upload failed') + ': ' + file.name);
      }
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    if (videoMode === 'frame-to-video') {
      setUploadedFiles(prev => {
        const a = [prev[0] ?? null, prev[1] ?? null];
        a[index] = null;
        return a;
      });
    } else {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const swapFrameOrder = () => {
    if (uploadedFiles.length < 2) return;
    setUploadedFiles(prev => [prev[1], prev[0]]);
    toast.success('Đã đổi thứ tự ảnh đầu / ảnh cuối');
  };

  const handleSend = () => {
    const effectiveFiles = (videoMode === 'frame-to-video') ? uploadedFiles.filter(Boolean) : uploadedFiles;
    if (!inputValue.trim() && effectiveFiles.length === 0) return;

    // Chuyển sang AgentChat giống như DashboardHome
    setPromptForChat(inputValue);
    setInitialFileUrls(effectiveFiles.map(f => f.url));
    setIsChatMode(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBackToDashboard = () => {
    setIsChatMode(false);
    setPromptForChat('');
    setInitialFileUrls([]);
    setInputValue('');
  };

  // Nếu đang ở chế độ chat, hiển thị AgentChat
  if (isChatMode) {
    return (
      <AgentChat
        initialPrompt={promptForChat}
        initialInputType="video"
        initialModel={selectedModel}
        initialFileUrls={initialFileUrls}
        initialVideoMode={videoMode}
        initialVideoAspectRatio={videoAspectRatio}
        initialVideoDuration={videoDuration}
        initialVideoX2={videoX2}
        initialVideoResolution={videoResolution}
        initialVideoLanguage="EN"
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white dark:bg-[#0f172a]">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto min-h-screen pb-32 font-sans overflow-hidden w-full">

        {/* Main Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-white mb-2 tracking-tight px-4">
            Biến mọi thứ thành video
          </h1>
        </div>

        {/* Input Area - Giữ nguyên như DashboardHome */}
        <div className="w-full max-w-3xl mx-auto mb-8 relative z-20">
          {/* Form: layout y hệt như DashboardHome */}
          <div className="relative w-full bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#27272a] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-2.5 sm:p-3 md:p-4 shadow-xl transition-all duration-300 focus-within:border-gray-300 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-gray-200/80 dark:focus-within:ring-zinc-700/50 relative z-20">
            
            {/* Top row: left = mode, right = model / x2 / filter */}
            <div className="flex flex-row justify-between items-center gap-2 mb-2">
              <div className="relative min-w-0" ref={modeMenuRef}>
                {/* Video Mode Dropdown */}
                <button
                  type="button"
                  onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                  className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-900 dark:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-150 border border-transparent dark:border-gray-800"
                >
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">
                    {VIDEO_MODES.find(m => m.id === videoMode)?.icon && (() => {
                      const MIcon = VIDEO_MODES.find(m => m.id === videoMode)?.icon;
                      return MIcon ? <MIcon size={18} className="sm:w-5 sm:h-5" /> : null;
                    })()}
                  </span>
                  <span className="max-w-[140px] sm:max-w-[220px] truncate">{VIDEO_MODES.find(m => m.id === videoMode)?.label}</span>
                  <Icons.ChevronDown size={18} className={`shrink-0 transition-transform sm:w-5 sm:h-5 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isModeMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-200 dark:border-[#27272a] p-2 z-50">
                    {VIDEO_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => { setVideoMode(mode.id); setIsModeMenuOpen(false); }}
                        className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${videoMode === mode.id ? 'bg-gray-100 dark:bg-[#252525] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#252525] text-gray-700 dark:text-gray-300'}`}
                      >
                        <span className={`shrink-0 ${videoMode === mode.id ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <mode.icon size={20} isActive={videoMode === mode.id} />
                        </span>
                        <span className="font-medium text-sm">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 self-end md:self-auto shrink-0">
                {/* Model Badge */}
                <div className="flex items-center h-8 sm:h-9 gap-1 sm:gap-1.5 px-2 sm:px-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-full text-xs sm:text-sm font-medium text-gray-900 dark:text-white border border-transparent dark:border-gray-800 cursor-default select-none transition-colors">
                  <span className="shrink-0 text-gray-900 dark:text-white"><selectedModel.icon size={18} className="sm:w-5 sm:h-5" /></span>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate leading-none">{selectedModel.name}</span>
                </div>

                {/* Ratio/Count Badge */}
                <div className="flex items-center h-8 sm:h-9 gap-1 sm:gap-1.5 px-2 sm:px-3 text-gray-500 dark:text-gray-400 cursor-default select-none border border-transparent rounded-full transition-colors"
                  title={`Tỷ lệ: ${videoAspectRatio}`}>
                  <Icons.RectangleFrame size={18} className={`sm:w-5 sm:h-5 ${videoAspectRatio.includes('9:16') ? 'rotate-90' : ''}`} />
                  <span className="text-xs sm:text-sm font-medium leading-none">x{videoX2 ? '2' : '1'}</span>
                </div>

                {/* Unified Tuning Icon + Dropdown */}
                <div className="relative" ref={tuningMenuRef}>
                  <button
                    type="button"
                    onClick={() => { setIsSettingsOpen(!isSettingsOpen); setTuningSubMenu(null); }}
                    className={`group h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors border rounded-full ${isSettingsOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-transparent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'}`}
                    title="Cài đặt video"
                  >
                    <Icons.TuningSquare size={18} className="sm:w-5 sm:h-5" isActive={isSettingsOpen} />
                  </button>
                  {isSettingsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[24rem] md:w-[32rem] max-w-[32rem] bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 sm:p-3 z-50 space-y-2 sm:space-y-3">
                      {/* Row 1: Ratio + Count */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {/* Aspect Ratio */}
                        <div className="flex-1 relative">
                          <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'ratio' ? null : 'ratio')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Tỷ lệ khung hình</span>
                              <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                                <Icons.Rectangle size={16} className={videoAspectRatio.includes('9:16') ? 'rotate-90' : ''} />
                                {VIDEO_RATIOS.find(r => r.id === videoAspectRatio)?.desc || videoAspectRatio}
                              </span>
                            </div>
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'ratio' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {tuningSubMenu === 'ratio' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                              {VIDEO_RATIOS.map((r) => (
                                <button key={r.id} type="button"
                                  onClick={() => { setVideoAspectRatio(r.id); setTuningSubMenu(null); }}
                                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-lg ${videoAspectRatio === r.id ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                  <Icons.Rectangle size={18} className={(r.id === '9:16' || r.id === '3:4') ? 'rotate-90' : ''} />
                                  <span className="font-medium text-sm">{r.desc} ({r.label})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Number of videos */}
                        <div className="flex-1 relative">
                          <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'count' ? null : 'count')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Số lượng</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{videoX2 ? '2' : '1'}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'count' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {tuningSubMenu === 'count' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                              {[{ v: false, l: '1' }, { v: true, l: '2' }].map((opt) => (
                                <button key={String(opt.v)} type="button"
                                  onClick={() => { setVideoX2(opt.v); setTuningSubMenu(null); }}
                                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors rounded-lg ${videoX2 === opt.v ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                  {opt.l}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Duration + Resolution */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                          <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'duration' ? null : 'duration')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Thời lượng</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{videoDuration}s</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'duration' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {tuningSubMenu === 'duration' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                              {VIDEO_DURATIONS.map((d) => (
                                <button key={d} type="button"
                                  onClick={() => { setVideoDuration(d); setTuningSubMenu(null); }}
                                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors rounded-lg ${videoDuration === d ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                  {d}s
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 relative">
                          <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'resolution' ? null : 'resolution')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Độ phân giải</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{videoResolution === '4k' ? '4K' : videoResolution}</span>
                            </div>
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'resolution' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {tuningSubMenu === 'resolution' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                              {[{ v: '720p', l: '720p' }, { v: '1080p', l: '1080p' }, { v: '4k', l: '4K' }].map((r) => (
                                <button key={r.v} type="button"
                                  onClick={() => { setVideoResolution(r.v); setTuningSubMenu(null); }}
                                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors rounded-lg ${videoResolution === r.v ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                  {r.l}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Model selection */}
                      <div className="relative">
                        <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'model' ? null : 'model')}
                          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Mô hình</span>
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                              <selectedModel.icon size={16} />
                              {selectedModel.name}
                            </span>
                          </div>
                          <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'model' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {tuningSubMenu === 'model' && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                            {MODELS.video.map((model) => (
                              <button key={model.id} type="button"
                                onClick={() => { setSelectedModel(model); setTuningSubMenu(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-lg ${selectedModel.id === model.id ? 'bg-gray-100 dark:bg-[#303030]' : 'hover:bg-gray-50 dark:hover:bg-[#303030]'}`}>
                                <span className={selectedModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                  <model.icon size={18} />
                                </span>
                                <span className={`text-sm font-medium ${selectedModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{model.name}</span>
                                {model.credits != null && (<span className={`text-xs font-semibold ml-auto ${selectedModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{model.credits}cr</span>)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Credit info */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                        Dựa trên chế độ cài đặt hiện tại, bạn cần dùng <span className="text-gray-900 dark:text-white font-bold underline cursor-pointer">
                          {selectedModel.credits * (videoX2 ? 2 : 1)} tín dụng
                        </span> cho mỗi lần tạo.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="w-full min-h-[2.5rem] sm:min-h-[2.75rem] py-1 mb-1 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full min-h-[2.5rem] sm:min-h-[2.75rem] max-h-48 bg-transparent border-none p-0 text-sm sm:text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 resize-none leading-relaxed overflow-x-hidden overflow-y-auto break-words"
                placeholder={t.dashboard.home.placeholderVideo}
              />
            </div>

            {/* Uploaded Files Preview */}
            <div className="flex justify-between items-end mt-2">
              {/* Từ văn bản sang video: không có nút + */}
              {videoMode === 'text-to-video' && (
                <div />
              )}
              {/* Tạo video từ các khung hình: 2 nút đầu & cuối */}
              {videoMode === 'frame-to-video' && (
                <div className="flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => { plusMenuFrameSlotRef.current = 0; setPlusMenuFrameSlot(0); setIsPlusMenuOpen(true); }}
                      className={`relative group/thumb w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all ${isPlusMenuOpen && plusMenuFrameSlot === 0 ? 'bg-gray-200 dark:bg-[#252525]' : ''}`}
                      title={uploadedFiles[0] ? 'Khung hình đầu tiên' : 'Ảnh đầu (khung hình đầu video)'}
                    >
                      {uploadedFiles[0] ? (
                        uploadedFiles[0].type?.startsWith('image/') ? (
                          <img src={uploadedFiles[0].url} alt={uploadedFiles[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"><Icons.FileText size={18} /></div>
                        )
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">{isPlusMenuOpen && plusMenuFrameSlot === 0 ? <Icons.X size={20} /> : <Icons.Plus size={20} />}</span>
                      )}
                      {uploadedFiles[0]?.type?.startsWith('image/') && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(0); }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        >
                          <Icons.X size={10} />
                        </button>
                      )}
                    </button>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => { plusMenuFrameSlotRef.current = 1; setPlusMenuFrameSlot(1); setIsPlusMenuOpen(true); }}
                      className={`relative group/thumb w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all ${isPlusMenuOpen && plusMenuFrameSlot === 1 ? 'bg-gray-200 dark:bg-[#252525]' : ''}`}
                      title={uploadedFiles[1] ? 'Khung hình cuối' : 'Ảnh cuối (khung hình cuối video)'}
                    >
                      {uploadedFiles[1] ? (
                        uploadedFiles[1].type?.startsWith('image/') ? (
                          <img src={uploadedFiles[1].url} alt={uploadedFiles[1].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"><Icons.FileText size={18} /></div>
                        )
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">{isPlusMenuOpen && plusMenuFrameSlot === 1 ? <Icons.X size={20} /> : <Icons.Plus size={20} />}</span>
                      )}
                      {uploadedFiles[1]?.type?.startsWith('image/') && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(1); }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        >
                          <Icons.X size={10} />
                        </button>
                      )}
                    </button>
                  </div>
                  {uploadedFiles.filter(Boolean).length === 2 && (
                    <button
                      type="button"
                      onClick={swapFrameOrder}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-500 dark:text-gray-400 transition-all"
                      title="Đổi thứ tự ảnh đầu/cuối"
                    >
                      <Icons.ArrowLeftRight size={18} />
                    </button>
                  )}
                </div>
              )}
              {/* Tạo video từ các thành phần: tối đa 3 ảnh */}
              {videoMode === 'ingredients-to-video' && (
                <div className="flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="relative shrink-0 group">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] ring-2 ring-transparent">
                        {file?.type?.startsWith('image/') ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400"><Icons.FileText size={18} /></div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icons.X size={10} />
                      </button>
                    </div>
                  ))}
                  {uploadedFiles.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-500 dark:text-gray-400 transition-all"
                    >
                      <Icons.Plus size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim() && (videoMode === 'text-to-video' || uploadedFiles.filter(Boolean).length === 0)}
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F0F0F] active:scale-95 shadow-lg dark:shadow-none border dark:border-gray-700 ${
                  (inputValue.trim() || uploadedFiles.filter(Boolean).length > 0)
                    ? 'bg-gray-900 dark:bg-[#2A2A2A] hover:bg-black dark:hover:bg-[#333333] text-white dark:text-gray-300 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500'
                    : 'bg-gray-200 dark:bg-[#252525] text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icons.ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-20 w-full"></div>

        {/* Tools Grid - 6 công cụ */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { id: 'avatar-video', name: 'Avatar video', icon: Icons.User },
              { id: 'talking-photo', name: 'AI talking photo', icon: Icons.MessageCircle },
              { id: 'product-showcase', name: 'Product showcase', icon: Icons.Shop },
              { id: 'remove-bg', name: 'Remove background', icon: Icons.Scissors },
              { id: 'quick-cut', name: 'Quick cut', icon: Icons.Scissors },
              { id: 'video-editor', name: 'Video editor', icon: Icons.Edit },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#27272a] rounded-xl hover:bg-gray-50 dark:hover:bg-[#252525] hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#252525] group-hover:bg-gray-200 dark:group-hover:bg-[#303030] transition-colors">
                    <Icon size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    {tool.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-20 w-full"></div>
      </div>
    </div>
  );
};

export default VideoGenerator;
