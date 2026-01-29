import { useState, useRef } from 'react';
import { Icons } from '../Icons';
import { uploadFile } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    text: ['text/plain', 'text/markdown', 'text/csv']
};

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = async (files) => {
        const validFiles = files.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File ${file.name} vượt quá 20MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            for (const file of selectedFiles) {
                const reader = new FileReader();
                await new Promise((resolve, reject) => {
                    reader.onloadend = async () => {
                        try {
                            const base64 = reader.result.split(',')[1];
                            await uploadFile({
                                fileName: file.name,
                                fileType: file.type,
                                fileSize: file.size,
                                fileData: base64
                            });
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            toast.success(`Đã tải lên ${selectedFiles.length} file thành công`);
            setSelectedFiles([]);
            if (onUploadSuccess) onUploadSuccess();
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi tải lên file');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tải lên file</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icons.X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                            isDragging
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                        <Icons.Cloud size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Kéo thả file vào đây hoặc
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                            Chọn file từ máy tính
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Hỗ trợ: Ảnh (JPG, PNG, GIF, WebP), PDF, Text (TXT, MD, CSV)
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Tối đa 20MB mỗi file
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={[...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.document, ...ACCEPTED_TYPES.text].join(',')}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-6 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Files đã chọn:</h3>
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                                        {file.type.startsWith('image/') ? (
                                            <Icons.Image size={20} className="text-purple-600 dark:text-purple-400" />
                                        ) : file.type === 'application/pdf' ? (
                                            <Icons.FileText size={20} className="text-red-600 dark:text-red-400" />
                                        ) : (
                                            <Icons.FileText size={20} className="text-gray-600 dark:text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <Icons.X size={16} className="text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={uploading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang tải lên...
                            </>
                        ) : (
                            <>
                                <Icons.Cloud size={16} />
                                Tải lên {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
