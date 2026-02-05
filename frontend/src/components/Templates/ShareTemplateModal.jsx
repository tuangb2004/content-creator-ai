import { useState } from 'react';
import { Icons } from '../Icons';
import { createPost } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const ShareTemplateModal = ({ isOpen, onClose, initialContent, prompt, user }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createPost({
                type: 'text',
                content: initialContent,
                prompt: prompt || 'Văn bản được chia sẻ',
                title,
                category,
            });
            toast.success('Đã chia sẻ lên Cảm Hứng thành công!');
            onClose();
            setTitle('');
        } catch (error) {
            toast.error(error.message || 'Lỗi khi chia sẻ bài viết');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Chia sẻ lên Cảm Hứng</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icons.X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề bài viết</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: 10 tips SEO cho website..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="general">Chung</option>
                            <option value="blog">Blog</option>
                            <option value="social">Social Media</option>
                            <option value="email">Email</option>
                            <option value="marketing">Marketing</option>
                            <option value="seo">SEO</option>
                            <option value="creative">Sáng tạo</option>
                        </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Nội dung:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
                            {initialContent?.substring(0, 200)}{initialContent?.length > 200 ? '...' : ''}
                        </p>
                    </div>

                    {prompt && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Prompt gốc:</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300 italic line-clamp-2">
                                "{prompt.substring(0, 100)}{prompt.length > 100 ? '...' : ''}"
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <Icons.Loader size={14} className="animate-spin" />}
                            Chia sẻ ngay
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareTemplateModal;
