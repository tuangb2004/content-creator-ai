import { useState } from 'react';
import { Icons } from '../Icons';
import { createPost } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const CATEGORIES = [
    { id: 'general', label: 'Chung', icon: 'Grid' },
    { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
    { id: 'art', label: 'Nghệ thuật', icon: 'Palette' },
    { id: 'product', label: 'Sản phẩm', icon: 'Package' },
    { id: 'fashion', label: 'Thời trang', icon: 'Shirt' },
    { id: 'food', label: 'Ẩm thực', icon: 'UtensilsCrossed' },
    { id: 'travel', label: 'Du lịch', icon: 'Plane' },
    { id: 'technology', label: 'Công nghệ', icon: 'Cpu' },
];

const ShareModal = ({ isOpen, onClose, mediaUrl, prompt, type = 'image', model, aspectRatio }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim()) && tags.length < 5) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!mediaUrl) {
            toast.error('Không có media để chia sẻ');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createPost({
                type,
                mediaUrl,
                prompt: prompt || '',
                title: title.trim(),
                description: description.trim(),
                model,
                aspectRatio,
                category,
                tags,
            });

            if (result.success) {
                toast.success('Đã chia sẻ thành công!');
                onClose();
                // Reset form
                setTitle('');
                setDescription('');
                setCategory('general');
                setTags([]);
            }
        } catch (error) {
            toast.error(error.message || 'Không thể chia sẻ. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Icons.Share2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chia sẻ lên Cảm Hứng</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chia sẻ tác phẩm của bạn với cộng đồng</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Icons.X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="flex gap-6">
                        {/* Media Preview */}
                        <div className="w-48 shrink-0">
                            <div className="aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                {type === 'video' ? (
                                    <video src={mediaUrl} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                    <Icons.Sparkles size={10} />
                                    {type === 'video' ? 'Video' : 'Hình ảnh'}
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex-1 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Đặt tên cho tác phẩm..."
                                    maxLength={100}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Mô tả
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Thêm mô tả cho tác phẩm..."
                                    rows={2}
                                    maxLength={500}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Danh mục
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => {
                                        const CatIcon = Icons[cat.icon] || Icons.Grid;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === cat.id
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                <CatIcon size={12} />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Tags <span className="text-xs font-normal text-gray-400">(tối đa 5)</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                        >
                                            #{tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                                                <Icons.X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {tags.length < 5 && (
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Nhập tag và Enter..."
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                )}
                            </div>

                            {/* Prompt Preview */}
                            {prompt && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Prompt <span className="text-xs font-normal text-gray-400">(sẽ được chia sẻ)</span>
                                    </label>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {prompt}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Icons.Globe size={12} />
                        Bài đăng sẽ hiển thị công khai
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim()}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Icons.Loader size={16} className="animate-spin" />
                                    Đang chia sẻ...
                                </>
                            ) : (
                                <>
                                    <Icons.Send size={16} />
                                    Chia sẻ ngay
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
