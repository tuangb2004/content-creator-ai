/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  updateProfile
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, functions } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Firestore user data (credits, plan, etc.)
  const [loading, setLoading] = useState(true);
  const userDocUnsubRef = useRef(null);
  const createDocTimeoutRef = useRef(null);
  const createDocAttemptedRef = useRef(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (userDocUnsubRef.current) {
        userDocUnsubRef.current();
        userDocUnsubRef.current = null;
      }
      if (createDocTimeoutRef.current) {
        clearTimeout(createDocTimeoutRef.current);
        createDocTimeoutRef.current = null;
      }
      createDocAttemptedRef.current = false;

      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync profile to Firestore
        syncProfileWithFirestore(firebaseUser);
        // Set loading false IMMEDIATELY - don't wait for userData
        setLoading(false);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        userDocUnsubRef.current = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.data());
              return;
            }

            setUserData(null);
            if (createDocAttemptedRef.current) return;
            createDocAttemptedRef.current = true;

            createDocTimeoutRef.current = setTimeout(async () => {
              try {
                const userEmail = firebaseUser.email;
                if (!userEmail) {
                  console.error('❌ Cannot create user document: user email is missing');
                  return;
                }

                await setDoc(userDocRef, {
                  email: userEmail,
                  plan: 'free',
                  credits: 10,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                }, { merge: false });
              } catch (createError) {
                console.error('❌ Failed to create user document:', createError);
              }
            }, 2000);
          },
          (error) => {
            if (error.code === 'permission-denied' || error.code === 'unavailable') {
              console.warn('Cannot fetch user data:', error.message);
            } else {
              console.error('Error fetching user data:', error);
            }
            setUserData(null);
          }
        );
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      if (userDocUnsubRef.current) {
        userDocUnsubRef.current();
        userDocUnsubRef.current = null;
      }
      if (createDocTimeoutRef.current) {
        clearTimeout(createDocTimeoutRef.current);
        createDocTimeoutRef.current = null;
      }
      unsubscribe();
    };
  }, []);

  /**
   * Login with email and password
   * 
   * Flow chuẩn industry:
   * - Cho phép login ngay cả khi chưa verify
   * - ProtectedRoute sẽ tự động show blocking screen nếu chưa verify
   * - ❌ KHÔNG signOut() - chỉ block quyền
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if email is verified (only for email/password users, not social login)
      // Flow chuẩn: Cho phép login, ProtectedRoute sẽ block nếu chưa verify
      // ❌ KHÔNG signOut() - user được login, ProtectedRoute sẽ handle blocking
      if (userCredential.user.providerData[0]?.providerId === 'password' && !userCredential.user.emailVerified) {
        // Resend verification email automatically (silent)
        try {
          const { sendEmailVerification } = await import('firebase/auth');
          await sendEmailVerification(userCredential.user);
          console.log('[AuthContext] Verification email resent automatically');
        } catch (emailError) {
          console.error('[AuthContext] Failed to resend verification email:', emailError);
        }
        // User is logged in - ProtectedRoute will show blocking screen
        // No error thrown - let ProtectedRoute handle it
      }

      // Log login activity (fire and forget - don't block login)
      console.log('🔐 Attempting to log login activity...');
      try {
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('../config/firebase');
        const logLogin = httpsCallable(functions, 'logUserLogin');
        console.log('📞 Calling logUserLogin function...');
        // Don't await - fire and forget to not block login
        logLogin({
          provider: userCredential.user.providerData[0]?.providerId || 'email',
          userAgent: navigator.userAgent
        }).then((result) => {
          console.log('✅ Login activity logged successfully:', result);
          // Clear cache to force fresh fetch
          if (userCredential.user?.uid) {
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_50`);
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_6`);
            console.log('🗑️ Cleared activity logs cache');
          }
          // Trigger activity logs refresh with multiple attempts to ensure it's fetched
          // Firestore writes can be slightly delayed
          const refreshLogs = (attempt = 1, maxAttempts = 3) => {
            const delay = attempt * 2000; // 2s, 4s, 6s
            setTimeout(() => {
              console.log(`🔄 Dispatching refreshActivityLogs event (attempt ${attempt}/${maxAttempts})...`);
              window.dispatchEvent(new CustomEvent('refreshActivityLogs'));

              if (attempt < maxAttempts) {
                refreshLogs(attempt + 1, maxAttempts);
              }
            }, delay);
          };
          refreshLogs();
        }).catch((logError) => {
          console.error('❌ Failed to log login activity:', logError);
          console.error('Error details:', logError.code, logError.message, logError);
        });
      } catch (logError) {
        console.error('❌ Failed to initialize login logging:', logError);
        // Don't fail login if logging fails
      }

      // Auth state listener will update user state automatically
      return {
        user: userCredential.user,
        // Note: userData will be fetched by onAuthStateChanged listener
      };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Register new user with email and password
   * 
   * Flow chuẩn industry:
   * - Tạo user và gửi email verification
   * - User ĐƯỢC login (emailVerified = false)
   * - ProtectedRoute sẽ tự động show blocking screen
   * - ❌ KHÔNG signOut() - chỉ block quyền
   */
  const register = async (name, email, password) => {
    try {
      // Step 1: Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Step 2: Update user profile with name
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }

      // Step 3: Send email verification using Firebase built-in function
      let emailSent = false;
      try {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(userCredential.user);
        emailSent = true;
        console.log('[AuthContext] Verification email sent');
      } catch (emailError) {
        console.error('[AuthContext] Failed to send verification email:', emailError);
        emailSent = false;
        // Don't throw - user can request resend later
      }

      // Step 4: Return result (user is logged in with emailVerified = false)
      // ProtectedRoute will automatically show blocking screen
      // ❌ KHÔNG signOut() - flow chuẩn industry
      return {
        user: userCredential.user,
        emailSent: emailSent,
        email: userCredential.user.email
      };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Request additional scopes
      provider.addScope('profile');
      provider.addScope('email');
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const userCredential = await signInWithPopup(auth, provider);

      // Social login users are automatically email verified
      // Update profile if needed
      if (userCredential.user && !userCredential.user.displayName && userCredential.user.providerData[0]?.displayName) {
        try {
          await updateProfile(userCredential.user, {
            displayName: userCredential.user.providerData[0].displayName,
            photoURL: userCredential.user.providerData[0].photoURL
          });
        } catch (updateError) {
          console.warn('Failed to update profile:', updateError);
        }
      }

      // Force sync to Firestore
      await syncProfileWithFirestore(userCredential.user);

      // Log login activity (fire and forget - don't block login)
      console.log('🔐 Attempting to log Google login activity...');
      setTimeout(async () => {
        try {
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../config/firebase');
          const logLogin = httpsCallable(functions, 'logUserLogin');
          const result = await logLogin({
            provider: 'google.com',
            userAgent: navigator.userAgent
          });
          console.log('✅ Login activity logged successfully:', result);
          if (userCredential.user?.uid) {
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_50`);
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_6`);
            console.log('🗑️ Cleared activity logs cache');
          }
          // Trigger activity logs refresh with multiple attempts to ensure it's fetched
          const refreshLogs = (attempt = 1, maxAttempts = 3) => {
            const delay = attempt * 2000; // 2s, 4s, 6s
            setTimeout(() => {
              console.log(`🔄 Dispatching refreshActivityLogs event (attempt ${attempt}/${maxAttempts})...`);
              window.dispatchEvent(new CustomEvent('refreshActivityLogs'));

              if (attempt < maxAttempts) {
                refreshLogs(attempt + 1, maxAttempts);
              }
            }, delay);
          };
          refreshLogs();
        } catch (logError) {
          console.error('❌ Failed to log login activity:', logError);
          console.error('Error code:', logError.code, 'Message:', logError.message);
        }
      }, 500);

      // Auth state listener will update user state automatically
      return {
        user: userCredential.user,
      };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Login with Facebook
   */
  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      // Note: Firebase Auth automatically requests basic profile and email
      // Only add additional scopes if needed and approved by Facebook
      // provider.addScope('public_profile'); // Default scope, usually not needed

      const userCredential = await signInWithPopup(auth, provider);

      // Social login users are automatically email verified
      // Update profile if needed
      if (userCredential.user && !userCredential.user.displayName && userCredential.user.providerData[0]?.displayName) {
        try {
          await updateProfile(userCredential.user, {
            displayName: userCredential.user.providerData[0].displayName,
            photoURL: userCredential.user.providerData[0].photoURL
          });
        } catch (updateError) {
          console.warn('Failed to update profile:', updateError);
        }
      }

      // Force sync to Firestore
      await syncProfileWithFirestore(userCredential.user);

      // Log login activity (fire and forget - don't block login)
      console.log('🔐 Attempting to log Facebook login activity...');
      setTimeout(async () => {
        try {
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../config/firebase');
          const logLogin = httpsCallable(functions, 'logUserLogin');
          const result = await logLogin({
            provider: 'facebook.com',
            userAgent: navigator.userAgent
          });
          console.log('✅ Login activity logged successfully:', result);
          if (userCredential.user?.uid) {
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_50`);
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_6`);
            console.log('🗑️ Cleared activity logs cache');
          }
          // Trigger activity logs refresh with multiple attempts to ensure it's fetched
          const refreshLogs = (attempt = 1, maxAttempts = 3) => {
            const delay = attempt * 2000; // 2s, 4s, 6s
            setTimeout(() => {
              console.log(`🔄 Dispatching refreshActivityLogs event (attempt ${attempt}/${maxAttempts})...`);
              window.dispatchEvent(new CustomEvent('refreshActivityLogs'));

              if (attempt < maxAttempts) {
                refreshLogs(attempt + 1, maxAttempts);
              }
            }, delay);
          };
          refreshLogs();
        } catch (logError) {
          console.error('❌ Failed to log login activity:', logError);
          console.error('Error code:', logError.code, 'Message:', logError.message);
        }
      }, 500);

      // Auth state listener will update user state automatically
      return {
        user: userCredential.user,
      };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Login with TikTok
   */
  const loginWithTikTok = async () => {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../config/firebase');

      // Get TikTok auth URL from Cloud Function
      const getTikTokUrl = httpsCallable(functions, 'getTikTokAuthUrl');
      const result = await getTikTokUrl({});

      // Redirect to TikTok OAuth
      window.location.href = result.data.authUrl;
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Sign in with custom token (for TikTok OAuth callback)
   */
  const signInWithCustomTokenAuth = async (customToken) => {
    try {
      const userCredential = await signInWithCustomToken(auth, customToken);

      // Log login activity (fire and forget - don't block login)
      console.log('🔐 Attempting to log TikTok login activity...');
      setTimeout(async () => {
        try {
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../config/firebase');
          const logLogin = httpsCallable(functions, 'logUserLogin');
          const result = await logLogin({
            provider: 'tiktok',
            userAgent: navigator.userAgent
          });
          console.log('✅ Login activity logged successfully:', result);
          if (userCredential.user?.uid) {
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_50`);
            sessionStorage.removeItem(`activityLogs_${userCredential.user.uid}_6`);
            console.log('🗑️ Cleared activity logs cache');
          }
          // Trigger activity logs refresh with multiple attempts to ensure it's fetched
          const refreshLogs = (attempt = 1, maxAttempts = 3) => {
            const delay = attempt * 2000; // 2s, 4s, 6s
            setTimeout(() => {
              console.log(`🔄 Dispatching refreshActivityLogs event (attempt ${attempt}/${maxAttempts})...`);
              window.dispatchEvent(new CustomEvent('refreshActivityLogs'));

              if (attempt < maxAttempts) {
                refreshLogs(attempt + 1, maxAttempts);
              }
            }, delay);
          };
          refreshLogs();
        } catch (logError) {
          console.error('❌ Failed to log login activity:', logError);
          console.error('Error code:', logError.code, 'Message:', logError.message);
        }
      }, 500);

      // Auth state listener will update user state automatically
      return {
        user: userCredential.user,
      };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      // Set flag to indicate user is logging out (prevents auto-redirect to dashboard)
      localStorage.setItem('logging_out', 'true');
      await signOut(auth);
      // Clear the flag after a short delay to allow redirect
      setTimeout(() => {
        localStorage.removeItem('logging_out');
      }, 1000);
      // Auth state listener will clear user state automatically
      // Redirect will be handled by ProtectedRoute or LandingPage
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('logging_out');
      throw formatAuthError(error);
    }
  };

  /**
   * Send password reset email using Firebase built-in function
   */
  const resetPassword = async (email) => {
    try {
      console.log('[AuthContext] Requesting password reset for:', email);

      // Use Firebase built-in sendPasswordResetEmail
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);

      console.log('[AuthContext] Password reset email sent successfully');
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('[AuthContext] Failed to send password reset email:', error);
      throw formatAuthError(error);
    }
  };

  /**
   * Resend email verification using Firebase built-in function
   * User must be authenticated to resend verification email
   */
  const resendVerificationEmail = async (emailOrUser = null) => {
    if (!user) {
      throw new Error('No user logged in. Please sign in first to resend verification email.');
    }

    try {
      console.log('[AuthContext] Resending email verification for user:', user.email);

      // Check if email is already verified
      if (user.emailVerified) {
        console.log('[AuthContext] Email is already verified');
        return {
          success: true,
          alreadyVerified: true,
          message: 'Email is already verified.'
        };
      }

      // Use Firebase built-in sendEmailVerification
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(user);

      console.log('[AuthContext] Verification email resent successfully');
      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('[AuthContext] Failed to resend verification email:', error);
      // Handle Firebase Functions errors
      if (error.code === 'functions/unauthenticated') {
        throw formatAuthError({ code: 'auth/unauthenticated', message: 'Please sign in to resend verification email.' });
      } else if (error.code === 'functions/internal') {
        throw formatAuthError({ code: 'auth/internal-error', message: error.message });
      }
      throw formatAuthError(error);
    }
  };

  /**
   * Refresh user data from Firestore
   * Forces a fresh fetch even if cached
   */
  const refreshUserData = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  /**
   * Format Firebase auth errors to user-friendly messages
   */
  const formatAuthError = (error) => {
    const errorMessages = {
      'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
      'auth/wrong-password': 'Mật khẩu không đúng.',
      'auth/email-already-in-use': 'Email này đã được sử dụng.',
      'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
      'auth/invalid-email': 'Email không hợp lệ.',
      'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
      'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.',
      'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
      'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy.',
      'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
      'auth/operation-not-allowed': 'Thao tác này không được phép.',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      'auth/user-mismatch': 'Thông tin đăng nhập không khớp.',
      'auth/email-not-verified': 'Vui lòng xác thực email trước khi đăng nhập. Chúng tôi đã gửi email xác thực đến địa chỉ email của bạn.',
    };

    const errorCode = error.code;
    const message = errorMessages[errorCode] || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';

    return {
      code: errorCode,
      message: message,
      originalError: error
    };
  };

  /**
   * Sync Firebase Auth profile with Firestore user document
   */
  const syncProfileWithFirestore = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      const updateData = {};
      const currentName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

      if (userDocSnap.exists()) {
        const currentData = userDocSnap.data();

        if (firebaseUser.displayName && currentData.displayName !== firebaseUser.displayName) {
          updateData.displayName = firebaseUser.displayName;
        }

        if (firebaseUser.photoURL && currentData.photoURL !== firebaseUser.photoURL) {
          updateData.photoURL = firebaseUser.photoURL;
        }

        // Always ensure updatedAt is fresh if we're doing ANY update
        if (Object.keys(updateData).length > 0) {
          console.log('🔄 Updating profile in Firestore:', updateData);
          await setDoc(userDocRef, {
            ...updateData,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }

        // PROACTIVE SYNC: Even if profile photo matches, posts might still have old names/avatars
        // especially if they were created before the last sync or with legacy logic
        if (firebaseUser.photoURL || firebaseUser.displayName) {
          console.log('🔄 Checking posts for sync (Aggressive)...');
          try {
            const postsQuery = query(
              collection(db, 'posts'),
              where('authorId', '==', firebaseUser.uid)
            );
            const querySnapshot = await getDocs(postsQuery);

            if (!querySnapshot.empty) {
              const batch = writeBatch(db);
              let needsCommit = false;

              querySnapshot.docs.forEach((postDoc) => {
                const post = postDoc.data();
                const updates = {};

                // Update avatar if missing or different
                if (firebaseUser.photoURL && (post.authorAvatar !== firebaseUser.photoURL || post.authorPhotoURL !== firebaseUser.photoURL)) {
                  updates.authorAvatar = firebaseUser.photoURL;
                  updates.authorPhotoURL = firebaseUser.photoURL;
                }

                // Update name if missing or different (fixes 'hihitk28' issue)
                if (currentName && (post.authorName !== currentName || post.authorDisplayName !== currentName)) {
                  updates.authorName = currentName;
                  updates.authorDisplayName = currentName;
                }

                if (Object.keys(updates).length > 0) {
                  batch.update(postDoc.ref, updates);
                  needsCommit = true;
                }
              });

              if (needsCommit) {
                await batch.commit();
                console.log(`✅ Updated author info for ${querySnapshot.size} posts`);
              }
            }
          } catch (postError) {
            console.error('⚠️ Failed to sync posts author info:', postError);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync profile with Firestore:', error);
    }
  };

  const value = {
    user,           // Firebase Auth user object
    userData,       // Firestore user data (credits, plan, email, etc.)
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTikTok,
    signInWithCustomTokenAuth,
    logout,
    resetPassword,
    resendVerificationEmail,
    loading,
    refreshUserData,
    syncProfileWithFirestore // Export for explicit sync if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
