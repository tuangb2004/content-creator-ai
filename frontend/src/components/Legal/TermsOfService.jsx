import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const TermsOfService = ({ onBack }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  return (
    <div className={`min-h-screen pt-24 pb-20 animate-fade-in-up transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-[#F5F2EB] text-[#2C2A26]'
    }`}>
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        
        <button 
          onClick={onBack}
          className={`group flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors mb-12 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-[#A8A29E] hover:text-[#2C2A26]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t?.common?.back || 'Back'}
        </button>

        <h1 className={`text-4xl md:text-5xl font-serif mb-2 transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
        }`}>
          {t?.terms?.title || 'Terms of Service'}
        </h1>
        <p className={`text-sm mb-12 uppercase tracking-widest transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-500' : 'text-[#A8A29E]'
        }`}>
          {t?.terms?.lastUpdated || 'Last Updated: October 27, 2025'}
        </p>

        <div className={`prose prose-stone dark:prose-invert max-w-none font-light leading-relaxed transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-300' : 'text-[#5D5A53]'
        }`}>
          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section1?.title || '1. Acceptance of Terms'}
          </h3>
          <p>
            {t?.terms?.section1?.content || 'By accessing and using CreatorAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.'}
          </p>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section2?.title || '2. AI-Generated Content'}
          </h3>
          <p>
            {t?.terms?.section2?.content || 'CreatorAI utilizes artificial intelligence (Google Gemini models) to generate text and images. You acknowledge that:'}
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>{t?.terms?.section2?.point1 || 'Output may not always be accurate, unique, or suitable for your specific needs.'}</li>
            <li>{t?.terms?.section2?.point2 || 'You are responsible for reviewing and verifying all generated content before publication.'}</li>
            <li>{t?.terms?.section2?.point3 || 'We do not claim copyright ownership over the content you generate; however, the legal status of AI-generated works varies by jurisdiction.'}</li>
          </ul>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section3?.title || '3. User Conduct'}
          </h3>
          <p>
            {t?.terms?.section3?.content || 'You agree not to use the Service to generate content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or hateful. We reserve the right to terminate accounts that violate these standards or misuse our AI infrastructure.'}
          </p>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section4?.title || '4. Intellectual Property'}
          </h3>
          <p>
            {t?.terms?.section4?.content || 'The interface, code, and design of CreatorAI are the proprietary property of CreatorAI Labs. You are granted a limited license only for purposes of viewing and using the material on this website.'}
          </p>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section5?.title || '5. Limitation of Liability'}
          </h3>
          <p>
            {t?.terms?.section5?.content || 'In no event shall CreatorAI, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.'}
          </p>
          
          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.terms?.section6?.title || '6. Changes to Terms'}
          </h3>
          <p>
            {t?.terms?.section6?.content || 'We reserve the right to modify these terms at any time. Your continued use of the Service following any changes indicates your acceptance of the new Terms of Service.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

