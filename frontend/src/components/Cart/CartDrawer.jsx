const CartDrawer = ({ isOpen, onClose, items, onRemoveItem }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#2C2A26]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Centered */}
      <div className="relative bg-[#F5F2EB] w-full max-w-3xl max-h-[85vh] shadow-2xl rounded-sm border border-[#D6D1C7] flex flex-col animate-fade-in-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D6D1C7] bg-[#F9F8F6]">
          <div>
            <h2 className="text-xl font-serif text-[#2C2A26]">Saved Projects</h2>
            <p className="text-xs text-[#A8A29E] mt-1">{items.length} items in your collection</p>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#2C2A26] transition-colors p-2 hover:bg-[#EBE7DE] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F5F2EB]">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="w-16 h-16 bg-[#EBE7DE] rounded-full flex items-center justify-center text-[#A8A29E]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="font-light text-[#5D5A53]">No projects saved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="bg-white border border-[#D6D1C7] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-center p-3 border-b border-[#F5F2EB] bg-[#F9F8F6]">
                        <span className="text-[10px] uppercase tracking-widest text-[#A8A29E] font-bold">{item.toolName}</span>
                        <button onClick={() => onRemoveItem(item.id)} className="text-[#A8A29E] hover:text-red-500 transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="p-4 flex-1">
                        <p className="text-sm font-medium text-[#2C2A26] mb-3 line-clamp-2" title={item.prompt}>
                            {item.prompt}
                        </p>
                        
                        {item.type === 'text' ? (
                            <div className="bg-[#F5F2EB] p-3 text-xs text-[#5D5A53] h-24 overflow-hidden relative rounded-sm">
                                <p className="whitespace-pre-wrap break-words">{item.result}</p>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#F5F2EB] via-transparent to-transparent pointer-events-none"></div>
                            </div>
                        ) : (
                            <div className="h-32 w-full bg-[#EBE7DE] rounded-sm overflow-hidden">
                                <img src={item.result} className="w-full h-full object-cover" alt="Generated" />
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 bg-[#F9F8F6] border-t border-[#F5F2EB] flex justify-between items-center">
                        <span className="text-[10px] text-[#A8A29E]">
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button 
                            className="text-[10px] uppercase tracking-widest font-bold text-[#2C2A26] hover:underline"
                            onClick={() => navigator.clipboard.writeText(item.result)}
                        >
                            Copy
                        </button>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
        
        {/* Footer Stats */}
        <div className="p-4 border-t border-[#D6D1C7] bg-[#EBE7DE]/30 flex justify-center gap-8 text-xs text-[#5D5A53]">
             <div className="flex gap-2">
                <span className="font-bold">{items.filter(i => i.type === 'text').length}</span>
                <span className="text-[#A8A29E]">Texts</span>
             </div>
             <div className="flex gap-2">
                <span className="font-bold">{items.filter(i => i.type === 'image').length}</span>
                <span className="text-[#A8A29E]">Images</span>
             </div>
        </div>

      </div>
    </div>
  );
};

export default CartDrawer;

