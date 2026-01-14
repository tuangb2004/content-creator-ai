import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, FileText, Key, Tag, 
  ArrowRight, LogOut, Sparkles 
} from 'lucide-react';

function ProfileDropdown() {
  const { user, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get plan and credits from userData
  const plan = userData?.plan || 'free';
  const creditsRemaining = userData?.credits || 0;
  
  const planDisplayNames = {
    free: 'Free Plan',
    pro: 'Pro Studio',
    agency: 'Agency'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  };

  const menuItems = [
    { icon: User, label: 'Account information', to: null, section: 'account' },
    { icon: FileText, label: 'Plans and pricing', to: null, section: 'general' },
    { icon: Key, label: 'Account authorization', to: null, section: 'account' },
    { icon: Tag, label: 'Promo code', to: null, section: 'general' },
    { icon: FileText, label: 'Terms and Policies', to: null, hasArrow: true },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-purple-500 hover:ring-purple-600 transition overflow-hidden"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'C'}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* User Summary Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-xl">
                    {user?.name?.[0]?.toUpperCase() || 'C'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{maskEmail(user?.email || '')}</p>
              <p className="font-bold text-gray-900 mb-2">{planDisplayNames[plan] || 'Free Plan'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{creditsRemaining} credits left</span>
              </div>
            </div>
            <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">
              Invite friends to get rewards
            </button>
          </div>

          {/* Menu Items Section */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">{item.label}</span>
                  </div>
                  {item.hasArrow && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              );

              if (item.to) {
                return (
                  <Link
                    key={index}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    {content}
                  </Link>
                );
              }

              return <div key={index}>{content}</div>;
            })}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-50 transition text-left"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;

