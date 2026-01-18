import { useState } from 'react';
import { BRAND_NAME } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children, activeTab, onTabChange, onLogout, userEmail }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { user, userData } = useAuth();

  // Get user email and plan from auth context
  const displayEmail = userEmail || user?.email || "creator@demo.com";
  const plan = userData?.plan || 'free';
  const planDisplayNames = {
    free: t?.dashboard?.profile?.freePlan || 'Free Plan',
    pro: t?.dashboard?.profile?.proPlan || 'Pro Plan',
    agency: t?.dashboard?.profile?.agencyPlan || 'Agency Plan'
  };

  // Get user avatar and display name
  const userAvatar = user?.photoURL || userData?.avatarUrl || null;
  const userDisplayName = userData?.firstName
    ? `${userData.firstName}${userData.lastName ? ' ' + userData.lastName : ''}`.trim()
    : user?.displayName || displayEmail.split('@')[0];

  // Get initial for avatar fallback
  const getInitial = () => {
    if (userData?.firstName) {
      return userData.firstName[0].toUpperCase();
    }
    if (userData?.lastName) {
      return userData.lastName[0].toUpperCase();
    }
    if (user?.displayName) {
      return user.displayName[0].toUpperCase();
    }
    return displayEmail[0]?.toUpperCase() || 'U';
  };

  const handleProfileNav = (tab) => {
    onTabChange(tab);
    setIsProfileOpen(false);
    setMobileSidebarOpen(false);
  };

  const handleNavClick = (tab) => {
    onTabChange(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex font-sans">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#2C2A26] text-[#F5F2EB] z-40 flex items-center px-4 justify-between">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="font-serif font-medium">{BRAND_NAME}</span>
        <div className="w-8"></div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#2C2A26] text-[#F5F2EB] flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo Area */}
        <div className="p-8 hidden md:block">
          <h1 className="text-2xl font-serif tracking-tight">{BRAND_NAME}</h1>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E]">Studio</span>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="p-4 md:hidden flex justify-between items-center border-b border-[#433E38]">
          <span className="font-serif text-xl">{t?.dashboard?.menu || 'Menu'}</span>
          <button onClick={() => setMobileSidebarOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<HomeIcon />}
            label={t?.dashboard?.nav?.dashboard || 'Dashboard'}
            isActive={activeTab === 'dashboard'}
            onClick={() => handleNavClick('dashboard')}
          />
          <NavItem
            icon={<GridIcon />}
            label={t?.dashboard?.nav?.tools || 'All Tools'}
            isActive={activeTab === 'tools'}
            onClick={() => handleNavClick('tools')}
          />
          <NavItem
            icon={<FolderIcon />}
            label={t?.dashboard?.nav?.projects || 'Projects'}
            isActive={activeTab === 'projects'}
            onClick={() => handleNavClick('projects')}
          />
          <NavItem
            icon={<SparklesIcon />}
            label={t?.dashboard?.nav?.inspiration || 'Inspiration'}
            isActive={activeTab === 'inspiration'}
            onClick={() => handleNavClick('inspiration')}
          />
        </nav>

        {/* User / Footer Profile Menu */}
        <div className="p-4 border-t border-[#433E38] relative">

          {isProfileOpen && (
            <div
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setIsProfileOpen(false)}
            />
          )}

          {isProfileOpen && (
            <div className="absolute bottom-[calc(100%+10px)] left-4 w-56 bg-white rounded-sm shadow-xl border border-[#D6D1C7] py-2 z-40 text-[#2C2A26] animate-fade-in-up origin-bottom-left">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="font-bold text-sm">{t?.dashboard?.profile?.account || 'My Account'}</p>
                <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
              </div>

              <button
                onClick={() => handleProfileNav('settings')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#F5F2EB] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#A8A29E]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t?.dashboard?.profile?.settings || 'Profile Settings'}
              </button>
              <button
                onClick={() => handleProfileNav('billing')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#F5F2EB] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#A8A29E]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                {t?.dashboard?.profile?.billing || 'Billing & Plans'}
              </button>

              <div className="h-px bg-gray-100 my-1"></div>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogoutIcon />
                {t?.dashboard?.profile?.signout || 'Sign Out'}
              </button>
            </div>
          )}

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors text-left group ${isProfileOpen ? 'bg-[#433E38]' : 'hover:bg-[#433E38]'
              }`}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userDisplayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#433E38] group-hover:ring-[#A8A29E] transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A8A29E] to-[#F5F2EB] flex items-center justify-center text-[#2C2A26] font-bold text-xs ring-2 ring-[#433E38] group-hover:ring-[#A8A29E] transition-all">
                {getInitial()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-[#F5F2EB]">{userDisplayName}</p>
              <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">{planDisplayNames[plan] || 'Free Plan'}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-[#A8A29E] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 md:p-12 mt-16 md:mt-0 w-full">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 ${isActive
        ? 'bg-[#F5F2EB] text-[#2C2A26]'
        : 'text-[#A8A29E] hover:bg-[#433E38] hover:text-[#F5F2EB]'
      }`}
  >
    {icon}
    {label}
  </button>
);

// Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);
const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h3.75M12 7.5a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0120.25 7.5v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0112 9.75V7.5z" />
  </svg>
);
const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export default DashboardLayout;

