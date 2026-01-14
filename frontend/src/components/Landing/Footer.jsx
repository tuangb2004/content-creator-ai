import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = ({ onLinkClick }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [subscribeStatus, setSubscribeStatus] = useState('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="bg-[#EBE7DE] dark:bg-gray-800 pt-24 pb-12 px-6 text-[#5D5A53] dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-[#2C2A26] dark:text-gray-100 mb-6 transition-colors duration-300">CreatorAI</h4>
          <p className="max-w-xs font-light leading-relaxed">
            {t?.footer?.description || 'Designing technology that feels as natural as the world around it. Born from code, built for the mind.'}
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] dark:text-gray-100 mb-6 tracking-wide text-sm uppercase transition-colors duration-300">{t?.footer?.platform || 'Platform'}</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#products" onClick={(e) => onLinkClick && onLinkClick(e, 'products')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.footer?.allTools || 'All Tools'}</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick && onLinkClick(e, 'products')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.footer?.features || 'New Features'}</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick && onLinkClick(e, 'products')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.footer?.community || 'Community'}</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-medium text-[#2C2A26] dark:text-gray-100 mb-6 tracking-wide text-sm uppercase transition-colors duration-300">{t?.footer?.company || 'Company'}</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#about" onClick={(e) => onLinkClick && onLinkClick(e, 'about')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.footer?.story || 'Our Story'}</a></li>
            <li><a href="#about" onClick={(e) => onLinkClick && onLinkClick(e, 'about')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.footer?.ethics || 'Ethics'}</a></li>
            <li><a href="#journal" onClick={(e) => onLinkClick && onLinkClick(e, 'journal')} className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline">{t?.journal?.title || 'The Journal'}</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className={`font-medium mb-6 tracking-wide text-sm uppercase transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>{t?.footer?.newsletter || 'Newsletter'}</h4>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="email@address.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              className="bg-transparent border-b border-[#A8A29E] dark:border-gray-600 py-2 text-lg outline-none focus:border-[#2C2A26] dark:focus:border-gray-400 transition-colors placeholder-[#A8A29E]/70 dark:placeholder-gray-500 text-[#2C2A26] dark:text-gray-200 disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className={`self-start text-sm font-medium uppercase tracking-widest mt-2 disabled:cursor-default disabled:opacity-50 transition-all duration-300 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-gray-100 disabled:hover:text-gray-500'
                  : 'text-[#2C2A26] hover:text-[#2C2A26] disabled:hover:text-[#5D5A53]'
              }`}
            >
              {subscribeStatus === 'idle' && (t?.footer?.subscribe || 'Subscribe')}
              {subscribeStatus === 'loading' && (t?.footer?.subscribing || 'Subscribing...')}
              {subscribeStatus === 'success' && (t?.footer?.subscribed || 'Subscribed')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-[#D6D1C7] dark:border-gray-700 flex flex-col md:flex-row justify-end items-center text-xs uppercase tracking-widest opacity-60 transition-colors duration-300">
        <div className="flex gap-6 mt-4 md:mt-0">
          <a 
            href="#terms" 
            onClick={(e) => onLinkClick && onLinkClick(e, 'terms')}
            className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline"
          >
            {t?.footer?.termsOfService || 'Terms of Service'}
          </a>
          <a 
            href="#privacy" 
            onClick={(e) => onLinkClick && onLinkClick(e, 'privacy')}
            className="hover:text-[#2C2A26] dark:hover:text-gray-100 transition-colors underline-offset-4 hover:underline"
          >
            {t?.footer?.privacyPolicy || 'Privacy Policy'}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

