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
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
      
      // Create verification session and send email
      let sessionId = null;
      try {
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('../config/firebase');
        const createSession = httpsCallable(functions, 'createVerificationSession');
        const result = await createSession({});
        
        sessionId = result.data?.session_id;
        if (sessionId) {
          localStorage.setItem('pendingVerificationSessionId', sessionId);
          console.log('[AuthContext] Verification session created:', sessionId);
        }
      } catch (sessionError) {
        console.warn('[AuthContext] Failed to create verification session:', sessionError);
      }
      
      // Sign out user immediately after registration - they need to verify email first
      await signOut(auth);
      
      // Return user info but user is signed out
      return {
        user: null,
        emailSent: true,
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
   * Send password reset email
   */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: false
      });
      return { success: true };
    } catch (error) {
      throw formatAuthError(error);
    }
  };

  /**
   * Resend email verification
   * Can be called with user object or email string
   */
  const resendVerificationEmail = async (emailOrUser = null) => {
    let targetUser = user;
    
    // If email string provided, try to sign in temporarily to send verification
    if (typeof emailOrUser === 'string') {
      // For unverified users, we can't sign them in
      // So we'll need to handle this differently - maybe through a backend function
      // For now, throw an error
      throw new Error('Cannot resend verification email without being logged in. Please try signing in again after verifying your email.');
    } else if (emailOrUser && emailOrUser.email) {
      // If user object provided, use it
      targetUser = emailOrUser;
    }
    
    if (!targetUser) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('[AuthContext] Resending email verification to:', targetUser.email);
      await sendEmailVerification(targetUser, {
        url: window.location.origin + '/',
        handleCodeInApp: false
      });
      console.log('[AuthContext] Verification email resent successfully');
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Failed to resend verification email:', error);
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
