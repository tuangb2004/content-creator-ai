import { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { VIDEO_MODELS, requestVideoGeneration, pollVideoStatus } from '../../services/videoGeneration';
import toast from '../../utils/toast';

const RATIOS = [
    { id: '16:9', label: '16:9', width: 'w-8', height: 'h-4' },
    { id: '9:16', label: '9:16', width: 'w-3', height: 'h-5' },
    { id: '1:1', label: '1:1', width: 'w-5', height: 'h-5' },
];

const LANGUAGES = [
    { id: 'EN', label: 'English' },
    { id: 'VI', label: 'Tiếng Việt' },
];

const VideoGenerator = () => {
    const { t } = useLanguage();
    const { userData, refreshUserData } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const [isRatioLangMenuOpen, setIsRatioLangMenuOpen] = useState(false);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
    const [selectedRatio, setSelectedRatio] = useState('16:9');
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0]); // Default: Veo 3.1 Fast
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState(null);
    const [generatedVideo, setGeneratedVideo] = useState(null);

    const menuRef = useRef(null);
    const ratioLangMenuRef = useRef(null);
    const modelMenuRef = useRef(null);

    const userCredits = userData?.credits || 0;
    const userPlan = userData?.plan || 'free';
    const canGenerateVideo = userPlan !== 'free' && userCredits >= selectedModel.credits;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsPlusMenuOpen(false);
            }
            if (ratioLangMenuRef.current && !ratioLangMenuRef.current.contains(event.target)) {
                setIsRatioLangMenuOpen(false);
            }
            if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
                setIsModelMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Check if free plan
        if (userPlan === 'free') {
            toast.error('Video generation is only available for Pro and higher plans. Please upgrade.');
            return;
        }

        // Check credits
        if (userCredits < selectedModel.credits) {
            toast.error(`Insufficient credits. Need ${selectedModel.credits} credits, you have ${userCredits}.`);
            return;
        }

        setIsGenerating(true);
        setGenerationStatus({ status: 'requesting', message: 'Sending request...' });

        try {
            // Request video generation
            const result = await requestVideoGeneration({
                prompt: inputValue.trim(),
                model: selectedModel.id,
                aspectRatio: selectedRatio,
                duration: 8,
            });

            if (!result.success) {
                throw new Error(result.message || 'Failed to queue video');
            }

            setGenerationStatus({
                status: 'queued',
                message: result.message,
                position: result.position,
                queueId: result.queueId,
            });

            toast.success(`Video queued! Position: ${result.position}`);

            // Start polling for completion
            const pollResult = await pollVideoStatus(
                result.queueId,
                (status) => {
                    setGenerationStatus({
                        status: status.status,
                        message: status.status === 'processing' ? 'Generating video...' : 'In queue...',
                        position: status.position,
                    });
                }
            );

            if (pollResult.success) {
                setGeneratedVideo({
                    url: pollResult.videoUrl,
                    thumbnail: pollResult.thumbnailUrl,
                });
                toast.success('Video generated successfully!');
                refreshUserData(); // Refresh credits
            } else {
                throw new Error(pollResult.error || 'Video generation failed');
            }
        } catch (error) {
            console.error('Video generation error:', error);
            toast.error(error.message || 'Failed to generate video');
            setGenerationStatus({ status: 'failed', message: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const resetGeneration = () => {
        setGeneratedVideo(null);
        setGenerationStatus(null);
        setInputValue('');
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-white dark:bg-[#0f172a]">
            {/* Main Content Container */}
            <div className="flex-1 flex flex-col items-center pt-12 md:pt-16 px-6 max-w-5xl mx-auto w-full">

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-black dark:text-white tracking-tight">
                    {t?.dashboard?.videoGen?.title || 'Create Video'}
                </h1>

                {/* Credit Info */}
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Credits: <span className="font-bold text-black dark:text-white">{userCredits.toLocaleString()}</span>
                    </span>
                    {userPlan === 'free' && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                            Upgrade to Pro for video generation
                        </span>
                    )}
                </div>

                {/* Generated Video Preview */}
                {generatedVideo && (
                    <div className="w-full max-w-2xl mb-8 rounded-2xl overflow-hidden bg-black">
                        <video
                            src={generatedVideo.url}
                            controls
                            className="w-full aspect-video"
                            poster={generatedVideo.thumbnail}
                        />
                        <div className="p-4 bg-gray-900 flex items-center justify-between">
                            <a
                                href={generatedVideo.url}
                                download
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                <Icons.Download size={16} />
                                Download
                            </a>
                            <button
                                onClick={resetGeneration}
                                className="px-4 py-2 text-white text-sm font-medium hover:bg-gray-800 rounded-full transition-colors"
                            >
                                Create New
                            </button>
                        </div>
                    </div>
                )}

                {/* Generation Status */}
                {isGenerating && generationStatus && (
                    <div className="w-full max-w-2xl mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div>
                                <p className="font-medium text-black dark:text-white">
                                    {generationStatus.status === 'queued' ? 'In Queue' : 'Generating...'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {generationStatus.message}
                                    {generationStatus.position > 1 && ` (Position: ${generationStatus.position})`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                {!generatedVideo && (
                    <div className="w-full max-w-3xl mx-auto mb-8 relative z-20">
                        <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-shadow relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isGenerating}
                                className="w-full h-16 bg-transparent border-0 focus:border-0 focus:ring-0 ring-0 focus:outline-none outline-none appearance-none text-lg text-gray-600 dark:text-gray-300 placeholder-gray-400 resize-none leading-relaxed shadow-none disabled:opacity-50"
                                placeholder={t?.dashboard?.videoGen?.placeholder || 'Describe the video you want to create...'}
                            ></textarea>

                            <div className="flex items-center justify-between mt-4 px-1">
                                <div className="flex items-center gap-2 relative">
                                    {/* Plus Menu */}
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                            disabled={isGenerating}
                                            className={`w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-400 flex items-center justify-center transition-all disabled:opacity-50 ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-gray-700 rotate-45' : ''}`}
                                        >
                                            <Icons.Plus size={16} />
                                        </button>

                                        {isPlusMenuOpen && (
                                            <div className="absolute top-14 left-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                    <Icons.Monitor size={18} className="text-black/60" />
                                                    {t?.dashboard?.home?.uploadFromComputer || 'Upload from computer'}
                                                </button>
                                                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-medium text-black dark:text-gray-200 transition-colors text-left">
                                                    <Icons.Folder size={18} className="text-black/60" />
                                                    {t?.dashboard?.home?.chooseFromAssets || 'Choose from assets'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Model Selector */}
                                    <div className="relative" ref={modelMenuRef}>
                                        <button
                                            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                                            disabled={isGenerating}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${isModelMenuOpen ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300' : 'border-gray-300 dark:border-gray-600 text-black dark:text-gray-300'}`}
                                        >
                                            <Icons.Video size={14} />
                                            <span>{selectedModel.name}</span>
                                            <span className="text-purple-500 dark:text-purple-400 ml-1">
                                                {selectedModel.credits} cr
                                            </span>
                                        </button>

                                        {isModelMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Video Model</h3>
                                                <div className="space-y-1">
                                                    {VIDEO_MODELS.map((model) => (
                                                        <button
                                                            key={model.id}
                                                            onClick={() => {
                                                                setSelectedModel(model);
                                                                setIsModelMenuOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-colors ${selectedModel.id === model.id ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'}`}
                                                        >
                                                            <div>
                                                                <p className="font-medium text-black dark:text-white">{model.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{model.description}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-purple-600 dark:text-purple-400">{model.credits}</p>
                                                                <p className="text-xs text-gray-400">credits</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ratio & Language Selector */}
                                    <div className="relative" ref={ratioLangMenuRef}>
                                        <button
                                            onClick={() => setIsRatioLangMenuOpen(!isRatioLangMenuOpen)}
                                            disabled={isGenerating}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-black dark:text-gray-300 text-xs font-bold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 ${isRatioLangMenuOpen ? 'bg-gray-100 dark:bg-gray-700 border-gray-400' : 'border-gray-300 dark:border-gray-600'}`}
                                        >
                                            <Icons.TuningSquare size={14} isActive={isRatioLangMenuOpen} />
                                            <span>{selectedRatio}</span>
                                        </button>

                                        {isRatioLangMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 tracking-tight">{t?.dashboard?.home?.aspectRatio || 'Aspect Ratio'}</h3>
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

                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 tracking-tight">{t?.settings?.language || 'Language'}</h3>
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
                                </div>

                                {/* Send Button with Credit Cost */}
                                <div className="flex items-center gap-3">
                                    {inputValue.trim() && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Cost: <span className="font-bold text-purple-600 dark:text-purple-400">{selectedModel.credits}</span> credits
                                        </span>
                                    )}
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isGenerating || !canGenerateVideo}
                                        className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center ${inputValue.trim() && canGenerateVideo && !isGenerating ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                                        title={!canGenerateVideo ? (userPlan === 'free' ? 'Upgrade to Pro' : 'Insufficient credits') : 'Generate video'}
                                    >
                                        {isGenerating ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Icons.ArrowUp size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popular Tools */}
                <div className="w-full max-w-4xl">
                    <h2 className="text-center text-black dark:text-gray-400 font-medium mb-6">{t?.dashboard?.videoGen?.popularTools || 'Popular Tools'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Bot size={24} className="text-teal-600 dark:text-teal-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.avatarVideo || 'Avatar Video'}</span>
                        </button>

                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Mic size={24} className="text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.talkingPhoto || 'AI Talking Photo'}</span>
                        </button>

                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Store size={24} className="text-amber-600 dark:text-amber-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.productShowcase || 'Product Showcase'}</span>
                        </button>

                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Image size={24} className="text-slate-600 dark:text-slate-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.removeBackground || 'Remove Background'}</span>
                        </button>

                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Scissors size={24} className="text-blue-600 dark:text-blue-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.quickCut || 'Quick Cut'}</span>
                        </button>

                        <button className="flex items-center p-3 bg-gray-50 dark:bg-[#1e293b] border border-transparent dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Icons.Clapperboard size={24} className="text-pink-600 dark:text-pink-300" />
                            </div>
                            <span className="font-medium text-black dark:text-gray-200">{t?.dashboard?.videoGen?.videoEditor || 'Video Editor'}</span>
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-20 w-full"></div>
            </div>

            {/* Help Bubble */}
            <button className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50">
                <Icons.HelpCircle size={24} />
            </button>
        </div>
    );
};

export default VideoGenerator;
