import { useLanguage } from '../../contexts/LanguageContext';

const JournalDetail = ({ article, onBack }) => {
  const { language, t } = useLanguage();
  const title = (language === 'vi' ? article.title_vi : article.title) || article.title;
  const content = (language === 'vi' ? article.content_vi : article.content) || article.content;

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-gray-900 animate-fade-in-up transition-colors duration-300">
       {/* Hero Image for Article - Full bleed to top so navbar sits on it */}
       <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden">
          <img 
             src={article.image} 
             alt={title} 
             className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
       </div>

       <div className="max-w-3xl mx-auto px-6 md:px-12 -mt-32 relative z-10 pb-32">
          <div className="bg-[#F5F2EB] dark:bg-gray-800 p-8 md:p-16 shadow-xl shadow-[#2C2A26]/5 dark:shadow-black/20 transition-colors duration-300">
             <div className="flex justify-between items-center mb-12 border-b border-[#D6D1C7] dark:border-gray-700 pb-8 transition-colors duration-300">
                <button 
                  onClick={onBack}
                  className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A8A29E] dark:text-gray-500 hover:text-[#2C2A26] dark:hover:text-gray-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  {t?.journal?.back || 'Back to Journal'}
                </button>
                <span className="text-xs font-medium uppercase tracking-widest text-[#A8A29E] dark:text-gray-500 transition-colors duration-300">{article.date}</span>
             </div>

             <h1 className="text-4xl md:text-6xl font-serif text-[#2C2A26] dark:text-gray-100 mb-12 leading-tight text-center transition-colors duration-300">
               {title}
             </h1>

             <div className="prose prose-stone dark:prose-invert prose-lg mx-auto font-light leading-loose text-[#5D5A53] dark:text-gray-300 transition-colors duration-300">
               {content}
             </div>
             
             <div className="mt-16 pt-12 border-t border-[#D6D1C7] dark:border-gray-700 flex justify-center transition-colors duration-300">
                 <span className="text-2xl font-serif italic text-[#2C2A26] dark:text-gray-100 transition-colors duration-300">CreatorAI</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default JournalDetail;

