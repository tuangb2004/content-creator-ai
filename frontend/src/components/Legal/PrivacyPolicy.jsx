import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const PrivacyPolicy = ({ onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

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
          {t?.privacy?.title || 'Privacy Policy'}
        </h1>
        <p className={`text-sm mb-12 uppercase tracking-widest transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-500' : 'text-[#A8A29E]'
        }`}>
          {t?.privacy?.lastUpdated || 'Last Updated: October 27, 2025'}
        </p>

        <div className={`prose prose-stone dark:prose-invert max-w-none font-light leading-relaxed transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-300' : 'text-[#5D5A53]'
        }`}>
          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section1?.title || '1. Information We Collect'}
          </h3>
          <p>
            {t?.privacy?.section1?.content || 'We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or use our interactive tools. This includes:'}
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>{t?.privacy?.section1?.point1 || 'Contact information (Name, Email address).'}</li>
            <li>{t?.privacy?.section1?.point2 || 'Usage data (Prompts entered, Tools used).'}</li>
            <li>{t?.privacy?.section1?.point3 || 'Generated content history (Saved projects).'}</li>
          </ul>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section2?.title || '2. Use of AI Technology'}
          </h3>
          <p>
            {t?.privacy?.section2?.content || 'CreatorAI uses Google\'s Gemini API to process your prompts and generate content. When you use our tools, the text or images you provide as input are sent to Google\'s servers for processing.'}
          </p>
          <p className="mt-2">
            {t?.privacy?.section2?.warning || 'We recommend not inputting sensitive personal data (PII), confidential business information, or trade secrets into the generation prompts.'}
          </p>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section3?.title || '3. How We Use Your Information'}
          </h3>
          <p>
            {t?.privacy?.section3?.content || 'We use the information we collect to:'}
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>{t?.privacy?.section3?.point1 || 'Provide, maintain, and improve our services.'}</li>
            <li>{t?.privacy?.section3?.point2 || 'Personalize your experience (e.g., saving your favorite tools).'}</li>
            <li>{t?.privacy?.section3?.point3 || 'Send you technical notices and support messages.'}</li>
          </ul>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section4?.title || '4. Data Security'}
          </h3>
          <p>
            {t?.privacy?.section4?.content || 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. However, no internet transmission is completely secure.'}
          </p>
          
          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section5?.title || '5. Cookies'}
          </h3>
          <p>
            {t?.privacy?.section5?.content || 'We use cookies to understand and save your preferences for future visits. You can choose to disable cookies through your individual browser options.'}
          </p>

          <h3 className={`font-serif text-xl mt-8 mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>
            {t?.privacy?.section6?.title || '6. Contact Us'}
          </h3>
          <p>
            {t?.privacy?.section6?.content || 'If you have any questions about this Privacy Policy, please contact us at privacy@creatorai.demo.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

