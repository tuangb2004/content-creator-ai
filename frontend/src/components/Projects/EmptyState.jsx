/**
 * @license
 * Premium Empty State Component
 * Inspired by editorial design with abstract illustrations
 */

import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function EmptyState({ hasFilters = false }) {
    const navigate = useNavigate();
    const { t } = useLanguage();

    if (hasFilters) {
        // Empty state when filters are applied
        return (
            <div className="animate-fade-in-up py-32 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#F5F2EB] rounded-full flex items-center justify-center mb-6 text-[#A8A29E]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-serif text-[#2C2A26] mb-2">
                    {t?.projects?.noMatching || 'No matching projects found'}
                </h3>
                <p className="text-[#A8A29E] max-w-xs font-light">
                    {t?.projects?.tryAdjusting || 'Try adjusting your keywords or clearing the category filter.'}
                </p>
            </div>
        );
    }

    // Rich empty state for new users - Editorial Design
    return (
        <div className="animate-fade-in-up">
            {/* EMPTY STATE CONTAINER */}
            <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">

                {/* Background Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#EBE7DE] to-transparent rounded-full opacity-50 blur-3xl -z-10"></div>

                {/* Abstract Canvas Illustration */}
                <div className="relative mb-12 group">
                    <div className="w-64 h-80 bg-white border border-[#D6D1C7] shadow-2xl rounded-sm transform -rotate-6 transition-transform group-hover:rotate-0 duration-700 ease-out flex flex-col p-6">
                        <div className="w-full h-2 bg-[#F5F2EB] rounded-full mb-4"></div>
                        <div className="w-2/3 h-2 bg-[#F5F2EB] rounded-full mb-8"></div>
                        <div className="flex-1 border border-dashed border-[#D6D1C7] rounded-sm flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-12 h-12 text-[#A8A29E] animate-pulse">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute inset-0 w-64 h-80 bg-[#2C2A26] opacity-[0.03] rounded-sm transform rotate-3 -z-10"></div>
                </div>

                {/* Text Content */}
                <div className="max-w-lg">
                    <h3 className="text-4xl md:text-5xl font-serif text-[#2C2A26] mb-6 leading-tight">
                        {t?.projects?.emptyTitle || 'A blank space'} <br />
                        {t?.projects?.emptySubtitle || 'is a'} <span className="italic">{t?.projects?.possibility || 'possibility.'}</span>
                    </h3>
                    <p className="text-[#5D5A53] text-lg font-light leading-relaxed mb-10">
                        {t?.projects?.emptyDescription || 'Your studio archive is currently quiet. Begin your creative journey by synthesizing your first piece of intelligence.'}
                    </p>

                    <button
                        onClick={() => navigate('/tools')}
                        className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#2C2A26] text-[#F5F2EB] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-sm shadow-xl"
                    >
                        {t?.projects?.launchStudio || 'Launch Studio Suite'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>

                {/* Quick Suggested Tools */}
                <div className="mt-24 w-full max-w-4xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A8A29E] mb-8">
                        {t?.projects?.suggestedEntryPoints || 'Suggested entry points'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {SUGGESTED_TOOLS.map(tool => (
                            <div
                                key={tool.id}
                                onClick={() => navigate('/tools')}
                                className="bg-white/50 backdrop-blur-sm border border-[#D6D1C7] p-6 rounded-sm hover:border-[#2C2A26] transition-all cursor-pointer text-left group"
                            >
                                <span className="text-[10px] font-bold text-[#A8A29E] group-hover:text-[#2C2A26] transition-colors uppercase tracking-widest">{tool.category}</span>
                                <h4 className="font-serif text-lg text-[#2C2A26] mt-1">{tool.name}</h4>
                                <div className="mt-4 flex justify-end">
                                    <div className="w-6 h-6 rounded-full border border-[#D6D1C7] flex items-center justify-center group-hover:bg-[#2C2A26] group-hover:border-[#2C2A26] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-[#A8A29E] group-hover:text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Suggested tools for empty state
const SUGGESTED_TOOLS = [
    {
        id: 'blog-writer',
        category: 'Text',
        name: 'Blog Writer',
    },
    {
        id: 'image-gen',
        category: 'Image',
        name: 'Image Generator',
    },
    {
        id: 'social-post',
        category: 'Social',
        name: 'Social Post',
    },
];
