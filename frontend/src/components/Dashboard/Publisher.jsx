import { Icons } from '../Icons';

const Publisher = () => {
    const socialIcons = {
        tiktok: (
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-[10px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
            </div>
        ),
        instagram: (
            <div className="w-5 h-5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
        ),
        facebook: (
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.42c-.005.56-.005 3.318-.005 3.667h-3.415v7.981c-2.525-.23-5.53-.23-8.843 0" /></svg>
            </div>
        )
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col justify-center">
            <div className="mb-12 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Publisher</h1>
                <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold px-2 py-0.5 rounded">Free for now</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                {/* Left Side Content */}
                <div className="lg:w-5/12 space-y-8">
                    <h2 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white">
                        Manage your posts across social platforms in one place.
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Post more, grow more</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Everything you need to create, edit, and publish posts to build your brand on social media.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Streamline your workflow</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Manage all of your social media content in one place.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Save time</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Schedule to automatically post content whenever you want.</p>
                            </div>
                        </div>
                    </div>

                    <button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors mt-4">
                        Authorize
                        <Icons.ChevronRight size={16} />
                    </button>
                </div>

                {/* Right Side Visuals - Calendar */}
                <div className="lg:w-6/12 w-full relative">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white">Publishing</h3>
                            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs">
                                <button><Icons.ChevronLeft size={14} /></button>
                                <span>05/2024</span>
                                <button><Icons.ChevronRight size={14} /></button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-xl p-4 min-h-[300px]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border-r border-gray-100 dark:border-gray-700 pr-4">
                                        <div className="text-xs text-gray-400 mb-4">Sunday</div>
                                        <div className="text-sm font-bold mb-4 dark:text-white">27</div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg mb-2">
                                            <div className="flex items-center gap-1 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">The Nordic way o...</span>
                                            </div>
                                            <div className="text-[9px] text-gray-400">4:30 PM</div>
                                            <div className="text-[9px] text-gray-400">Published</div>
                                        </div>
                                        <div className="text-sm font-bold mt-8 dark:text-white">3</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-4">Monday</div>
                                        <div className="text-sm font-bold mb-4 dark:text-white">28</div>
                                        <div className="text-sm font-bold mt-20 dark:text-white">4</div>
                                    </div>
                                </div>
                            </div>

                            {/* Platform List */}
                            <div className="w-40 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase">Platform</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        {socialIcons.tiktok}
                                        <span className="text-sm font-medium dark:text-white">TikTok</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {socialIcons.instagram}
                                        <span className="text-sm font-medium dark:text-white">Instagram</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {socialIcons.facebook}
                                        <span className="text-sm font-medium dark:text-white">Facebook</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

export default Publisher;
