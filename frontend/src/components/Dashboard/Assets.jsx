import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { Icons } from '../Icons';
import UploadModal from './UploadModal';
import { getUploads } from '../../services/firebaseFunctions';

const mapDocToProject = (doc) => {
    const p = { id: doc.id, ...doc.data() };
    let cleanTitle = p.title || 'Sáng tạo mới';
    if (typeof cleanTitle === 'string' && (cleanTitle.trim().startsWith('{') || cleanTitle.trim().startsWith('"'))) {
        try {
            const parsed = JSON.parse(cleanTitle);
            if (typeof parsed === 'string') cleanTitle = parsed;
            else if (typeof parsed === 'object' && parsed !== null) {
                cleanTitle = parsed.prompt || parsed.text || parsed.title || Object.values(parsed).find(v => typeof v === 'string') || 'Sáng tạo mới';
            }
        } catch (e) { /* ignore */ }
    }
    const createdAt = p.createdAt?.toMillis ? p.createdAt.toMillis() : (p.createdAt?._seconds ? p.createdAt._seconds * 1000 : Date.now());
    return {
        id: p.id,
        title: (cleanTitle || '').length > 50 ? (cleanTitle || '').substring(0, 50) + '...' : (cleanTitle || ''),
        fullTitle: cleanTitle || 'Sáng tạo mới',
        type: p.type || 'text',
        date: new Date(createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        imageUrl: p.content?.imageUrl || p.content?.previewUrl,
        content: p.content,
        _createdAt: createdAt
    };
};

const Assets = ({ onNavigateToProject, onSelectFile }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Creations');
    const [projects, setProjects] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUploads, setIsLoadingUploads] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (activeTab !== 'Creations' || !user?.uid) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mapped = snapshot.docs.map(doc => mapDocToProject(doc));
            mapped.sort((a, b) => (b._createdAt || 0) - (a._createdAt || 0));
            setProjects(mapped);
            setIsLoading(false);
        }, (error) => {
            console.error('Assets projects listener error:', error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [activeTab, user?.uid]);

    useEffect(() => {
        if (activeTab !== 'Uploads' || !user?.uid) {
            setIsLoadingUploads(false);
            return;
        }
        setIsLoadingUploads(true);
        const uploadsRef = collection(db, 'uploads');
        const q = query(uploadsRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mapped = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : Date.now());
                return {
                    id: doc.id,
                    fileName: data.fileName,
                    fileType: data.fileType,
                    fileSize: data.fileSize,
                    fileUrl: data.fileUrl,
                    createdAt: new Date(createdAt).toLocaleDateString(),
                    _createdAt: createdAt
                };
            });
            mapped.sort((a, b) => (b._createdAt || 0) - (a._createdAt || 0));
            setUploads(mapped);
            setIsLoadingUploads(false);
        }, (error) => {
            console.error('Assets uploads listener error:', error);
            setIsLoadingUploads(false);
        });
        return () => unsubscribe();
    }, [activeTab, user?.uid]);

    const handleProjectClick = (project) => {
        if (selectedIds.size > 0) {
            toggleSelection(project.id);
            return;
        }
        if (onNavigateToProject) {
            onNavigateToProject(project);
        }
    };

    const toggleSelection = (id, e) => {
        if (e) e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} mục đã chọn?`)) return;

        setIsDeleting(true);
        try {
            const promises = Array.from(selectedIds).map(id =>
                deleteDoc(doc(db, activeTab === 'Creations' ? 'projects' : 'uploads', id))
            );
            await Promise.all(promises);
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error deleting documents: ", error);
            alert("Đã xảy ra lỗi khi xóa mục.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownloadSelected = () => {
        if (selectedIds.size === 0) return;

        const items = activeTab === 'Creations' ? projects : uploads;
        const selectedItems = items.filter(item => selectedIds.has(item.id));

        selectedItems.forEach((item) => {
            const url = activeTab === 'Creations' ? item.imageUrl : item.fileUrl;
            if (url) {
                // Force download by creating a temporary link
                const link = document.createElement('a');
                link.href = url;
                link.download = item.fileName || item.title || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });

        // Clear selection after download starts (optional, keeping it selected might be better UX)
    };

    return (
        <div className="p-8 h-full flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                    7251b37f-1c52-4374-8c10-14a98e4d2842's space
                    <span className="ml-3 text-xs text-gray-400 font-normal font-sans">0B / 500GB</span>
                </h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-black dark:bg-white text-white dark:text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
                    >
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
                {['Creations', 'Drafts', 'Uploads', 'Products', 'Trash'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedIds(new Set()); }}
                        className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab
                            ? 'text-gray-900 dark:text-white border-b-2 border-black dark:border-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'Creations' && (
                <div className="flex-1 overflow-y-auto px-1 pb-20">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
                            {projects.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleProjectClick(item)}
                                        className={`group flex flex-col bg-white dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#1e293b] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative ${isSelected
                                            ? 'border-purple-500 dark:border-purple-400 shadow-[0_0_0_1px_rgba(168,85,247,0.4)]'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                                            }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <div
                                            onClick={(e) => toggleSelection(item.id, e)}
                                            className={`absolute top-2 right-2 z-20 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-purple-600 border-purple-600 text-white opacity-100 scale-100'
                                                : 'bg-white/80 dark:bg-black/50 border-gray-300 dark:border-gray-500 opacity-0 group-hover:opacity-100 scale-95 hover:scale-105 hover:border-purple-500'
                                                }`}>
                                            {isSelected && <Icons.CheckCircle size={12} />}
                                        </div>

                                        {/* Image Container - Horizontal Aspect Ratio (16:9) */}
                                        <div className="relative w-full aspect-video bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex flex-col items-center justify-center gap-3 ${item.type === 'image' ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/10' :
                                                    item.type === 'video' ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/10' :
                                                        'text-green-500 bg-green-50 dark:bg-green-900/10'
                                                    }`}>
                                                    {item.type === 'image' && <Icons.Image size={40} className="opacity-50" />}
                                                    {item.type === 'video' && <Icons.Video size={40} className="opacity-50" />}
                                                    {(!item.type || item.type === 'text') && <Icons.FileText size={40} className="opacity-50" />}
                                                </div>
                                            )}

                                            {/* Type Badge (Visible on Hover) */}
                                            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider backdrop-saturate-150">
                                                    {item.type || 'text'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Info */}
                                        <div className="p-4 flex flex-col flex-1 h-full">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mb-1" title={item.fullTitle}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-auto pt-2">
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {item.date}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
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
                    )}
                </div>
            )}

            {/* Selection Toolbar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-6">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedIds.size}</span>
                        <span className="text-sm text-gray-500">selected</span>
                        <button onClick={() => setSelectedIds(new Set())} className="ml-2 text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white underline decoration-dotted">
                            Clear
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadSelected}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors tooltip flex flex-col items-center gap-1 group"
                        >
                            <Icons.Download size={20} />
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors tooltip flex flex-col items-center gap-1 group"
                        >
                            <Icons.Trash2 size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Uploads tab */}
            {activeTab === 'Uploads' && (
                <div className="flex-1 overflow-y-auto px-1 pb-20">
                    {isLoadingUploads ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    ) : uploads.length > 0 ? (
                        <div className="grid grid-cols-5 gap-3">
                            {uploads.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectFile && onSelectFile(item)}
                                    className={`group flex-shrink-0 bg-white dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer p-2.5 flex items-center gap-3 ${onSelectFile ? '' : 'cursor-default'}`}
                                >
                                    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        {item.fileType.startsWith('image/') ? (
                                            <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                                        ) : item.fileType === 'application/pdf' ? (
                                            <Icons.FileText size={18} />
                                        ) : (
                                            <Icons.FileText size={18} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[13px] font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            {item.fileName}
                                        </h3>
                                        <div className="flex items-center gap-1 opacity-40">
                                            <span className="text-[9px] whitespace-nowrap">{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                            <span className="text-[9px] whitespace-nowrap">• {item.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-20 bg-white dark:bg-[#1e293b] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center transform -rotate-6 z-10 relative">
                                    <Icons.Cloud size={32} className="text-gray-400" />
                                </div>
                                <Icons.Wand2 className="absolute -top-4 -right-4 text-teal-400 animate-bounce" size={24} fill="currentColor" />
                                <div className="absolute top-10 -left-6 w-3 h-3 bg-blue-400 rounded-full opacity-50"></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có file nào được tải lên</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Tải lên file để sử dụng khi tạo nội dung</p>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <Icons.Cloud size={16} />
                                Tải lên file
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Other tabs - show empty state */}
            {activeTab !== 'Creations' && activeTab !== 'Uploads' && (
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
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    // Refresh will happen automatically via realtime listener
                }}
            />

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
