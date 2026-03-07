import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icons } from '../Icons';
import Logo from '../../assets/svg/Logo.svg';
import NotificationDropdown from './NotificationDropdown';

// Safe area hook for mobile devices
const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    setSafeArea({
      top: parseInt(computedStyle.getPropertyValue('--sat')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('--sab')) || 0,
      left: parseInt(computedStyle.getPropertyValue('--sal')) || 0,
      right: parseInt(computedStyle.getPropertyValue('--sar')) || 0,
    });
  }, []);
  
  return safeArea;
};

const navItems = [
  { id: 'dashboard', icon: 'Home' },
  { id: 'video-generator', icon: 'Clapperboard', section: 'creation' },
  { id: 'image-studio', icon: 'Image', section: 'creation' },
  { id: 'inspiration', icon: 'Lightbulb', section: 'creation' },
  { id: 'avatars', icon: 'Users', section: 'creation' },
  { id: 'analytics', icon: 'BarChart2', section: 'management' },
  { id: 'publisher', icon: 'Calendar', section: 'management' },
  { id: 'smart-creation', icon: 'Wand2', section: 'space' },
  { id: 'assets', icon: 'Cloud', section: 'space' },
];

const DashboardLayout = ({ children, activeTab, onTabChange, onLogout, userEmail, isSidebarCollapsed: controlledCollapsed, onSidebarToggle, hideHeader = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarProfileOpen, setIsSidebarProfileOpen] = useState(false);

  // Internal state for backward compatibility or independent usage
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isSidebarCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setIsSidebarCollapsed = (value) => {
    if (onSidebarToggle) {
      onSidebarToggle(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  const profileRef = useRef(null);
  const sidebarProfileRef = useRef(null);

  const { user, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();

  const isDarkMode = theme === 'dark';

  // User info
  const displayEmail = userEmail || user?.email || "creator@demo.com";
  // Ensure we only retrieve the first name to avoid long names
  const fullDisplayName = userData?.displayName || userData?.firstName || user?.displayName || displayEmail.split('@')[0];
  const userDisplayName = fullDisplayName.split(' ')[0] || "User";
  const userHandle = `@${userDisplayName.toLowerCase().replace(/\s+/g, '')}`;
  const userAvatar = userData?.photoURL || user?.photoURL;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (sidebarProfileRef.current && !sidebarProfileRef.current.contains(event.target)) {
        setIsSidebarProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to get translated label
  const getNavLabel = (id) => {
    const key = id.replace(/-/g, ''); // video-generator -> videogenerator
    // Handle special cases or generic mapping
    const map = {
      'dashboard': t.dashboard.nav.dashboard,
      'video-generator': t.dashboard.nav.videoGenerator,
      'image-studio': t.dashboard.nav.imageStudio,
      'inspiration': t.dashboard.nav.inspiration,
      'avatars': t.dashboard.nav.avatars,
      'analytics': t.dashboard.nav.analytics,
      'publisher': t.dashboard.nav.publisher,
      'smart-creation': t.dashboard.nav.smartCreation,
      'assets': t.dashboard.nav.assets
    };
    return map[id] || id; // Fallback to id if translation missing
  };

  const renderNavItem = (item) => {
    const Icon = Icons[item.icon] || Icons.HelpCircle;
    const isActive = activeTab === item.id;
    const label = getNavLabel(item.id);

    return (
      <button
        key={item.id}
        onClick={() => {
          onTabChange(item.id);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center group ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-sm transition-all duration-200 ${isActive
          ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
          : 'text-black dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
          }`}
        title={isSidebarCollapsed ? label : ''}
      >
        <Icon size={20} isActive={isActive} className="shrink-0" />
        {!isSidebarCollapsed && (
          <span className={`truncate ${isActive ? 'font-semibold' : 'font-normal group-hover:font-semibold'}`}>{label}</span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0f172a] font-sans">
      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - slides in from left on mobile when hamburger is clicked */}
      <aside className={`${isSidebarCollapsed ? 'w-[70px]' : 'w-56'} bg-white dark:bg-[#1e293b] border-r border-gray-100 dark:border-gray-800 transform transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 flex flex-col 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:relative`}>
        {/* Close button for mobile - shows only on mobile, using hamburger icon */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-3 right-3 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white lg:hidden"
        >
          <Icons.Menu size={20} />
        </button>

        {/* Toggle sidebar button - shows only on desktop */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-1/2 -right-3 z-50 hidden lg:flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-sm transition-colors hover:shadow-md"
        >
          {isSidebarCollapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
        </button>

        <div className={`flex items-center h-[52px] ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center shrink-0">
            <img src={Logo} alt="Logo" className="h-8 w-auto object-contain dark:invert pl-2" />
            {!isSidebarCollapsed && (
              <span className="text-x font-brand font-semibold tracking-tight text-black dark:text-white">CreatorAI</span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-6 no-scrollbar pt-4">
          <div className="space-y-1">
            {navItems.filter(i => !i.section).map(renderNavItem)}
          </div>

          <div>
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">{t.dashboard.sections?.creation || 'Creation'}</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'creation').map(renderNavItem)}
            </div>
          </div>

          <div>
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">{t.dashboard.sections?.management || 'Management'}</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'management').map(renderNavItem)}
            </div>
          </div>

          <div>
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">{t.dashboard.sections?.space || 'Space'}</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'space').map(renderNavItem)}
            </div>
          </div>
        </nav>

        <div className="p-2 border-t border-gray-100 dark:border-gray-800 relative" ref={sidebarProfileRef}>
          {isSidebarProfileOpen && (
            <div className={`absolute z-50 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-600 overflow-hidden animate-in fade-in duration-200 w-52 ${isSidebarCollapsed
              ? 'bottom-full left-0 mb-2 slide-in-from-bottom-2'
              : 'bottom-full left-2 mb-2 slide-in-from-bottom-2'
              }`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white dark:border-gray-700 overflow-hidden shadow-sm bg-gradient-to-br from-purple-500 to-blue-500">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-500', 'to-blue-500');
                        e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-white uppercase tracking-tighter">${fullDisplayName.split(' ').filter(Boolean).length >= 2 ? (fullDisplayName.split(' ').filter(Boolean)[0][0] + fullDisplayName.split(' ').filter(Boolean).pop()[0]).toUpperCase() : fullDisplayName.substring(0, 2).toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-white uppercase tracking-tighter">
                      {fullDisplayName.split(' ').filter(Boolean).length >= 2 ? (fullDisplayName.split(' ').filter(Boolean)[0][0] + fullDisplayName.split(' ').filter(Boolean).pop()[0]).toUpperCase() : fullDisplayName.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-black dark:text-white truncate">{userDisplayName}</div>
                  <div className="text-xs text-black dark:text-gray-400 truncate">{userHandle}</div>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    onTabChange('profile');
                    setIsSidebarProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group"
                >
                  <Icons.User size={16} className="text-black dark:text-gray-400" />
                  {t.dashboard.profile?.myProfile || 'Hồ sơ của tôi'}
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group">
                  <Icons.Bell size={16} className="text-black dark:text-gray-400" />
                  {t.dashboard.profile?.notifications || 'Notifications'}
                </button>
                <button
                  onClick={() => changeLanguage(language === 'en' ? 'vi' : 'en')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group"
                >
                  <Icons.Globe size={16} className="text-black dark:text-gray-400" />
                  {t.settings.language}: {language === 'en' ? 'EN' : 'VI'}
                </button>
                <button
                  onClick={() => onTabChange('profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group"
                >
                  <Icons.User size={16} className="text-black dark:text-gray-400" />
                  {t.dashboard.profile?.myProfile || 'My profile'}
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group"
                >
                  {theme === 'dark' ? (
                    <>
                      <Icons.Sun size={16} className="text-black dark:text-gray-400" />
                      {t.dashboard.profile?.lightMode || 'Light Mode'}
                    </>
                  ) : (
                    <>
                      <Icons.Moon size={16} className="text-black dark:text-gray-400" />
                      {t.dashboard.profile?.darkMode || 'Dark Mode'}
                    </>
                  )}
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group">
                  <Icons.Sparkles size={16} className="text-black dark:text-gray-400" />
                  {t.dashboard.profile?.upgrade || 'Upgrade plan'}
                </button>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2"></div>

              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group">
                  <div className="flex items-center gap-3">
                    <Icons.HelpCircle size={16} className="text-black dark:text-gray-400" />
                    {t.dashboard.profile?.help || 'Help'}
                  </div>
                  <Icons.ChevronRight size={14} className="text-black dark:text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsSidebarProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-normal hover:font-semibold text-black dark:text-gray-400 dark:hover:text-white transition-all text-left group"
                >
                  <Icons.LogOut size={16} className="text-black dark:text-gray-400" />
                  {t.dashboard.profile?.signout || 'Log out'}
                </button>
              </div>
            </div>
          )}

          {!isSidebarCollapsed ? (
            <div
              onClick={() => setIsSidebarProfileOpen(!isSidebarProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group w-full"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white dark:border-gray-700 overflow-hidden shadow-sm bg-gradient-to-br from-purple-500 to-blue-500">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-500', 'to-blue-500');
                      e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-white uppercase tracking-tighter">${userDisplayName.charAt(0)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">
                    {fullDisplayName.split(' ').filter(Boolean).length >= 2 ? (fullDisplayName.split(' ').filter(Boolean)[0][0] + fullDisplayName.split(' ').filter(Boolean).pop()[0]).toUpperCase() : fullDisplayName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left overflow-hidden">
                <div className="font-semibold text-sm text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {userDisplayName}
                </div>
                <div className="text-xs text-black dark:text-gray-400 truncate">
                  {userData?.plan === 'pro' ? (t.dashboard.profile?.proPlan || 'Pro Plan') : (t.dashboard.profile?.freePlan || 'Free Plan')}
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                {t.common?.upgrade || 'Upgrade'}
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsSidebarProfileOpen(!isSidebarProfileOpen)}
              className="flex justify-center"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white dark:border-gray-700 overflow-hidden shadow-sm bg-gradient-to-br from-purple-500 to-blue-500">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-500', 'to-blue-500');
                      e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-white uppercase tracking-tighter">${userDisplayName.charAt(0)}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">
                    {fullDisplayName.split(' ').filter(Boolean).length >= 2 ? (fullDisplayName.split(' ').filter(Boolean)[0][0] + fullDisplayName.split(' ').filter(Boolean).pop()[0]).toUpperCase() : fullDisplayName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#0f172a]">
        {/* Header */}
        {!hideHeader && (
          <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-transparent relative z-40 bg-white dark:bg-[#0f172a]">
            {/* Mobile menu button and title */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden touch-manipulation"
                aria-label="Open menu"
              >
                <Icons.Menu size={24} />
              </button>
              
              {/* Page title - hidden on small mobile, visible on larger screens */}
              <div className="hidden xs:block lg:hidden">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  CreatorAI
                </span>
              </div>
            </div>

            {/* Spacer for desktop */}
            <div className="hidden lg:block"></div>

            {/* Right side actions */}
            <div className="flex items-center space-x-1.5 md:space-x-3">
              {/* Credits - compact on mobile */}
              <div className="flex items-center h-8 md:h-9 bg-white dark:bg-gray-800 px-2 md:px-3 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 transition-colors">
                <Icons.Wand2 size={14} className="text-purple-600 dark:text-purple-400 mr-1.5 md:mr-2" />
                <span className="text-xs md:text-sm text-black dark:text-white font-bold tabular-nums">
                  {userData?.credits !== undefined ? userData.credits.toLocaleString() : '0'}
                </span>
                <span className="hidden md:inline mx-2 text-gray-300 dark:text-gray-600">|</span>
                <span className="hidden md:inline text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {userData?.plan === 'pro' ? (t.dashboard.profile?.proPlan || 'Pro Plan') : (t.dashboard.profile?.freePlan || 'Free Plan')}
                </span>
                
                {/* Mobile-only plan indicator */}
                <span className="md:hidden ml-1 text-[10px] text-gray-500 dark:text-gray-400">
                  {userData?.plan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>

              {/* Earn credits button - full text on mobile */}
              <button
                onClick={() => onTabChange('billing')}
                className="flex items-center h-8 md:h-9 gap-1.5 md:gap-2 bg-white dark:bg-gray-800 text-black dark:text-white px-2 md:px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm group"
              >
                <Icons.Shop size={14} className="md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-bold whitespace-nowrap">{t.dashboard.earnCredits || 'Earn'}</span>
              </button>

              {/* Notifications */}
              <NotificationDropdown />
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;
