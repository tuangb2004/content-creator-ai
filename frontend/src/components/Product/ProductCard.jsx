import { useLanguage } from '../../contexts/LanguageContext';

const ProductCard = ({ product, onClick }) => {
  const { language, t } = useLanguage();
  
  // Resolve localized strings
  const name = (language === 'vi' ? product.name_vi : product.name) || product.name;
  const tagline = (language === 'vi' ? product.tagline_vi : product.tagline) || product.tagline;

  return (
    <div className="group flex flex-col gap-6 cursor-pointer h-full" onClick={() => onClick(product)}>
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EBE7DE] dark:bg-[#2C2A26] transition-colors duration-500">
        <img 
          src={product.imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
        />
        
        <div className="absolute inset-0 bg-[#2C2A26]/0 group-hover:bg-[#2C2A26]/10 transition-colors duration-500 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="bg-white/90 backdrop-blur text-[#2C2A26] px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium">
                    {t?.tools?.openTool || 'Open Tool'}
                </span>
            </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-serif font-medium text-[#2C2A26] dark:text-[#F5F2EB] mb-1 group-hover:opacity-70 transition-all duration-300">{name}</h3>
        <p className="text-sm font-light text-[#5D5A53] dark:text-[#A8A29E] mb-3 tracking-wide transition-colors duration-300">{tagline}</p>
        <div className="flex justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#A8A29E] border border-[#D6D1C7] dark:border-[#433E38] dark:text-[#A8A29E] px-2 py-1 rounded-sm transition-colors duration-300">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

