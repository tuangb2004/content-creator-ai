import { useState } from 'react';

const ProjectItem = ({ item, index, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#D6D1C7] rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#F5F2EB] flex justify-between items-center bg-[#F9F8F6]">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.type === 'image' ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
                <span className="text-[10px] uppercase tracking-widest text-[#5D5A53] font-bold">{item.toolName}</span>
            </div>
            <button 
                onClick={() => onRemove(item.id)}
                className="text-[#A8A29E] hover:text-red-500 transition-colors p-1"
                title="Delete Project"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
        </div>

        {/* Prompt */}
        <div className="p-4 border-b border-[#F5F2EB]">
            <p className="text-sm font-medium text-[#2C2A26] line-clamp-2" title={item.prompt}>
                "{item.prompt}"
            </p>
            <span className="text-[10px] text-[#A8A29E] mt-1 block">{new Date(item.timestamp).toLocaleDateString()}</span>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white relative group-hover:bg-[#FDFCFB] transition-colors">
             {item.type === 'text' ? (
                 <div className={`p-4 text-xs text-[#5D5A53] leading-relaxed whitespace-pre-wrap font-light ${isExpanded ? '' : 'line-clamp-[8] max-h-48 overflow-hidden'}`}>
                    {item.result}
                 </div>
             ) : (
                 <div className="w-full h-48 overflow-hidden bg-[#EBE7DE]">
                    <img src={item.result} alt="Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 </div>
             )}
             {item.type === 'text' && !isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
             )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-[#F5F2EB] flex justify-between items-center bg-[#F9F8F6]">
            {item.type === 'text' ? (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
                >
                    {isExpanded ? (
                        <>
                            Collapse
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                        </>
                    ) : (
                        <>
                            Expand
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </>
                    )}
                </button>
            ) : (
                <div></div>
            )}
            
            <button 
                className="text-[10px] uppercase tracking-widest font-bold text-[#2C2A26] hover:underline" 
                onClick={() => navigator.clipboard.writeText(item.result)}
            >
                Copy Content
            </button>
        </div>
    </div>
  );
};

const ProjectList = ({ items, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-[#D6D1C7] rounded-sm bg-[#F9F8F6]">
        <div className="w-16 h-16 bg-[#EBE7DE] rounded-full flex items-center justify-center mb-4 text-[#A8A29E]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        </div>
        <h3 className="text-xl font-serif text-[#2C2A26] mb-2">No projects yet</h3>
        <p className="text-[#5D5A53] text-sm max-w-xs text-center">Use the Creative Suite tools to generate content and save it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
      {items.map((item, idx) => (
        <ProjectItem key={`${item.id}-${idx}`} item={item} index={idx} onRemove={onRemoveItem} />
      ))}
    </div>
  );
};

export default ProjectList;

