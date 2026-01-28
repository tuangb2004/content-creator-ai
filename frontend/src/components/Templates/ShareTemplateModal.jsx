import { useState } from 'react';
import { Icons } from '../Icons';
import { saveTemplate } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const ShareTemplateModal = ({ isOpen, onClose, initialContent, user }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await saveTemplate({
                title,
                content: initialContent,
                category,
                isPublic,
                authorId: user?.uid,
                authorName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous'
            });
            toast.success('Mẫu đã được chia sẻ thành công!');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi lưu mẫu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Chia sẻ mẫu này</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icons.X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề mẫu</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Viết bài Facebook bán hàng..."
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
                            <option value="General">Chung</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Social Media">Social Media</option>
                            <option value="SEO">SEO</option>
                            <option value="Email">Email</option>
                            <option value="Creative Writing">Sáng tạo</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">Chia sẻ công khai với cộng đồng</label>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-500 dark:text-gray-400 italic">
                        Preview: "{initialContent?.substring(0, 100)}..."
                    </div>

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
