import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { TOOLS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { X, Send } from 'lucide-react';

// Sparkle icon component - 4-point star
const SparkleIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 64 64" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="currentColor"
  >
    <path d="M22.625 2c0 15.834-8.557 30-20.625 30c12.068 0 20.625 14.167 20.625 30c0-15.833 8.557-30 20.625-30c-12.068 0-20.625-14.166-20.625-30" />
    <path d="M47 32c0 7.918-4.277 15-10.313 15C42.723 47 47 54.084 47 62c0-7.916 4.277-15 10.313-15C51.277 47 47 39.918 47 32z" />
    <path d="M51.688 2c0 7.917-4.277 15-10.313 15c6.035 0 10.313 7.084 10.313 15c0-7.916 4.277-15 10.313-15c-6.036 0-10.313-7.083-10.313-15" />
  </svg>
);

const Assistant = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // Initialize welcome message based on language
  useEffect(() => {
    if (language === 'vi') {
      setMessages([
        { 
          role: 'model', 
          text: 'Chào mừng đến với CreatorAI! ✨\n\nTôi là trợ lý AI của CreatorAI, được hỗ trợ bởi Groq - AI siêu nhanh.\n\nTôi có thể giúp bạn:\n\n• Chọn công cụ phù hợp với nhu cầu (12+ công cụ)\n• Gợi ý prompt và chiến lược nội dung\n• Trả lời câu hỏi về website, tính năng, pricing\n• Lên kế hoạch nội dung hiệu quả\n\nBạn muốn tạo nội dung gì hôm nay?',
          timestamp: Date.now() 
        }
      ]);
    } else {
      setMessages([
        { 
          role: 'model', 
          text: 'Welcome to CreatorAI! ✨\n\nI\'m the AI assistant for CreatorAI, powered by Groq - lightning-fast AI.\n\nI can help you:\n\n• Choose the right tool for your needs (12+ tools)\n• Suggest prompts and content strategies\n• Answer questions about the website, features, pricing\n• Plan your content effectively\n\nWhat would you like to create today?',
          timestamp: Date.now() 
        }
      ]);
    }
  }, [language]);

  // Quick actions based on language - simplified for general content creation
  const quickActions = language === 'vi' 
    ? [
        { text: 'Tạo hình ảnh', action: 'Tôi muốn tạo hình ảnh quảng cáo, bạn có thể gợi ý công cụ và cách sử dụng không?' },
        { text: 'Viết văn bản', action: 'Tôi cần viết một bài blog về chủ đề công nghệ, bạn có thể gợi ý công cụ và cách sử dụng không?' },
        { text: 'Video/TikTok', action: 'Tôi muốn tạo script video TikTok, bạn có thể gợi ý công cụ và cách sử dụng không?' },
        { text: 'Caption mạng xã hội', action: 'Tôi cần viết caption Instagram, bạn có thể gợi ý công cụ và cách sử dụng không?' },
        { text: 'Lên chiến lược nội dung', action: 'Tôi muốn lên kế hoạch nội dung 30 ngày, bạn có thể gợi ý công cụ và cách sử dụng không?' },
        { text: 'Cải thiện nội dung', action: 'Tôi có một bài viết cần cải thiện, bạn có thể gợi ý công cụ và cách sử dụng không?' }
      ]
    : [
        { text: 'Generate Image', action: 'I want to create an ad image, can you suggest the right tool and how to use it?' },
        { text: 'Write Text', action: 'I need to write a blog post about technology, can you suggest the right tool and how to use it?' },
        { text: 'Video/TikTok', action: 'I want to create a TikTok video script, can you suggest the right tool and how to use it?' },
        { text: 'Social Caption', action: 'I need an Instagram caption, can you suggest the right tool and how to use it?' },
        { text: 'Content Strategy', action: 'I want to plan a 30-day content calendar, can you suggest the right tool and how to use it?' },
        { text: 'Improve Content', action: 'I have content that needs improvement, can you suggest the right tool and how to use it?' }
      ];

  // Placeholder text based on language
  const placeholderText = language === 'vi' ? 'Hỏi tôi bất cứ điều gì...' : 'Ask me anything...';
  const thinkingText = language === 'vi' ? 'Đang suy nghĩ...' : 'Thinking...';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (customMessage = null) => {
    const messageToSend = customMessage || inputValue.trim();
    if (!messageToSend) return;

    const userMsg = { role: 'user', text: messageToSend, timestamp: Date.now() };
    
    // Update messages state and get updated messages for API call
    let historyForAPI = [];
    setMessages(prev => {
      const updatedMessages = [...prev, userMsg];
      
      // Prepare history from updated messages - create clean copy to avoid circular references
      historyForAPI = updatedMessages
        .slice(0, -1) // Exclude the current message we just added
        .map(m => {
          // Only send simple data, no circular references or complex objects
          const role = m.role === 'model' ? 'assistant' : (m.role === 'user' ? 'user' : 'assistant');
          const content = m.text || m.content || '';
          
          // Return plain object only - no functions, no circular refs
          return {
            role: role,
            content: content
          };
        })
        .filter(m => m.content && m.content.trim()); // Filter out empty messages
      
      return updatedMessages;
    });
    
    if (!customMessage) setInputValue('');
    setIsThinking(true);

    try {
      
      // Use Firebase Functions instead of Express API
      const chatFunction = httpsCallable(functions, 'chat');
      const result = await chatFunction({
        message: messageToSend,
        history: historyForAPI
      });
      
      const aiMsg = { role: 'model', text: result.data.message, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      
      // Check if response mentions a tool and extract tool ID
      const toolMention = result.data.message.match(/\(tool ID: (t\d+)\)/i);
      if (toolMention) {
        const toolId = toolMention[1];
        const tool = TOOLS.find(t => t.id === toolId);
        if (tool) {
          // Add a suggestion message with tool link
          setTimeout(() => {
            const suggestionMsg = {
              role: 'model',
              text: language === 'vi'
                ? `💡 Bạn muốn sử dụng ${tool.name}? Nhấn để mở!`
                : `💡 Want to use ${tool.name}? Click here to open it!`,
              timestamp: Date.now(),
              toolId: toolId,
              isSuggestion: true
            };
            setMessages(prev => [...prev, suggestionMsg]);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Handle Firebase Functions errors
      const errorCode = error.code || error.response?.status;
      const errorMessage = error.message || error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      
      if (errorCode === 'unauthenticated' || errorCode === 401) {
        const errorMsg = { 
          role: 'model', 
          text: language === 'vi' 
            ? 'Vui lòng đăng nhập để sử dụng trợ lý chat. Bạn có thể đăng ký hoặc đăng nhập từ trang chủ.'
            : 'Please log in to use the chat assistant. You can sign up or log in from the landing page.', 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        // Handle other errors
        const errorMsg = { 
          role: 'model', 
          text: errorMessage, 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickAction = (action) => {
    handleSend(action);
  };

  const handleToolClick = (toolId) => {
    navigate(`/dashboard?tool=${toolId}`);
    setIsOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className={`mb-6 flex flex-col overflow-hidden border animate-slide-up-fade w-[90vw] sm:w-[400px] h-[600px] rounded-2xl shadow-2xl ${
          theme === 'dark' 
            ? 'bg-[#1C1B19] border-[#433E38]' 
            : 'bg-[#F5F2EB] border-[#D6D1C7]'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex justify-between items-center ${
            theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-[#EBE7DE] border-[#D6D1C7]'
          }`}>
            <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                    theme === 'dark' 
                      ? 'bg-[#F5F2EB] text-[#2C2A26]' 
                      : 'bg-[#2C2A26] text-[#F5F2EB]'
                  }`}>
                    AI
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <span className={`font-serif font-bold text-lg ${
                    theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>CreatorAI</span>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                    {language === 'vi' ? 'Trợ lý AI' : 'AI Assistant'}
                  </p>
                </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-[#433E38] text-[#A8A29E]' : 'hover:bg-[#D6D1C7] text-[#5D5A53]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Area */}
          <div 
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-[#F5F2EB]'
            }`} 
            ref={scrollRef}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mr-2 shrink-0 ${
                    theme === 'dark' 
                      ? 'bg-[#F5F2EB] text-[#2C2A26]' 
                      : 'bg-[#2C2A26] text-[#F5F2EB]'
                  }`}>
                    AI
                  </div>
                )}
                <div 
                  className={`max-w-[80%] p-4 text-sm leading-relaxed rounded-2xl ${
                    msg.role === 'user' 
                      ? theme === 'dark'
                        ? 'bg-[#F5F2EB] text-[#2C2A26]'
                        : 'bg-[#2C2A26] text-[#F5F2EB]'
                      : theme === 'dark'
                        ? 'bg-[#2C2A26] text-[#F5F2EB] border border-[#433E38] rounded-tl-sm'
                        : 'bg-white text-[#5D5A53] border border-[#EBE7DE] shadow-sm rounded-tl-sm'
                  } ${msg.isSuggestion ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  onClick={msg.isSuggestion && msg.toolId ? () => handleToolClick(msg.toolId) : undefined}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {msg.isSuggestion && (
                    <div className={`mt-2 text-xs italic ${msg.role === 'user' ? 'text-white/70' : 'text-[#A8A29E]'}`}>
                      {language === 'vi' ? 'Nhấn để mở →' : 'Click to open →'}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
               <div className="flex justify-start">
                 <div className={`flex gap-1 items-center ${
                   theme === 'dark' ? 'bg-[#2C2A26] border border-[#433E38]' : 'bg-white border border-[#EBE7DE]'
                 } p-4 rounded-2xl rounded-tl-sm`}>
                   <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`}></div>
                   <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`} style={{ animationDelay: '0.1s' }}></div>
                   <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'}`} style={{ animationDelay: '0.2s' }}></div>
                 </div>
               </div>
            )}
            
            {/* Quick Actions - Show only when no messages or first message */}
            {messages.length <= 1 && !isThinking && (
              <div className="mt-4 space-y-3">
                <div className={`text-xs font-semibold uppercase tracking-wide px-1 ${
                  theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                }`}>
                  {language === 'vi' ? 'Gợi ý nhanh' : 'Quick Actions'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.action)}
                      className={`px-3 py-2 text-xs font-medium rounded-full transition-all ${
                        theme === 'dark'
                          ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] hover:bg-[#F5F2EB] hover:text-[#2C2A26]'
                          : 'bg-white border border-[#D6D1C7] text-[#5D5A53] hover:bg-[#2C2A26] hover:text-[#F5F2EB]'
                      }`}
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-[#F5F2EB] border-[#D6D1C7]'
          }`}>
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholderText} 
                className={`flex-1 px-4 py-3 text-sm outline-none transition-colors rounded-xl ${
                  theme === 'dark'
                    ? 'bg-[#1C1B19] border border-[#433E38] text-[#F5F2EB] placeholder-[#6B6B6B] focus:border-[#F5F2EB]'
                    : 'bg-white border border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                }`}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                disabled={!inputValue.trim() || isThinking}
                className={`px-4 py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg ${
                  theme === 'dark'
                    ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-white'
                    : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#444]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 z-50 ${
          theme === 'dark'
            ? 'bg-[#F5F2EB] text-[#2C2A26]'
            : 'bg-[#2C2A26] text-[#F5F2EB]'
        }`}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <SparkleIcon size={26} />
        )}
      </button>
    </div>
  );
};

export default Assistant;

