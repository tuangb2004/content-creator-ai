import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Icons } from '../Icons';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import toast from '../../utils/toast';

const ProfileSettings = ({ onBack }) => {
  const { t } = useLanguage();
  const { user, userData, refreshUserData } = useAuth();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('profile');

  const parseDisplayName = (displayName) => {
    if (!displayName) return { firstName: '', lastName: '' };
    const parts = displayName.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    photoURL: null,
  });

  const [notifications, setNotifications] = useState({
    productUpdates: true,
    projectCompleted: false,
  });

  const [loading, setLoading] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email || '',
      }));
    }
  }, [user, formData.email]);

  useEffect(() => {
    if (user) {
      const { firstName, lastName } = parseDisplayName(user.displayName || '');
      setFormData(prev => ({
        ...prev,
        firstName: firstName || userData?.firstName || prev.firstName || '',
        lastName: lastName || userData?.lastName || prev.lastName || '',
        email: user.email || userData?.email || prev.email || user.email || '',
        bio: userData?.bio || prev.bio || '',
        photoURL: userData?.photoURL || user.photoURL || prev.photoURL || null,
      }));

      if (userData) {
        setNotifications({
          productUpdates: userData.notifications?.productUpdates !== false,
          projectCompleted: userData.notifications?.projectCompleted === true,
        });
      }

      setAvatarPreview(userData?.photoURL || user.photoURL || null);
    }
  }, [user, userData]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t?.profileSettings?.invalidFileType || 'Please select an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t?.profileSettings?.fileTooLarge || 'File size must be less than 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(avatarRef);

      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: new Date()
      });

      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
      toast.success(t?.profileSettings?.avatarUploaded || 'Avatar uploaded successfully!');

      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t?.profileSettings?.avatarUploadFailed || 'Failed to upload avatar.');
      setAvatarPreview(formData.photoURL);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!formData.photoURL) return;

    setUploadingAvatar(true);
    try {
      if (formData.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const avatarRef = ref(storage, formData.photoURL);
          await deleteObject(avatarRef);
        } catch (deleteError) {
          console.warn('Could not delete old avatar from storage:', deleteError);
        }
      }

      await updateProfile(auth.currentUser, {
        photoURL: null
      });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: null,
        updatedAt: new Date()
      });

      setFormData(prev => ({ ...prev, photoURL: null }));
      setAvatarPreview(null);
      toast.success(t?.profileSettings?.avatarRemoved || 'Avatar removed successfully!');

      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Remove avatar error:', error);
      toast.error(error.message || t?.profileSettings?.avatarRemoveFailed || 'Failed to remove avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error(t?.profileSettings?.notLoggedIn || 'Please log in to update your profile.');
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    let updateSuccess = false;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const displayName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || formData.lastName || user.email?.split('@')[0] || 'User';

      updateProfile(auth.currentUser, {
        displayName: displayName
      }).catch(authError => {
        console.warn('Failed to update auth profile:', authError);
      });

      const updateData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        bio: formData.bio || '',
        email: user.email || '',
        notifications: {
          productUpdates: notifications.productUpdates !== false,
          projectCompleted: notifications.projectCompleted === true,
        },
        updatedAt: new Date()
      };

      const setDocPromise = setDoc(userDocRef, updateData, { merge: true });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      await Promise.race([setDocPromise, timeoutPromise]);
      updateSuccess = true;

      toast.success(t?.profileSettings?.profileUpdated || 'Profile updated successfully!');

    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || error.code || t?.profileSettings?.profileUpdateFailed || 'Failed to update profile.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);

      if (updateSuccess && refreshUserData) {
        setTimeout(() => {
          refreshUserData().catch(err => {
            console.warn('Failed to refresh user data:', err);
          });
        }, 100);
      }
    }
  };

  const getAvatarDisplay = (size = 'md') => {
    const initials = (formData.firstName?.[0] || user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();
    const sizeClasses = size === 'lg' ? 'w-24 h-24' : size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
    const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-xl';

    if (avatarPreview) {
      return (
        <div className={`relative ${sizeClasses} rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 border-white dark:border-gray-700 shadow-md bg-gradient-to-br from-purple-500 to-blue-500`}>
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-500', 'to-blue-500');
              e.target.parentElement.innerHTML = `<span class="${textSize} font-bold text-white uppercase tracking-tighter">${initials}</span>`;
            }}
          />
        </div>
      );
    }
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-gray-700 shadow-md bg-gradient-to-br from-purple-500 to-blue-500`}>
        <span className={`${textSize} font-bold text-white uppercase tracking-tighter`}>
          {initials}
        </span>
      </div>
    );
  };

  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'profile', label: t?.profileSettings?.personalInformation || 'Thông tin cá nhân', icon: 'User' },
    { id: 'notifications', label: t?.profileSettings?.notifications || 'Thông báo', icon: 'Bell' },
    { id: 'danger', label: t?.settings?.dangerZone || 'Vùng nguy hiểm', icon: 'AlertTriangle' },
  ];

  const getIcon = (iconName) => {
    const iconMap = {
      User: Icons.User,
      Bell: Icons.Bell,
      AlertTriangle: Icons.AlertTriangle,
    };
    const IconComponent = iconMap[iconName] || Icons.User;
    return <IconComponent size={18} />;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <form onSubmit={handleSubmit}>
            <div className={`p-6 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t?.profileSettings?.personalInformation || 'Thông tin cá nhân'}
              </h3>
              
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {getAvatarDisplay('lg')}
                <div>
                  <h4 className={`font-medium mb-1 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t?.profileSettings?.profilePhoto || 'Ảnh đại diện'}
                  </h4>
                  <p className={`text-xs mb-3 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    PNG, JPG. Tối đa 2MB
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="group flex items-center h-9 gap-2 bg-white dark:bg-gray-800 text-black dark:text-white px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white hover:font-semibold transition-all duration-200 shadow-sm text-sm font-medium disabled:opacity-50"
                    >
                      {uploadingAvatar ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.Camera size={16} />}
                      Tải lên
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="group flex items-center h-9 gap-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:font-semibold transition-all duration-200 text-sm font-medium disabled:opacity-50"
                      >
                        <Icons.Trash2 size={16} />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t?.profileSettings?.firstName || 'Họ'}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 rounded-lg border outline-none transition-colors ${isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-[#FE2C55]'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FE2C55]'
                      }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t?.profileSettings?.lastName || 'Tên'}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 rounded-lg border outline-none transition-colors ${isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-[#FE2C55]'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FE2C55]'
                      }`}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t?.profileSettings?.emailAddress || 'Email'}
                </label>
                <input
                  type="email"
                  value={formData.email || user?.email || ''}
                  disabled
                  className={`w-full px-3 py-2.5 rounded-lg border outline-none opacity-60 cursor-not-allowed ${isDark
                    ? 'bg-gray-800 border-gray-600 text-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                />
              </div>
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-2 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t?.profileSettings?.bioRole || 'Giới thiệu'}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu về bản thân..."
                  rows={3}
                  className={`w-full px-3 py-2.5 rounded-lg border outline-none transition-colors resize-none ${isDark
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-[#FE2C55]'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FE2C55]'
                    }`}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex items-center h-9 gap-2 bg-white dark:bg-gray-800 text-black dark:text-white px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white hover:font-semibold transition-all duration-200 shadow-sm text-sm font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <Icons.Loader size={16} className="animate-spin" />
                  ) : (
                    <Icons.Save size={16} />
                  )}
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        );

      case 'notifications':
        return (
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t?.profileSettings?.notifications || 'Thông báo'}
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-5 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cập nhật sản phẩm
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nhận tin tức về công cụ và tính năng mới
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={() => handleNotificationToggle('productUpdates')}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-600 transition-colors ${isDark
                    ? 'bg-gray-600 peer-checked:bg-green-500'
                    : 'bg-gray-200 peer-checked:bg-green-500'
                    }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 left-0.5 ${notifications.productUpdates ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Hoàn thành dự án
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Gửi email khi quá trình tạo hoàn tất
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.projectCompleted}
                    onChange={() => handleNotificationToggle('projectCompleted')}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-600 transition-colors ${isDark
                    ? 'bg-gray-600 peer-checked:bg-green-500'
                    : 'bg-gray-200 peer-checked:bg-green-500'
                    }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 left-0.5 ${notifications.projectCompleted ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('Vui lòng đăng nhập');
                    return;
                  }
                  if (savingNotifications) return;

                  setSavingNotifications(true);
                  try {
                    const userDocRef = doc(db, 'users', user.uid);
                    await setDoc(userDocRef, {
                      notifications: {
                        productUpdates: notifications.productUpdates !== false,
                        projectCompleted: notifications.projectCompleted === true,
                      },
                      updatedAt: new Date()
                    }, { merge: true });
                    toast.success('Đã lưu cài đặt thông báo');
                  } catch (error) {
                    toast.error('Lỗi lưu cài đặt');
                  } finally {
                    setSavingNotifications(false);
                  }
                }}
                disabled={savingNotifications}
                className="group flex items-center h-9 gap-2 bg-white dark:bg-gray-800 text-black dark:text-white px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white hover:font-semibold transition-all duration-200 shadow-sm text-sm font-medium disabled:opacity-50"
              >
                {savingNotifications ? (
                  <Icons.Loader size={16} className="animate-spin" />
                ) : (
                  <Icons.Save size={16} />
                )}
                Lưu thông báo
              </button>
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className={`p-6 rounded-xl border transition-colors duration-300 ${isDark ? 'bg-[#1e293b] border-red-900/30' : 'bg-white border-red-200'}`}>
            <h3 className="text-lg font-semibold mb-2 text-red-500">
              Vùng nguy hiểm
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Khi bạn xóa tài khoản, sẽ không thể khôi phục. Vui lòng chắc chắn.
            </p>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) return;
                  setLoading(true);
                  try {
                    const currentUser = auth.currentUser;
                    if (!currentUser) throw new Error('No user logged in');
                    await currentUser.delete();
                    toast.success('Tài khoản đã được xóa');
                  } catch (error) {
                    console.error('Delete error:', error);
                    if (error.code === 'auth/requires-recent-login') {
                      toast.error('Vui lòng đăng nhập lại trước khi xóa');
                    } else {
                      toast.error('Không thể xóa tài khoản');
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="group flex items-center h-9 gap-2 bg-red-500 hover:bg-red-600 hover:font-semibold text-white px-4 rounded-lg transition-all duration-200 shadow-sm text-sm font-medium disabled:opacity-50"
              >
                <Icons.Trash2 size={16} />
                {loading ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1100px] px-4 md:px-8 pt-2 md:pt-4 pb-8">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <Icons.ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 dark:text-white mb-2 md:mb-3 tracking-tight leading-none">
          Cài đặt
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Quản lý tài khoản và tùy chọn của bạn
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Menu */}
        <div className={`w-full md:w-64 shrink-0 ${isDark ? 'bg-[#1e293b]' : 'bg-white'} rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-2 h-fit`}>
          <div className="flex md:flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left w-full ${activeSection === item.id
                  ? isDark
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'bg-gray-100 text-gray-900 font-semibold'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white hover:font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black hover:font-semibold'
                  }`}
              >
                <span className={item.id === 'danger' ? 'text-red-500' : ''}>{getIcon(item.icon)}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
