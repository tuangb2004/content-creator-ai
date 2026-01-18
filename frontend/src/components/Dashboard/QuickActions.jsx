import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../../constants';

const QuickActions = ({ onToolSelect, isNewUser = false }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Define quick action shortcuts
    const quickActions = [
        {
            id: 'editorial',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
            title: 'Write Article',
            description: 'Generate SEO-optimized blog posts and articles',
            toolId: 't1',
            color: 'blue'
        },
        {
            id: 'visual',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            ),
            title: 'Create Visual',
            description: 'Design stunning images for social media',
            toolId: 't2',
            color: 'purple'
        },
        {
            id: 'social',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
            ),
            title: 'Social Post',
            description: 'Craft engaging captions and posts',
            toolId: 't3',
            color: 'orange'
        },
        {
            id: 'email',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            ),
            title: 'Email Campaign',
            description: 'Write compelling email content',
            toolId: 't6',
            color: 'green'
        }
    ];

    const handleActionClick = (action) => {
        const tool = TOOLS.find(t => t.id === action.toolId);
        if (tool && onToolSelect) {
            onToolSelect(tool);
        }
    };

    const colorClasses = {
        blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300',
        purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-300',
        orange: 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-300',
        green: 'hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300'
    };

    return (
        <div className={`border rounded-sm p-8 transition-colors ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
            }`}>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-block mb-4">
                    <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
                <p className={`font-serif text-xl mb-2 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>
                    {isNewUser ? 'Welcome! Let\'s create something amazing' : 'Your canvas awaits'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                    }`}>
                    Choose a tool to get started
                </p>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className={`group p-4 border rounded-sm transition-all text-left ${theme === 'dark'
                            ? 'bg-[#1C1B19] border-[#433E38] hover:border-[#F5F2EB]'
                            : 'bg-[#F9F8F6] border-[#D6D1C7] hover:border-[#2C2A26]'
                            } ${colorClasses[action.color]}`}
                    >
                        <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center transition-all ${theme === 'dark'
                            ? 'bg-[#433E38] text-[#F5F2EB] group-hover:bg-[#F5F2EB] group-hover:text-[#2C2A26]'
                            : 'bg-white text-[#2C2A26] group-hover:bg-[#2C2A26] group-hover:text-[#F5F2EB]'
                            }`}>
                            {action.icon}
                        </div>
                        <h4 className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>
                            {action.title}
                        </h4>
                        <p className="text-[10px] text-[#A8A29E] leading-relaxed line-clamp-2">
                            {action.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Secondary CTA */}
            <div className="flex justify-center gap-4 pt-4 border-t border-[#D6D1C7] dark:border-[#433E38]">
                <button
                    onClick={() => navigate('/ai-tools')}
                    className={`text-xs font-bold uppercase tracking-widest hover:underline transition-colors ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                        }`}
                >
                    View All Tools →
                </button>
                <span className="text-[#D6D1C7]">•</span>
                <button
                    onClick={() => navigate('/inspiration')}
                    className="text-xs font-bold uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] dark:hover:text-[#F5F2EB] transition-colors"
                >
                    Browse Inspiration
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
