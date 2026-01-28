import { Icons } from '../Icons';

const Assets = () => {
    return (
        <div className="p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                    7251b37f-1c52-4374-8c10-14a98e4d2842's space
                    <span className="ml-3 text-xs text-gray-400 font-normal font-sans">0B / 500GB</span>
                </h1>
                <div className="flex items-center gap-4">
                    <button className="bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity">
                        <Icons.Cloud size={16} />
                        Upload
                        <Icons.ChevronRight size={14} className="rotate-90" />
                    </button>

                    <div className="flex items-center gap-4 text-gray-500">
                        <button className="flex items-center gap-1 text-sm font-medium hover:text-gray-900 dark:hover:text-white">
                            <Icons.List size={16} />
                            Modified
                            <Icons.ChevronRight size={12} className="rotate-90" />
                        </button>
                        <button className="hover:text-gray-900 dark:hover:text-white">
                            <Icons.LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 flex gap-8 mb-12">
                {['Creations', 'Drafts', 'Uploads', 'Products', 'Trash'].map((tab, i) => (
                    <button
                        key={tab}
                        className={`pb-3 text-sm font-medium transition-colors ${i === 0
                                ? 'text-gray-900 dark:text-white border-b-2 border-black dark:border-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-20 bg-white dark:bg-[#1e293b] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center transform -rotate-6 z-10 relative">
                        <Icons.Clapperboard size={32} className="text-gray-400" />
                    </div>
                    <Icons.Wand2 className="absolute -top-4 -right-4 text-teal-400 animate-bounce" size={24} fill="currentColor" />
                    <div className="absolute top-10 -left-6 w-3 h-3 bg-blue-400 rounded-full opacity-50"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No exported videos or images yet.</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Start creating content to see your assets here.</p>
            </div>

            {/* Help Bubble */}
            <div className="fixed bottom-8 right-8">
                <button className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Icons.HelpCircle size={20} />
                </button>
            </div>
        </div>
    );
};

export default Assets;
