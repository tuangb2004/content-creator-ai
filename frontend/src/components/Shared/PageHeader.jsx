import { Link } from 'react-router-dom';
import { Bell, Folder } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import LanguageDropdown from './LanguageDropdown';

function PageHeader({ title }) {
  return (
    <header className="px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
          <Bell className="w-4 h-4 text-gray-600" />
        </button>
        <Link
          to="/projects"
          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <Folder className="w-4 h-4 text-gray-600" />
        </Link>
        <LanguageDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}

export default PageHeader;

