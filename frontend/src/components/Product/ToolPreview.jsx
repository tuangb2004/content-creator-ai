import { useLanguage } from '../../contexts/LanguageContext';
import { Reveal } from '../Landing/Reveal';

const ToolPreview = ({ tool, onBack, onUseTool }) => {
  const { language, t } = useLanguage();

  // Resolve localized strings
  const name = (language === 'vi' ? tool.name_vi : tool.name) || tool.name;
  const tagline = (language === 'vi' ? tool.tagline_vi : tool.tagline) || tool.tagline;
  const description = (language === 'vi' ? tool.description_vi : tool.description) || tool.description;

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-gray-900 pt-24 pb-20 animate-fade-in-up transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A8A29E] dark:text-gray-500 hover:text-[#2C2A26] dark:hover:text-gray-300 transition-colors mb-12"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t?.journal?.back || 'Back'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Image / Visual */}
            <div className="relative aspect-[4/3] bg-[#EBE7DE] dark:bg-gray-700 overflow-hidden rounded-sm shadow-lg transition-colors duration-300">
                <img 
                    src={tool.imageUrl} 
                    alt={name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A26]/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                        {tool.category}
                    </span>
                </div>
            </div>

            {/* Right: Content */}
            <div className="flex flex-col h-full justify-center">
                <Reveal>
                    <h1 className="text-4xl md:text-6xl font-serif text-[#2C2A26] dark:text-gray-100 mb-4 transition-colors duration-300">{name}</h1>
                    <p className="text-xl text-[#5D5A53] dark:text-gray-300 font-serif italic mb-8 transition-colors duration-300">{tagline}</p>
                </Reveal>

                <Reveal delay={100}>
                    <p className="text-lg text-[#5D5A53] dark:text-gray-300 font-light leading-relaxed mb-10 border-l-2 border-[#D6D1C7] dark:border-gray-600 pl-6 transition-colors duration-300">
                        {description}
                    </p>
                </Reveal>

                <Reveal delay={200}>
                    <div className="mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] dark:text-gray-100 mb-6 transition-colors duration-300">
                            {language === 'vi' ? 'Tính năng chính' : 'Key Capabilities'}
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {tool.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-[#5D5A53] dark:text-gray-300 transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2C2A26]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>

                <Reveal delay={300}>
                    <div className="p-6 bg-white dark:bg-gray-800 border border-[#D6D1C7] dark:border-gray-600 rounded-sm mb-8 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2 text-[#A8A29E] dark:text-gray-500 transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <span className="text-[10px] uppercase tracking-widest font-bold">AI Power</span>
                        </div>
                        <p className="text-sm text-[#5D5A53] dark:text-gray-300 transition-colors duration-300">
                            {language === 'vi' 
                                ? 'Được hỗ trợ bởi Gemini 2.5 để mang lại tốc độ và độ chính xác vượt trội. Công cụ này thích ứng với phong cách độc đáo của bạn.'
                                : 'Powered by Gemini 2.5 for superior speed and accuracy. This tool adapts to your unique style.'}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={400}>
                    <button 
                        onClick={onUseTool}
                        className="w-full sm:w-auto px-12 py-4 bg-[#2C2A26] dark:bg-gray-700 text-[#F5F2EB] dark:text-gray-100 text-sm font-bold uppercase tracking-widest hover:bg-[#433E38] dark:hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        {language === 'vi' ? 'Sử Dụng Công Cụ Này' : 'Start Creating'}
                    </button>
                    <p className="mt-4 text-xs text-[#A8A29E] dark:text-gray-500 text-center sm:text-left transition-colors duration-300">
                        {language === 'vi' ? 'Yêu cầu đăng nhập tài khoản.' : 'Account login required.'}
                    </p>
                </Reveal>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPreview;

