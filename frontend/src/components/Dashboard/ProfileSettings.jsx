import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import toast from '../../utils/toast';

const ProfileSettings = () => {
  const { t } = useLanguage();
  const { user, userData, refreshUserData } = useAuth();
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  
  // Parse displayName to firstName and lastName
  const parseDisplayName = (displayName) => {
    if (!displayName) return { firstName: '', lastName: '' };
    const parts = displayName.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  };

  // Initialize form state from user data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    avatarUrl: null,
  });

  const [notifications, setNotifications] = useState({
    productUpdates: true,
    projectCompleted: false,
  });

  const [loading, setLoading] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Load email immediately when user is available
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email || '',
      }));
    }
  }, [user, formData.email]);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const { firstName, lastName } = parseDisplayName(user.displayName || '');
      setFormData(prev => ({
        ...prev,
        firstName: firstName || userData?.firstName || prev.firstName || '',
        lastName: lastName || userData?.lastName || prev.lastName || '',
        email: user.email || userData?.email || prev.email || user.email || '',
        bio: userData?.bio || prev.bio || '',
        avatarUrl: user.photoURL || userData?.avatarUrl || prev.avatarUrl || null,
      }));
      
      if (userData) {
        setNotifications({
          productUpdates: userData.notifications?.productUpdates !== false,
          projectCompleted: userData.notifications?.projectCompleted === true,
        });
      }
      
      setAvatarPreview(user.photoURL || userData?.avatarUrl || null);
    }
  }, [user, userData]);

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t?.profileSettings?.invalidFileType || 'Please select an image file.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t?.profileSettings?.fileTooLarge || 'File size must be less than 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(avatarRef);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        avatarUrl: downloadURL,
        updatedAt: new Date()
      });

      setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
      toast.success(t?.profileSettings?.avatarUploaded || 'Avatar uploaded successfully!');
      
      // Refresh user data
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t?.profileSettings?.avatarUploadFailed || 'Failed to upload avatar.');
      setAvatarPreview(formData.avatarUrl);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    if (!formData.avatarUrl) return;

    setUploadingAvatar(true);
    try {
      // Delete from Storage if it's a Firebase Storage URL
      if (formData.avatarUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const avatarRef = ref(storage, formData.avatarUrl);
          await deleteObject(avatarRef);
        } catch (deleteError) {
          console.warn('Could not delete old avatar from storage:', deleteError);
        }
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: null
      });

      // Update Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        avatarUrl: null,
        updatedAt: new Date()
      });

      setFormData(prev => ({ ...prev, avatarUrl: null }));
      setAvatarPreview(null);
      toast.success(t?.profileSettings?.avatarRemoved || 'Avatar removed successfully!');
      
      // Refresh user data
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

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t?.profileSettings?.notLoggedIn || 'Please log in to update your profile.');
      return;
    }

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);
    let updateSuccess = false;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const displayName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || formData.lastName || user.email?.split('@')[0] || 'User';

      // Update Firebase Auth displayName (non-blocking)
      updateProfile(auth.currentUser, {
        displayName: displayName
      }).catch(authError => {
        console.warn('Failed to update auth profile:', authError);
        // Continue even if auth update fails
      });

      // Update Firestore - use setDoc with merge to handle case where document doesn't exist
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

      // Add timeout to prevent hanging (30 seconds max)
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
      // Always reset loading state immediately after Firestore update
      setLoading(false);
      
      // Refresh user data in background (non-blocking)
      if (updateSuccess && refreshUserData) {
        // Use setTimeout to ensure loading state is reset first
        setTimeout(() => {
          refreshUserData().catch(err => {
            console.warn('Failed to refresh user data:', err);
          });
        }, 100);
      }
    }
  };

  // Get avatar display
  const getAvatarDisplay = () => {
    if (avatarPreview) {
      return (
        <img 
          src={avatarPreview} 
          alt="Avatar" 
          className={`w-24 h-24 rounded-full object-cover border transition-colors duration-300 ${
            theme === 'dark' ? 'border-gray-600' : 'border-[#D6D1C7]'
          }`} 
        />
      );
    }
    const initial = (formData.firstName?.[0] || formData.lastName?.[0] || user?.email?.[0] || 'U').toUpperCase();
    return (
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-serif border transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-[#EBE7DE] text-[#A8A29E] border-[#D6D1C7]'
      }`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className={`text-3xl font-serif mb-2 transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
        }`}>{t?.profileSettings?.title || 'Profile Settings'}</h2>
        <p className={`font-light transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
        }`}>{t?.profileSettings?.subtitle || 'Manage your personal information and preferences.'}</p>
      </div>

      {/* Avatar Section */}
      <div className={`p-8 border rounded-sm flex items-center gap-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D6D1C7]'
      }`}>
        {getAvatarDisplay()}
        <div>
            <h3 className={`font-medium mb-1 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
            }`}>{t?.profileSettings?.profilePhoto || 'Profile Photo'}</h3>
            <p className={`text-xs mb-4 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : 'text-[#A8A29E]'
            }`}>{t?.profileSettings?.acceptedFileTypes || 'Accepted file types: png, jpg. Max size: 2MB'}</p>
            <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-[#2C2A26] text-[#F5F2EB] text-xs uppercase tracking-widest font-medium hover:bg-[#433E38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (t?.profileSettings?.uploading || 'Uploading...') : (t?.profileSettings?.uploadNew || 'Upload New')}
                </button>
                <button 
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || !formData.avatarUrl}
                  className="px-4 py-2 border border-[#D6D1C7] text-[#5D5A53] text-xs uppercase tracking-widest font-medium hover:bg-[#F5F2EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t?.profileSettings?.remove || 'Remove'}
                </button>
            </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <form onSubmit={handleSubmit}>
        <div className={`p-8 border rounded-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D6D1C7]'
        }`}>
          <h3 className={`text-lg font-serif mb-6 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
          }`}>{t?.profileSettings?.personalInformation || 'Personal Information'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
                  }`}>{t?.profileSettings?.firstName || 'First Name'}</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400'
                        : 'bg-[#F9F8F6] border-[#D6D1C7] text-[#2C2A26] focus:border-[#2C2A26]'
                    }`}
                  />
              </div>
              <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
                  }`}>{t?.profileSettings?.lastName || 'Last Name'}</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400'
                        : 'bg-[#F9F8F6] border-[#D6D1C7] text-[#2C2A26] focus:border-[#2C2A26]'
                    }`}
                  />
              </div>
          </div>
          <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
              }`}>{t?.profileSettings?.emailAddress || 'Email Address'}</label>
              <input 
                type="email" 
                value={formData.email || user?.email || ''}
                disabled
                className={`w-full border px-4 py-3 outline-none opacity-60 cursor-not-allowed transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-[#F9F8F6] border-[#D6D1C7] text-[#2C2A26]'
                }`}
              />
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#A8A29E]'
              }`}>{t?.profileSettings?.emailCannotChange || 'Email cannot be changed.'}</p>
          </div>
          <div className="mb-6">
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#5D5A53]'
              }`}>{t?.profileSettings?.bioRole || 'Bio / Role'}</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder={t?.profileSettings?.bioPlaceholder || 'Tell us about yourself...'}
                className={`w-full border px-4 py-3 outline-none transition-colors h-24 resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400'
                    : 'bg-[#F9F8F6] border-[#D6D1C7] text-[#2C2A26] focus:border-[#2C2A26]'
                }`}
              />
          </div>
          
          <div className={`flex justify-end pt-4 border-t transition-colors duration-300 ${
            theme === 'dark' ? 'border-gray-700' : 'border-[#F5F2EB]'
          }`}>
              <button 
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                }`}
              >
                {loading ? (t?.profileSettings?.saving || 'Saving...') : (t?.profileSettings?.saveChanges || 'Save Changes')}
              </button>
          </div>
        </div>
      </form>

       {/* Notifications */}
       <div className={`p-8 border rounded-sm transition-colors duration-300 ${
         theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D6D1C7]'
       }`}>
        <h3 className={`text-lg font-serif mb-6 transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
        }`}>{t?.profileSettings?.notifications || 'Notifications'}</h3>
        <div className="space-y-4">
            <div className={`flex items-center justify-between pb-4 border-b transition-colors duration-300 ${
              theme === 'dark' ? 'border-gray-700' : 'border-[#F5F2EB]'
            }`}>
                <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
                    }`}>{t?.profileSettings?.productUpdates || 'Product Updates'}</p>
                    <p className={`text-xs transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-[#A8A29E]'
                    }`}>{t?.profileSettings?.productUpdatesDesc || 'Receive news about new tools and features.'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.productUpdates}
                      onChange={() => handleNotificationToggle('productUpdates')}
                      className="sr-only peer" 
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-600 peer-checked:bg-gray-100'
                        : 'bg-gray-200 peer-checked:bg-[#2C2A26]'
                    }`}></div>
                </label>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-[#2C2A26]'
                    }`}>{t?.profileSettings?.projectCompleted || 'Project Completed'}</p>
                    <p className={`text-xs transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-[#A8A29E]'
                    }`}>{t?.profileSettings?.projectCompletedDesc || 'Email me when a long-running generation is finished.'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.projectCompleted}
                      onChange={() => handleNotificationToggle('projectCompleted')}
                      className="sr-only peer" 
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-600 peer-checked:bg-gray-100'
                        : 'bg-gray-200 peer-checked:bg-[#2C2A26]'
                    }`}></div>
                </label>
            </div>
        </div>
        <div className={`flex justify-end pt-4 border-t mt-6 transition-colors duration-300 ${
          theme === 'dark' ? 'border-gray-700' : 'border-[#F5F2EB]'
        }`}>
            <button 
              onClick={async () => {
                if (!user) {
                  toast.error(t?.profileSettings?.notLoggedIn || 'Please log in to update your profile.');
                  return;
                }

                // Prevent double submission
                if (savingNotifications) {
                  return;
                }

                setSavingNotifications(true);
                let updateSuccess = false;
                
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  const updateData = {
                    notifications: {
                      productUpdates: notifications.productUpdates !== false,
                      projectCompleted: notifications.projectCompleted === true,
                    },
                    updatedAt: new Date()
                  };

      console.log('[ProfileSettings] Starting Firestore update...');
      const startTime = Date.now();
      
      await setDoc(userDocRef, updateData, { merge: true });
      
      const duration = Date.now() - startTime;
      console.log(`[ProfileSettings] Firestore update completed in ${duration}ms`);
      
      updateSuccess = true;

                  toast.success(t?.profileSettings?.notificationsUpdated || 'Notification preferences updated!');
                  
                } catch (error) {
                  console.error('Notification update error:', error);
                  const errorMessage = error.message || error.code || t?.profileSettings?.notificationsUpdateFailed || 'Failed to update notifications.';
                  toast.error(errorMessage);
                } finally {
                  // Always reset loading state immediately after Firestore update
                  setSavingNotifications(false);
                  
                  // Refresh user data in background (non-blocking)
                  if (updateSuccess && refreshUserData) {
                    setTimeout(() => {
                      refreshUserData().catch(err => {
                        console.warn('Failed to refresh user data:', err);
                      });
                    }, 100);
                  }
                }
              }}
              disabled={savingNotifications || loading}
              className={`px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
              }`}
            >
              {savingNotifications ? (t?.profileSettings?.saving || 'Saving...') : (t?.profileSettings?.saveNotifications || 'Save Notifications')}
            </button>
        </div>
       </div>

    </div>
  );
};

export default ProfileSettings;
