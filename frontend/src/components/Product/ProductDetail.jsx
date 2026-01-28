import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { generateContent as generateContentFunction, ErrorTypes, isErrorType } from '../../services/firebaseFunctions';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from '../../utils/toast';

const ProductDetail = ({ tool, onBack, onSave }) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const { userData } = useAuth();

  const userPlan = userData?.plan || 'free';
  const toolId = tool?.id ?? '';
  const safeTool = tool ?? {
    id: toolId,
    inputType: 'text',
    name: '',
    name_vi: '',
    description: '',
    description_vi: '',
    category: '',
    systemInstruction: undefined
  };

  // Storage key for this tool
  const storageKey = toolId ? `tool_${toolId}_draft` : 'tool_unknown_draft';

  // Load saved state from localStorage
  const loadSavedState = useCallback(() => {
    if (!toolId) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          prompt: parsed.prompt || '',
          style: parsed.style || 'Professional',
          result: parsed.result?.content ? parsed.result : null,
          textProvider: parsed.textProvider || (userPlan === 'free' ? 'groq' : 'gemini'),
          imageProvider: parsed.imageProvider || 'stability',
          history: parsed.history || [''],
          historyIndex: parsed.historyIndex || 0
        };
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    return null;
  }, [storageKey, toolId, userPlan]);

  const savedState = useMemo(() => loadSavedState(), [loadSavedState]);

  const [prompt, setPrompt] = useState(savedState?.prompt || '');
  const [style, setStyle] = useState(savedState?.style || 'Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState?.result || null);

  // Provider selection state
  const isTextTool = safeTool.inputType === 'text';

  // Default providers based on plan
  const defaultTextProvider = userPlan === 'free' ? 'groq' : 'gemini';
  const defaultImageProvider = 'stability'; // Stability AI is the default (Pollination is down)

  const [textProvider, setTextProvider] = useState(savedState?.textProvider || defaultTextProvider);
  const [imageProvider, setImageProvider] = useState(savedState?.imageProvider || defaultImageProvider);

  const availableModels = useMemo(() => {
    if (safeTool.inputType === 'image_prompt') {
      return [
        {
          id: 'stability',
          name: t?.productDetail?.models?.stability?.name || 'Stability',
          desc: t?.productDetail?.models?.stability?.desc || 'Fast, high-quality visuals',
          badge: t?.productDetail?.models?.stability?.badge || 'Standard',
          requiresPro: false
        },
        {
          id: 'gemini',
          name: t?.productDetail?.models?.gemini?.name || 'Gemini',
          desc: t?.productDetail?.models?.gemini?.desc || 'Premium composition + details',
          badge: t?.productDetail?.models?.gemini?.badge || 'Ultra',
          requiresPro: false
        }
      ];
    }
    return [
      {
        id: 'groq',
        name: t?.productDetail?.models?.groq?.name || 'Groq',
        desc: t?.productDetail?.models?.groq?.desc || 'Efficient & quick',
        badge: t?.productDetail?.models?.groq?.badge || 'Savings',
        requiresPro: false
      },
      {
        id: 'gemini',
        name: t?.productDetail?.models?.gemini?.name || 'Gemini',
        desc: t?.productDetail?.models?.gemini?.desc || 'Deep reasoning',
        badge: t?.productDetail?.models?.gemini?.badge || 'Intelligence',
        requiresPro: false
      }
    ];
  }, [safeTool.inputType, t]);

  const selectedModel = isTextTool ? textProvider : imageProvider;
  const setSelectedModel = (id) => {
    if (isTextTool) {
      setTextProvider(id);
    } else {
      setImageProvider(id);
    }
  };

  const currentModelDetails = useMemo(() => {
    return availableModels.find((model) => model.id === selectedModel) || availableModels[0];
  }, [availableModels, selectedModel]);

  const estimatedInputCredits = useMemo(() => {
    const normalizedToolName = `${safeTool.name || ''}`.toLowerCase();
    const normalizedToolCategory = `${safeTool.category || ''}`.toLowerCase();
    const isHeavyTool = normalizedToolName.includes('editorial')
      || normalizedToolName.includes('strategy')
      || normalizedToolCategory.includes('editorial')
      || normalizedToolCategory.includes('strategy');
    const heavyMultiplier = isHeavyTool ? 1.5 : 1;
    const estimateTokens = (text) => Math.ceil(text.length / 4);
    const estimatedOutputTokens = 300;

    if (safeTool.inputType === 'image_prompt') {
      if (currentModelDetails.id === 'gemini') return 8;
      if (currentModelDetails.id === 'stability') return 4;
      return 4; // Default to 4 for images if not Gemini
    }

    if (currentModelDetails.id === 'groq') return 0;
    const inputTokens = estimateTokens(prompt);
    const baseCredits = Math.max(1, Math.ceil((inputTokens + estimatedOutputTokens) / 700));
    return Math.ceil(baseCredits * heavyMultiplier);
  }, [currentModelDetails.id, prompt, safeTool.category, safeTool.inputType, safeTool.name]);

  const userTier = userPlan === 'agency' ? 'Agency' : userPlan === 'pro' ? 'Pro' : 'Starter';

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
  }, [loadSavedState, toolId]); // Only run when tool changes

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
          provider: imageProvider,
          toolId: tool.id,
          toolName: tool.name,
          toolCategory: tool.category
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
          systemInstruction: tool.systemInstruction, // Pass custom system instruction from tool
          toolId: tool.id,
          toolName: tool.name,
          toolCategory: tool.category
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

  const handleSave = async () => {
    if (!result || !result.content) return;
    try {
      await Promise.resolve(onSave({
        id: Date.now().toString(),
        toolName: tool.name,
        prompt: prompt,
        result: result.content,
        type: result.type,
        timestamp: Date.now()
      }));

      // Clear saved state after successful save
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error('Error clearing saved state:', e);
      }
      // Reset states
      setPrompt('');
      setResult(null);
      setHistory(['']);
      setHistoryIndex(0);
      historyRef.current = [''];
      indexRef.current = 0;

      toast.success('Project saved.', { title: 'Saved' });
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error(error?.message || 'Failed to save project.');
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
    const ph = t?.productDetail?.placeholders;

    if (tool.id === 't1') return ph?.t1 || "Topic: The Future of Remote Work. \nAudience: HR Managers. \nKey points: Productivity, Mental Health, Tools.";
    if (tool.id === 't3') return ph?.t3 || "Topic: New product launch for organic skincare. \nTarget: Gen Z on TikTok.";
    if (tool.id === 't4') return ph?.t4 || "Video about: 3 Tips to save money on groceries. \nStyle: Fast-paced, educational.";
    if (tool.id === 't6') return ph?.t6 || "Niche: Personal Finance for College Students. \nGoal: Grow Instagram followers.";
    if (tool.id === 't12') return ph?.t12 || "Product/Service: SaaS tool for project management. \nTarget Audience: Startup founders and product managers. \nGoal: Get demo bookings.";
    if (tool.inputType === 'image_prompt') return ph?.image || "A futuristic workspace with holographic screens, cinematic lighting, photorealistic...";
    return ph?.default || "Enter your topic or instructions here...";
  }

  const imgStyles = ['Photorealistic', 'Cinematic', 'Anime', 'Oil Painting', 'Minimalist Line Art', 'Cyberpunk'];

  const tonePresetsByToolId = {
    t1: {
      tones: ['Authoritative', 'Analytical', 'Academic', 'Thought Leadership', 'Persuasive'],
      descriptions: {
        'Authoritative': 'Confident, credible voice with clear expertise and leadership.',
        'Analytical': 'Data-driven and structured, emphasizing evidence and logic.',
        'Academic': 'Formal and scholarly with precise terminology and depth.',
        'Thought Leadership': 'Visionary perspective with strong point of view.',
        'Persuasive': 'Argument-led, designed to influence decisions and beliefs.'
      }
    },
    t3: {
      tones: ['Conversational', 'Energetic', 'Playful', 'Inspirational', 'Bold'],
      descriptions: {
        'Conversational': 'Friendly, relatable, and human, ideal for community feel.',
        'Energetic': 'Fast-paced, upbeat, high engagement with dynamic hooks.',
        'Playful': 'Light, witty, and fun, designed for shares and reactions.',
        'Inspirational': 'Motivational, uplifting, and value-driven.',
        'Bold': 'Confident, provocative, designed to stop the scroll.'
      }
    },
    t4: {
      tones: ['Cinematic', 'Educational', 'Dramatic', 'Comedic', 'Storytelling'],
      descriptions: {
        'Cinematic': 'Visually rich, cinematic cues, strong scene direction.',
        'Educational': 'Clear and structured with step-by-step teaching.',
        'Dramatic': 'Tension-driven, emotional pacing with a strong hook.',
        'Comedic': 'Light and humorous with punchy beats.',
        'Storytelling': 'Narrative arc with relatable moments and payoff.'
      }
    },
    t5: {
      tones: ['Clarity', 'Professional', 'Concise', 'Brand Voice', 'Polished'],
      descriptions: {
        'Clarity': 'Simplifies and clarifies without changing intent.',
        'Professional': 'Formal and credible tone for business contexts.',
        'Concise': 'Tight, direct, reduced fluff while keeping meaning.',
        'Brand Voice': 'Keeps brand personality consistent across text.',
        'Polished': 'Refined, improved cadence and readability.'
      }
    },
    t6: {
      tones: ['Strategic', 'Visionary', 'Analytical', 'Growth', 'Structured'],
      descriptions: {
        'Strategic': 'High-level planning with clear objectives and pillars.',
        'Visionary': 'Big-picture themes and future-facing ideas.',
        'Analytical': 'Research-informed with data-backed planning.',
        'Growth': 'Experimentation and performance-focused initiatives.',
        'Structured': 'Clear, systematic breakdown of steps and cadence.'
      }
    },
    t7: {
      tones: ['SEO-Optimized', 'Curiosity-Driven', 'Emotional', 'Direct', 'Urgency'],
      descriptions: {
        'SEO-Optimized': 'Keyword-led, search intent aligned and clear.',
        'Curiosity-Driven': 'Teaser hooks with curiosity gaps.',
        'Emotional': 'Appeals to feelings and psychological triggers.',
        'Direct': 'Clear and specific, no fluff.',
        'Urgency': 'Time-sensitive or FOMO-driven.'
      }
    },
    t8: {
      tones: ['Trend-Focused', 'Creative', 'Experimental', 'Audience-First', 'Data-Inspired'],
      descriptions: {
        'Trend-Focused': 'Built around current viral mechanics and formats.',
        'Creative': 'Original angles and unexpected hooks.',
        'Experimental': 'Test new formats and hypothesis-based ideas.',
        'Audience-First': 'Tailored for specific audience pain points.',
        'Data-Inspired': 'Informed by patterns and measurable signals.'
      }
    },
    t10: {
      tones: ['Repurposing', 'Platform-Specific', 'Efficiency', 'Narrative', 'Engagement'],
      descriptions: {
        'Repurposing': 'Reframe core ideas into multiple formats.',
        'Platform-Specific': 'Adapted for each platform’s structure.',
        'Efficiency': 'Concise and high-impact outputs.',
        'Narrative': 'Story-driven outputs across channels.',
        'Engagement': 'Calls to action and interaction prompts.'
      }
    },
    t11: {
      tones: ['Critical', 'Constructive', 'SEO-Focused', 'Clarity', 'CTA-Driven'],
      descriptions: {
        'Critical': 'Direct, pinpointing gaps and risks.',
        'Constructive': 'Actionable, improvement-first guidance.',
        'SEO-Focused': 'Search intent, keywords, and structure optimized.',
        'Clarity': 'Readability and comprehension improvements.',
        'CTA-Driven': 'Action-oriented conversion enhancements.'
      }
    },
    t12: {
      tones: ['Persuasive', 'Personalized', 'Value-First', 'Confident', 'Warm'],
      descriptions: {
        'Persuasive': 'Convincing with clear benefits and CTA.',
        'Personalized': 'Tailored to recipient and context.',
        'Value-First': 'Helpful, non-pushy, insight-driven.',
        'Confident': 'Clear positioning and authority.',
        'Warm': 'Human, polite, relationship-oriented.'
      }
    }
  };

  const defaultTonePreset = {
    tones: ['Professional', 'Casual', 'Witty', 'Empathetic', 'Luxury', 'Minimalist'],
    descriptions: {
      'Professional': 'Clear, concise, and authoritative. Best for business reports and LinkedIn.',
      'Casual': 'Relaxed, friendly, and approachable. Great for social media and blogs.',
      'Witty': 'Clever, humorous, and sharp. Use for engaging tweets and ads.',
      'Empathetic': 'Understanding, warm, and supportive. Ideal for personal stories.',
      'Luxury': 'Sophisticated, elegant, and exclusive. Perfect for high-end brand copy.',
      'Minimalist': 'Direct, simple, and stripped back. Good for modern landing pages.'
    }
  };

  const tonePreset = tonePresetsByToolId[safeTool.id] || defaultTonePreset;
  const tones = tonePreset.tones;
  const toneDescriptions = tonePreset.descriptions;

  const imgStyleDescriptions = {
    'Photorealistic': 'High detail, looks like a real photograph.',
    'Cinematic': 'Dramatic lighting, movie-like composition and color grading.',
    'Anime': 'Japanese animation style, vibrant colors, distinctive character designs.',
    'Oil Painting': 'Textured brushstrokes, classical art look.',
    'Minimalist Line Art': 'Clean lines, simple shapes, limited color palette.',
    'Cyberpunk': 'Neon lights, futuristic technology, dark urban environments.'
  };

  // Get localized strings
  const displayName = (language === 'vi' ? safeTool.name_vi : safeTool.name) || safeTool.name;
  const displayDescription = (language === 'vi' ? safeTool.description_vi : safeTool.description) || safeTool.description;

  if (!toolId) {
    return null;
  }

  return (
    <div className={`pt-1 min-h-screen animate-fade-in-up ${theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-[#F5F2EB]'
      }`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-24">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className={`group flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#F5F2EB]' : 'text-[#A8A29E] hover:text-[#2C2A26]'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t?.productDetail?.back || 'Studio'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">{t?.productDetail?.workspaceMode || 'Workspace Mode'}:</span>
            <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm flex items-center gap-2 ${userTier === 'Agency' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
              userTier === 'Pro' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${userTier === 'Agency' ? 'bg-indigo-600' : userTier === 'Pro' ? 'bg-amber-600' : 'bg-slate-600'
                }`}></div>
              {userTier} Access
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-8 border shadow-sm rounded-sm ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
              }`}>
              <div className={`mb-8 pb-6 border-b ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#F5F2EB]'
                }`}>
                <h1 className={`text-2xl font-serif mb-2 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>{displayName}</h1>
                <p className="text-xs text-[#A8A29E] font-light leading-relaxed">{displayDescription}</p>
              </div>

              <div className="mb-8">
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>{t?.productDetail?.selectAI || 'Select AI Intelligence'}</label>
                <div className="grid grid-cols-1 gap-2">
                  {availableModels.map((model) => {
                    const isDisabled = model.requiresPro && userPlan === 'free';
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => !isDisabled && setSelectedModel(model.id)}
                        disabled={isDisabled}
                        className={`flex items-center justify-between p-4 border text-left transition-all rounded-sm group ${isSelected
                          ? 'border-[#2C2A26] dark:border-[#F5F2EB] bg-[#F9F8F6] dark:bg-[#1C1B19]'
                          : 'border-[#D6D1C7] dark:border-[#433E38] hover:border-[#A8A29E]'
                          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSelected ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]') : 'text-[#A8A29E]'}`}>
                              {model.name}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${model.badge === 'Intelligence' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {model.badge}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#A8A29E] mt-1">{model.desc}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#2C2A26] dark:border-[#F5F2EB] bg-[#2C2A26] dark:bg-[#F5F2EB]' : 'border-[#D6D1C7]'
                          }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-[#F5F2EB] dark:bg-[#2C2A26] rounded-full"></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{safeTool.inputType === 'text' ? (t?.productDetail?.prompt || 'Prompt') : (t?.productDetail?.imagePrompt || 'Image Prompt')}</label>
                  <div className="flex items-center gap-2">
                    <button onClick={handleUndo} disabled={historyIndex === 0} className="p-1 opacity-50 hover:opacity-100 disabled:opacity-10">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                    </button>
                    <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-1 opacity-50 hover:opacity-100 disabled:opacity-10">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
                    </button>
                    <button
                      onClick={handleVoiceInput}
                      className={`p-1 rounded-full transition-colors ${isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : theme === 'dark'
                          ? 'text-[#A8A29E] hover:text-[#F5F2EB]'
                          : 'text-[#A8A29E] hover:text-[#2C2A26]'
                        }`}
                      title="Voice input"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder={getPlaceholder(tool)}
                    className={`w-full border p-4 pr-12 outline-none h-40 resize-none text-sm font-light ${theme === 'dark'
                      ? 'bg-[#1C1B19] border-[#433E38] text-[#F5F2EB] placeholder-[#5D5A53]'
                      : 'bg-[#F9F8F6] border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E]'
                      }`}
                  />
                </div>
              </div>

              <div className="relative mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>
                    {safeTool.inputType === 'text' ? (t?.productDetail?.toneVoice || 'Tone & Voice') : (t?.productDetail?.visualStyle || 'Visual Style')}
                  </label>

                  <div
                    className="relative flex items-center h-6"
                    onMouseEnter={() => setShowStyleInfo(true)}
                    onMouseLeave={() => setShowStyleInfo(false)}
                  >
                    <button
                      type="button"
                      className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors h-full flex items-center px-2"
                      onClick={() => setShowStyleInfo(!showStyleInfo)}
                      aria-label="Style Information"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </button>

                    {showStyleInfo && (
                      <div className="absolute left-0 top-6 w-72 bg-white border border-[#D6D1C7] shadow-xl p-4 rounded-sm z-30 animate-fade-in-up">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] mb-3">{t?.productDetail?.styleGuide || 'Style Guide'}</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {(safeTool.inputType === 'text' ? tones : imgStyles).map((tVal) => (
                            <div key={tVal} className="border-b border-[#F5F2EB] last:border-0 pb-2 last:pb-0">
                              <span className="text-xs font-bold text-[#2C2A26] block mb-0.5">
                                {safeTool.inputType === 'text'
                                  ? (t?.productDetail?.tones?.[tVal.replace(/[\s-]+/g, '')] || tVal)
                                  : (t?.productDetail?.imgStyles?.[tVal.replace(/[\s-]+/g, '')] || tVal)
                                }
                              </span>
                              <span className="text-[10px] text-[#5D5A53] leading-tight block">
                                {safeTool.inputType === 'text'
                                  ? (t?.productDetail?.toneDescriptions?.[tVal.replace(/[\s-]+/g, '')] || toneDescriptions[tVal])
                                  : (t?.productDetail?.imgStyleDescriptions?.[tVal.replace(/[\s-]+/g, '')] || imgStyleDescriptions[tVal])
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(safeTool.inputType === 'text' ? tones : imgStyles).map((tVal) => (
                    <button
                      key={tVal}
                      onClick={() => setStyle(tVal)}
                      className={`text-xs py-2 border transition-all ${style === tVal
                        ? 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26]'
                        : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#A8A29E]'
                        }`}
                    >
                      {safeTool.inputType === 'text'
                        ? (t?.productDetail?.tones?.[tVal.replace(/[\s-]+/g, '')] || tVal)
                        : (t?.productDetail?.imgStyles?.[tVal.replace(/[\s-]+/g, '')] || tVal)
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#2C2A26] text-[#F5F2EB] rounded-sm shadow-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">{t?.productDetail?.estConsumption || 'Est. Consumption'}</span>
                  <span className="text-sm font-serif">{estimatedInputCredits} Cr</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (estimatedInputCredits / 20) * 100)}%` }}></div>
                </div>
                <p className="text-[8px] mt-2 opacity-50 uppercase tracking-widest">
                  {safeTool.inputType === 'image_prompt' ? (t?.productDetail?.fixedPerGen || 'Fixed per generation') : (t?.productDetail?.basedOnChars?.replace('{{count}}', prompt.length) || `Based on ${prompt.length} input chars`)}
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full mt-6 py-4 bg-[#2C2A26] dark:bg-[#F5F2EB] text-[#F5F2EB] dark:text-[#2C2A26] uppercase tracking-[0.2em] text-[10px] font-bold hover:opacity-90 transition-all disabled:opacity-20"
              >
                {isGenerating ? (t?.productDetail?.thinking || 'Thinking...') : (t?.productDetail?.synthesize || 'Synthesize Intelligence')}
              </button>
            </div>
          </div>

          <div className={`lg:col-span-8 border min-h-[700px] flex flex-col rounded-sm relative shadow-inner overflow-hidden ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
            }`}>
            <div className={`absolute top-0 inset-x-0 h-1 ${theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-white'}`}>
              {isGenerating && <div className="h-full bg-amber-400 animate-[loading_2s_infinite] w-1/3"></div>}
            </div>

            <div className="p-10 flex-1 overflow-y-auto bg-white dark:bg-[#2C2A26]">
              {!result && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-[#A8A29E] py-40">
                  <span className="font-serif italic text-2xl opacity-30">{t?.productDetail?.waiting || 'Waiting for intelligence...'}</span>
                </div>
              )}
              {isGenerating && (
                <div className="h-full flex flex-col items-center justify-center py-40">
                  <div className="flex gap-2 mb-8 animate-pulse">
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`}></div>
                  </div>
                  <span className="font-serif italic text-xl text-[#A8A29E]">{currentModelDetails.name} {t?.productDetail?.weaving || 'weaving content...'}</span>
                </div>
              )}
              {result && result.content && (
                <div className="animate-fade-in-up">
                  {result.type === 'text' ? (
                    <div className="prose dark:prose-invert prose-stone max-w-none font-light leading-relaxed whitespace-pre-wrap text-[#2C2A26] dark:text-[#F5F2EB]">
                      {result.content}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <img src={result.content} alt="Result" className="max-w-full rounded-sm shadow-2xl mb-4 grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">{t?.productDetail?.renderedVia || 'Rendered via'} {currentModelDetails.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {result && result.content && (
              <div className={`p-6 border-t flex justify-between items-center ${theme === 'dark' ? 'bg-[#1C1B19] border-[#433E38]' : 'bg-[#F9F8F6] border-[#D6D1C7]'
                }`}>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#A8A29E]">{t?.productDetail?.contentStatus || 'Content Status'}</span>
                  <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}`}>{t?.productDetail?.unsavedDraft || 'Unsaved Draft'}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setResult(null)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26]">
                    {t?.productDetail?.discard || 'Discard'}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-[#2C2A26] dark:bg-[#F5F2EB] text-[#F5F2EB] dark:text-[#2C2A26] text-[10px] font-bold uppercase tracking-widest hover:opacity-90 shadow-lg"
                  >
                    {t?.productDetail?.archive || 'Archive Result'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

