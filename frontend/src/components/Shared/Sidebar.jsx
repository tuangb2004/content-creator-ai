import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Folder, Sparkles
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();


  const navigationItems = [
    { label: 'Trang chủ', icon: Home, to: '/dashboard' },
    { label: 'Dự án', icon: Folder, to: '/projects' }
  ];

  return (
    <aside className="w-56 border-r border-gray-200 flex flex-col p-3 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="text-white h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">CreatorAI</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5 mb-5">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 px-1">Chức năng</p>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <SidebarItem 
              key={item.label} 
              {...item} 
              active={isActive}
            />
          );
        })}
      </nav>

      {/* Promotional Card */}
      <div className="mt-auto bg-purple-50 rounded-2xl p-4 border border-purple-100">
        <p className="text-sm font-semibold text-purple-900 mb-3">
          Unlock all AI features and trending templates free for 7 days
        </p>
        <button className="w-full py-2.5 bg-white text-purple-600 rounded-xl font-semibold text-sm hover:shadow-md transition">
          Try for ₫0
        </button>
      </div>

    </aside>
  );
}

function SidebarItem({ icon: Icon, label, active, to }) {
  const content = (
    <div
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition ${
        active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default Sidebar;

