import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Icons } from '../Icons';
import { generateContent, saveProject, getProjects, getProject, uploadFile, getUploads } from '../../services/firebaseFunctions';
import { createVideoRequest, subscribeVideoRequest, VIDEO_CREDIT_COSTS } from '../../services/videoGeneration';
import toast from '../../utils/toast';
import SelectFileModal from './SelectFileModal';
import { useAuth } from '../../contexts/AuthContext';
import ShareTemplateModal from '../Templates/ShareTemplateModal';
import ShareModal from './ShareModal';
import { useLanguage } from '../../contexts/LanguageContext';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Upload data URL (ảnh generate) lên Storage, trả về URL để lưu — khi back vào chat vẫn thấy ảnh */
async function uploadDataUrlToStorage(dataUrl, userId) {
    const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/.exec(dataUrl);
    const mime = m ? m[1] : 'image/png';
    const ext = mime === 'image/png' ? 'png' : /jpe?g/.test(mime) ? 'jpg' : mime.includes('gif') ? 'gif' : mime.includes('webp') ? 'webp' : 'png';
    const path = `projects/${userId}/generated/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const sRef = ref(storage, path);
    await uploadString(sRef, dataUrl, 'data_url', { contentType: mime });
    return getDownloadURL(sRef);
}

const MORPH_DURATION = 400;
const MORPH_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

const VIDEO_RATIOS = [
    { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4' },
    { id: '4:3', label: '4:3', width: 'w-6', height: 'h-4' },
    { id: '1:1', label: '1:1', width: 'w-5', height: 'h-5' },
    { id: '3:4', label: '3:4', width: 'w-4', height: 'h-5' },
    { id: '9:16', label: '9:16', width: 'w-3', height: 'h-5' },
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
        { id: 'pollinations', name: 'Pollinations Flux', desc: 'Free • Không tốn tín dụng', icon: Icons.Pollinations, credits: 0, free: true },
    ],
    text: [
        { id: 'groq', name: 'Groq Llama 3', desc: 'Siêu nhanh & thông minh', icon: Icons.Groq },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Fastest & smartest model', icon: Icons.Gemini },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Next-gen performance', icon: Icons.Gemini },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Reasoning & complexity', icon: Icons.Gemini },
    ],
    video: [
        { id: 'veo-3.1-fast', name: 'Veo 3.1 Fast', desc: 'Nhanh, tiết kiệm', icon: Icons.Veo, credits: 30 },
        { id: 'veo-3.1-standard', name: 'Veo 3.1 Standard', desc: 'Chất lượng cao', icon: Icons.Veo, credits: 50 },
    ]
};

/** Coi là ảnh nếu type image/ hoặc URL là data:image/ hoặc có đuôi ảnh (tránh chỉ hiện icon file) */
const isImageFile = (f) => {
    if (!f) return false;
    const type = f.type || '';
    const url = f.url || '';
    return type.startsWith('image/') || url.startsWith('data:image/') || /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url);
};

/** Coi là video nếu type video/ hoặc có đuôi video */
const isVideoFile = (f) => {
    if (!f) return false;
    const type = f.type || '';
    const url = f.url || '';
    return type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);
};

/** Context-aware: image mode → ảnh only, video mode → ảnh+video, text → all */
const getAcceptTypes = (inputType) => {
    switch (inputType) {
        case 'image': return 'image/*';
        case 'video': return 'image/*,video/mp4,video/webm,video/quicktime';
        default: return 'image/*,video/mp4,video/webm,application/pdf,text/plain,text/markdown,text/csv';
    }
};

const isDataUrl = (url) => typeof url === 'string' && url.startsWith('data:');

/** Loại file hiển thị (PNG, PDF, MP4, ...) */
const fileDisplayType = (f) => {
    if (!f) return 'FILE';
    const t = (f.type || '').toLowerCase();
    if (t.includes('pdf')) return 'PDF';
    if (t.includes('png')) return 'PNG';
    if (t.includes('jpeg') || t.includes('jpg')) return 'JPEG';
    if (t.includes('gif')) return 'GIF';
    if (t.includes('webp')) return 'WEBP';
    if (t.includes('mp4')) return 'MP4';
    if (t.includes('webm')) return 'WEBM';
    if (t.includes('quicktime') || t.includes('mov')) return 'MOV';
    const u = (f.url || '').toLowerCase();
    if (/\.pdf(\?|$)/.test(u)) return 'PDF';
    if (/\.png(\?|$)/.test(u)) return 'PNG';
    if (/\.jpe?g(\?|$)/.test(u)) return 'JPEG';
    if (/\.mp4(\?|$)/.test(u)) return 'MP4';
    if (/\.webm(\?|$)/.test(u)) return 'WEBM';
    if (/\.mov(\?|$)/.test(u)) return 'MOV';
    return (t.split('/')[1] || 'FILE').toUpperCase();
};

/** Card file đính kèm: thumbnail | tên + loại | optional X. Click ảnh → mở full ảnh (lightbox). */
const FileCard = ({ file, onRemove, showRemove = false, onImageClick }) => {
    const { t: tr } = useLanguage();
    const isImg = isImageFile(file);
    const isVid = isVideoFile(file);
    const thumb = (
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
            {isImg ? (
                <img src={file.url} alt={file.name || ''} className="w-full h-full object-cover" />
            ) : isVid ? (
                <>
                    <Icons.Video size={22} className="text-purple-500 dark:text-purple-400" />
                    <div className="absolute bottom-0.5 right-0.5 bg-black/60 rounded px-1">
                        <span className="text-[8px] text-white font-bold">{fileDisplayType(file)}</span>
                    </div>
                </>
            ) : (
                <Icons.FileText size={22} className="text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );
    return (
        <div className="relative flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 shadow-sm w-full max-w-[240px]">
            {isImg && onImageClick ? (
                <button type="button" onClick={() => onImageClick(file.url)} className="shrink-0 rounded-lg overflow-hidden ring-offset-2 ring-offset-transparent hover:ring-2 hover:ring-purple-400 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer">
                    {thumb}
                </button>
            ) : (
                <div className="shrink-0">{thumb}</div>
            )}
            <div className={`flex-1 min-w-0 ${showRemove ? 'pr-8' : ''}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>{file.name || 'File'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{fileDisplayType(file)}</p>
            </div>
            {showRemove && onRemove && (
                <button type="button" onClick={onRemove} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0 absolute top-2 right-2" title={tr?.common?.delete || 'Delete'}>
                    <Icons.X size={16} />
                </button>
            )}
        </div>
    );
};

