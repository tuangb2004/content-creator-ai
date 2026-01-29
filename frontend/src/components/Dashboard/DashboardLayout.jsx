import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Icons } from '../Icons';
import Logo from '../../assets/svg/Logo.svg';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: 'Home' },
  { id: 'video-generator', label: 'Video generator', icon: 'Clapperboard', section: 'creation' },
  { id: 'image-studio', label: 'Image studio', icon: 'Image', section: 'creation' },
  { id: 'inspiration', label: 'Inspiration', icon: 'Lightbulb', section: 'creation' },
  { id: 'avatars', label: 'Avatars and voices', icon: 'Users', section: 'creation' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart2', section: 'management' },
  { id: 'publisher', label: 'Publisher', icon: 'Calendar', section: 'management' },
  { id: 'smart-creation', label: 'Smart creation', icon: 'Wand2', section: 'space' },
  { id: 'assets', label: 'Assets', icon: 'Cloud', section: 'space' },
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
  // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();

  const isDarkMode = theme === 'dark';

  // User info
  const displayEmail = userEmail || user?.email || "creator@demo.com";
  // Ensure we only retrieve the first name to avoid long names
  const fullDisplayName = userData?.firstName || user?.displayName || displayEmail.split('@')[0];
  const userDisplayName = fullDisplayName.split(' ')[0];
  const userHandle = `@${userDisplayName.toLowerCase().replace(/\s+/g, '')}`;

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

  const renderNavItem = (item) => {
    const Icon = Icons[item.icon] || Icons.HelpCircle;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.label}
        onClick={() => {
          onTabChange(item.id);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center group ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-sm transition-all duration-200 ${isActive
          ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
          : 'text-black dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
          }`}
        title={isSidebarCollapsed ? item.label : ''}
      >
        <Icon size={20} isActive={isActive} className="shrink-0" />
        {!isSidebarCollapsed && (
          <span className={isActive ? 'font-semibold' : 'font-normal group-hover:font-semibold'}>{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0f172a] font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'w-[70px]' : 'w-56'} bg-white dark:bg-[#1e293b] border-r border-gray-100 dark:border-gray-800 transform transition-all duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative flex flex-col`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-1/2 -right-3 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-sm transition-colors hover:shadow-md"
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
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">Creation</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'creation').map(renderNavItem)}
            </div>
          </div>

          <div>
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">Management</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'management').map(renderNavItem)}
            </div>
          </div>

          <div>
            {!isSidebarCollapsed && <h3 className="px-3 text-xs font-medium text-black dark:text-gray-400 mb-2">Space</h3>}
            {isSidebarCollapsed && <div className="h-px bg-gray-100 dark:bg-gray-700 my-4 mx-2"></div>}
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'space').map(renderNavItem)}
            </div>
          </div>
        </nav>

        <div className="p-2 border-t border-gray-100 dark:border-gray-800 relative" ref={sidebarProfileRef}>
          {isSidebarProfileOpen && (
            <div className={`absolute z-50 bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-200 w-56 ${isSidebarCollapsed
              ? 'bottom-full left-0 mb-2 slide-in-from-bottom-2'
              : 'bottom-full -left-2 mb-2 slide-in-from-bottom-2'
              }`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-sm shrink-0">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{userDisplayName.charAt(0)}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-black dark:text-white truncate">{userDisplayName}</div>
                  <div className="text-xs text-black dark:text-gray-400 truncate">{userHandle}</div>
                </div>
              </div>

              <div className="p-2 space-y-0.5">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <Icons.Bell size={18} className="text-black dark:text-gray-400" />
                  Notifications
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <Icons.Folder size={18} className="text-black dark:text-gray-400" />
                  Projects
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left"
                >
                  <Icons.Globe size={18} className="text-black dark:text-gray-400" />
                  Language: EN
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <Icons.Sparkles size={18} className="text-black dark:text-gray-400" />
                  Upgrade plan
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <Icons.Brush size={18} className="text-black dark:text-gray-400" />
                  Personalization
                </button>
                <button onClick={() => onTabChange('settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <Icons.Settings size={18} className="text-black dark:text-gray-400" />
                  Settings
                </button>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2"></div>

              <div className="p-2 space-y-0.5">
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Icons.HelpCircle size={18} className="text-black dark:text-gray-400" />
                    Help
                  </div>
                  <Icons.ChevronRight size={14} className="text-black dark:text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsSidebarProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-medium text-black dark:text-gray-300 transition-colors text-left"
                >
                  <Icons.LogOut size={18} className="text-black dark:text-gray-400" />
                  Log out
                </button>
              </div>
            </div>
          )}

          {!isSidebarCollapsed ? (
            <div
              onClick={() => setIsSidebarProfileOpen(!isSidebarProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group w-full"
            >
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-sm shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{userDisplayName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left overflow-hidden">
                <div className="font-semibold text-sm text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {userDisplayName}
                </div>
                <div className="text-xs text-black dark:text-gray-400 truncate">Miễn phí</div>
              </div>
              <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-black dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Upgrade
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsSidebarProfileOpen(!isSidebarProfileOpen)}
              className="flex justify-center"
            >
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-sm shrink-0 cursor-pointer">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{userDisplayName.charAt(0)}</span>
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
          <header className="flex items-center justify-between px-6 py-3 border-b border-transparent relative z-40">
            <div className="flex items-center md:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <Icons.Menu size={24} />
              </button>
            </div>

            {/* Breadcrumb or Title spacer */}
            <div className="hidden md:block"></div>

            <div className="flex items-center space-x-3 ml-auto">
              <div className="hidden md:flex items-center bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg">
                <Icons.Wand2 size={14} className="text-teal-600 dark:text-teal-400 mr-2" />
                <span className="text-teal-700 dark:text-teal-300 text-sm font-bold">200</span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                <button className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline">Try for $0</button>
              </div>

              <button className="hidden md:flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors group">
                <Icons.Shop size={16} isActive={false} />
                <span className="text-sm font-bold">Earn credits</span>
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
