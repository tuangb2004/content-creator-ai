import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const BRAND_NAME = 'CreatorAI';

const LandingNavbar = ({ onNavClick, projectCount = 0, onCartClick, onAuthClick, onSearch }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const languageButton = event.target.closest('[aria-label="Select Language"]');
      const dropdownMenu = event.target.closest('.absolute.top-full');
      
      if (isLangMenuOpen && !languageButton && !dropdownMenu) {
        setIsLangMenuOpen(false);
      }
    };

    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLangMenuOpen]);

  const handleSearchChange = (e) => {
      const val = e.target.value;
      setSearchQuery(val);
      if (onSearch) onSearch(val);
      // Keep search open if there's a query
      if (val && !isSearchOpen) {
          setIsSearchOpen(true);
      }
  };

  const handleLanguageChange = (lang) => {
      setLanguage(lang);
      setIsLangMenuOpen(false);
  };

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(e, targetId);
    } else {
      // Default smooth scroll behavior
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 85;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  const handleCartClick = (e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    if (onCartClick) {
      onCartClick();
    } else if (user) {
      navigate('/projects');
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onNavClick) {
      onNavClick(e, '');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to landing page after logout
      navigate('/', { replace: true });
      // Force reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Text color changes based on scroll state and theme
  const textColorClass = (scrolled || mobileMenuOpen) 
    ? 'text-[#2C2A26] dark:text-gray-100' 
    : theme === 'dark' 
      ? 'text-gray-100' 
      : 'text-[#F5F2EB]';
  const buttonBgClass = (scrolled || mobileMenuOpen) 
    ? 'bg-[#2C2A26] dark:bg-gray-700 text-[#F5F2EB] dark:text-gray-100 hover:bg-[#433E38] dark:hover:bg-gray-600' 
    : theme === 'dark'
      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
      : 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-white';
  const borderColorClass = (scrolled || mobileMenuOpen) 
    ? 'border-[#2C2A26] dark:border-gray-400' 
    : theme === 'dark'
      ? 'border-gray-400'
      : 'border-[#F5F2EB]';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent ${
          scrolled || mobileMenuOpen 
            ? theme === 'dark'
              ? 'bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md py-4 shadow-sm border-gray-700/50'
              : 'bg-[#F5F2EB]/95 backdrop-blur-md py-4 shadow-sm border-[#D6D1C7]/50'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
          
          {/* LEFT: Logo */}
          <div className={`flex-shrink-0 z-20 transition-opacity duration-300 ${isSearchOpen ? 'opacity-70' : 'opacity-100'}`}>
            <a 
                href="#" 
                onClick={handleLogoClick}
                className={`text-2xl md:text-3xl font-serif font-medium tracking-tight transition-colors duration-500 ${textColorClass}`}
            >
                {BRAND_NAME}
            </a>
          </div>
          
          {/* CENTER: Navigation Links (Absolute centered on desktop) - Hide when search is open to prevent overlap */}
          <div className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-[13px] font-medium tracking-[0.12em] uppercase transition-all duration-300 z-10 ${textColorClass} ${isSearchOpen ? 'opacity-0 scale-95 pointer-events-none invisible' : 'opacity-100 scale-100 pointer-events-auto visible'}`}>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:opacity-60 transition-opacity">{t?.nav?.suite || 'Creative Suite'}</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:opacity-60 transition-opacity">{t?.nav?.phil || 'Philosophy'}</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:opacity-60 transition-opacity">{t?.nav?.res || 'Resources'}</a>
          </div>

          {/* RIGHT: Actions - Higher z-index when search is open */}
          <div className={`hidden lg:flex items-center gap-4 transition-all duration-500 ${textColorClass} ${isSearchOpen ? 'z-[55]' : 'z-20'}`}>
            
            {/* Search Bar - Higher z-index to prevent overlap */}
            <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 xl:w-64' : 'w-8'}`}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsSearchOpen(!isSearchOpen);
                        setIsLangMenuOpen(false); // Close language menu when opening search
                        if (!isSearchOpen && searchInputRef.current) {
                            setTimeout(() => searchInputRef.current?.focus(), 100);
                        }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity z-10"
                    aria-label="Toggle search"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder={t?.nav?.searchPlaceholder || 'Search tools & articles...'}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSearchOpen(true);
                        setIsLangMenuOpen(false); // Close language menu when clicking search input
                    }}
                    onBlur={(e) => {
                        // Check if blur is not caused by clicking on search button
                        const relatedTarget = e.relatedTarget;
                        const searchButton = e.currentTarget.parentElement?.querySelector('button');
                        
                        // Delay to allow click on search icon
                        setTimeout(() => {
                            if (!searchQuery.trim() && relatedTarget !== searchButton) {
                                setIsSearchOpen(false);
                            }
                        }, 200);
                    }}
                    onFocus={() => {
                        setIsSearchOpen(true);
                        setIsLangMenuOpen(false); // Close language menu when focusing search input
                    }}
                    className={`w-full bg-transparent border-b ${borderColorClass} py-1 pr-8 text-sm outline-none placeholder-current/50 transition-all duration-300 ${textColorClass} ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                />
            </div>

            {/* Language Icon with Dropdown */}
            <div className={`relative transition-opacity duration-300 ${isSearchOpen ? 'opacity-70' : 'opacity-100'}`}>
                <button 
                    onClick={() => {
                        setIsLangMenuOpen(!isLangMenuOpen);
                        setIsSearchOpen(false); // Close search when opening language menu
                    }}
                    className="hover:opacity-60 transition-opacity relative group flex items-center"
                    aria-label="Select Language"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="ml-1 text-[10px] font-bold uppercase">{language}</span>
                </button>

                {/* Dropdown Menu */}
                {isLangMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-32 bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] shadow-xl rounded-sm py-2 animate-fade-in-up text-[#2C2A26] dark:text-[#F5F2EB] z-50">
                        <button 
                            onClick={() => handleLanguageChange('en')}
                            className={`w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#F5F2EB] dark:hover:bg-[#433E38] transition-colors ${language === 'en' ? 'font-bold' : 'font-normal'}`}
                            type="button"
                        >
                            English
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('vi')}
                            className={`w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#F5F2EB] dark:hover:bg-[#433E38] transition-colors ${language === 'vi' ? 'font-bold' : 'font-normal'}`}
                            type="button"
                        >
                            Tiếng Việt
                        </button>
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`hover:opacity-60 transition-all duration-300 ${isSearchOpen ? 'opacity-70' : 'opacity-100'}`}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons - Only show when NOT logged in */}
            {!user && (
              <>
                <button 
                    onClick={() => onAuthClick && onAuthClick('signin')}
                    className={`text-xs font-medium uppercase tracking-widest hover:opacity-60 transition-all duration-300 ml-2 ${isSearchOpen ? 'opacity-70' : 'opacity-100'}`}
                >
                    {t?.nav?.signin || 'Sign In'}
                </button>
                
                <button 
                    onClick={() => onAuthClick && onAuthClick('signup')}
                    className={`px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md duration-300 ${buttonBgClass} ${isSearchOpen ? 'opacity-70' : 'opacity-100'}`}
                >
                    {t?.nav?.start || 'Get Started'}
                </button>
              </>
            )}

          </div>

          {/* Mobile Menu Button - Outside actions div so it shows on mobile */}
          <button 
            className={`lg:hidden z-20 focus:outline-none transition-all duration-500 ${textColorClass}`}
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setIsSearchOpen(false);
            }}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#F5F2EB] dark:bg-gray-900 z-[45] flex flex-col pt-24 px-8 transition-all duration-500 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => {
          // Close menu when clicking on overlay (not on content)
          if (e.target === e.currentTarget) {
            setMobileMenuOpen(false);
          }
        }}
      >
        {/* Mobile Search */}
        <div className="mb-8 relative">
            <input 
              type="text" 
              placeholder={t?.nav?.searchPlaceholder || 'Search tools & articles...'}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white dark:bg-gray-800 border border-[#D6D1C7] dark:border-gray-600 py-3 px-4 text-[#2C2A26] dark:text-gray-100 outline-none focus:border-[#2C2A26] dark:focus:border-gray-400 transition-colors placeholder-[#A8A29E] dark:placeholder-gray-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E] dark:text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <div className="flex flex-col gap-6 text-xl font-serif text-[#2C2A26] dark:text-gray-100">
          <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="border-b border-[#D6D1C7] dark:border-gray-700 pb-4 transition-colors duration-300">{t?.nav?.suite || 'Creative Suite'}</a>
          <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="border-b border-[#D6D1C7] dark:border-gray-700 pb-4 transition-colors duration-300">{t?.nav?.phil || 'Philosophy'}</a>
          <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="border-b border-[#D6D1C7] dark:border-gray-700 pb-4 transition-colors duration-300">{t?.nav?.res || 'Resources'}</a>
          
          {/* Mobile Language Selector */}
          <div className="border-b border-[#D6D1C7] dark:border-gray-700 pb-4 flex items-center justify-between transition-colors duration-300">
              <span>Language</span>
              <div className="flex gap-4 text-sm font-sans uppercase tracking-widest">
                  <button 
                      onClick={() => handleLanguageChange('en')} 
                      className={`${language === 'en' ? 'font-bold text-[#2C2A26] dark:text-gray-100' : 'text-[#A8A29E] dark:text-gray-500'} transition-colors duration-300`}
                  >
                      EN
                  </button>
                  <button 
                      onClick={() => handleLanguageChange('vi')} 
                      className={`${language === 'vi' ? 'font-bold text-[#2C2A26] dark:text-gray-100' : 'text-[#A8A29E] dark:text-gray-500'} transition-colors duration-300`}
                  >
                      VI
                  </button>
              </div>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="border-b border-[#D6D1C7] dark:border-gray-700 pb-4 flex items-center justify-between transition-colors duration-300">
              <span>Theme</span>
              <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest hover:opacity-60 transition-opacity text-[#2C2A26] dark:text-gray-100"
              >
                  {theme === 'dark' ? (
                      <>
                          <Sun className="w-5 h-5" />
                          <span>Light</span>
                      </>
                  ) : (
                      <>
                          <Moon className="w-5 h-5" />
                          <span>Dark</span>
                      </>
                  )}
              </button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col gap-4">
          {!user && (
            <>
              <button 
                  onClick={() => { setMobileMenuOpen(false); onAuthClick && onAuthClick('signin'); }}
                  className="w-full py-4 border border-[#2C2A26] dark:border-gray-400 text-[#2C2A26] dark:text-gray-100 text-xs font-bold uppercase tracking-widest hover:bg-[#2C2A26] dark:hover:bg-gray-700 hover:text-[#F5F2EB] dark:hover:text-gray-100 transition-colors"
              >
                  {t?.nav?.signin || 'Sign In'}
              </button>
              <button 
                  onClick={() => { setMobileMenuOpen(false); onAuthClick && onAuthClick('signup'); }}
                  className="w-full py-4 bg-[#2C2A26] dark:bg-gray-700 text-[#F5F2EB] dark:text-gray-100 text-xs font-bold uppercase tracking-widest hover:bg-[#433E38] dark:hover:bg-gray-600 transition-colors"
              >
                  {t?.nav?.start || 'Get Started'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LandingNavbar;