const MessageItem = ({ msg, onShare, onImageClick, setMessages, selectedModel, videoAspectRatio, videoDuration }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const isUser = msg.role === 'user';

    // Heuristic: Check if content has > 4 lines or is long enough to likely wrap
    const lineCount = (msg.content || '').split('\n').length;
    const isLongContent = lineCount > 4 || msg.content.length > 200;

    const displayFiles = (() => {
        const seen = new Set();
        const list = [];
        if (msg.mediaUrl && !seen.has(msg.mediaUrl)) {
            seen.add(msg.mediaUrl);
            list.push({ url: msg.mediaUrl, name: 'Image', type: 'image' });
        }
        // Include all mediaUrls (multi-image responses)
        if (msg.mediaUrls && Array.isArray(msg.mediaUrls)) {
            msg.mediaUrls.forEach((url, idx) => {
                if (url && !seen.has(url)) {
                    seen.add(url);
                    list.push({ url, name: `Image ${idx + 1}`, type: 'image' });
                }
            });
        }
        (msg.attachedFiles || []).forEach(f => {
            if (f?.url && !seen.has(f.url)) { seen.add(f.url); list.push(f); }
        });
        return list;
    })();

    return (

        <div className={`flex w-full group mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 ${isUser ? 'max-w-[85%] md:max-w-[75%] flex-row-reverse' : 'w-full flex-row'}`}>

                {/* AI Icon */}
                {!isUser && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-purple-600 mt-0.5 shadow-sm self-start">
                        {(() => {
                            let IconComponent = Icons.Sparkles;
                            if (msg.inputType && msg.modelId && MODELS[msg.inputType]) {
                                const foundModel = MODELS[msg.inputType].find(m => m.id === msg.modelId);
                                if (foundModel?.icon) IconComponent = foundModel.icon;
                            }
                            // Using capitalized variable for component rendering
                            const ModelIcon = IconComponent;
                            return <ModelIcon size={16} />;
                        })()}
                    </div>
                )}

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start flex-1 min-w-0'}`}>
                    {/* File/ảnh đính kèm: nằm TRÊN bubble, không trong bubble */}
                    {isUser && displayFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 w-full max-w-[85%] md:max-w-[75%] justify-end">
                            {displayFiles.map((f, i) => {
                                if (isImageFile(f)) {
                                    return (
                                        <div key={i} className="relative w-28 h-28 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:opacity-90 transition-all bg-gray-100 dark:bg-gray-800" onClick={() => onImageClick && onImageClick(f.url)}>
                                            <img src={f.url} alt="Attachment" className="w-full h-full object-cover" />
                                        </div>
                                    );
                                }
                                return <FileCard key={i} file={f} showRemove={false} onImageClick={onImageClick} />;
                            })}
                        </div>
                    )}
                    <div className={`relative px-5 py-3.5 text-[15px] leading-7 group/bubble w-full max-w-full ${isUser
                        ? 'bg-[#f0f4f9] dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-[24px] rounded-tr-[4px]'
                        : 'bg-transparent text-gray-800 dark:text-gray-100 px-0 py-0'
                        }`}>

                        {isUser && isLongContent && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-[1px] z-10"
                                title={isExpanded ? (t.common?.hide || "Hide") : (t.common?.show || "Show")}
                            >
                                <Icons.ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        )}

                        {isUser ? (
                            <div className={`whitespace-pre-wrap font-normal break-words ${!isExpanded && isLongContent ? 'line-clamp-4 overflow-hidden mask-linear-fade' : ''}`}>
                                {msg.content}
                            </div>
                        ) : (
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0 prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {!isUser && (msg.mediaUrls?.length > 1 ? (
                            /* Multi-image grid */
                            <div className={`mt-3 grid gap-2 ${msg.mediaUrls.length === 2 ? 'grid-cols-2' : msg.mediaUrls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                {msg.mediaUrls.map((url, idx) => (
                                    <div key={idx} className="relative">
                                        {onImageClick ? (
                                            <button type="button" onClick={() => onImageClick(url)} className="block rounded-2xl overflow-hidden focus:outline-none cursor-zoom-in w-full">
                                                <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-auto max-h-[280px] object-cover rounded-2xl bg-gray-50 dark:bg-gray-800" />
                                            </button>
                                        ) : (
                                            <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-auto max-h-[280px] object-cover rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : msg.mediaUrl && (
                            <div className="mt-3 inline-block">
                                {msg.type === 'video' ? (
                                    <div className="space-y-2">
                                        <video
                                            src={msg.mediaUrl}
                                            controls
                                            className="w-auto h-auto max-h-[400px] max-w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-900 shadow-sm"
                                        />
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={msg.mediaUrl}
                                                download
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <Icons.Download size={14} />
                                                Tải xuống
                                            </a>
                                        </div>
                                    </div>
                                ) : onImageClick ? (
                                    <button type="button" onClick={() => onImageClick(msg.mediaUrl)} className="block rounded-2xl overflow-hidden focus:outline-none cursor-zoom-in">
                                        <img src={msg.mediaUrl} alt="Generated Content" className="w-auto h-auto max-h-[400px] max-w-full object-contain rounded-2xl bg-gray-50 dark:bg-gray-800" />
                                    </button>
                                ) : (
                                    <img src={msg.mediaUrl} alt="Generated Content" className="w-auto h-auto max-h-[400px] max-w-full object-contain rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* AI Action Buttons */}
                    {!isUser && !msg.isError && (
                        <div className="flex items-center gap-1 mt-2 -ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={t.dashboard.chat.thumbsUp}>
                                <Icons.ThumbsUp size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={t.dashboard.chat.thumbsDown}>
                                <Icons.ThumbsDown size={16} />
                            </button>
                            <button
                                onClick={() => onShare(msg)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={msg.mediaUrl ? 'Chia sẻ lên Cảm Hứng' : t.dashboard.chat.shareTemplate}
                            >
                                <Icons.Share2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={t.common?.more || 'More'}>
                                <Icons.MoreVertical size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Infer video from URL so saved projects show video player, not broken img */
const isVideoUrl = (url) => url && /\.(mp4|webm|mov)(\?|$)/i.test(String(url));

/** Normalize messages from backend (may have Firestore timestamps) for display */
const normalizeMessages = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((m, i) => {
        const mediaUrl = m.mediaUrl ?? null;
        const type = m.type ?? (mediaUrl && isVideoUrl(mediaUrl) ? 'video' : null);
        return {
            id: m.id || `msg-${i}-${Date.now()}`,
            role: m.role === 'user' ? 'user' : 'model',
            content: typeof m.content === 'string' ? m.content : '',
            timestamp: m.timestamp,
            mediaUrl,
            mediaUrls: Array.isArray(m.mediaUrls) ? m.mediaUrls : null,
            attachedFiles: Array.isArray(m.attachedFiles) ? m.attachedFiles : null,
            modelId: m.modelId ?? null,
            inputType: m.inputType ?? null,
            type: type ?? null,
            isError: !!m.isError,
        };
    });
};

export const AgentChat = ({ initialPrompt, initialMessages, projectId: initialProjectId, initialInputType = 'image', initialModel, initialMorphOffsetY, initialFileUrls = [], initialVideoMode, initialVideoAspectRatio, initialVideoDuration, initialVideoX2, initialVideoResolution, initialVideoLanguage, initialImageAspectRatio = '1:1', initialImageCount = 1, onBack }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [messages, setMessages] = useState(() => (initialMessages?.length > 0 ? normalizeMessages(initialMessages) : []));
    const [projectId, setProjectId] = useState(initialProjectId || null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(() =>
        initialFileUrls.map(url => ({ url, name: url.split('/').pop() || 'file', type: 'unknown' }))
    );
    const [loadingProject, setLoadingProject] = useState(!!(initialProjectId && !initialMessages?.length));

    // Form morph: start at Home position then animate down (same pattern as back)
    const [formOffsetY, setFormOffsetY] = useState(initialMorphOffsetY ?? 0);

    // Toolbar States (Mirrored from DashboardHome)
    const [inputType, setInputType] = useState(initialInputType);
    const [selectedModel, setSelectedModel] = useState(initialModel);
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const [tuningSubMenu, setTuningSubMenu] = useState(null); // 'ratio', 'count', 'model'
    const [isTuningOpen, setIsTuningOpen] = useState(false);
    const [imageAspectRatio, setImageAspectRatio] = useState(initialImageAspectRatio);
    const [imageCount, setImageCount] = useState(initialImageCount);
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [isAutoRatio, setIsAutoRatio] = useState(true);
    const [isVideoRatioLangMenuOpen, setIsVideoRatioLangMenuOpen] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(initialVideoAspectRatio || '9:16');
    const [videoLanguage, setVideoLanguage] = useState('EN');
    const [videoMode, setVideoMode] = useState(initialVideoMode || 'text-to-video');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [plusMenuFrameSlot, setPlusMenuFrameSlot] = useState(null);
    const [videoGenerating, setVideoGenerating] = useState(false);
    const [videoDuration] = useState(initialVideoDuration || 8);
    const [videoX2] = useState(initialVideoX2 || false);
    const [videoResolution] = useState(initialVideoResolution || '720p');
    const [videoLanguage2] = useState(initialVideoLanguage || 'EN');

    // New Feature States
    const [isLengthMenuOpen, setIsLengthMenuOpen] = useState(false);
    const [selectedLength, setSelectedLength] = useState({ id: 'medium', label: t.textGen?.lengths?.medium?.split(' ')[0] || 'Medium' });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareContent, setShareContent] = useState('');
    const [sharePrompt, setSharePrompt] = useState('');
    const [isSelectingFromAssets, setIsSelectingFromAssets] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const fileInputRef = useRef(null);
    const frameFileInputRef = useRef(null);
    const assetsFileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const currentModels = MODELS[inputType] || MODELS.image;
    const effectiveModel = (selectedModel && currentModels.find(m => m.id === selectedModel.id)) ? selectedModel : currentModels[0];

    // History Sidebar State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [recentProjects, setRecentProjects] = useState([]);

    const fetchHistory = async () => {
        try {
            const result = await getProjects();
            if (result.success) {
                const mapped = result.projects.map(p => ({
                    id: p.id,
                    title: p.title || t.dashboard.chat.newCreation,
                    type: p.type || 'text',
                    date: new Date(p.createdAt?._seconds * 1000 || Date.now()).toLocaleDateString()
                }));
                setRecentProjects(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        if (isHistoryOpen) {
            fetchHistory();
        }
    }, [isHistoryOpen]);

    const messagesEndRef = useRef(null);
    const initializedRef = useRef(false);

    const menuRef = useRef(null);
    const tuningRef = useRef(null);
    const tuningButtonRef = useRef(null);
    const lengthMenuRef = useRef(null);
    const videoRatioLangMenuRef = useRef(null);
    const modeMenuRef = useRef(null);
    const plusMenuFrameSlotRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Auto-resize textarea như DashboardHome: mở rộng dần, không scroll ngang
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        const maxH = 12 * 16; // ~12rem
        const h = Math.min(ta.scrollHeight, maxH);
        ta.style.height = `${h}px`;
    }, [inputValue]);

    // Load project by id when opening from Assets (realtime: no wait in Home)
    const loadedProjectIdRef = useRef(null);
    useEffect(() => {
        if (!initialProjectId || initialMessages?.length > 0 || loadedProjectIdRef.current === initialProjectId) return;
        loadedProjectIdRef.current = initialProjectId;
        setLoadingProject(true);
        getProject(initialProjectId)
            .then((res) => {
                if (!res.success || !res.project) {
                    setLoadingProject(false);
                    return;
                }
                const p = res.project;
                if (p.messages && p.messages.length > 0) {
                    setMessages(normalizeMessages(p.messages));
                } else {
                    const userContent = p.title || p.metadata?.prompt || t.dashboard.chat.newCreation;
                    const aiContent = p.content?.text || (p.content?.imageUrl ? 'Generated Image' : '');
                    setMessages(normalizeMessages([
                        { id: 'u1', role: 'user', content: userContent },
                        { id: 'a1', role: 'model', content: aiContent, mediaUrl: p.content?.imageUrl }
                    ]));
                }
                setProjectId(p.id);
                setInputType(p.type || 'text');
            })
            .catch((e) => {
                console.error('Failed to load project:', e);
            })
            .finally(() => setLoadingProject(false));
    }, [initialProjectId, initialMessages]);

    // Only auto-send when opening with a new prompt (no existing chat history)
    useEffect(() => {
        if (initialPrompt && !initializedRef.current && (!initialMessages || initialMessages.length === 0) && !initialProjectId) {
            initializedRef.current = true;
            handleSend(initialPrompt);
        } else if (initialMessages?.length > 0) {
            initializedRef.current = true;
        }
    }, [initialPrompt, initialMessages, initialProjectId]);

    const morphHoldRef = useRef(null);
    // Animate form from Home position down to final (same as back: brief hold then transition)
    useEffect(() => {
        if (initialMorphOffsetY == null || initialMorphOffsetY === 0) return;
        let rafId2;
        const rafId1 = requestAnimationFrame(() => {
            rafId2 = requestAnimationFrame(() => {
                morphHoldRef.current = setTimeout(() => setFormOffsetY(0), 60);
            });
        });
        return () => {
            cancelAnimationFrame(rafId1);
            if (rafId2) cancelAnimationFrame(rafId2);
            if (morphHoldRef.current) clearTimeout(morphHoldRef.current);
        };
    }, [initialMorphOffsetY]);

    useEffect(() => {
        if (!lightboxImage) return;
        const onKey = (e) => { if (e.key === 'Escape') setLightboxImage(null); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [lightboxImage]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsPlusMenuOpen(false);
            }
            if (tuningRef.current && !tuningRef.current.contains(event.target)) {
                setIsTuningOpen(false);
                setTuningSubMenu(null);
            }
            if (lengthMenuRef.current && !lengthMenuRef.current.contains(event.target)) {
                setIsLengthMenuOpen(false);
            }
            if (videoRatioLangMenuRef.current && !videoRatioLangMenuRef.current.contains(event.target)) {
                setIsVideoRatioLangMenuOpen(false);
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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsPlusMenuOpen(false);

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
                    setUploadedFiles(prev => [...prev, { url: result.fileUrl, name: file.name, type: file.type }]);
                    toast.dismiss(`uploading-${file.name}`);
                    toast.success(t.dashboard.chat?.fileUploaded || 'File uploaded');
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
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const handleSelectFromAssets = () => {
        setIsSelectingFromAssets(true);
    };

    const handleFrameFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const slot = plusMenuFrameSlotRef.current;
        if (slot === undefined || slot === null) return;

        const file = files[0];
        if (file.size > 20 * 1024 * 1024) {
            toast.error((t.dashboard.uploadModal?.fileTooLarge || 'File {name} exceeds 20MB').replace('{name}', file.name));
            e.target.value = '';
            return;
        }

        toast.loading(t.dashboard.chat?.uploadingImage || 'Uploading...', { id: `frame-upload-${slot}` });
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
                handleFileSelectedForSlot(slot, { url: result.fileUrl, name: file.name, type: file.type });
                toast.dismiss(`frame-upload-${slot}`);
                toast.success(t.dashboard.chat?.fileUploaded || 'File uploaded');
            } else throw new Error(result.message || 'Upload failed');
        } catch (err) {
            console.error('Frame file upload error:', err);
            toast.dismiss(`frame-upload-${slot}`);
            toast.error((t.dashboard.chat?.uploadError || 'Upload failed') + ': ' + file.name);
        }
        e.target.value = '';
    };

    const removeFile = (index) => {
        if (inputType === 'video' && videoMode === 'frame-to-video') {
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
    };

    const handleFileSelectedForSlot = (slot, file) => {
        setUploadedFiles(prev => {
            const a = [prev[0] ?? null, prev[1] ?? null];
            a[slot] = file;
            return a;
        });
        setIsPlusMenuOpen(false);
        setPlusMenuFrameSlot(null);
        plusMenuFrameSlotRef.current = null;
    };

    // State for community share modal (image/video)
    const [showCommunityShareModal, setShowCommunityShareModal] = useState(false);
    const [shareMediaData, setShareMediaData] = useState(null);

    const handleShareClick = (msg) => {
        // If message has media, open community share modal
        if (msg.mediaUrl) {
            setShareMediaData({
                mediaUrl: msg.mediaUrl,
                prompt: messages.find(m => m.role === 'user' && messages.indexOf(m) < messages.indexOf(msg))?.content || '',
                type: msg.inputType === 'video' ? 'video' : 'image',
                model: msg.modelId,
            });
            setShowCommunityShareModal(true);
        } else {
            // For text content, extract prompt from previous user message
            const promptMsg = messages.find(m => m.role === 'user' && messages.indexOf(m) < messages.indexOf(msg));
            setShareContent(msg.content);
            setSharePrompt(promptMsg?.content || '');
            setShowShareModal(true);
        }
    };

    const handleSend = async (text) => {
        const validFiles = uploadedFiles.filter(Boolean);
        if (!text.trim() && validFiles.length === 0 && !uploadedImage) return;

        // Lưu file đính kèm vào message user (hiển thị như Gemini/ChatGPT)
        const attachedFiles = validFiles.map(f => ({ url: f.url, name: f.name, type: f.type }));
        const firstImageUrl = (uploadedImage && typeof uploadedImage === 'string')
            ? uploadedImage
            : (validFiles.find(f => isImageFile(f))?.url ?? null);

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: text || (validFiles.length > 0 ? `Phân tích ${validFiles.length} file đính kèm` : ''),
            timestamp: new Date(),
            mediaUrl: firstImageUrl ?? null,
            attachedFiles: attachedFiles.length > 0 ? attachedFiles : null
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setUploadedImage(null);
        setUploadedFiles([]);
        setIsLoading(true);

        const model = (selectedModel && (MODELS[inputType] || MODELS.image).find(m => m.id === selectedModel.id)) ? selectedModel : (MODELS[inputType] || MODELS.image)[0];

        // ===== VIDEO: Gửi yêu cầu tạo video qua Firestore trigger =====
        if (inputType === 'video') {
            try {
                setVideoGenerating(true);
                const fileUrls = attachedFiles.map(f => f.url).filter(Boolean);

                // Build video request params based on videoMode
                const videoParams = {
                    prompt: text || 'Generate a video',
                    model: model?.id || 'veo-3.1-fast',
                    aspectRatio: videoAspectRatio || '16:9',
                    duration: videoDuration || 8,
                    videoMode: videoMode,
                    numberOfVideos: videoX2 ? 2 : 1,
                    resolution: videoResolution || '720p',
                    language: videoLanguage2 || 'EN',
                };

                // Map uploaded files based on video mode
                if (videoMode === 'frame-to-video' && fileUrls.length > 0) {
                    videoParams.firstFrameUrl = fileUrls[0];
                    if (fileUrls.length > 1) videoParams.lastFrameUrl = fileUrls[1];
                } else if (videoMode === 'ingredients-to-video' && fileUrls.length > 0) {
                    videoParams.referenceImageUrls = fileUrls.slice(0, 3);
                } else if (fileUrls.length > 0) {
                    videoParams.fileUrls = fileUrls;
                }

                // Add queued status message
                const queueMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    content: `🎬 Đang gửi yêu cầu tạo video với **${model?.name || 'Veo 3.1'}**...\n\n⏳ Video sẽ mất khoảng 30 giây - 2 phút để tạo.`,
                    timestamp: new Date(),
                    type: 'video',
                    modelId: model?.id,
                    inputType: 'video',
                };
                setMessages(prev => [...prev, queueMsg]);
                setIsLoading(false);
                toast.loading('Đang gửi yêu cầu tạo video...', { id: 'video-gen' });

                // Create Firestore video request (trigger backend)
                const requestId = await createVideoRequest({
                    userId: user.uid,
                    prompt: text || 'Generate a video',
                    model: model?.id || 'veo-3.1-fast',
                    aspectRatio: videoAspectRatio || '16:9',
                    duration: videoDuration || 8,
                    language: videoLanguage2 || 'EN',
                    videoMode: videoMode,
                    ...(videoParams.fileUrls && { fileUrls: videoParams.fileUrls }),
                    ...(videoParams.firstFrameUrl && { firstFrameUrl: videoParams.firstFrameUrl }),
                    ...(videoParams.lastFrameUrl && { lastFrameUrl: videoParams.lastFrameUrl }),
                    ...(videoParams.referenceImageUrls && { referenceImageUrls: videoParams.referenceImageUrls }),
                    ...(videoParams.resolution && { resolution: videoParams.resolution }),
                    ...(videoParams.personGeneration && { personGeneration: videoParams.personGeneration }),
                });

                // Listen for status updates
                const unsubscribe = subscribeVideoRequest(requestId, (request) => {
                    if (request.status === 'processing') {
                        toast.loading('Đang tạo video...', { id: 'video-gen' });
                        setMessages(prev => prev.map(m =>
                            m.id === queueMsg.id
                                ? {
                                    ...m,
                                    content: `🎬 Video đang được tạo...\n\n⚙️ Trạng thái: **Đang xử lý**`,
                                }
                                : m
                        ));
                    }

                    if (request.status === 'error') {
                        setVideoGenerating(false);
                        toast.dismiss('video-gen');
                        toast.error(request.error || 'Tạo video thất bại');
                        setMessages(prev => prev.map(m =>
                            m.id === queueMsg.id
                                ? {
                                    ...m,
                                    content: `❌ Tạo video thất bại: ${request.error || 'Đã xảy ra lỗi trong quá trình tạo video.'}`,
                                    isError: true,
                                }
                                : m
                        ));
                        unsubscribe();
                    }

                    if (request.status === 'completed' && request.videoUrl) {
                        setVideoGenerating(false);
                        toast.dismiss('video-gen');
                        toast.success('Video đã tạo xong! Kiểm tra Assets của bạn.');

                        const finalMsg = {
                            ...queueMsg,
                            content: '✅ Video đã tạo thành công!',
                            mediaUrl: request.videoUrl,
                            type: 'video',
                        };

                        // Replace queue message with final video result
                        setMessages(prev => prev.map(m =>
                            m.id === queueMsg.id ? finalMsg : m
                        ));

                        // Save project (auto-save video as asset)
                        const updatedMessages = [...messages, userMsg, finalMsg];
                        saveProject({
                            projectId: projectId || undefined,
                            title: text.length > 30 ? text.substring(0, 30) + '...' : text,
                            type: 'video',
                            content: { videoUrl: request.videoUrl },
                            messages: updatedMessages.map(m => ({
                                id: m.id,
                                role: m.role,
                                content: m.content,
                                timestamp: m.timestamp,
                                mediaUrl: m.mediaUrl || null,
                                attachedFiles: m.attachedFiles || null,
                                modelId: m.modelId ?? null,
                                inputType: m.inputType ?? null,
                                isError: m.isError ?? null,
                            })),
                        }).then(saveResult => {
                            if (saveResult?.projectId && !projectId) {
                                setProjectId(saveResult.projectId);
                                window.history.pushState({}, '', `/dashboard/project/${saveResult.projectId}`);
                            }
                            if (isHistoryOpen) fetchHistory();
                        }).catch(e => console.error('Background save failed:', e));

                        unsubscribe();
                    }
                });

            } catch (error) {
                console.error('Video Generation Error:', error);
                setIsLoading(false);
                setVideoGenerating(false);
                const errorMsg = {
                    id: (Date.now() + 2).toString(),
                    role: 'model',
                    content: `❌ Lỗi tạo video: ${error.message || 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu video.'}`,
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages(prev => [...prev, errorMsg]);
            }
            return;
        }

        // ===== TEXT / IMAGE: Logic hiện tại giữ nguyên =====
        try {
            // Determine provider
            let provider = 'gemini'; // Default
            if (inputType === 'text') {
                provider = model?.id === 'groq' ? 'groq' : 'gemini';
            } else if (inputType === 'image') {
                if (model?.id === 'sdxl') provider = 'stability';
                else if (model?.id === 'pollinations') provider = 'pollination';
                else provider = 'gemini'; // Nano = Gemini
            }

            // Collect file URLs (from uploadedFiles and uploadedImage if it's a URL)
            const fileUrls = uploadedFiles.filter(Boolean).map(f => f.url);
            if (uploadedImage && typeof uploadedImage === 'string' && uploadedImage.startsWith('http')) {
                fileUrls.push(uploadedImage);
            }

            // Call Backend API
            const result = await generateContent({
                prompt: text || 'Phân tích file đính kèm và tạo nội dung theo yêu cầu',
                contentType: inputType,
                provider: provider,
                modelId: model?.id,
                length: selectedLength?.id,
                ratio: inputType === 'image' ? imageAspectRatio : undefined,
                count: inputType === 'image' ? imageCount : undefined,
                image: uploadedImage && !uploadedImage.startsWith('http') ? uploadedImage : undefined, // Legacy base64 image
                fileUrls: fileUrls.length > 0 ? fileUrls : undefined // New file URLs for Gemini File API
            });

            // Handle multi-image response (count > 1 returns JSON array)
            let imageUrls = [];
            if (result.contentType === 'image') {
                try {
                    const parsed = JSON.parse(result.content);
                    if (Array.isArray(parsed)) {
                        imageUrls = parsed;
                    } else {
                        imageUrls = [result.content];
                    }
                } catch {
                    imageUrls = [result.content];
                }
            }

            // Upload generated images to Storage
            const processedUrls = [];
            for (const imgData of imageUrls) {
                if (isDataUrl(imgData) && user?.uid) {
                    try {
                        const uploaded = await uploadDataUrlToStorage(imgData, user.uid);
                        processedUrls.push(uploaded);
                    } catch (e) {
                        console.warn('Upload generated image to Storage failed:', e);
                        processedUrls.push(imgData);
                    }
                } else {
                    processedUrls.push(imgData);
                }
            }

            const displayImageUrl = result.contentType === 'image' ? (processedUrls[0] || result.content) : null;
            const isVideoResponse = result.contentType === 'video' || (result.metadata && result.metadata.queueId);

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: isVideoResponse
                    ? `🎬 Đang tạo video... (Queue ID: ${result.metadata?.queueId || '...'})\n\n⏳ Quá trình này có thể mất vài phút.`
                    : (result.contentType === 'image' ? (processedUrls.length > 1 ? `Đã tạo ${processedUrls.length} ảnh` : "") : result.content),
                timestamp: new Date(),
                type: result.contentType,
                mediaUrl: displayImageUrl,
                mediaUrls: processedUrls.length > 1 ? processedUrls : undefined,
                modelId: model?.id,
                inputType: inputType,
                metadata: result.metadata
            };

            setMessages(prev => [...prev, aiMsg]);

            // If it's a video from generateContent, start polling
            if (isVideoResponse && result.metadata?.queueId) {
                const qId = result.metadata.queueId;
                pollVideoStatus(qId, (status) => {
                    if (status.status === 'processing') {
                        setMessages(prev => prev.map(m =>
                            m.id === aiMsg.id ? { ...m, content: `🎬 Video đang được xử lý...\n\n⚙️ Trạng thái: **Đang xử lý**` } : m
                        ));
                    }
                }).then(pollResult => {
                    if (pollResult.success) {
                        setMessages(prev => prev.map(m =>
                            m.id === aiMsg.id ? { ...m, content: `✅ Video đã tạo thành công!`, mediaUrl: pollResult.videoUrl, type: 'video' } : m
                        ));
                        // Update mediaUrl locally for future reference in this session
                        aiMsg.mediaUrl = pollResult.videoUrl;
                        aiMsg.type = 'video';
                    } else {
                        setMessages(prev => prev.map(m =>
                            m.id === aiMsg.id ? { ...m, content: `❌ Tạo video thất bại: ${pollResult.error}`, isError: true } : m
                        ));
                    }
                });
            }

            const updatedMessages = [...messages, userMsg, aiMsg];
            setIsLoading(false);

            const sanitizeUrl = (u) => (u && !isDataUrl(u) ? u : null);
            // Allow Data URL for the LATEST message if it failed upload (it will be in imageUrlToSave)
            const getSafeMediaUrl = (m) => {
                if (m.mediaUrl && isDataUrl(m.mediaUrl)) {
                    // Only allow sending Data URL if it's the current AI generation that failed client-upload
                    // We check if it matches result.content
                    return m.mediaUrl;
                }
                return m.mediaUrl;
            };

            const sanitizeAttached = (arr) => {
                if (!Array.isArray(arr) || !arr.length) return null;
                const out = arr.filter(f => f?.url && !isDataUrl(f.url)).map(f => ({ url: f.url, name: f.name, type: f.type }));
                return out.length ? out : null;
            };
            const payload = {
                projectId: projectId || undefined,
                title: text.length > 30 ? text.substring(0, 30) + '...' : text,
                type: inputType,
                content: {
                    text: result.contentType === 'text' ? result.content : undefined,
                    imageUrl: (processedUrls.length > 0 ? processedUrls[0] : undefined)
                },
                messages: updatedMessages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp,
                    // Use getSafeMediaUrl logic: allow Data URL if it's what we want to save
                    mediaUrl: m.mediaUrl || null,
                    mediaUrls: Array.isArray(m.mediaUrls) ? m.mediaUrls : null,
                    attachedFiles: sanitizeAttached(m.attachedFiles) ?? null,
                    modelId: m.modelId ?? null,
                    inputType: m.inputType ?? null,
                    isError: m.isError ?? null
                }))
            };

            // Save in background
            saveProject(payload).then(saveResult => {
                // If server returned a new project with updated URLs (backend upload), use it
                if (saveResult?.project?.messages) {
                    setMessages(normalizeMessages(saveResult.project.messages));
                }
                if (saveResult?.projectId && !projectId) {
                    setProjectId(saveResult.projectId);
                    // Update URL without reload if needed
                    window.history.pushState({}, '', `/dashboard/project/${saveResult.projectId}`);
                }
                if (isHistoryOpen) fetchHistory();
            }).catch(e => console.error("Background save failed:", e));

        } catch (error) {
            console.error("Generation Error:", error);
            setIsLoading(false); // Ensure loading stops on error
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: error.message || "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn.",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputValue);
        }
    };


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
        <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] relative">
            {/* Floating Header (Gemini-style) */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between py-4 px-6 bg-transparent shrink-0 z-30 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        onClick={onBack}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-95 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800"
                        title={t.dashboard.chat.back}
                    >
                        <Icons.ArrowRight className="rotate-180" size={20} />
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center backdrop-blur-sm border ${isHistoryOpen
                            ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                            : 'bg-white/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        title={t.dashboard.chat.history}
                    >
                        <Icons.Clock size={20} />
                    </button>
                </div>


            </div>

            {/* History Sidebar */}
            {isHistoryOpen && (
                <div className="absolute top-4 left-6 bottom-32 w-72 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 z-40 animate-in slide-in-from-left-4 duration-300 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{t.dashboard.chat.history}</h3>
                        <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Icons.X size={16} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {recentProjects.map((item) => (
                            <button key={item.id} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-left transition-all group mb-1 border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.type === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                                    item.type === 'video' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                        'bg-green-100 text-green-600 dark:bg-green-900/30'
                                    }`}>
                                    {item.type === 'image' && <Icons.Image size={16} />}
                                    {item.type === 'video' && <Icons.Video size={16} />}
                                    {(!item.type || item.type === 'text') && <Icons.FileText size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{item.title}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{item.date}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto pt-16 pb-52 px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && !isLoading && !initialPrompt && !loadingProject && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 mt-20">
                            <Icons.Bot size={64} className="mb-4" />
                            <p>{t.dashboard.chat.startChat}</p>
                        </div>
                    )}
                    {messages.length === 0 && loadingProject && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 mt-20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                            <p className="text-sm">{t.dashboard.chat.loadingChat}</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            onShare={handleShareClick}
                            onImageClick={(url) => setLightboxImage(url)}
                            setMessages={setMessages}
                            selectedModel={selectedModel}
                            videoAspectRatio={videoAspectRatio}
                            videoDuration={videoDuration}
                        />
                    ))}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-purple-600 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                    {(() => {
                                        const ModelIcon = (effectiveModel && effectiveModel.icon) ? effectiveModel.icon : Icons.Sparkles;
                                        return <ModelIcon size={16} isActive={true} />;
                                    })()}
                                </div>
                                <div className="flex items-center gap-1.5 h-8">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 pb-2 pt-3 px-6 md:px-8 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/95 z-40">
                <div
                    className="w-full max-w-3xl mx-auto"
                    style={{
                        transform: formOffsetY ? `translate3d(0, ${formOffsetY}px, 0)` : 'none',
                        transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1)',
                        willChange: formOffsetY ? 'transform' : 'auto',
                    }}
                >
                    <div className="relative w-full bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#27272a] rounded-3xl md:rounded-[2.5rem] p-3 md:p-4 shadow-xl transition-all duration-300 focus-within:border-gray-300 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-gray-200/80 dark:focus-within:ring-zinc-700/50 relative z-20">
                    {/* Top row: left = mode/label, right = badges */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-2 transition-opacity duration-300">
                        <div className="relative min-w-0" ref={inputType === 'video' ? modeMenuRef : null}>
                            {inputType === 'video' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-900 dark:text-white rounded-full text-sm font-medium transition-all duration-150 border border-transparent dark:border-gray-800"
                                    >
                                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                            {VIDEO_MODES.find(m => m.id === videoMode)?.icon && (() => {
                                                const MIcon = VIDEO_MODES.find(m => m.id === videoMode)?.icon;
                                                return MIcon ? <MIcon size={20} /> : null;
                                            })()}
                                        </span>
                                        <span className="max-w-[220px] truncate">{VIDEO_MODES.find(m => m.id === videoMode)?.label || 'Video'}</span>
                                        <Icons.ChevronDown size={20} className={`shrink-0 transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isModeMenuOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-200 dark:border-[#27272a] p-2 z-50">
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
                            {inputType === 'image' && (
                                <button
                                    type="button"
                                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-full text-sm font-medium border border-transparent dark:border-gray-800 cursor-default"
                                >
                                    <span className="text-gray-500 dark:text-gray-400 shrink-0"><Icons.Gallery size={20} /></span>
                                    <span>{t.dashboard.nav?.images || 'Tạo hình ảnh'}</span>
                                </button>
                            )}
                            {inputType === 'text' && (
                                <button
                                    type="button"
                                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-full text-sm font-medium border border-transparent dark:border-gray-800 cursor-default"
                                >
                                    <span className="text-gray-500 dark:text-gray-400 shrink-0"><Icons.Notebook size={20} /></span>
                                    <span>{t.dashboard.nav?.textContent || 'Nội dung văn bản'}</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                            {/* Model Badge */}
                            <div className="flex items-center h-9 gap-1.5 px-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-full text-sm font-medium text-gray-900 dark:text-white border border-transparent dark:border-gray-800 cursor-default select-none transition-colors">
                                <span className="shrink-0 text-gray-900 dark:text-white">
                                    {(() => {
                                        const ModelIcon = effectiveModel.icon || Icons.Sparkles;
                                        return <ModelIcon size={20} />;
                                    })()}
                                </span>
                                <span className="max-w-[120px] truncate leading-none">{effectiveModel.name}</span>
                            </div>

                            {/* Ratio/Count Badge (for Video & Image) - giống Dashboard Home */}
                            {(inputType === 'video' || inputType === 'image') && (
                                <div className="flex items-center h-9 gap-1.5 px-3 text-gray-500 dark:text-gray-400 cursor-default select-none border border-transparent rounded-full transition-colors" title={inputType === 'video' ? `Tỷ lệ: ${videoAspectRatio}` : `Tỷ lệ: ${imageAspectRatio}`}>
                                    <Icons.RectangleFrame size={20} className={((inputType === 'video' ? videoAspectRatio : imageAspectRatio).includes('9:16') || (inputType === 'image' && imageAspectRatio === '3:4')) ? 'rotate-90' : ''} />
                                    <span className="text-sm font-medium leading-none">x{inputType === 'video' ? (videoX2 ? '2' : '1') : imageCount}</span>
                                </div>
                            )}

                            {/* Unified Tuning Icon + Dropdown */}
                            <div className="relative" ref={tuningRef}>
                                <button
                                    type="button"
                                    onClick={() => { setIsTuningOpen(!isTuningOpen); setTuningSubMenu(null); }}
                                    className={`group h-9 w-9 flex items-center justify-center transition-colors border rounded-full ${isTuningOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-transparent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'}`}
                                    title={inputType === 'video' ? "Cài đặt video" : inputType === 'image' ? "Cài đặt hình ảnh" : "Cài đặt văn bản"}
                                >
                                    <Icons.TuningSquare size={20} isActive={isTuningOpen} />
                                </button>
                                {isTuningOpen && (
                                    <div className="absolute bottom-full right-0 mb-2 w-[32rem] bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 z-50 space-y-3">
                                        {/* Row 1: Ratio + Count (Only for Video & Image) */}
                                        {(inputType === 'video' || inputType === 'image') && (
                                            <div className="flex gap-3">
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
                                            <div className="flex gap-3">
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
                                                        {(() => {
                                                            const ModelIcon = effectiveModel.icon || Icons.Sparkles;
                                                            return <ModelIcon size={16} />;
                                                        })()}
                                                        {effectiveModel.name}
                                                    </span>
                                                </div>
                                                <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${tuningSubMenu === 'model' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            {tuningSubMenu === 'model' && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-[calc(100%-12px)] bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[60]">
                                                    {currentModels.map((model) => (
                                                        <button key={model.id} type="button"
                                                            onClick={() => { setSelectedModel(model); setTuningSubMenu(null); }}
                                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-lg ${effectiveModel.id === model.id ? 'bg-gray-100 dark:bg-[#303030]' : 'hover:bg-gray-50 dark:hover:bg-[#303030]'}`}>
                                                            <span className={effectiveModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                                                {(() => {
                                                                    const ModelIcon = model.icon || Icons.Sparkles;
                                                                    return <ModelIcon size={18} />;
                                                                })()}
                                                            </span>
                                                            <span className={`text-sm font-medium ${effectiveModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{model.name}</span>
                                                            {model.free ? (<span className="text-xs font-semibold ml-auto text-emerald-500">Free</span>) : model.credits != null && (<span className={`text-xs font-semibold ml-auto ${effectiveModel.id === model.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{model.credits}cr</span>)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Credit info */}
                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                                            Dựa trên chế độ cài đặt hiện tại, bạn cần dùng <span className="text-gray-900 dark:text-white font-bold underline cursor-pointer">
                                                {(() => {
                                                    const m = effectiveModel;
                                                    if (inputType === 'video') {
                                                        const qty = videoX2 ? 2 : 1;
                                                        return `${(m.credits || 0) * qty} tín dụng`;
                                                    } else if (inputType === 'image') {
                                                        if (m.free || m.id === 'pollinations') return 'Miễn phí ✨';
                                                        // Gemini image = 8cr, Stability = 4cr
                                                        const perImage = m.id === 'sdxl' ? 4 : 8;
                                                        return `${perImage * imageCount} tín dụng`;
                                                    } else {
                                                        // Text: Groq = 0, Gemini ≈ 1-2
                                                        return m.id === 'groq' ? '0 tín dụng' : '~1-2 tín dụng';
                                                    }
                                                })()}
                                            </span> cho mỗi lần tạo.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form input: textarea / files */}
                    <div className="flex flex-col gap-2">
                        {/* File đã chọn: trong form input; ẩn khi video frame-to-video (hiển thị ở 2 ô tròn dưới) */}
                        {(uploadedImage || uploadedFiles.filter(Boolean).length > 0) && !(inputType === 'video' && videoMode === 'frame-to-video') && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {uploadedImage && (
                                    <FileCard
                                        file={{ url: uploadedImage, name: 'Image', type: 'image' }}
                                        showRemove
                                        onRemove={() => setUploadedImage(null)}
                                        onImageClick={(url) => setLightboxImage(url)}
                                    />
                                )}
                                {uploadedFiles.map((file, index) => file ? (
                                    <FileCard
                                        key={index}
                                        file={file}
                                        showRemove
                                        onRemove={() => removeFile(index)}
                                        onImageClick={(url) => setLightboxImage(url)}
                                    />
                                ) : null)}
                            </div>
                        )}

                        <div className="w-full min-h-[2.75rem] py-1 mb-1 relative z-10 transition-all duration-300 overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                className="w-full min-h-[2.75rem] max-h-48 bg-transparent border-none p-0 text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 resize-none leading-relaxed overflow-x-hidden overflow-y-auto break-words"
                                placeholder={
                                    inputType === 'video'
                                        ? "Hãy mô tả video bạn muốn tạo. Thêm liên kết, hình ảnh hoặc tài liệu để có kết quả chính xác hơn."
                                        : inputType === 'image'
                                            ? 'Mô tả hình ảnh bạn muốn thiết kế và sử dụng "/" để đánh dấu văn bản cần thêm'
                                            : 'Mô tả nội dung bạn muốn viết hoặc chỉnh sửa...'
                                }
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Bottom toolbar Row: left = Action icons or frame slots, right = Send Button */}
                    <div className="flex justify-between items-end mt-2 relative z-20">
                        {/* Left: empty for text-to-video; two frame slots + swap for frame-to-video; Plus + menu otherwise */}
                        {inputType === 'video' && videoMode === 'text-to-video' && <div />}
                        {inputType === 'video' && videoMode === 'frame-to-video' && (
                            <div className="flex items-center gap-2" ref={menuRef}>
                                <input type="file" ref={frameFileInputRef} accept="image/*" onChange={handleFrameFileUpload} className="hidden" />
                                {/* Slot 0: first frame */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => { plusMenuFrameSlotRef.current = 0; setPlusMenuFrameSlot(0); setIsPlusMenuOpen(!isPlusMenuOpen); }}
                                        className={`relative group/thumb w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all ${isPlusMenuOpen && plusMenuFrameSlot === 0 ? 'bg-gray-200 dark:bg-[#252525]' : ''}`}
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
                                        {uploadedFiles[0] && (
                                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); removeFile(0); }} aria-label="Remove">
                                                <Icons.X size={18} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                    {isPlusMenuOpen && plusMenuFrameSlot === 0 && (
                                        <div className="absolute bottom-full left-0 mb-2 w-[min(90vw,380px)] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 p-2">
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => frameFileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white transition-colors text-sm font-medium">
                                                    <Icons.ArrowUp size={18} className="shrink-0" />
                                                    <span>{t.dashboard.uploadModal?.upload ?? 'Tải lên'}</span>
                                                </button>
                                                <button type="button" onClick={() => { handleSelectFromAssets(); }} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium">
                                                    <Icons.Folder size={18} className="shrink-0" />
                                                    <span>{t.dashboard.home?.chooseFromAssets ?? 'Chọn từ Asset'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={swapFrameOrder}
                                    disabled={(uploadedFiles[0] ? 1 : 0) + (uploadedFiles[1] ? 1 : 0) !== 2}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    title="Đổi thứ tự ảnh đầu / ảnh cuối"
                                >
                                    <Icons.ArrowLeftRight size={18} />
                                </button>
                                {/* Slot 1: last frame */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => { plusMenuFrameSlotRef.current = 1; setPlusMenuFrameSlot(1); setIsPlusMenuOpen(!isPlusMenuOpen); }}
                                        className={`relative group/thumb w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#252525] ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all ${isPlusMenuOpen && plusMenuFrameSlot === 1 ? 'bg-gray-200 dark:bg-[#252525]' : ''}`}
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
                                        {uploadedFiles[1] && (
                                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); removeFile(1); }} aria-label="Remove">
                                                <Icons.X size={18} className="text-white" />
                                            </span>
                                        )}
                                    </button>
                                    {isPlusMenuOpen && plusMenuFrameSlot === 1 && (
                                        <div className="absolute bottom-full left-0 mb-2 w-[min(90vw,380px)] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 p-2">
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => frameFileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white transition-colors text-sm font-medium">
                                                    <Icons.ArrowUp size={18} className="shrink-0" />
                                                    <span>{t.dashboard.uploadModal?.upload ?? 'Tải lên'}</span>
                                                </button>
                                                <button type="button" onClick={() => { handleSelectFromAssets(); }} className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium">
                                                    <Icons.Folder size={18} className="shrink-0" />
                                                    <span>{t.dashboard.home?.chooseFromAssets ?? 'Chọn từ Asset'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {!(inputType === 'video' && (videoMode === 'text-to-video' || videoMode === 'frame-to-video')) && (
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/50 active:scale-[0.98] ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-zinc-800 shadow-inner' : ''}`}
                                        title={t.dashboard.home?.addContent || 'Thêm nội dung'}
                                    >
                                        <Icons.Plus size={24} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
                                    </button>
                                    {isPlusMenuOpen && (
                                        <div className="absolute bottom-full left-0 mb-3 w-64 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#27272a] p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <button
                                                onClick={() => { fileInputRef.current?.click(); setIsPlusMenuOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#252525] text-gray-700 dark:text-gray-300 transition-colors text-left font-medium"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <Icons.Monitor size={18} />
                                                </div>
                                                <span>Tải từ máy tính</span>
                                            </button>
                                            <input type="file" ref={fileInputRef} accept={getAcceptTypes(inputType)} multiple onChange={handleFileUpload} className="hidden" />
                                            <button
                                                onClick={() => { handleSelectFromAssets(); setIsPlusMenuOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#252525] text-gray-700 dark:text-gray-300 transition-colors text-left font-medium"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <Icons.Folder size={18} />
                                                </div>
                                                <span>Chọn từ Tài nguyên</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Send Button */}
                        <button
                            onClick={() => handleSend(inputValue)}
                            disabled={(!inputValue.trim() && !uploadedImage && uploadedFiles.filter(Boolean).length === 0) || isLoading}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${(inputValue.trim() || uploadedImage || uploadedFiles.filter(Boolean).length > 0) && !isLoading ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 shadow-md hover:shadow-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600' : 'bg-gray-100 dark:bg-[#1E293B] text-gray-400 dark:text-gray-600 cursor-not-allowed scale-95 opacity-50'}`}
                        >
                            <Icons.ArrowRight size={20} className={isLoading ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                    </div>
                <div className="text-center mt-2 pb-1">
                    <p className="text-[10px] text-gray-400">AI có thể mắc lỗi. Vui lòng kiểm tra lại nội dung được tạo.</p>
                </div>
                </div>
            </div>

            <ShareTemplateModal
                isOpen={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    setShareContent('');
                    setSharePrompt('');
                }}
                initialContent={shareContent}
                prompt={sharePrompt}
                user={user}
            />

            <SelectFileModal
                isOpen={isSelectingFromAssets}
                onClose={() => { setIsSelectingFromAssets(false); setPlusMenuFrameSlot(null); plusMenuFrameSlotRef.current = null; }}
                onSelectFile={(file) => {
                    const slot = plusMenuFrameSlotRef.current;
                    if (slot !== undefined && slot !== null) {
                        handleFileSelectedForSlot(slot, file);
                    } else {
                        setUploadedFiles(prev => [...prev, file]);
                    }
                    toast.success('Đã chọn file từ Tài nguyên');
                    setIsSelectingFromAssets(false);
                }}
            />

            {/* Community Share Modal */}
            <ShareModal
                isOpen={showCommunityShareModal}
                onClose={() => {
                    setShowCommunityShareModal(false);
                    setShareMediaData(null);
                }}
                mediaUrl={shareMediaData?.mediaUrl}
                prompt={shareMediaData?.prompt}
                type={shareMediaData?.type}
                model={shareMediaData?.model}
            />

            {/* Lightbox: xem full ảnh, nút X thoát */}
            {
                lightboxImage && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setLightboxImage(null)}
                    >
                        <button
                            type="button"
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                            title="Đóng"
                        >
                            <Icons.X size={24} />
                        </button>
                        <img
                            src={lightboxImage}
                            alt="Xem ảnh"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </div>
    );
};
