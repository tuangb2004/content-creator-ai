import { useMemo } from 'react';
import { JOURNAL_ARTICLES } from '../../constants';
import { Reveal } from '../Landing/Reveal';
import { useLanguage } from '../../contexts/LanguageContext';

const Journal = ({ onArticleClick, searchQuery = '' }) => {
  const { t, language } = useLanguage();
  
  const filteredArticles = useMemo(() => {
    let articles = JOURNAL_ARTICLES;

    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        articles = articles.filter(article => {
            const title = (language === 'vi' ? article.title_vi : article.title) || article.title;
            const excerpt = (language === 'vi' ? article.excerpt_vi : article.excerpt) || article.excerpt;
            return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query)
        });
    }
    return articles;
  }, [searchQuery, language]);

  if (filteredArticles.length === 0 && searchQuery) {
      return null;
  }

  return (
    <section id="journal" className="bg-[#F5F2EB] dark:bg-gray-900 py-32 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto">
        <Reveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-8 border-b border-[#D6D1C7] dark:border-gray-700 transition-colors duration-300">
                <div>
                    <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] dark:text-gray-500 mb-4 transition-colors duration-300">{t?.journal?.editorial || 'Editorial'}</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] dark:text-gray-100 transition-colors duration-300">{t?.journal?.title || 'The Journal'}</h2>
                </div>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {filteredArticles.map((article, index) => {
                const title = (language === 'vi' ? article.title_vi : article.title) || article.title;
                const excerpt = (language === 'vi' ? article.excerpt_vi : article.excerpt) || article.excerpt;
                
                return (
                    <Reveal key={article.id} delay={index * 150}>
                        <div className="group cursor-pointer flex flex-col text-left" onClick={() => onArticleClick(article)}>
                            <div className="w-full aspect-[4/3] overflow-hidden mb-8 bg-[#EBE7DE] dark:bg-gray-700 transition-colors duration-300">
                                <img 
                                    src={article.image} 
                                    alt={title} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                                />
                            </div>
                            <div className="flex flex-col flex-1 text-left">
                                <span className="text-xs font-medium uppercase tracking-widest text-[#A8A29E] dark:text-gray-500 mb-3 transition-colors duration-300">{article.date}</span>
                                <h3 className="text-2xl font-serif text-[#2C2A26] dark:text-gray-100 mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4 transition-colors duration-300">{title}</h3>
                                <p className="text-[#5D5A53] dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">{excerpt}</p>
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>
      </div>
    </section>
  );
};

export default Journal;

