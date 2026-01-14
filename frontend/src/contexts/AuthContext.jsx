import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Firestore user data (credits, plan, etc.)
  const [loading, setLoading] = useState(true);
  const lastFetchedUserIdRef = useRef(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Set loading false IMMEDIATELY - don't wait for userData
        setLoading(false);
        
        // Fetch user data in background (don't block UI)
        const shouldFetch = lastFetchedUserIdRef.current !== firebaseUser.uid;
        
        if (shouldFetch) {
          // Fetch in background - don't block
          (async () => {
            try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);
              
              if (userDocSnap.exists()) {
                setUserData(userDocSnap.data());
                lastFetchedUserIdRef.current = firebaseUser.uid;
              } else {
                // User document doesn't exist yet (should be created by onUserCreate trigger)
                // This is normal for newly created users - wait a bit and retry
                console.log('User document not found yet, will retry in 2 seconds...');
                setUserData(null);
                lastFetchedUserIdRef.current = firebaseUser.uid;
                
                // Retry after 2 seconds (give Cloud Function time to create document)
                setTimeout(async () => {
                  try {
                    const retryDocSnap = await getDoc(userDocRef);
                    if (retryDocSnap.exists()) {
                      setUserData(retryDocSnap.data());
                      console.log('User document found on retry');
                    } else {
                      // If still not found, create user document directly (fallback)
                      // This is safe because Firestore rules only allow users to create their own document
                      console.warn('User document still not found after retry. Creating user document directly...');
                      try {
                        const userEmail = firebaseUser.email;
                        if (!userEmail) {
                          console.error('❌ Cannot create user document: user email is missing');
                          return;
                        }
                        
                        // Create user document with default values
                        await setDoc(userDocRef, {
                          email: userEmail,
                          plan: 'free',
                          credits: 10, // Free tier: 10 credits
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp()
                        }, { merge: false }); // merge: false ensures we don't overwrite if it exists
                        
                        // Fetch the newly created document
                        const newDocSnap = await getDoc(userDocRef);
                        if (newDocSnap.exists()) {
                          setUserData(newDocSnap.data());
                          console.log('✅ User document created successfully');
                        } else {
                          console.error('❌ Failed to create user document');
                        }
                      } catch (createError) {
                        console.error('❌ Failed to create user document:', createError);
                        // If creation fails due to permission, it means document might exist now
                        // Try to fetch one more time
                        try {
                          const finalDocSnap = await getDoc(userDocRef);
                          if (finalDocSnap.exists()) {
                            setUserData(finalDocSnap.data());
                            console.log('✅ User document found after creation attempt');
                          }
                        } catch (fetchError) {
                          console.error('❌ Error fetching user document:', fetchError);
                        }
                      }
                    }
                  } catch (retryError) {
                    console.warn('Retry failed:', retryError.message);
                  }
                }, 2000);
              }
            } catch (error) {
              // Don't log as error if it's just a permission issue or document doesn't exist
              if (error.code === 'permission-denied' || error.code === 'unavailable') {
                console.warn('Cannot fetch user data:', error.message);
              } else {
              console.error('Error fetching user data:', error);
              }
              setUserData(null);
              lastFetchedUserIdRef.current = firebaseUser.uid;
            }
          })();
        }
      } else {
        setUser(null);
        setUserData(null);
        lastFetchedUserIdRef.current = null;
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
      provider.addScope('email'); // Request email permission
      provider.addScope('public_profile'); // Request profile permission
      
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
   * Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);
      // Auth state listener will clear user state automatically
      // Redirect will be handled by ProtectedRoute
    } catch (error) {
      console.error('Logout error:', error);
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
    let targetEmail = null;
    
    // If email string provided, try to sign in temporarily to send verification
    if (typeof emailOrUser === 'string') {
      targetEmail = emailOrUser;
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
      // Clear cache to force fresh fetch
      lastFetchedUserIdRef.current = null;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
        lastFetchedUserIdRef.current = user.uid;
      } else {
        setUserData(null);
        lastFetchedUserIdRef.current = user.uid;
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
