import { useState } from 'react';
import { Icons } from '../Icons';
import { updateUserProfile } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
    const [bio, setBio] = useState(profile?.bio || '');
    const [website, setWebsite] = useState(profile?.website || '');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateUserProfile({ bio, website });
            toast.success('Đã cập nhật hồ sơ!');
            onProfileUpdated?.({ bio, website });
            onClose();
        } catch (error) {
            toast.error(error.message || 'Không thể cập nhật');
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chỉnh sửa hồ sơ</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <Icons.X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Avatar Preview */}
                    <div className="flex items-center gap-4">
                        <img
                            src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}&size=80`}
                            alt={profile?.displayName}
                            className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-700"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{profile?.displayName}</h3>
                            <p className="text-sm text-gray-500">{profile?.email}</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Giới thiệu
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Viết vài dòng về bản thân..."
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/500</p>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website
                        </label>
                        <div className="relative">
                            <Icons.Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://yourwebsite.com"
                                maxLength={200}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Icons.Loader size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Icons.Check size={18} />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;
