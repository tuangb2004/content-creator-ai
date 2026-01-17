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
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified (only for email/password users, not social login)
      if (userCredential.user.providerData[0]?.providerId === 'password' && !userCredential.user.emailVerified) {
        // Sign out the user immediately if email not verified
        await signOut(auth);
        throw {
          code: 'auth/email-not-verified',
          message: 'Vui lòng xác thực email trước khi đăng nhập. Chúng tôi đã gửi email xác thực đến địa chỉ email của bạn.'
        };
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
   */
  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      
      // Store password temporarily for auto-login after verification
      localStorage.setItem('pendingVerificationPassword', btoa(password));
      localStorage.setItem('pendingVerificationEmail', email);
      
      // Wait for Firebase auth token to be ready before creating session
      // Force token refresh to ensure it's available
      let sessionId = null;
      let emailSent = false;
      
      try {
        // Wait for token to be ready (with retry and force refresh)
        let tokenReady = false;
        for (let i = 0; i < 10; i++) {
          try {
            // Force refresh token to ensure it's valid
            const token = await userCredential.user.getIdToken(true);
            if (token) {
              tokenReady = true;
              console.log(`[AuthContext] Token ready after ${i + 1} attempts`);
              break;
            }
          } catch (e) {
            console.log(`[AuthContext] Waiting for token... (attempt ${i + 1}/10)`, e.message);
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        if (tokenReady) {
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../config/firebase');
          const createSession = httpsCallable(functions, 'createVerificationSession');
          const result = await createSession({});
          
          sessionId = result.data?.session_id;
          emailSent = true;
          if (sessionId) {
            localStorage.setItem('pendingVerificationSessionId', sessionId);
            console.log('[AuthContext] Verification session created:', sessionId);
          }
        } else {
          throw new Error('Token not ready after retries');
        }
      } catch (sessionError) {
        console.warn('[AuthContext] Failed to create verification session:', sessionError);
        // Fallback: try to send verification email without session
        // But user must still be authenticated for this to work
        try {
          // Ensure user is still authenticated
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid === userCredential.user.uid) {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../config/firebase');
            const resendVerification = httpsCallable(functions, 'resendCustomVerification');
            await resendVerification({});
            emailSent = true;
            console.log('[AuthContext] Fallback: Verification email sent without session');
          } else {
            console.error('[AuthContext] User no longer authenticated, cannot send email');
          }
        } catch (emailError) {
          console.error('[AuthContext] Failed to send verification email (fallback):', emailError);
          emailSent = false;
        }
      }
      
      // Sign out user immediately after registration - they need to verify email first
      // Always sign out (user needs to verify email before they can use the account)
      await signOut(auth);
      
      // If email wasn't sent, return error info but don't throw
      // This allows the UI to handle the error gracefully
      if (!emailSent) {
        console.error('[AuthContext] Registration completed but verification email was not sent');
      }
      
      // Return user info but user is signed out
      return {
        user: null,
        emailSent: emailSent,
        email: userCredential.user.email,
        sessionId: sessionId
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
            displayName: userCredential.user.providerData[0].displayName
          });
        } catch (updateError) {
          console.warn('Failed to update profile:', updateError);
        }
      }
      
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
            displayName: userCredential.user.providerData[0].displayName
          });
        } catch (updateError) {
          console.warn('Failed to update profile:', updateError);
        }
      }
      
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
   * Send password reset email using custom function (SendGrid)
   */
  const resetPassword = async (email) => {
    try {
      console.log('[AuthContext] Requesting password reset for:', email);
      const sendPasswordReset = httpsCallable(functions, 'sendCustomPasswordReset');
      const result = await sendPasswordReset({ email });
      console.log('[AuthContext] Password reset email sent successfully:', result);
      return { 
        success: true, 
        message: result.data?.message || 'Password reset email sent. Please check your inbox.' 
      };
    } catch (error) {
      console.error('[AuthContext] Failed to send password reset email:', error);
      // Handle Firebase Functions errors
      if (error.code === 'functions/invalid-argument') {
        throw formatAuthError({ code: 'auth/invalid-email', message: error.message });
      } else if (error.code === 'functions/internal') {
        throw formatAuthError({ code: 'auth/internal-error', message: error.message });
      }
      throw formatAuthError(error);
    }
  };

  /**
   * Resend email verification using custom function (SendGrid)
   * User must be authenticated to resend verification email
   */
  const resendVerificationEmail = async (emailOrUser = null) => {
    if (!user) {
      throw new Error('No user logged in. Please sign in first to resend verification email.');
    }
    
    try {
      console.log('[AuthContext] Resending email verification for user:', user.email);
      const resendVerification = httpsCallable(functions, 'resendCustomVerification');
      const result = await resendVerification();
      
      if (result.data?.alreadyVerified) {
        console.log('[AuthContext] Email is already verified');
        return { 
          success: true, 
          alreadyVerified: true,
          message: result.data?.message || 'Email is already verified.' 
        };
      }
      
      console.log('[AuthContext] Verification email resent successfully:', result);
      return { 
        success: true, 
        message: result.data?.message || 'Verification email sent. Please check your inbox.' 
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
    refreshUserData
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
