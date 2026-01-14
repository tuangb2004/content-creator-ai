import { useState, useMemo } from 'react';
import { TOOLS } from '../../constants';
import ProductCard from './ProductCard';
import { Reveal } from '../Landing/Reveal';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductGrid = ({ onProductClick, searchQuery = '', compact = false }) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');

  // Helper to get translated categories
  const categories = useMemo(() => [
      { id: 'All', label: t?.tools?.categories?.all || 'All' },
      { id: 'Text', label: t?.tools?.categories?.text || 'Text' },
      { id: 'Image', label: t?.tools?.categories?.image || 'Image' },
      { id: 'Social', label: t?.tools?.categories?.social || 'Social' },
      { id: 'Strategy', label: t?.tools?.categories?.strategy || 'Strategy' }
  ], [t]);

  const filteredTools = useMemo(() => {
    let tools = TOOLS;

    // Filter by Category
    if (activeCategory !== 'All') {
        tools = tools.filter(t => t.category === activeCategory);
    }

    // Filter by Search Query (check both EN and VI fields)
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        tools = tools.filter(tool => {
            const name = (language === 'vi' ? tool.name_vi : tool.name) || tool.name;
            const desc = (language === 'vi' ? tool.description_vi : tool.description) || tool.description;
            const tagline = (language === 'vi' ? tool.tagline_vi : tool.tagline) || tool.tagline;
            
            return name.toLowerCase().includes(query) || 
                   desc.toLowerCase().includes(query) ||
                   tagline.toLowerCase().includes(query);
        });
    }

    return tools;
  }, [activeCategory, searchQuery, language]);

  return (
    <section id="products" className={`${compact ? 'pt-2 pb-12 px-0' : 'py-32 px-6 md:px-12'} bg-[#F5F2EB] dark:bg-gray-900 transition-colors duration-300`}>
      <div className="max-w-[1800px] mx-auto">
        
        <div className={`flex flex-col items-center text-center ${compact ? 'mb-12' : 'mb-24'} space-y-8`}>
          <Reveal>
            <h2 className={`${compact ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} font-serif text-[#2C2A26] dark:text-gray-100 transition-colors duration-300`}>{t?.tools?.title || 'Your Studio'}</h2>
          </Reveal>
          
          <Reveal delay={200}>
            <div className="flex flex-wrap justify-center gap-8 pt-4 border-t border-[#D6D1C7]/50 w-full max-w-2xl mx-auto">
                {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-sm uppercase tracking-widest pb-1 border-b transition-all duration-300 ${
                    activeCategory === cat.id 
                        ? 'border-[#2C2A26] dark:border-gray-100 text-[#2C2A26] dark:text-gray-100' 
                        : 'border-transparent text-[#A8A29E] dark:text-gray-500 hover:text-[#2C2A26] dark:hover:text-gray-300'
                    }`}
                >
                    {cat.label}
                </button>
                ))}
            </div>
          </Reveal>
        </div>

        {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 items-stretch">
            {filteredTools.map((tool, index) => (
                <Reveal key={tool.id} delay={index * 100}>
                    <ProductCard product={tool} onClick={onProductClick} />
                </Reveal>
            ))}
            </div>
        ) : (
            <div className="text-center py-24 opacity-60">
                <p className="text-xl font-serif text-[#2C2A26] dark:text-gray-100 transition-colors duration-300">{t?.tools?.noResults || 'No tools found.'}</p>
                <p className="text-sm text-[#5D5A53] dark:text-gray-400 mt-2 transition-colors duration-300">{t?.tools?.tryAdjust || 'Try adjusting your search or category.'}</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;

