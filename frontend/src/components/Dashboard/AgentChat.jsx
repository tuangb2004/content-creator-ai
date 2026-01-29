import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Icons } from '../Icons';
import { generateContent, saveProject, getProjects, getProject, uploadFile, getUploads } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';
import SelectFileModal from './SelectFileModal';
import { useAuth } from '../../contexts/AuthContext';
import ShareTemplateModal from '../Templates/ShareTemplateModal';

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

/** Coi là ảnh nếu type image/ hoặc URL là data:image/ hoặc có đuôi ảnh (tránh chỉ hiện icon file) */
const isImageFile = (f) => {
    if (!f) return false;
    const type = f.type || '';
    const url = f.url || '';
    return type.startsWith('image/') || url.startsWith('data:image/') || /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url);
};

const isDataUrl = (url) => typeof url === 'string' && url.startsWith('data:');

/** Loại file hiển thị (PNG, PDF, ...) */
const fileDisplayType = (f) => {
    if (!f) return 'FILE';
    const t = (f.type || '').toLowerCase();
    if (t.includes('pdf')) return 'PDF';
    if (t.includes('png')) return 'PNG';
    if (t.includes('jpeg') || t.includes('jpg')) return 'JPEG';
    if (t.includes('gif')) return 'GIF';
    if (t.includes('webp')) return 'WEBP';
    const u = (f.url || '').toLowerCase();
    if (/\.pdf(\?|$)/.test(u)) return 'PDF';
    if (/\.png(\?|$)/.test(u)) return 'PNG';
    if (/\.jpe?g(\?|$)/.test(u)) return 'JPEG';
    return (t.split('/')[1] || 'FILE').toUpperCase();
};

/** Card file đính kèm (ảnh 2): thumbnail | tên + loại | optional X. Click ảnh → mở full ảnh (lightbox). */
const FileCard = ({ file, onRemove, showRemove = false, onImageClick }) => {
    const isImg = isImageFile(file);
    const thumb = (
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {isImg ? (
                <img src={file.url} alt={file.name || ''} className="w-full h-full object-cover" />
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
                <button type="button" onClick={onRemove} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0 absolute top-2 right-2" title="Xóa">
                    <Icons.X size={16} />
                </button>
            )}
        </div>
    );
};

