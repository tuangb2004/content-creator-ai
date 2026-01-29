import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { Icons } from '../Icons';
import { getUploads } from '../../services/firebaseFunctions';

const SelectFileModal = ({ isOpen, onClose, onSelectFile }) => {
    const { user } = useAuth();
    const [uploads, setUploads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !user?.uid) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
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
            setIsLoading(false);
        }, (error) => {
            console.error('SelectFileModal listener error:', error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [isOpen, user?.uid]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chọn file từ Tài nguyên</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icons.X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    ) : uploads.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {uploads.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onSelectFile({ url: item.fileUrl, name: item.fileName, type: item.fileType });
                                        onClose();
                                    }}
                                    className="group p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all text-left"
                                >
                                    <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        {item.fileType.startsWith('image/') ? (
                                            <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : item.fileType === 'application/pdf' ? (
                                            <Icons.FileText size={32} className="text-red-600 dark:text-red-400" />
                                        ) : (
                                            <Icons.FileText size={32} className="text-gray-600 dark:text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">{item.fileName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(item.fileSize / 1024 / 1024).toFixed(2)} MB • {item.createdAt}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Icons.Folder size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chưa có file nào được tải lên</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Vui lòng tải lên file trong Assets trước</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectFileModal;
