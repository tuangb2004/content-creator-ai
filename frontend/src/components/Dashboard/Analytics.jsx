import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Icons } from '../Icons';

const data = [
    { name: 'Mon', value: 1000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2500 },
    { name: 'Fri', value: 2200 },
    { name: 'Sat', value: 4000 },
    { name: 'Sun', value: 5000 },
];

const Analytics = () => {
    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col justify-center">
            <div className="mb-12 flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold px-2 py-0.5 rounded">Free for now</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                {/* Left Side Content */}
                <div className="lg:w-5/12 space-y-8">
                    <h2 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white">
                        One dashboard for your posts across social media platforms.
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">By account</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Track key engagement metrics for each social account.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">By post</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Break data down by individual stories, posts, and reels.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 mt-2"></span>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Aggregate and compare</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Easily aggregate data and compare post performances.</p>
                            </div>
                        </div>
                    </div>

                    <button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors mt-4">
                        Authorize
                        <Icons.ChevronRight size={16} />
                    </button>
                </div>

                {/* Right Side Visuals */}
                <div className="lg:w-6/12 w-full relative flex justify-center items-center">
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-600 rounded-full blur-[120px] opacity-20 -z-10 translate-y-1/4 translate-x-1/4"></div>

                    <div className="relative w-full max-w-lg">
                        {/* Main Stats Card */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 relative z-10 w-full">
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">Summary</h3>
                                <div className="grid grid-cols-1 gap-8">
                                    <div>
                                        <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">Followers <Icons.HelpCircle size={10} /></div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">88,680</div>
                                        <div className="text-xs text-green-500 font-medium flex items-center mt-1">vs last period <span className="ml-1">↑ 18%</span></div>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                                    <div>
                                        <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">Impression <Icons.HelpCircle size={10} /></div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">1,247</div>
                                        <div className="text-xs text-green-500 font-medium flex items-center mt-1">vs last period <span className="ml-1">↑ 34%</span></div>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
                                    <div>
                                        <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">Engagement <Icons.HelpCircle size={10} /></div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">1,247</div>
                                        <div className="text-xs text-red-500 font-medium flex items-center mt-1">vs last period <span className="ml-1">↓ 14%</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Chart Card */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-8 lg:-right-24 bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 w-72 z-20">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-4">Follower growth</h4>
                            <div className="h-28 w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
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

export default Analytics;
