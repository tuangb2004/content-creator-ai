import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { TOOLS } from '../../constants';

const Assistant = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      text: 'Welcome to CreatorAI! I\'m your content creation assistant. I can help you:\n\n• Choose the right tool for your content needs\n• Suggest prompts and strategies\n• Plan your content calendar\n• Optimize your content for different platforms\n\nWhat would you like to create today?', 
      timestamp: Date.now() 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // Quick action suggestions
  const quickActions = [
    { text: 'Tôi muốn viết blog post', action: 'I want to write a blog post' },
    { text: 'Tạo caption cho Instagram', action: 'Create Instagram caption' },
    { text: 'Viết script video TikTok', action: 'Write TikTok video script' },
    { text: 'Lên kế hoạch nội dung 30 ngày', action: 'Plan 30-day content calendar' },
    { text: 'Tạo hình ảnh cho quảng cáo', action: 'Generate ad image' },
    { text: 'Cải thiện nội dung hiện có', action: 'Improve existing content' }
  ];

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
              text: `💡 Want to use ${tool.name}? Click here to open it!`,
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
          text: 'Please log in to use the chat assistant. You can sign up or log in from the landing page.', 
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
        <div className="bg-[#F5F2EB] rounded-none shadow-2xl shadow-[#2C2A26]/10 w-[90vw] sm:w-[380px] h-[550px] mb-6 flex flex-col overflow-hidden border border-[#D6D1C7] animate-slide-up-fade">
          {/* Header */}
          <div className="bg-[#EBE7DE] p-5 border-b border-[#D6D1C7] flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#2C2A26] rounded-full animate-pulse"></div>
                <span className="font-serif italic text-[#2C2A26] text-lg">Concierge</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F2EB]" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#2C2A26] text-[#F5F2EB]' 
                      : 'bg-white border border-[#EBE7DE] text-[#5D5A53] shadow-sm'
                  } ${msg.isSuggestion ? 'cursor-pointer hover:bg-[#F5F2EB] transition-colors' : ''}`}
                  onClick={msg.isSuggestion && msg.toolId ? () => handleToolClick(msg.toolId) : undefined}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {msg.isSuggestion && (
                    <div className="mt-2 text-xs text-[#A8A29E] italic">
                      Click to open tool →
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
               <div className="flex justify-start">
                 <div className="bg-white border border-[#EBE7DE] p-4 flex gap-1 items-center shadow-sm">
                   <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
               </div>
            )}
            
            {/* Quick Actions - Show only when no messages or first message */}
            {messages.length <= 1 && !isThinking && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-[#A8A29E] font-medium uppercase tracking-wide px-1">
                  Quick Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.action)}
                      className="px-3 py-1.5 text-xs bg-white border border-[#D6D1C7] text-[#5D5A53] hover:bg-[#EBE7DE] hover:border-[#2C2A26] transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-[#F5F2EB] border-t border-[#D6D1C7]">
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything..." 
                className="flex-1 bg-white border border-[#D6D1C7] focus:border-[#2C2A26] px-4 py-3 text-sm outline-none transition-colors placeholder-[#A8A29E] text-[#2C2A26]"
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                disabled={!inputValue.trim() || isThinking}
                className="bg-[#2C2A26] text-[#F5F2EB] px-4 hover:bg-[#444] transition-colors disabled:opacity-50"
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
        className="bg-[#2C2A26] text-[#F5F2EB] w-14 h-14 flex items-center justify-center rounded-full shadow-xl hover:scale-105 transition-all duration-500 z-50"
      >
        {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
             </svg>
        ) : (
            <span className="font-serif italic text-lg">Ai</span>
        )}
      </button>
    </div>
  );
};

export default Assistant;

