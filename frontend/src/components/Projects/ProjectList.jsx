/**
 * @license
 * Enhanced ProjectList Component with Premium UI/UX
 * Inspired by modern, editorial design systems
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import { useLanguage } from '../../contexts/LanguageContext';

const ProjectList = ({ items = [], onRemoveItem, highlightedProjectId, onClearHighlight }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesFilter = filter === 'all' || item.type === filter;
            const matchesSearch =
                item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.toolName?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [items, filter, searchQuery]);

    const hasFilters = searchQuery !== '' || filter !== 'all';

    // Clear highlight when clicking outside project list
    useEffect(() => {
        if (!highlightedProjectId) return;

        const handleClickOutside = (event) => {
            // Find if click is outside the project list container
            const projectListContainer = event.target.closest('[data-project-list]');
            if (!projectListContainer && onClearHighlight) {
                onClearHighlight();
            }
        };

        // Small delay to prevent immediate clearing
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [highlightedProjectId, onClearHighlight]);

    if (items.length === 0) {
        return <EmptyState hasFilters={false} />;
    }

    return (
        <div className="space-y-8 animate-fade-in-up" data-project-list>
            {/* Toolbox / Header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white border border-[#D6D1C7] rounded-sm shadow-sm p-4">

                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder={t?.projects?.searchPlaceholder || "Search in projects..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F9F8F6] border border-[#D6D1C7] py-2 pl-10 pr-4 text-xs outline-none focus:border-[#2C2A26] transition-colors rounded-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    <div className="flex p-1 bg-[#F5F2EB] rounded-sm w-full sm:w-auto">
                        {['all', 'text', 'image'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`flex-1 sm:px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${filter === t
                                    ? 'bg-white text-[#2C2A26] shadow-sm'
                                    : 'text-[#A8A29E] hover:text-[#2C2A26]'
                                    }`}
                            >
                                {t === 'all' ? (t?.projects?.filterAll || 'All') : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <div className="flex border border-[#D6D1C7] rounded-sm overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#2C2A26] text-white' : 'text-[#A8A29E] bg-white'}`}
                            aria-label="Grid view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#2C2A26] text-white' : 'text-[#A8A29E] bg-white'}`}
                            aria-label="List view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5m-16.5 3.75h16.5m-16.5-15h16.5M3.75 8.25h16.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Rendering */}
            {filteredItems.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredItems.map((item, idx) => (
                        <ProjectCard
                            key={`${item.id}-${idx}`}
                            item={item}
                            onRemove={onRemoveItem}
                            isHighlighted={item.id === highlightedProjectId}
                        />
                    ))}
                </div>
            ) : (
                <ProjectTable items={filteredItems} onRemoveItem={onRemoveItem} />
            )}
        </div>
    );
};

// Project Card Component
const ProjectCard = ({ item, onRemove, isHighlighted }) => {
    return (
        <div className={`group bg-white border hover:border-[#2C2A26] transition-all duration-500 rounded-sm flex flex-col h-full shadow-sm hover:shadow-xl ${isHighlighted
                ? 'border-[#2C2A26] bg-[#F9F8F6] shadow-lg'
                : 'border-[#D6D1C7]'
            }`}>
            {/* Header */}
            <div className="p-5 border-b border-[#F5F2EB] flex justify-between items-center bg-[#F9F8F6]">
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'image' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D5A53]">{item.toolName}</span>
                </div>
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-[#A8A29E] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete project"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
                <p className="text-sm font-medium text-[#2C2A26] mb-4 line-clamp-2 italic">"{item.prompt}"</p>
                {item.type === 'text' ? (
                    <div className="text-xs text-[#5D5A53] leading-relaxed line-clamp-6 font-light overflow-hidden">
                        {item.result}
                    </div>
                ) : (
                    <div className="aspect-video w-full overflow-hidden bg-[#EBE7DE] rounded-sm">
                        <img src={item.result} alt="Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F9F8F6] border-t border-[#F5F2EB] flex justify-between items-center">
                <span className="text-[10px] text-[#A8A29E] uppercase tracking-tighter">
                    {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigator.clipboard.writeText(item.result)}
                        className="text-[10px] font-bold uppercase tracking-widest text-[#2C2A26] hover:underline"
                        aria-label="Copy content"
                    >
                        Copy
                    </button>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#2C2A26] hover:underline">
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

// Project Table Component
const ProjectTable = ({ items, onRemoveItem }) => {
    return (
        <div className="bg-white border border-[#D6D1C7] rounded-sm shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-[#A8A29E] border-b border-[#D6D1C7]">
                    <tr>
                        <th className="p-5">Project Name / Prompt</th>
                        <th className="p-5">Tool</th>
                        <th className="p-5">Type</th>
                        <th className="p-5">Date</th>
                        <th className="p-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                    {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9F8F6] transition-colors group">
                            <td className="p-5 max-w-md">
                                <p className="text-sm font-medium text-[#2C2A26] truncate">"{item.prompt}"</p>
                            </td>
                            <td className="p-5">
                                <span className="text-xs text-[#5D5A53]">{item.toolName}</span>
                            </td>
                            <td className="p-5">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border ${item.type === 'image'
                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                    {item.type}
                                </span>
                            </td>
                            <td className="p-5 text-xs text-[#A8A29E]">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(item.result)}
                                        className="p-2 hover:bg-[#F5F2EB] rounded-sm transition-colors"
                                        title="Copy"
                                        aria-label="Copy content"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="p-2 hover:bg-rose-50 text-[#A8A29E] hover:text-rose-600 rounded-sm transition-colors"
                                        title="Delete"
                                        aria-label="Delete project"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProjectList;
