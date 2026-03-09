// Dashboard Home Component
import { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { AgentChat } from './AgentChat';
import { getProjects, uploadFile, getUploads } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';
import SelectFileModal from './SelectFileModal';
import { useLanguage } from '../../contexts/LanguageContext';

const VIDEO_RATIOS = [
  { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4', desc: 'Landscape' },
  { id: '9:16', label: '9:16', width: 'w-4', height: 'h-7', desc: 'Portrait' },
];

const IMAGE_RATIOS = [
  { id: '1:1', label: '1:1', width: 'w-6', height: 'h-6', desc: 'Square' },
  { id: '4:3', label: '4:3', width: 'w-8', height: 'h-6', desc: 'Standard' },
  { id: '3:4', label: '3:4', width: 'w-6', height: 'h-8', desc: 'Vertical' },
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
    { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', desc: 'Nhanh, tiết kiệm', icon: Icons.Veo, credits: 300 },
    { id: 'veo-3.1-standard', name: 'Veo 3.1 Standard', desc: 'Chất lượng cao', icon: Icons.Veo, credits: 500 },
  ]
};

/** Context-aware: image mode → ảnh only, video mode → ảnh+video, text → all */
const getAcceptTypes = (inputType) => {
  switch (inputType) {
    case 'image': return 'image/*';
    case 'video': return 'image/*,video/mp4,video/webm,video/quicktime';
    default: return 'image/*,video/mp4,video/webm,application/pdf,text/plain,text/markdown,text/csv';
  }
};

/** Format label for accepted file types (e.g. ".png, .jpg, .webp") */
const getAcceptFormatsLabel = (inputType) => {
  switch (inputType) {
    case 'image': return '.png, .jpg, .webp, .heic, .avif';
    case 'video': return '.png, .jpg, .webp, .mp4, .webm';
    default: return '.png, .jpg, .webp, .pdf, .txt';
  }
};

const DashboardHome = ({ onGenerate, onCollapseSidebar, initialPrompt, prefillPrompt, onPrefillConsumed, initialProject, onChatToggle }) => {
  const { t } = useLanguage();
  const [inputType, setInputType] = useState('image');

  const MODELS = {
    image: [
      { id: 'nano-pro', name: 'Nano Banana Pro', desc: t?.dashboard?.models?.nanoPro, icon: Icons.Banana },
      { id: 'nano', name: 'Nano Banana', desc: t?.dashboard?.models?.nano, icon: Icons.Banana },
      { id: 'sdxl', name: 'SDXL 1.0', desc: t?.dashboard?.models?.sdxl, icon: Icons.Stability },
      { id: 'pollinations', name: 'Pollinations Flux', desc: 'Free • Không tốn tín dụng', icon: Icons.Pollinations, credits: 0, free: true },
    ],
  text: [
    { id: 'groq', name: 'Groq Llama 3', desc: t?.dashboard?.models?.groq, icon: Icons.Groq },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: t?.dashboard?.models?.geminiNextGen, icon: Icons.Gemini },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: t?.dashboard?.models?.geminiPro, icon: Icons.Gemini },
  ],
    video: [
      { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', desc: t?.dashboard?.models?.veoFast || 'Nhanh, tiết kiệm', icon: Icons.Veo, credits: 300 },
      { id: 'veo-3.1-standard', name: 'Veo 3.1 Standard', desc: t?.dashboard?.models?.veoStandard || 'Chất lượng cao', icon: Icons.Veo, credits: 500 },
    ]
  };

  // Auto-switch to chat if initialPrompt or initialProject (open existing chat) is present
  useEffect(() => {
    if (initialProject?.messages?.length > 0) {
      setIsChatMode(true);
      if (onChatToggle) onChatToggle(true);
      if (onCollapseSidebar) onCollapseSidebar(true);
    } else if (initialPrompt) {
      setPromptForChat(initialPrompt);
      setIsChatMode(true);
      if (onChatToggle) onChatToggle(true);
      if (onCollapseSidebar) onCollapseSidebar(true);
    }
  }, [initialPrompt, initialProject, onCollapseSidebar, onChatToggle]);

  // Handle prefillPrompt - just fills input WITHOUT triggering chat mode
  useEffect(() => {
    if (prefillPrompt) {
      setInputValue(prefillPrompt);
      // Optionally auto-focus the input
      if (onPrefillConsumed) {
        setTimeout(() => onPrefillConsumed(), 100);
      }
    }
  }, [prefillPrompt, onPrefillConsumed]);

  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects();
        if (result.success) {
          const mapped = result.projects.slice(0, 5).map(p => {
            let cleanTitle = p.title || t.dashboard.chat.newCreation;
            if (cleanTitle.trim().startsWith('{') || cleanTitle.trim().startsWith('"')) {
              try {
                const parsed = JSON.parse(cleanTitle);
                if (typeof parsed === 'string') {
                  cleanTitle = parsed;
                } else if (typeof parsed === 'object' && parsed !== null) {
                  cleanTitle = parsed.prompt || parsed.text || parsed.title || Object.values(parsed).find(v => typeof v === 'string') || t.dashboard.chat.newCreation;
                }
              } catch (e) {
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
  /** Khi mở dropdown từ frame-to-video: 0 = ảnh đầu, 1 = ảnh cuối; null = chế độ thường (append file) */
  const [plusMenuFrameSlot, setPlusMenuFrameSlot] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentUploadsLoading, setRecentUploadsLoading] = useState(false);
  const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isAutoRatio, setIsAutoRatio] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [isVideoRatioLangMenuOpen, setIsVideoRatioLangMenuOpen] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
  const [videoLanguage, setVideoLanguage] = useState('EN');
  const [videoMode, setVideoMode] = useState('text-to-video');
  const [videoDuration, setVideoDuration] = useState(8);
  const [videoX2, setVideoX2] = useState(false);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageCount, setImageCount] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Toggle settings panel
  const [tuningSubMenu, setTuningSubMenu] = useState(null); // 'ratio' | 'count' | 'duration' | 'resolution' | 'model'
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false); // Mode dropdown
  const [uploadedFiles, setUploadedFiles] = useState([]); // Array of { url, name, type }
  const [isSelectingFromAssets, setIsSelectingFromAssets] = useState(false);
  const fileInputRef = useRef(null);
  const frameStartInputRef = useRef(null);
  const frameEndInputRef = useRef(null);

  // Animation States
  const [isChatMode, setIsChatMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [promptForChat, setPromptForChat] = useState('');
  const [morphOffsetY, setMorphOffsetY] = useState(null); // for Home → AgentChat: form starts here then animates down

  // Refs
  const menuRef = useRef(null);
  const ratioMenuRef = useRef(null);
  const tuningMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  /** Ref giữ slot khi upload bất đồng bộ (frame-to-video) để gán đúng ảnh sau khi upload xong */
  const plusMenuFrameSlotRef = useRef(null);

  // Load recent uploads when + dropdown opens
  useEffect(() => {
    if (!isPlusMenuOpen) return;
    setRecentUploadsLoading(true);
    getUploads()
      .then((r) => {
        const list = (r.uploads || []).slice(0, 24);
        setRecentUploads(list);
      })
      .catch(() => setRecentUploads([]))
      .finally(() => setRecentUploadsLoading(false));
  }, [isPlusMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsPlusMenuOpen(false);
        setPlusMenuFrameSlot(null);
        plusMenuFrameSlotRef.current = null;
      }
      if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target)) {
        setIsRatioMenuOpen(false);
      }
      if (tuningMenuRef.current && !tuningMenuRef.current.contains(event.target)) {
        setIsVideoRatioLangMenuOpen(false); setIsSettingsOpen(false); setTuningSubMenu(null);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target)) {
        setIsModeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Chuẩn hóa uploadedFiles khi chuyển sang frame-to-video (2 slot: ảnh đầu, ảnh cuối)
  useEffect(() => {
    if (inputType === 'video' && videoMode === 'frame-to-video' && uploadedFiles.length !== 2) {
      setUploadedFiles(prev => [prev[0] ?? null, prev[1] ?? null]);
    }
  }, [inputType, videoMode]);

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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const isFrameSlot = inputType === 'video' && videoMode === 'frame-to-video' && plusMenuFrameSlot !== null;
    const filesToProcess = isFrameSlot ? files.slice(0, 1) : files;

    for (const file of filesToProcess) {
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

        if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes(',')) {
          throw new Error('Invalid file data format');
        }

        const base64 = base64Data.split(',')[1];
        const result = await uploadFile({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          fileData: base64
        });

        if (result.success) {
          const newFile = { url: result.fileUrl, name: file.name, type: file.type };
          const slot = plusMenuFrameSlotRef.current ?? plusMenuFrameSlot;

          if (inputType === 'video' && videoMode === 'frame-to-video' && (slot === 0 || slot === 1)) {
            setUploadedFiles(prev => {
              const next = [prev[0] ?? null, prev[1] ?? null];
              next[slot] = newFile;
              return next;
            });
            plusMenuFrameSlotRef.current = null;
            setPlusMenuFrameSlot(null);
            setIsPlusMenuOpen(false);
          } else {
            // Ingredients mode: enforce max 3
            if (inputType === 'video' && videoMode === 'ingredients-to-video') {
              setUploadedFiles(prev => prev.length >= 3 ? prev : [...prev, newFile]);
              if (uploadedFiles.length >= 3) {
                toast.error('Tối đa 3 ảnh tham chiếu');
              }
            } else {
              setUploadedFiles(prev => [...prev, newFile]);
            }
          }
          toast.dismiss(`uploading-${file.name}`);
          toast.success(t.dashboard.chat?.fileUploaded || 'File uploaded');
          getUploads().then((r) => setRecentUploads((r.uploads || []).slice(0, 24))).catch(() => { });
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast.dismiss(`uploading-${file.name}`);
        const errorMessage = error.message === 'Invalid file data format'
          ? (t.dashboard.chat?.fileReadError || 'Error reading file')
          : (t.dashboard.chat?.uploadError || 'Upload failed');
        toast.error(`${errorMessage}: ${file.name}`);
      }
    }
    e.target.value = '';
  };

  const handleSelectFromAssets = () => {
    setIsSelectingFromAssets(true);
  };

  const handleFileSelected = (file) => {
    const slot = plusMenuFrameSlotRef.current ?? plusMenuFrameSlot;
    const isFrameMode = inputType === 'video' && videoMode === 'frame-to-video';
    if (isFrameMode && (slot === 0 || slot === 1)) {
      setUploadedFiles(prev => {
        const next = [prev[0] ?? null, prev[1] ?? null];
        next[slot] = file;
        return next;
      });
      plusMenuFrameSlotRef.current = null;
      setPlusMenuFrameSlot(null);
      setIsPlusMenuOpen(false);
    } else {
      // Ingredients mode: enforce max 3
      if (inputType === 'video' && videoMode === 'ingredients-to-video') {
        setUploadedFiles(prev => prev.length >= 3 ? prev : [...prev, file]);
        if (uploadedFiles.length >= 3) {
          toast.error('Tối đa 3 ảnh tham chiếu');
          return;
        }
      } else {
        setUploadedFiles(prev => [...prev, file]);
      }
    }
    toast.success('Đã chọn file từ Tài nguyên');
  };

  const removeFile = (index) => {
    if (inputType === 'video' && videoMode === 'frame-to-video') {
      setUploadedFiles(prev => {
        const next = [prev[0] ?? null, prev[1] ?? null];
        next[index] = null;
        return next;
      });
    } else {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  /** Upload one file into a specific slot (0 = start frame, 1 = end frame) for frame-to-video */
  const handleFrameSlotUpload = (slot) => async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const file = files[0];
    if (file.size > 20 * 1024 * 1024) {
      toast.error((t.dashboard.uploadModal?.fileTooLarge || 'File {name} exceeds 20MB').replace('{name}', file.name));
      e.target.value = '';
      return;
    }
    try {
      const reader = new FileReader();
      toast.loading(t.dashboard.chat?.uploadingImage || 'Uploading...', { id: `upload-frame-${slot}` });
      reader.onloadend = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const result = await uploadFile({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64
          });
          if (result.success) {
            setUploadedFiles(prev => {
              const next = [prev[0] ?? null, prev[1] ?? null];
              next[slot] = { url: result.fileUrl, name: file.name, type: file.type };
              return next;
            });
            toast.dismiss(`upload-frame-${slot}`);
            toast.success(t.dashboard.chat?.fileUploaded || 'File uploaded');
          }
        } catch (err) {
          console.error(err);
          toast.dismiss(`upload-frame-${slot}`);
          toast.error(t.dashboard.chat?.uploadError || 'Upload failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error(t.dashboard.chat?.fileReadError || 'Error reading file');
    }
    e.target.value = '';
  };

  /** Đổi vị trí 2 ảnh đầu/cuối (ảnh hưởng video đầu ra) */
  const swapFrameOrder = () => {
    setUploadedFiles(prev => (prev.length === 2 ? [prev[1], prev[0]] : prev));
    toast.success('Đã đổi thứ tự ảnh đầu / ảnh cuối');
  };

  const handleSend = () => {
    const effectiveFiles = (inputType === 'video' && videoMode === 'frame-to-video') ? uploadedFiles.filter(Boolean) : uploadedFiles;
    if (!inputValue.trim() && effectiveFiles.length === 0) return;

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

  // Auto-resize textarea theo nội dung (kiểu ChatGPT/Gemini), không scroll ngang
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxH = 12 * 16; // 12rem = 192px
    const h = Math.min(ta.scrollHeight, maxH);
    ta.style.height = `${h}px`;
  }, [inputValue]);

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
    const hasExistingChat = initialProject?.messages?.length > 0;
    return (
      <AgentChat
        initialPrompt={hasExistingChat ? undefined : promptForChat}
        initialMessages={hasExistingChat ? initialProject.messages : undefined}
        projectId={hasExistingChat ? initialProject.id : undefined}
        initialInputType={initialProject?.type || inputType}
        initialModel={selectedModel}
        initialMorphOffsetY={morphOffsetY}
        initialFileUrls={(inputType === 'video' && videoMode === 'frame-to-video') ? uploadedFiles.filter(Boolean).map(f => f.url) : uploadedFiles.map(f => f.url)}
        initialVideoMode={videoMode}
        initialVideoAspectRatio={videoAspectRatio}
        initialVideoDuration={videoDuration}
        initialVideoX2={videoX2}
        initialVideoResolution={videoResolution}
        initialVideoLanguage={videoLanguage}
        initialImageAspectRatio={imageAspectRatio}
        initialImageCount={imageCount}
        onBack={() => {
          handleBackToDashboard();
          setUploadedFiles([]);
        }}
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
    <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto min-h-screen pb-32 font-sans overflow-hidden">

      {/* Banner */}
      {/* Banner */}
      {/* Banner */}
      <div className={`transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0' : 'opacity-100'}`}>
        {showBanner && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              <Icons.Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
              <span>{t.dashboard.home.banner}</span>
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
      <div className={`text-center mb-10 sm:mb-14 transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-gray-900 dark:text-white mb-2 tracking-tight px-4">
          {t.dashboard.home.mainHeading}
        </h1>
      </div>

      {/* Input Area - GPU layer and smooth easing for morph */}
      <div
        ref={inputRef}
        className="w-full max-w-3xl mx-auto mb-8 relative z-20"
        style={{
          transform: isTransitioning ? `translate3d(0, ${translateY}px, 0)` : 'none',
          willChange: isTransitioning || isReturning ? 'transform' : 'auto',
          transition: `transform ${isReturning ? 400 : 800}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      >

        {/* Toggle Tabs - Minimalist Style */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex gap-4 sm:gap-6 md:gap-8 transition-opacity duration-300 ${isTransitioning || isReturning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {[
            { id: 'video', label: t.dashboard.nav.video || 'Video', icon: Icons.ClapperboardPlay },
            { id: 'image', label: t.dashboard.nav.images || 'Image', icon: Icons.Gallery },
            { id: 'text', label: t.dashboard.nav.textContent || 'Text Content', icon: Icons.Notebook },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = inputType === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setInputType(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-1 py-2 transition-all duration-300 whitespace-nowrap relative group
                  ${isActive
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium'
                  }`}
              >
                <Icon size={18} isActive={isActive} className={`shrink-0 transition-colors duration-300 sm:w-5 sm:h-5 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                <span className="text-xs sm:text-sm tracking-tight capitalize">
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

        {/* Form: layout from HTML sample, compact height */}
        <div className="relative w-full bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#27272a] rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-2.5 sm:p-3 md:p-4 shadow-xl transition-all duration-300 focus-within:border-gray-300 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-gray-200/80 dark:focus-within:ring-zinc-700/50 relative z-20">
          {/* Top row: left = mode, right = model / x2 / filter */}
          <div className="flex flex-row justify-between items-center gap-2 mb-2">
            <div className="relative min-w-0" ref={inputType === 'video' ? modeMenuRef : typeDropdownRef}>
              {/* Video: dropdown chỉ gồm 3 chế độ video */}
              {inputType === 'video' && (
                <>
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
                </>
              )}
              {/* Image: chỉ hiển thị nhãn, không dropdown */}
              {inputType === 'image' && (
                <button
                  type="button"
                  className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-150 border border-transparent dark:border-gray-800 cursor-default"
                >
                  <span className="text-gray-500 dark:text-gray-400 shrink-0"><Icons.Gallery size={18} className="sm:w-5 sm:h-5" /></span>
                  <span>{t.dashboard.nav?.images ?? 'Tạo hình ảnh'}</span>
                </button>
              )}
              {/* Text: chỉ hiển thị nhãn, không dropdown */}
              {inputType === 'text' && (
                <button
                  type="button"
                  className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-150 border border-transparent dark:border-gray-800 cursor-default"
                >
                  <span className="text-gray-500 dark:text-gray-400 shrink-0"><Icons.Notebook size={18} className="sm:w-5 sm:h-5" /></span>
                  <span>{t.dashboard.nav?.textContent ?? 'Nội dung văn bản'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 self-end md:self-auto shrink-0">
              {(inputType === 'image' || inputType === 'video' || inputType === 'text') && (
                <>
                  {/* Model Badge */}
                  <div className="flex items-center h-8 sm:h-9 gap-1 sm:gap-1.5 px-2 sm:px-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-full text-xs sm:text-sm font-medium text-gray-900 dark:text-white border border-transparent dark:border-gray-800 cursor-default select-none transition-colors">
                    <span className="shrink-0 text-gray-900 dark:text-white"><selectedModel.icon size={18} className="sm:w-5 sm:h-5" /></span>
                    <span className="max-w-[80px] sm:max-w-[120px] truncate leading-none">{selectedModel.name}</span>
                  </div>

                  {/* Ratio/Count Badge (for Video & Image) */}
                  {(inputType === 'video' || inputType === 'image') && (
                    <div className="flex items-center h-8 sm:h-9 gap-1 sm:gap-1.5 px-2 sm:px-3 text-gray-500 dark:text-gray-400 cursor-default select-none border border-transparent rounded-full transition-colors"
                      title={inputType === 'video' ? `Tỷ lệ: ${videoAspectRatio}` : `Tỷ lệ: ${imageAspectRatio}`}>
                      <Icons.RectangleFrame size={18} className={`sm:w-5 sm:h-5 ${((inputType === 'video' ? videoAspectRatio : imageAspectRatio).includes('9:16') || (inputType === 'image' && imageAspectRatio === '3:4')) ? 'rotate-90' : ''}`} />
                      <span className="text-xs sm:text-sm font-medium leading-none">x{inputType === 'video' ? (videoX2 ? '2' : '1') : imageCount}</span>
                    </div>
                  )}

                  {/* Unified Tuning Icon + Dropdown */}
                  <div className="relative" ref={tuningMenuRef}>
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(!isSettingsOpen); setTuningSubMenu(null); }}
                      className={`group h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-colors border rounded-full ${isSettingsOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-transparent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'}`}
                      title={inputType === 'video' ? "Cài đặt video" : inputType === 'image' ? "Cài đặt hình ảnh" : "Cài đặt văn bản"}
                    >
                      <Icons.TuningSquare size={18} className="sm:w-5 sm:h-5" isActive={isSettingsOpen} />
                    </button>
                    {isSettingsOpen && (
                      <div className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[24rem] md:w-[32rem] max-w-[32rem] bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 sm:p-3 z-50 space-y-2 sm:space-y-3">
                        {/* Row 1: Ratio + Count (Only for Video & Image) */}
                        {(inputType === 'video' || inputType === 'image') && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {/* Aspect Ratio */}
                            <div className="flex-1 relative">
                              <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'ratio' ? null : 'ratio')}
                                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Tỷ lệ khung hình</span>
                                  <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                                    <Icons.Rectangle size={16} className={((inputType === 'video' ? videoAspectRatio : imageAspectRatio).includes('9:16') || (inputType === 'image' && imageAspectRatio === '3:4')) ? 'rotate-90' : ''} />
                                    {inputType === 'video'
                                      ? (VIDEO_RATIOS.find(r => r.id === videoAspectRatio)?.desc || videoAspectRatio)
                                      : (IMAGE_RATIOS.find(r => r.id === imageAspectRatio)?.desc || imageAspectRatio)
                                    }
                                  </span>
                                </div>
                                <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'ratio' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              {tuningSubMenu === 'ratio' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                                  {(inputType === 'video' ? VIDEO_RATIOS : IMAGE_RATIOS).map((r) => (
                                    <button key={r.id} type="button"
                                      onClick={() => { inputType === 'video' ? setVideoAspectRatio(r.id) : setImageAspectRatio(r.id); setTuningSubMenu(null); }}
                                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-lg ${(inputType === 'video' ? videoAspectRatio : imageAspectRatio) === r.id ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                      <Icons.Rectangle size={18} className={(r.id === '9:16' || r.id === '3:4') ? 'rotate-90' : ''} />
                                      <span className="font-medium text-sm">{r.desc} ({r.label})</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Number of videos/images */}
                            <div className="flex-1 relative">
                              <button type="button" onClick={() => setTuningSubMenu(tuningSubMenu === 'count' ? null : 'count')}
                                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#252525] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight">Số lượng</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">{inputType === 'video' ? (videoX2 ? '2' : '1') : imageCount}</span>
                                </div>
                                <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'count' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                              </button>
                              {tuningSubMenu === 'count' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                                  {inputType === 'video' ? (
                                    [{ v: false, l: '1' }, { v: true, l: '2' }].map((opt) => (
                                      <button key={String(opt.v)} type="button"
                                        onClick={() => { setVideoX2(opt.v); setTuningSubMenu(null); }}
                                        className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors rounded-lg ${videoX2 === opt.v ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                        {opt.l}
                                      </button>
                                    ))
                                  ) : (
                                    [1, 2, 3, 4].map((n) => (
                                      <button key={n} type="button"
                                        onClick={() => { setImageCount(n); setTuningSubMenu(null); }}
                                        className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors rounded-lg ${imageCount === n ? 'bg-gray-100 dark:bg-[#303030] text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'}`}>
                                        {n}
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Row 2: Duration + Resolution (Only for Video) */}
                        {inputType === 'video' && (
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
                                  {[4, 6, 8].map((d) => (
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
                        )}

                        {/* Row 3: Model selection (Common for all) */}
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
                              {currentModels.map((model) => (
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
                            {(() => {
                              const m = selectedModel;
                              if (inputType === 'video') {
                                const qty = videoX2 ? 2 : 1;
                                return `${(m.credits || 0) * qty} tín dụng`;
                              } else if (inputType === 'image') {
                                const perImage = m.id === 'sdxl' ? 4 : 8;
                                return `${perImage * imageCount} tín dụng`;
                              } else {
                                return m.id === 'groq' ? '0 tín dụng' : '~1-2 tín dụng';
                              }
                            })()}
                          </span> cho mỗi lần tạo.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full min-h-[2.5rem] sm:min-h-[2.75rem] py-1 mb-1 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full min-h-[2.5rem] sm:min-h-[2.75rem] max-h-48 bg-transparent border-none p-0 text-sm sm:text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 resize-none leading-relaxed overflow-x-hidden overflow-y-auto break-words"
              placeholder={
                inputType === 'video'
                  ? t.dashboard.home.placeholderVideo
                  : inputType === 'image'
                    ? (t.dashboard.home?.formHintImage ?? 'Tạo hình ảnh từ văn bản và thành phần')
                    : t.dashboard.home.placeholderText
              }
            />
          </div>
          {/* Uploaded Files Preview: frame-to-video hiển thị ảnh trong nút tròn hàng dưới, không dùng pill */}

          <div className="flex justify-between items-end mt-2">
            {/* Từ văn bản sang video: không có nút + (chỉ prompt) */}
            {inputType === 'video' && videoMode === 'text-to-video' && (
              <div />
            )}
            {/* Tạo video từ các khung hình: chỉ 2 nút – khung hình đầu & khung hình cuối; ảnh hiện ngay trong nút +, không chèn thêm ô khác */}
            {inputType === 'video' && videoMode === 'frame-to-video' && (
              <div className="flex items-center gap-1.5 sm:gap-2" ref={menuRef}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => { handleFileUpload(e); }}
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
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 pointer-events-none group-hover/thumb:opacity-100 transition-opacity z-50">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                          <img src={uploadedFiles[0].url} alt={uploadedFiles[0].name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-300 font-medium mt-1.5 px-2 py-1 mx-auto bg-gray-100 dark:bg-gray-800 rounded-md max-w-[140px]">Khung hình đầu tiên</p>
                      </div>
                    )}
                    {uploadedFiles[0] && (
                      <span className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); removeFile(0); }} aria-label="Remove">
                        <Icons.X size={18} className="text-white" />
                      </span>
                    )}
                  </button>
                  {isPlusMenuOpen && plusMenuFrameSlot === 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-[min(90vw,380px)] max-h-[65vh] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white transition-colors text-sm font-medium">
                          <Icons.Upload size={18} className="shrink-0" />
                          <span>{t.dashboard.uploadModal?.upload ?? 'Tải lên'}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">.png, .jpg, .webp</span>
                        </button>
                        <button type="button" onClick={() => { handleSelectFromAssets(); setIsPlusMenuOpen(false); }} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium">
                          <Icons.Folder size={18} className="shrink-0" />
                          <span>{t.dashboard.home?.chooseFromAssets ?? 'Chọn từ Asset'}</span>
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 min-h-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.dashboard.home?.recentUploads ?? 'Tệp gửi lên gần đây'}</p>
                        {recentUploadsLoading ? (
                          <div className="flex justify-center py-8"><div className="flex gap-1"><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} /></div></div>
                        ) : recentUploads.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {recentUploads.map((item) => (
                              <button key={item.id} type="button" onClick={() => { handleFileSelected({ url: item.fileUrl, name: item.fileName, type: item.fileType }); setIsPlusMenuOpen(false); setPlusMenuFrameSlot(null); plusMenuFrameSlotRef.current = null; }} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-500 transition-all flex items-center justify-center">
                                {item.fileType?.startsWith('image/') ? <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" /> : <Icons.FileText size={28} className="text-gray-500 dark:text-gray-400" />}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <Icons.Folder size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.selectFile?.uploadFirst ?? 'Chưa có file nào. Tải lên để sử dụng.'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={swapFrameOrder}
                  disabled={uploadedFiles.filter(Boolean).length !== 2}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="Đổi thứ tự ảnh đầu / ảnh cuối"
                >
                  <Icons.ArrowLeftRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => { plusMenuFrameSlotRef.current = 1; setPlusMenuFrameSlot(1); setIsPlusMenuOpen(true); }}
                    className={`relative group/thumb w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-colors ${isPlusMenuOpen && plusMenuFrameSlot === 1 ? 'bg-gray-200 dark:bg-[#252525]' : ''}`}
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
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 pointer-events-none group-hover/thumb:opacity-100 transition-opacity z-50">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                          <img src={uploadedFiles[1].url} alt={uploadedFiles[1].name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-300 font-medium mt-1.5 px-2 py-1 mx-auto bg-gray-100 dark:bg-gray-800 rounded-md max-w-[140px]">Khung hình cuối</p>
                      </div>
                    )}
                    {uploadedFiles[1] && (
                      <span className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); removeFile(1); }} aria-label="Remove">
                        <Icons.X size={18} className="text-white" />
                      </span>
                    )}
                  </button>
                  {isPlusMenuOpen && plusMenuFrameSlot === 1 && (
                    <div className="absolute bottom-full left-0 mb-2 w-[min(90vw,380px)] max-h-[65vh] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white transition-colors text-sm font-medium">
                          <Icons.Upload size={18} className="shrink-0" />
                          <span>{t.dashboard.uploadModal?.upload ?? 'Tải lên'}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">.png, .jpg, .webp</span>
                        </button>
                        <button type="button" onClick={() => { handleSelectFromAssets(); setIsPlusMenuOpen(false); }} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium">
                          <Icons.Folder size={18} className="shrink-0" />
                          <span>{t.dashboard.home?.chooseFromAssets ?? 'Chọn từ Asset'}</span>
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 min-h-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.dashboard.home?.recentUploads ?? 'Tệp gửi lên gần đây'}</p>
                        {recentUploadsLoading ? (
                          <div className="flex justify-center py-8"><div className="flex gap-1"><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} /></div></div>
                        ) : recentUploads.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {recentUploads.map((item) => (
                              <button key={item.id} type="button" onClick={() => { handleFileSelected({ url: item.fileUrl, name: item.fileName, type: item.fileType }); setIsPlusMenuOpen(false); setPlusMenuFrameSlot(null); plusMenuFrameSlotRef.current = null; }} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-500 transition-all flex items-center justify-center">
                                {item.fileType?.startsWith('image/') ? <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" /> : <Icons.FileText size={28} className="text-gray-500 dark:text-gray-400" />}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <Icons.Folder size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.selectFile?.uploadFirst ?? 'Chưa có file nào. Tải lên để sử dụng.'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Các chế độ khác: nút + cố định trái, ảnh đính kèm xếp bên phải; hover ảnh hiện preview */}
            {!(inputType === 'video' && videoMode === 'text-to-video') && !(inputType === 'video' && videoMode === 'frame-to-video') && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-500 dark:text-gray-400 transition-colors ${isPlusMenuOpen ? 'bg-gray-200 dark:bg-[#252525] text-gray-700 dark:text-white' : ''}`}
                  >
                    {isPlusMenuOpen ? <Icons.X size={18} className="sm:w-5 sm:h-5" /> : <Icons.Plus size={18} className="sm:w-5 sm:h-5" />}
                  </button>

                  {/* Dropdown: Upload (nhỏ) + Chọn từ Asset cạnh nhau, rồi grid file gần đây */}
                  {isPlusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-[min(90vw,380px)] max-h-[65vh] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white transition-colors text-sm font-medium"
                        >
                          <Icons.Upload size={18} className="shrink-0" />
                          <span>{t.dashboard.uploadModal?.upload ?? 'Tải lên'}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">{getAcceptFormatsLabel(inputType)}</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={getAcceptTypes(inputType)}
                          multiple
                          onChange={(e) => { handleFileUpload(e); }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectFromAssets();
                            setIsPlusMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium"
                        >
                          <Icons.Folder size={18} className="shrink-0" />
                          <span>{t.dashboard.home?.chooseFromAssets ?? 'Chọn từ Asset'}</span>
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 min-h-0">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t.dashboard.home?.recentUploads ?? 'Tệp gửi lên gần đây'}</p>
                        {recentUploadsLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                          </div>
                        ) : recentUploads.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {recentUploads.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  handleFileSelected({ url: item.fileUrl, name: item.fileName, type: item.fileType });
                                  setIsPlusMenuOpen(false);
                                }}
                                className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-500 transition-all flex items-center justify-center"
                              >
                                {item.fileType?.startsWith('image/') ? (
                                  <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                                ) : item.fileType === 'application/pdf' ? (
                                  <Icons.FileText size={28} className="text-red-500 dark:text-red-400" />
                                ) : (
                                  <Icons.FileText size={28} className="text-gray-500 dark:text-gray-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center">
                            <Icons.Folder size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.selectFile?.uploadFirst ?? 'Chưa có file nào. Tải lên để sử dụng.'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {uploadedFiles.filter(Boolean).map((file) => {
                  const index = uploadedFiles.indexOf(file);
                  return (
                    <button
                      key={index}
                      type="button"
                      className="relative group/thumb w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
                      title={file.name}
                    >
                      {file.type?.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <Icons.FileText size={18} />
                        </div>
                      )}
                      {file.type?.startsWith('image/') && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 pointer-events-none group-hover/thumb:opacity-100 transition-opacity z-50">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] text-center text-gray-600 dark:text-gray-300 truncate max-w-[120px] mt-1 mx-auto bg-white dark:bg-gray-800 rounded px-1">{file.name}</p>
                        </div>
                      )}
                      <span
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        aria-label="Remove"
                      >
                        <Icons.X size={18} className="text-white" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || (inputType === 'video' && videoMode === 'frame-to-video' && uploadedFiles.filter(Boolean).length < 2)}
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F0F0F] active:scale-95 shadow-lg dark:shadow-none border dark:border-gray-700 ${inputValue.trim() && !(inputType === 'video' && videoMode === 'frame-to-video' && uploadedFiles.filter(Boolean).length < 2) ? 'bg-gray-900 dark:bg-[#2A2A2A] hover:bg-black dark:hover:bg-[#333333] text-white dark:text-gray-300 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500' : 'bg-gray-200 dark:bg-[#252525] text-gray-400 cursor-not-allowed'}`}
            >
              <Icons.ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* History Links */}
        <div className={`flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 text-[10px] sm:text-xs text-black/50 dark:text-gray-400 font-medium transition-opacity duration-100 ${isTransitioning || isReturning ? 'opacity-0' : ''}`}>
          <div className="flex items-center gap-2">
            <span>{t.dashboard.home.history}</span>
            <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <button className="hover:text-black dark:hover:text-gray-300 flex items-center gap-1 transition-colors truncate max-w-[120px] sm:max-w-none">Wool-felt winter village <Icons.ArrowRight size={10} className="-rotate-45" /></button>
          <button className="hover:text-black dark:hover:text-gray-300 flex items-center gap-1 transition-colors truncate max-w-[120px] sm:max-w-none">Multiple poster editing <Icons.ArrowRight size={10} className="-rotate-45" /></button>
        </div>
      </div>

      <div className={`transition-opacity duration-300 delay-100 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

        {/* Popular Features Section */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 tracking-tight">{t.dashboard.home.popularFeatures}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {/* Feature Card 1 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="AI Talking Photo" />
                <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                  <Icons.MoreHorizontal size={8} className="sm:w-[10px] sm:h-[10px]" />
                </div>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">{t.dashboard.chat.aiTalkingPhoto}</h3>
                <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-center sm:justify-start gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  {t.dashboard.chat.useNow} <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Avatar Video" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[2px] sm:border-t-[3px] border-t-transparent border-l-[4px] sm:border-l-[5px] border-l-white border-b-[2px] sm:border-b-[3px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">{t.dashboard.chat.avatarVideo}</h3>
                <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-center sm:justify-start gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  {t.dashboard.chat.useNow} <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gray-200 overflow-hidden shrink-0 relative shadow-sm group-hover:scale-105 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Product photo" />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">{t.dashboard.chat.productPhoto}</h3>
                <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-center sm:justify-start gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  {t.dashboard.chat.useNow} <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-orange-100 overflow-hidden shrink-0 relative shadow-sm">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="Vibe marketing" />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-start mb-0.5">
                  <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-900 dark:text-white truncate">{t.dashboard.chat.vibeMarketing}</h3>
                  <span className="text-[7px] sm:text-[8px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold ml-1 hidden sm:inline">Beta</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 flex items-center justify-center sm:justify-start gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-semibold">
                  {t.dashboard.chat.useNow} <Icons.ArrowUp size={8} className="rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Chats Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 tracking-tight">{t.dashboard.home.recentCreations}</h2>
            <button className="text-[11px] sm:text-[13px] text-gray-900 dark:text-white font-semibold hover:underline">{t.dashboard.home.viewAll}</button>
          </div>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((item) => (
                <div
                  key={item.id}
                  className="group flex-shrink-0 w-[180px] sm:w-[240px] bg-white dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3"
                >
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${item.type === 'image' ? 'bg-purple-50 text-purple-600' :
                    item.type === 'video' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        {item.type === 'image' && <Icons.Image size={16} className="sm:w-[18px] sm:h-[18px]" />}
                        {item.type === 'video' && <Icons.Video size={16} className="sm:w-[18px] sm:h-[18px]" />}
                        {(!item.type || item.type === 'text') && <Icons.FileText size={16} className="sm:w-[18px] sm:h-[18px]" />}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-40">
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">{item.type || 'text'}</span>
                      <span className="text-[8px] sm:text-[9px] whitespace-nowrap">• {item.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full bg-gray-50 dark:bg-gray-800/40 rounded-3xl py-10 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                <Icons.Inbox className="text-gray-300 dark:text-gray-600 mb-2" size={28} />
                <p className="text-sm text-gray-400 font-medium">{t.dashboard.home.noHistory}</p>
              </div>
            )}
          </div>
        </div>

        {/* Select File Modal */}
        <SelectFileModal
          isOpen={isSelectingFromAssets}
          onClose={() => {
            setIsSelectingFromAssets(false);
            plusMenuFrameSlotRef.current = null;
            setPlusMenuFrameSlot(null);
          }}
          onSelectFile={handleFileSelected}
        />
      </div>
    </div>
  );
};

export default DashboardHome;

