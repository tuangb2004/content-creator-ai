import { useState, useRef, useEffect } from 'react';
import { generateContent as generateContentFunction, ErrorTypes, isErrorType } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ProductDetail = ({ tool, onBack, onSave }) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const { userData } = useAuth();
  
  // Safety check: if tool is not provided, return null
  if (!tool || !tool.id) {
    return null;
  }
  
  // Storage key for this tool
  const storageKey = `tool_${tool.id}_draft`;
  
  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          prompt: parsed.prompt || '',
          style: parsed.style || 'Professional',
          result: parsed.result || {type: 'text', content: ''},
          textProvider: parsed.textProvider || (userData?.plan === 'free' ? 'groq' : 'gemini'),
          imageProvider: parsed.imageProvider || 'stability',
          history: parsed.history || [''],
          historyIndex: parsed.historyIndex || 0
        };
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    return null;
  };
  
  const savedState = loadSavedState();
  
  const [prompt, setPrompt] = useState(savedState?.prompt || '');
  const [style, setStyle] = useState(savedState?.style || 'Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState?.result || {type: 'text', content: ''});
  
  // Provider selection state
  const userPlan = userData?.plan || 'free';
  const isTextTool = tool.inputType === 'text';
  const isImageTool = tool.inputType === 'image_prompt';
  
  // Default providers based on plan
  const defaultTextProvider = userPlan === 'free' ? 'groq' : 'gemini';
  const defaultImageProvider = 'stability'; // Stability AI is the default (Pollination is down)
  
  const [textProvider, setTextProvider] = useState(savedState?.textProvider || defaultTextProvider);
  const [imageProvider, setImageProvider] = useState(savedState?.imageProvider || defaultImageProvider);
  
  const [showStyleInfo, setShowStyleInfo] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Undo/Redo State
  const [history, setHistory] = useState(savedState?.history || ['']);
  const [historyIndex, setHistoryIndex] = useState(savedState?.historyIndex || 0);
  const historyRef = useRef(savedState?.history || ['']);
  const indexRef = useRef(savedState?.historyIndex || 0);
  const timeoutRef = useRef(null);
  
  // Initialize historyRef and indexRef with saved state when tool changes
  useEffect(() => {
    const currentSavedState = loadSavedState();
    if (currentSavedState) {
      historyRef.current = currentSavedState.history || [''];
      indexRef.current = currentSavedState.historyIndex || 0;
    }
  }, [tool.id]); // Only run when tool changes
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      prompt,
      style,
      result,
      textProvider,
      imageProvider,
      history: historyRef.current,
      historyIndex: indexRef.current,
      timestamp: Date.now()
    };
    
    // Only save if there's actual content (prompt or result)
    if (prompt.trim() || (result && result.content)) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      } catch (e) {
        console.error('Error saving state:', e);
      }
    }
  }, [prompt, style, result, textProvider, imageProvider, storageKey]);

  const handlePromptChange = (e) => {
    const newVal = e.target.value;
    setPrompt(newVal);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
        const currentIndex = indexRef.current;
        const currentHistory = historyRef.current;
        
        if (currentHistory[currentIndex] === newVal) return;

        const newHistory = currentHistory.slice(0, currentIndex + 1);
        newHistory.push(newVal);

        historyRef.current = newHistory;
        indexRef.current = newHistory.length - 1;

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, 500);
  };

  const handleUndo = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (indexRef.current > 0) {
          const newIndex = indexRef.current - 1;
          indexRef.current = newIndex;
          setHistoryIndex(newIndex);
          setPrompt(historyRef.current[newIndex]);
      }
  };

  const handleRedo = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (indexRef.current < historyRef.current.length - 1) {
          const newIndex = indexRef.current + 1;
          indexRef.current = newIndex;
          setHistoryIndex(newIndex);
          setPrompt(historyRef.current[newIndex]);
      }
  };

  const generateToolContent = async (tool, prompt, style) => {
    try {
      if (tool.inputType === 'image_prompt') {
        // Generate image using Firebase Functions with Pollination
        const result = await generateContentFunction({
          prompt: prompt,
          contentType: 'image',
          provider: imageProvider
        });
        
        return { type: 'image', content: result.content };
      } else {
        // Generate text using Firebase Functions with Groq or Gemini
        const templateMap = {
          't1': 'blog',
          't3': 'caption',
          't4': 'caption', // Video script uses caption template
          't5': 'blog', // Content polisher uses blog template
          't6': 'blog', // Calendar uses blog template
          't7': 'blog', // Headline hero uses blog template
          't8': 'blog', // Niche explorer uses blog template
          't10': 'blog', // Content multiplier uses blog template
          't11': 'blog', // Content auditor uses blog template
          't12': 'email' // Outreach Oracle uses email template
        };
        const template = templateMap[tool.id] || 'blog';
        
        // Map style to tone
        const toneMap = {
          'Professional': 'professional',
          'Casual': 'casual',
          'Witty': 'persuasive',
          'Empathetic': 'friendly',
          'Luxury': 'professional',
          'Minimalist': 'professional'
        };
        const tone = toneMap[style] || 'professional';
        
        // Pass systemInstruction from tool definition (takes priority over template)
        const result = await generateContentFunction({
          prompt: prompt,
          template: template,
          tone: tone,
          length: 'medium',
          contentType: 'text',
          provider: textProvider,
          systemInstruction: tool.systemInstruction // Pass custom system instruction from tool
        });
        
        return { type: 'text', content: result.content };
      }
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    try {
      const generated = await generateToolContent(tool, prompt, style);
      setResult(generated);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      
      // Handle specific error types
      if (isErrorType(error, ErrorTypes.INSUFFICIENT_CREDITS)) {
        toast.error(error.message || 'Insufficient credits. Please upgrade your plan.');
      } else if (isErrorType(error, ErrorTypes.RATE_LIMIT)) {
        toast.error(error.message || 'Rate limit exceeded. Please try again later.');
      } else if (isErrorType(error, ErrorTypes.UNAUTHENTICATED)) {
        toast.error('Please log in to use this feature.');
      } else {
        toast.error(error.message || 'Generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (result) {
        onSave({
            id: Date.now().toString(),
            toolName: tool.name,
            prompt: prompt,
            result: result.content,
            type: result.type,
            timestamp: Date.now()
        });
        // Clear saved state after successful save
        try {
          localStorage.removeItem(storageKey);
        } catch (e) {
          console.error('Error clearing saved state:', e);
        }
        // Reset states
        setPrompt('');
        setResult({type: 'text', content: ''});
        setHistory(['']);
        setHistoryIndex(0);
        historyRef.current = [''];
        indexRef.current = 0;
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newPrompt = prompt ? `${prompt} ${transcript}` : transcript;
      setPrompt(newPrompt);
      
      const currentIndex = indexRef.current;
      const currentHistory = historyRef.current;
      const newHistory = currentHistory.slice(0, currentIndex + 1);
      newHistory.push(newPrompt);
      
      historyRef.current = newHistory;
      indexRef.current = newHistory.length - 1;
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const getPlaceholder = (tool) => {
      if (tool.id === 't1') return "Topic: The Future of Remote Work. \nAudience: HR Managers. \nKey points: Productivity, Mental Health, Tools.";
      if (tool.id === 't3') return "Topic: New product launch for organic skincare. \nTarget: Gen Z on TikTok.";
      if (tool.id === 't4') return "Video about: 3 Tips to save money on groceries. \nStyle: Fast-paced, educational.";
      if (tool.id === 't6') return "Niche: Personal Finance for College Students. \nGoal: Grow Instagram followers.";
      if (tool.id === 't12') return "Product/Service: SaaS tool for project management. \nTarget Audience: Startup founders and product managers. \nGoal: Get demo bookings.";
      if (tool.inputType === 'image_prompt') return "A futuristic workspace with holographic screens, cinematic lighting, photorealistic...";
      return "Enter your topic or instructions here...";
  }

  const tones = ['Professional', 'Casual', 'Witty', 'Empathetic', 'Luxury', 'Minimalist'];
  const imgStyles = ['Photorealistic', 'Cinematic', 'Anime', 'Oil Painting', 'Minimalist Line Art', 'Cyberpunk'];

  const toneDescriptions = {
    'Professional': 'Clear, concise, and authoritative. Best for business reports and LinkedIn.',
    'Casual': 'Relaxed, friendly, and approachable. Great for social media and blogs.',
    'Witty': 'Clever, humorous, and sharp. Use for engaging tweets and ads.',
    'Empathetic': 'Understanding, warm, and supportive. Ideal for personal stories.',
    'Luxury': 'Sophisticated, elegant, and exclusive. Perfect for high-end brand copy.',
    'Minimalist': 'Direct, simple, and stripped back. Good for modern landing pages.'
  };

  const imgStyleDescriptions = {
    'Photorealistic': 'High detail, looks like a real photograph.',
    'Cinematic': 'Dramatic lighting, movie-like composition and color grading.',
    'Anime': 'Japanese animation style, vibrant colors, distinctive character designs.',
    'Oil Painting': 'Textured brushstrokes, classical art look.',
    'Minimalist Line Art': 'Clean lines, simple shapes, limited color palette.',
    'Cyberpunk': 'Neon lights, futuristic technology, dark urban environments.'
  };

  // Get localized strings
  const displayName = (language === 'vi' ? tool.name_vi : tool.name) || tool.name;
  const displayDescription = (language === 'vi' ? tool.description_vi : tool.description) || tool.description;

  return (
    <div className={`pt-4 min-h-screen animate-fade-in-up transition-colors duration-500 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F2EB]'
    }`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-24">
        
        {/* Header */}
        <button 
          onClick={onBack}
          className={`group flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors mb-8 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-[#A8A29E] hover:text-[#2C2A26]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t?.toolDetail?.back || 'Back to Studio'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full min-h-[600px]">
          
          {/* Left: Input Panel */}
          <div className={`lg:col-span-4 flex flex-col p-8 border shadow-sm h-fit transition-colors duration-500 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-[#D6D1C7]'
          }`}>
            <div className="mb-6">
                <span className={`text-xs font-bold uppercase tracking-widest mb-2 block transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-[#A8A29E]'
                }`}>{tool.category}</span>
                <h1 className={`text-3xl font-serif mb-2 transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
                }`}>{displayName}</h1>
                <p className={`text-sm font-light transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
                }`}>{displayDescription}</p>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-medium uppercase tracking-widest text-[#2C2A26]">
                            {tool.inputType === 'text' ? 'Brief / Topic' : 'Prompt'}
                        </label>
                        <div className="flex items-center gap-3">
                            {/* Undo/Redo Buttons */}
                            <div className="flex items-center gap-1 border-r border-[#D6D1C7] pr-3">
                                <button 
                                    onClick={handleUndo} 
                                    disabled={historyIndex === 0} 
                                    className="text-[#A8A29E] hover:text-[#2C2A26] disabled:opacity-30 disabled:hover:text-[#A8A29E] transition-colors p-1" 
                                    title="Undo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={handleRedo} 
                                    disabled={historyIndex === history.length - 1} 
                                    className="text-[#A8A29E] hover:text-[#2C2A26] disabled:opacity-30 disabled:hover:text-[#A8A29E] transition-colors p-1" 
                                    title="Redo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                    </svg>
                                </button>
                            </div>

                            <button 
                                onClick={handleVoiceInput}
                                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-[#A8A29E] hover:text-[#2C2A26]'}`}
                                title="Dictate with voice"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                </svg>
                                {isListening ? 'Listening...' : 'Voice Input'}
                            </button>
                        </div>
                    </div>
                    <textarea 
                        value={prompt}
                        onChange={handlePromptChange}
                        placeholder={getPlaceholder(tool)}
                        className="w-full bg-[#F9F8F6] border border-[#D6D1C7] p-4 text-[#2C2A26] outline-none focus:border-[#2C2A26] transition-colors h-40 resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="relative">
                     <div className="flex items-center gap-2 mb-3">
                        <label className="text-xs font-medium uppercase tracking-widest text-[#2C2A26]">
                            {tool.inputType === 'text' ? 'Tone & Voice' : 'Visual Style'}
                        </label>
                        <button
                            type="button"
                            className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
                            onMouseEnter={() => setShowStyleInfo(true)}
                            onMouseLeave={() => setShowStyleInfo(false)}
                            onClick={() => setShowStyleInfo(!showStyleInfo)}
                            aria-label="Style Information"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </button>
                        
                        {/* Tooltip */}
                        {showStyleInfo && (
                            <div className="absolute left-0 top-6 w-72 bg-white border border-[#D6D1C7] shadow-xl p-4 rounded-sm z-30 animate-fade-in-up">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] mb-3">Style Guide</h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {(tool.inputType === 'text' ? tones : imgStyles).map(t => (
                                        <div key={t} className="border-b border-[#F5F2EB] last:border-0 pb-2 last:pb-0">
                                            <span className="text-xs font-bold text-[#2C2A26] block mb-0.5">{t}</span>
                                            <span className="text-[10px] text-[#5D5A53] leading-tight block">
                                                {tool.inputType === 'text' ? toneDescriptions[t] : imgStyleDescriptions[t]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                     </div>

                    <div className="grid grid-cols-2 gap-2">
                        {(tool.inputType === 'text' ? tones : imgStyles).map(t => (
                            <button 
                                key={t}
                                onClick={() => setStyle(t)}
                                className={`text-xs py-2 border transition-all ${
                                    style === t 
                                    ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]' 
                                    : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Provider Selection */}
                <div>
                    <label className="text-xs font-medium uppercase tracking-widest text-[#2C2A26] mb-3 block">
                        {isTextTool ? 'AI Provider' : 'Image Provider'}
                    </label>
                    <div className={`grid ${isTextTool ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                        {isTextTool ? (
                            <>
                                <button 
                                    onClick={() => setTextProvider('groq')}
                                    disabled={isGenerating}
                                    className={`text-xs py-2 border transition-all ${
                                        textProvider === 'groq' 
                                        ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]' 
                                        : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Groq - Fast & Free"
                                >
                                    Groq {userPlan === 'free' && '(Free)'}
                                </button>
                                <button 
                                    onClick={() => setTextProvider('gemini')}
                                    disabled={isGenerating || userPlan === 'free'}
                                    className={`text-xs py-2 border transition-all ${
                                        textProvider === 'gemini' 
                                        ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]' 
                                        : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                                    } ${userPlan === 'free' ? 'opacity-30 cursor-not-allowed' : ''} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={userPlan === 'free' ? 'Gemini - Available for paid plans' : 'Gemini - Premium Quality'}
                                >
                                    Gemini {userPlan !== 'free' && '(Premium)'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setImageProvider('stability')}
                                    disabled={isGenerating}
                                    className={`text-xs py-2 border transition-all ${
                                        imageProvider === 'stability' 
                                        ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]' 
                                        : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Stability AI - High Quality SDXL"
                                >
                                    Stability AI
                                </button>
                                <button 
                                    onClick={() => setImageProvider('pollination')}
                                    disabled={true}
                                    className="text-xs py-2 border border-[#D6D1C7] text-[#A8A29E] opacity-50 cursor-not-allowed"
                                    title="Pollination - Currently Unavailable (API Down)"
                                >
                                    Pollination
                                </button>
                                <button 
                                    onClick={() => setImageProvider('gemini')}
                                    disabled={isGenerating || userPlan === 'free'}
                                    className={`text-xs py-2 border transition-all ${
                                        imageProvider === 'gemini' 
                                        ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]' 
                                        : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                                    } ${userPlan === 'free' ? 'opacity-30 cursor-not-allowed' : ''} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={userPlan === 'free' ? 'Gemini - Available for paid plans' : 'Gemini - Premium Quality (Coming Soon)'}
                                >
                                    Gemini {userPlan !== 'free' && '(Premium)'}
                                </button>
                            </>
                        )}
                    </div>
                    {userPlan === 'free' && (
                        <p className="text-[10px] text-[#A8A29E] mt-2">
                            {isTextTool ? 'Upgrade to Pro to use Gemini' : 'Upgrade to Pro for Gemini image generation'}
                        </p>
                    )}
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full py-4 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-sm font-medium hover:bg-[#433E38] transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : 'Generate Content'}
                </button>
            </div>
          </div>

          {/* Right: Output Canvas */}
          <div className="lg:col-span-8 bg-[#F5F2EB] border border-[#D6D1C7] min-h-[500px] flex flex-col relative">
             <div className="absolute top-0 left-0 right-0 h-10 bg-[#EBE7DE] border-b border-[#D6D1C7] flex items-center px-4 justify-between">
                <span className="text-xs uppercase tracking-widest text-[#A8A29E]">Output Console</span>
             </div>

             <div className="p-8 mt-10">
                {!result && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-[#A8A29E] opacity-50 py-24">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-24 h-24 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                         </svg>
                         <span className="font-serif italic text-xl">Ready to create.</span>
                    </div>
                )}

                {isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center animate-pulse py-24">
                         <span className="font-serif italic text-xl text-[#5D5A53]">Generating Intelligence...</span>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-fade-in-up">
                         {result.type === 'text' ? (
                            <div className="prose prose-stone max-w-none font-light leading-loose text-[#2C2A26] whitespace-pre-wrap">
                                {result.content}
                            </div>
                         ) : (
                             <div className="flex justify-center items-center">
                                <img src={result.content} alt="Generated Art" className="max-h-full max-w-full shadow-xl" />
                            </div>
                         )}

                         <div className="flex justify-end pt-6 border-t border-[#D6D1C7]/30">
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-[#2C2A26] text-[#F5F2EB] px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-[#433E38] transition-colors shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                                Save to Projects
                            </button>
                         </div>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