const MessageItem = ({ msg, onShare, onImageClick }) => {
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
                            return <IconComponent size={16} />;
                        })()}
                    </div>
                )}

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start flex-1 min-w-0'}`}>
                    {/* File/ảnh đính kèm: nằm TRÊN bubble, không trong bubble */}
                    {isUser && displayFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 w-full max-w-[85%] md:max-w-[75%] justify-end">
                            {displayFiles.map((f, i) => (
                                <FileCard key={i} file={f} showRemove={false} onImageClick={onImageClick} />
                            ))}
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
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
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

                        {msg.mediaUrl && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                {onImageClick ? (
                                    <button type="button" onClick={() => onImageClick(msg.mediaUrl)} className="block w-full text-left rounded-xl overflow-hidden ring-offset-2 hover:ring-2 hover:ring-purple-400 focus:ring-2 focus:ring-purple-400 focus:outline-none">
                                        <img src={msg.mediaUrl} alt="Generated Content" className="w-full h-auto max-w-sm" />
                                    </button>
                                ) : (
                                    <img src={msg.mediaUrl} alt="Generated Content" className="w-full h-auto max-w-sm" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Action Buttons */}
                    {!isUser && !msg.isError && (
                        <div className="flex items-center gap-1 mt-2 -ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Thích">
                                <Icons.ThumbsUp size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Không thích">
                                <Icons.ThumbsDown size={16} />
                            </button>
                            <button
                                onClick={() => onShare(msg.content)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Chia sẻ mẫu"
                            >
                                <Icons.Share2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Thêm">
                                <Icons.MoreVertical size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Normalize messages from backend (may have Firestore timestamps) for display */
const normalizeMessages = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((m, i) => ({
        id: m.id || `msg-${i}-${Date.now()}`,
        role: m.role === 'user' ? 'user' : 'model',
        content: typeof m.content === 'string' ? m.content : '',
        timestamp: m.timestamp,
        mediaUrl: m.mediaUrl ?? null,
        attachedFiles: Array.isArray(m.attachedFiles) ? m.attachedFiles : null,
        modelId: m.modelId ?? null,
        inputType: m.inputType ?? null,
        isError: !!m.isError,
    }));
};

export const AgentChat = ({ initialPrompt, initialMessages, projectId: initialProjectId, initialInputType = 'image', initialModel, initialMorphOffsetY, initialFileUrls = [], onBack }) => {
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
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [isRatioMenuOpen, setIsRatioMenuOpen] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [isAutoRatio, setIsAutoRatio] = useState(true);
    const [isVideoRatioLangMenuOpen, setIsVideoRatioLangMenuOpen] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState('9:16');
    const [videoLanguage, setVideoLanguage] = useState('EN');

    // New Feature States
    const [isLengthMenuOpen, setIsLengthMenuOpen] = useState(false);
    const [selectedLength, setSelectedLength] = useState({ id: 'medium', label: 'Vừa' });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareContent, setShareContent] = useState('');
    const [isSelectingFromAssets, setIsSelectingFromAssets] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);
    const fileInputRef = useRef(null);
    const assetsFileInputRef = useRef(null);

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
                    title: p.title || 'Untitled',
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
    const modelMenuRef = useRef(null);
    const ratioMenuRef = useRef(null);
    const lengthMenuRef = useRef(null);
    const videoRatioLangMenuRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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
                    const userContent = p.title || p.metadata?.prompt || 'Sáng tạo mới';
                    const aiContent = p.content?.text || (p.content?.imageUrl ? 'Dưới đây là hình ảnh được tạo dựa trên mô tả của bạn.' : '');
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
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
                setIsModelMenuOpen(false);
            }
            if (ratioMenuRef.current && !ratioMenuRef.current.contains(event.target)) {
                setIsRatioMenuOpen(false);
            }
            if (lengthMenuRef.current && !lengthMenuRef.current.contains(event.target)) {
                setIsLengthMenuOpen(false);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            toast.error('File size must be less than 20MB');
            return;
        }

        // If it's an image, use legacy uploadedImage for backward compatibility
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                setIsPlusMenuOpen(false);
            };
            reader.readAsDataURL(file);
            return;
        }

        // For other files (PDF, text, etc.), upload to Storage
        try {
            const reader = new FileReader();
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
                        setUploadedFiles(prev => [...prev, { url: result.fileUrl, name: file.name, type: file.type }]);
                        toast.success('File đã được tải lên');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    toast.error('Lỗi khi tải lên file');
                }
            };
            reader.readAsDataURL(file);
            setIsPlusMenuOpen(false);
        } catch (error) {
            console.error('File read error:', error);
            toast.error('Lỗi khi đọc file');
        }
    };

    const handleSelectFromAssets = () => {
        setIsSelectingFromAssets(true);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleShareClick = (content) => {
        setShareContent(content);
        setShowShareModal(true);
    };

    const handleSend = async (text) => {
        if (!text.trim() && uploadedFiles.length === 0 && !uploadedImage) return;

        // Lưu file đính kèm vào message user (hiển thị như Gemini/ChatGPT)
        const attachedFiles = uploadedFiles.map(f => ({ url: f.url, name: f.name, type: f.type }));
        const firstImageUrl = (uploadedImage && typeof uploadedImage === 'string')
            ? uploadedImage
            : (uploadedFiles.find(f => isImageFile(f))?.url ?? null);

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: text || (uploadedFiles.length > 0 ? `Phân tích ${uploadedFiles.length} file đính kèm` : ''),
            timestamp: new Date(),
            mediaUrl: firstImageUrl ?? null,
            attachedFiles: attachedFiles.length > 0 ? attachedFiles : null
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const model = (selectedModel && (MODELS[inputType] || MODELS.image).find(m => m.id === selectedModel.id)) ? selectedModel : (MODELS[inputType] || MODELS.image)[0];
        try {
            // Determine provider
            let provider = 'gemini'; // Default
            if (inputType === 'text') {
                provider = model?.id === 'groq' ? 'groq' : 'gemini';
            } else if (inputType === 'image') {
                provider = model?.id === 'sdxl' ? 'stability' : 'gemini'; // Nano = Gemini
            }

            // Collect file URLs (from uploadedFiles and uploadedImage if it's a URL)
            const fileUrls = uploadedFiles.map(f => f.url);
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
                ratio: isAutoRatio ? undefined : selectedRatio,
                image: uploadedImage && !uploadedImage.startsWith('http') ? uploadedImage : undefined, // Legacy base64 image
                fileUrls: fileUrls.length > 0 ? fileUrls : undefined // New file URLs for Gemini File API
            });

            // Clear files after sending
            setUploadedImage(null);
            setUploadedFiles([]);

            let imageUrlToSave = result.contentType === 'image' ? result.content : null;
            if (result.contentType === 'image' && isDataUrl(result.content) && user?.uid) {
                try {
                    imageUrlToSave = await uploadDataUrlToStorage(result.content, user.uid);
                } catch (e) {
                    console.warn('Upload generated image to Storage failed:', e);
                    toast.error('Client upload failed. Sending to server for backup save.');
                    // Fallback: send Data URL to server to handle
                    imageUrlToSave = result.content;
                }
            }
            const displayImageUrl = result.contentType === 'image' ? (imageUrlToSave || result.content) : null;

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: result.contentType === 'image' ? "Dưới đây là hình ảnh được tạo dựa trên mô tả của bạn:" : result.content,
                timestamp: new Date(),
                type: result.contentType,
                mediaUrl: displayImageUrl,
                modelId: model?.id,
                inputType: inputType
            };

            const updatedMessages = [...messages, userMsg, aiMsg];
            setMessages(prev => [...prev, aiMsg]);

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
                    imageUrl: imageUrlToSave ?? undefined
                },
                messages: updatedMessages.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp,
                    // Use getSafeMediaUrl logic: allow Data URL if it's what we want to save
                    mediaUrl: m.mediaUrl || null,
                    attachedFiles: sanitizeAttached(m.attachedFiles) ?? null,
                    modelId: m.modelId ?? null,
                    inputType: m.inputType ?? null,
                    isError: m.isError ?? null
                }))
            };
            const saveResult = await saveProject(payload);

            // If server returned a new project with updated URLs (backend upload), use it
            if (saveResult?.project) {
                // Update local messages with server version (which has HTTP URLs)
                if (saveResult.project.messages) {
                    setMessages(normalizeMessages(saveResult.project.messages));
                }
            }

            if (saveResult?.projectId && !projectId) {
                setProjectId(saveResult.projectId);
            }
            if (isHistoryOpen) fetchHistory();

        } catch (error) {
            console.error("Generation Error:", error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: error.message || "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn.",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
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
                        title="Quay lại"
                    >
                        <Icons.ArrowRight className="rotate-180" size={20} />
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center backdrop-blur-sm border ${isHistoryOpen
                            ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                            : 'bg-white/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        title="Lịch sử chat"
                    >
                        <Icons.Clock size={20} />
                    </button>
                </div>


            </div>

            {/* History Sidebar */}
            {isHistoryOpen && (
                <div className="absolute top-4 left-6 bottom-32 w-72 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 z-40 animate-in slide-in-from-left-4 duration-300 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Lịch sử</h3>
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
                            <p>Bắt đầu cuộc trò chuyện với CreatorAI</p>
                        </div>
                    )}
                    {messages.length === 0 && loadingProject && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 mt-20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                            <p className="text-sm">Đang tải đoạn chat...</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageItem
                            key={msg.id}
                            msg={msg}
                            onShare={handleShareClick}
                            onImageClick={(url) => setLightboxImage(url)}
                        />
                    ))}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-purple-600 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                    {(effectiveModel && effectiveModel.icon) ? (
                                        <effectiveModel.icon size={16} isActive={true} />
                                    ) : (
                                        <Icons.Sparkles size={16} />
                                    )}
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

            <div className="absolute bottom-0 left-0 right-0 pb-4 pt-4 px-4 md:px-8 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/95 z-10">
                <div
                    className="max-w-3xl mx-auto relative bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-6 shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200/80 dark:focus-within:ring-gray-600/50 focus-within:shadow-xl"
                    style={{
                        transform: `translate3d(0, ${formOffsetY}px, 0)`,
                        transition: `transform ${MORPH_DURATION}ms ${MORPH_EASING}`,
                        willChange: formOffsetY !== 0 ? 'transform' : 'auto',
                    }}
                >
                    {/* File đã chọn: trong form input (kiểu ảnh 3), không để ngoài */}
                    {(uploadedImage || uploadedFiles.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {uploadedImage && (
                                <FileCard
                                    file={{ url: uploadedImage, name: 'Image', type: 'image' }}
                                    showRemove
                                    onRemove={() => setUploadedImage(null)}
                                    onImageClick={(url) => setLightboxImage(url)}
                                />
                            )}
                            {uploadedFiles.map((file, index) => (
                                <FileCard
                                    key={index}
                                    file={file}
                                    showRemove
                                    onRemove={() => removeFile(index)}
                                    onImageClick={(url) => setLightboxImage(url)}
                                />
                            ))}
                        </div>
                    )}
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            inputType === 'video'
                                ? "Hãy mô tả video bạn muốn tạo. Thêm liên kết, hình ảnh hoặc tài liệu để có kết quả chính xác hơn."
                                : inputType === 'image'
                                    ? 'Mô tả hình ảnh bạn muốn thiết kế và sử dụng "/" để đánh dấu văn bản cần thêm'
                                    : 'Mô tả nội dung bạn muốn viết hoặc chỉnh sửa...'
                        }
                        className="w-full h-16 bg-transparent border-0 focus:border-0 focus:ring-0 ring-0 focus:outline-none outline-none appearance-none text-lg text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:placeholder-gray-500 dark:focus:placeholder-gray-400 resize-none leading-relaxed shadow-none transition-colors duration-200"
                        rows={1}
                        autoFocus
                    />

                    <div className="flex items-center justify-between mt-4 px-1 transition-opacity duration-100">
                        <div className="flex items-center gap-2 relative">
                            {/* Plus Button with Menu (Shared - match Home) */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                >
                                    <Icons.PlusCircle size={24} isActive={isPlusMenuOpen} />
                                </button>

                                {isPlusMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                                setIsPlusMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left"
                                        >
                                            <Icons.Monitor size={18} className="text-black/60" />
                                            Tải lên từ máy tính
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*,application/pdf,text/plain,text/markdown,text/csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => {
                                                handleSelectFromAssets();
                                                setIsPlusMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left"
                                        >
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
                                            <div className="absolute top-0 left-full ml-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0">
                                                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                    <Icons.Link size={18} className="text-black/60" />
                                                    Nhập từ liên kết sản phẩm
                                                </button>
                                                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                    <Icons.Box size={18} className="text-black/60" />
                                                    Tải lên từ Dropbox
                                                </button>
                                                <div className="relative group/qr">
                                                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                        <div className="flex items-center gap-3">
                                                            <Icons.Smartphone size={18} className="text-black/60" />
                                                            Tải lên từ điện thoại
                                                        </div>
                                                        <Icons.ChevronRight size={14} className="text-black/40" />
                                                    </button>
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
                                        <effectiveModel.icon size={14} isActive />
                                        <span>{effectiveModel.name}</span>
                                    </button>
                                    {isModelMenuOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            {currentModels.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => { setSelectedModel(model); setIsModelMenuOpen(false); }}
                                                    className={`flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer text-left transition-colors group ${effectiveModel.id === model.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                                                        <model.icon size={20} isActive={effectiveModel.id === model.id} />
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
                                <div className="relative" ref={ratioMenuRef}>
                                    <button
                                        onClick={() => setIsRatioMenuOpen(!isRatioMenuOpen)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isRatioMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        <Icons.Pip size={14} isActive={isRatioMenuOpen} />
                                        <span>{isAutoRatio ? 'Tỉ lệ' : selectedRatio}</span>
                                    </button>
                                    {isRatioMenuOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="flex items-center justify-between mb-5">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">Tỉ lệ khung hình</span>
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto</span>
                                                    <button onClick={() => setIsAutoRatio(!isAutoRatio)} className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isAutoRatio ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform ${isAutoRatio ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={`grid grid-cols-4 gap-2 transition-opacity duration-200 ${isAutoRatio ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                                {ratios.map((ratio) => (
                                                    <button
                                                        key={ratio.label}
                                                        onClick={() => { setSelectedRatio(ratio.label); setIsRatioMenuOpen(false); }}
                                                        className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl transition-all border ${selectedRatio === ratio.label ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                    >
                                                        <div className="h-8 flex items-center justify-center">
                                                            <div className={`${ratio.width} ${ratio.height} border-[1.5px] rounded-sm transition-colors ${selectedRatio === ratio.label ? 'border-purple-600 dark:border-purple-400 bg-purple-100/50 dark:bg-purple-400/20' : 'border-gray-400 dark:border-gray-500'}`}></div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${selectedRatio === ratio.label ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>{ratio.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {isAutoRatio && (
                                                <div className="mt-4 p-2.5 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                                                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium leading-relaxed">Chế độ tự động sẽ chọn tỉ lệ tối ưu dựa trên nội dung bạn mô tả.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {inputType === 'text' && (
                                <>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b]">
                                        <Icons.LayoutGrid size={14} />
                                        <span>Mẫu</span>
                                    </button>
                                    <div className="relative" ref={lengthMenuRef}>
                                        <button
                                            onClick={() => setIsLengthMenuOpen(!isLengthMenuOpen)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] group ${isLengthMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600' : ''}`}
                                        >
                                            <Icons.Sliders size={14} />
                                            <span>{selectedLength.label}</span>
                                        </button>
                                        {isLengthMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-1 z-50">
                                                {[{ id: 'short', label: 'Ngắn' }, { id: 'medium', label: 'Vừa' }, { id: 'long', label: 'Dài' }].map(l => (
                                                    <button key={l.id} onClick={() => { setSelectedLength(l); setIsLengthMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200">
                                                        {l.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => handleSend(inputValue)}
                            disabled={(!inputValue.trim() && !uploadedImage && uploadedFiles.length === 0) || isLoading}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1e293b] ${(inputValue.trim() || uploadedImage || uploadedFiles.length > 0) && !isLoading ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Icons.ArrowUp size={16} />
                        </button>
                    </div>

                </div>
                <div className="text-center mt-2 pb-1">
                    <p className="text-[10px] text-gray-400">AI có thể mắc lỗi. Vui lòng kiểm tra lại nội dung được tạo.</p>
                </div>
            </div>

            <ShareTemplateModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                initialContent={shareContent}
                user={user}
            />

            <SelectFileModal
                isOpen={isSelectingFromAssets}
                onClose={() => setIsSelectingFromAssets(false)}
                onSelectFile={(file) => {
                    setUploadedFiles(prev => [...prev, file]);
                    toast.success('Đã chọn file từ Tài nguyên');
                }}
            />

            {/* Lightbox: xem full ảnh, nút X thoát */}
            {lightboxImage && (
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
            )}
        </div>
    );
};
