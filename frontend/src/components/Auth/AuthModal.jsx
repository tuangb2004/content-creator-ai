import { useState, useEffect } from 'react';
import {
  X,
  Mail,
  ChevronLeft,
  CheckCircle
} from 'lucide-react';
import { Icons } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from '../../utils/toast';
import Logo from '../../assets/images/Logo.png';

const AuthModal = ({ isOpen, onClose, initialView = 'initial', onLoginSuccess, isBlocking = false }) => {
  const [view, setView] = useState(initialView);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loadingButton, setLoadingButton] = useState(null); // Track which button is loading: 'google', 'facebook', 'tiktok', 'email', null


  const {
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTikTok,
    resetPassword,
    logout,
    resendVerificationEmail
  } = useAuth();
  const { t } = useLanguage();

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      // Reset all states khi modal đóng
      setView(initialView);
      setEmail('');
      setPassword('');
      setName('');
      setPasswordVisible(false);
      setLoadingButton(null);
    }
  }, [isOpen, initialView]);

  // Instant reset on window focus (handle popup close)
  useEffect(() => {
    if (['google', 'facebook', 'tiktok'].includes(loadingButton)) {
      const handleFocus = () => {
        // Show immediate notification
        toast.error(t.auth.loginCancelled || 'Login cancelled');
        setLoadingButton(null);
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [loadingButton]);



  // Auto-poll for email verification when in verify view
  useEffect(() => {
    let interval;
    if (view === 'verify' && isOpen) {
      interval = setInterval(async () => {
        try {
          // Access auth.currentUser directly to bypass state updates
          const { auth } = await import('../../config/firebase');
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            toast.success(t.auth.verifiedSuccess || 'Email verified successfully!');
            if (onLoginSuccess) onLoginSuccess();
            onClose();
          }
        } catch (error) {
          console.error("Auto-verify check failed", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [view, isOpen, onLoginSuccess, onClose, t.auth.verifiedSuccess]);


  if (!isOpen) return null;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleClose = () => {
    onClose();
  };



  const handleGoogleLogin = async () => {
    setLoadingButton('google');

    try {
      await loginWithGoogle();
      toast.success(t.auth.signedInGoogle || 'Welcome! Signed in successfully with Google');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setLoadingButton(null);
        return;
      }
      toast.error(err.message || 'Failed to sign in with Google');
      setLoadingButton(null);
    }
  };

  const handleFacebookLogin = async () => {
    setLoadingButton('facebook');

    try {
      await loginWithFacebook();
      toast.success(t.auth.signedInFacebook || 'Welcome! Signed in successfully with Facebook');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setLoadingButton(null);
        return;
      }
      toast.error(err.message || 'Failed to sign in with Facebook');
      setLoadingButton(null);
    }
  };

  const handleTikTokLogin = async () => {
    setLoadingButton('tiktok');

    try {
      await loginWithTikTok();
      // TikTok redirects to OAuth, so we don't need to show success message here
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setLoadingButton(null);
        return;
      }
      toast.error(err.message || 'Failed to sign in with TikTok');
      setLoadingButton(null);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoadingButton('email');
    try {
      await login(email, password);
      toast.success(t.auth.welcomeBackToast || 'Welcome back! Signed in successfully');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setLoadingButton(null);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoadingButton('email');
    try {
      const result = await register(name, email, password);
      if (result.user) {
        setView('verify');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoadingButton(null);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingButton('email');
    try {
      await resetPassword(email);
      setView('success');
      toast.success(t.auth.passwordResetSent || 'Password reset email sent! Check your inbox');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoadingButton(null);
    }
  };

  // Check if any OAuth provider is loading (popup is open)
  const isOAuthLoading = loadingButton === 'google' || loadingButton === 'facebook' || loadingButton === 'tiktok';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isBlocking && handleClose()}
      ></div>

      <div className="relative w-full max-w-[900px] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 min-h-[600px] animate-in fade-in zoom-in-95 duration-200">

        {/* Left Side - Visuals */}
        <div className="hidden md:flex w-5/12 bg-[#F8F9FA] dark:bg-[#18181b] flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* ... visuals content ... */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 opacity-50"></div>

          <div className="relative w-full h-64 mb-8 flex justify-center items-center">
            {/* ... images ... */}
            <div className="absolute w-40 h-52 rounded-2xl overflow-hidden shadow-lg transform -rotate-6 -translate-x-4 border-4 border-white dark:border-gray-700 transition-transform duration-700 hover:scale-105 z-0">
              <img
                alt="AI Generated Portrait Back"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAngAeIoC3NStxgSTi-1i7H1d854MShAvxKHqFp7ylL_SQLu4LBaAN2mSET1iQOOIpp-CTH11O-ifK34TLWvrow-2ShSbd1aAu7bcvWSL_itELVgfhWlIe7mkCZgahCrUeT7Z0z_dnZh5ODeSfNTVRnSMJB-Wi6syfv1YxdYRp4oFPFWcGSArBsnEwFprvFC71DiOUHKd2dcQTlYtQ3vK-qE3RbgLoAEGqugLDE1vUoqRntgAvM4HZUlFUd9N8R0gqd2234MgG4VLU"
              />
            </div>
            <div className="absolute w-40 h-52 rounded-2xl overflow-hidden shadow-xl transform rotate-6 translate-x-4 translate-y-4 border-4 border-white dark:border-gray-700 z-10 transition-transform duration-700 hover:scale-105">
              <img
                alt="AI Generated Portrait Front"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt2s_fJUe-Dfnme0JqA98qE8FLH-9REJ3NeBJKyOybpNcK-rAVZBHNQ4DYmIguQAhFNIy1WFSeu91NgyhHkSwB5ANn24D1DlCl59FHo-a2bgT5uBzXKnkCAeg1XTy6c5s7uc3DZDZTOU3q4R-i7dRCJ76tbxolDu6t2onGlEeuMBPsQFhtpNjQLVImfyi0DLAjomfUovDnBbyX7g4IJ_hztNGi-G8B7Aux8AFeZmz9SUG5fa9BBKDNXHEaZz6oShRCF9CKdSGkreI"
              />
            </div>
          </div>

          <div className="relative z-10 text-center space-y-2 mt-4">
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wide">{t.auth.avatar}</p>
            <div className="flex items-center justify-center space-x-2 text-gray-800 dark:text-gray-200 font-semibold text-lg">
              <span className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-200"></span>
              <span>{t.auth.talkingPhoto}</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">{t.auth.marketingVideo}</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-4">{t.auth.productShowcase}</p>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative flex flex-col justify-center bg-white dark:bg-[#1e1e1e]">
          {!isBlocking && (
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-20 cursor-pointer"
            >
              <X size={24} />
            </button>
          )}

          {/* Initial View */}
          {view === 'initial' && (
            <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Logo Header */}
              <div className="flex items-center justify-center w-full mb-4 pr-12">
                <img src={Logo} alt="Creator AI Logo" className="w-32 h-32 object-contain invert dark:invert-0" />
                <span className="text-xl font-bold text-gray-900 dark:text-white font-serif -ml-6">Creator AI</span>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loadingButton !== null}
                  className="w-full relative bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 py-3 rounded-lg font-medium transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-[260px] mx-auto pl-5">
                    <Icons.Google size={20} className="flex-shrink-0" />
                    <span className="text-left">{loadingButton === 'google' ? (t.auth.processing || 'Please wait...') : t.auth.loginWithGoogle}</span>
                  </div>
                </button>

                <button
                  onClick={() => setView('signin')}
                  disabled={isOAuthLoading}
                  className="w-full relative bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors border border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3 w-[260px] mx-auto pl-5">
                    <Mail size={20} className="flex-shrink-0" />
                    <span className="text-left">{t.auth.continueWithEmail}</span>
                  </div>
                </button>

                <button
                  onClick={handleTikTokLogin}
                  disabled={loadingButton !== null}
                  className="w-full relative bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-[260px] mx-auto pl-5">
                    {/* TikTok Icon - Fixed SVG */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 2859 3333" fill="currentColor">
                      <path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z" />
                    </svg>
                    <span className="text-left">{loadingButton === 'tiktok' ? (t.auth.processing || 'Please wait...') : t.auth.loginWithTikTok}</span>
                  </div>
                </button>

                <button
                  onClick={handleFacebookLogin}
                  disabled={loadingButton !== null}
                  className="w-full relative bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-[260px] mx-auto pl-5">
                    <Icons.Facebook size={20} className="flex-shrink-0" />
                    <span className="text-left">{loadingButton === 'facebook' ? (t.auth.processing || 'Please wait...') : t.auth.loginWithFacebook}</span>
                  </div>
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 px-4 leading-relaxed">
                {t.auth.agreeTerms} <a href="/terms" className="font-semibold text-gray-900 dark:text-gray-200 hover:underline">{t.footer.termsOfService}</a> {t.auth.and} <a href="/privacy" className="font-semibold text-gray-900 dark:text-gray-200 hover:underline">{t.footer.privacyPolicy}</a>.
              </p>
            </div>
          )}

          {/* Sign In View */}
          {view === 'signin' && (
            <div className="flex flex-col w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center mb-8">
                <button
                  onClick={() => setView('initial')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-3 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-gray-900 dark:text-white">{t.auth.signIn}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t.auth.welcomeBack}</h2>

              <form className="space-y-4" onSubmit={handleEmailSignIn}>
                <div>
                  <input
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.enterEmail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.enterPassword}
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">{passwordVisible ? t.auth.hide : t.auth.show}</div>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loadingButton !== null}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg mt-6 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingButton === 'email' ? t.auth.signingIn : t.common.next}
                </button>
              </form>

              <div className="mt-6 text-center text-sm space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {t.auth.dontHaveAccount} <button onClick={() => setView('signup')} className="text-primary font-semibold hover:underline">{t.auth.signUp}</button>
                </p>
                <p>
                  <button onClick={() => setView('forgot')} className="text-primary font-medium hover:underline">{t.auth.forgotPassword}</button>
                </p>
              </div>
            </div>
          )}

          {/* Sign Up View */}
          {view === 'signup' && (
            <div className="flex flex-col w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setView('signin')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-3 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-gray-900 dark:text-white">{t.auth.signUp}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t.auth.createAccount}</h2>

              <form className="space-y-4" onSubmit={handleEmailSignUp}>
                <div>
                  <input
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.enterName}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.enterEmail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.createPassword}
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">{passwordVisible ? t.auth.hide : t.auth.show}</div>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loadingButton !== null}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg mt-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingButton === 'email' ? t.auth.creatingAccount : t.common.next}
                </button>
              </form>

              <div className="mt-8 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  {t.auth.alreadyHaveAccount} <button onClick={() => setView('signin')} className="text-primary font-semibold hover:underline">{t.auth.signIn}</button>
                </p>
              </div>
            </div>
          )}

          {/* Forgot Password View */}
          {view === 'forgot' && (
            <div className="flex flex-col w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center mb-8">
                <button
                  onClick={() => setView('signin')}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-3 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-gray-900 dark:text-white">{t.auth.forgotPassword}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.auth.resetPassword}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{t.auth.enterEmailReset}</p>

              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <input
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all outline-none"
                    placeholder={t.auth.enterEmail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingButton !== null}
                  className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingButton === 'email' ? t.auth.sending : t.auth.confirm}
                </button>
              </form>
            </div>
          )}

          {/* Success View */}
          {view === 'success' && (
            <div className="flex flex-col w-full max-w-sm mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.auth.requestSent}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">{t.auth.checkEmailReset}</p>
              <button
                onClick={() => setView('signin')}
                className="text-primary font-semibold flex items-center justify-center gap-2 mx-auto hover:underline"
              >
                <ChevronLeft size={16} /> {t.auth.backToSignIn}
              </button>
            </div>
          )}

          {/* Verify Email View */}
          {view === 'verify' && (
            <div className="flex flex-col w-full max-w-sm mx-auto text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Mail size={40} className="text-[#0d9488]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.auth.verifyEmail}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{t.auth.verificationEmailSent}</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-6 underline">{email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t.auth.checkInboxSpam}
              </p>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    const domain = email.split('@')[1]?.toLowerCase() || '';
                    let url = 'https://mail.google.com';
                    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('msn')) url = 'https://outlook.live.com';
                    else if (domain.includes('yahoo')) url = 'https://mail.yahoo.com';
                    window.open(url, '_blank');
                  }}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {t.auth.checkInboxButton}
                </button>
                <button
                  onClick={async () => {
                    setLoadingButton('check');
                    try {
                      const { auth } = await import('../../config/firebase');
                      await auth.currentUser?.reload();
                      if (auth.currentUser?.emailVerified) {
                        toast.success(t.auth.verifiedSuccess || 'Email verified successfully!');
                        if (onLoginSuccess) onLoginSuccess();
                        onClose();
                      } else {
                        toast.info(t.auth.notVerifiedYet || 'Email not verified yet. Please check your inbox.');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Failed to check verification status');
                    } finally {
                      setLoadingButton(null);
                    }
                  }}
                  disabled={loadingButton === 'check'}
                  className="w-full bg-[#0d9488] text-white hover:bg-[#0f766e] font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingButton === 'check' ? t.auth.processing : t.auth.iveVerified}
                </button>
                <button
                  onClick={async () => {
                    setLoadingButton('resend');
                    try {
                      await resendVerificationEmail();
                      toast.success(t.auth.verificationSentSuccess || 'Verification email resent!');
                    } catch (err) {
                      toast.error(err.message || 'Failed to resend email');
                    } finally {
                      setLoadingButton(null);
                    }
                  }}
                  disabled={loadingButton === 'resend'}
                  className="w-full bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingButton === 'resend' ? t.auth.sending : t.auth.resendEmail || 'Resend Email'}
                </button>
              </div>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setEmail('');
                    setView('signup');
                  } catch (err) {
                    console.error(err);
                    setView('initial');
                  }
                }}
                className="mt-8 text-sm text-[#0d9488] font-semibold hover:underline"
              >
                {t.auth.useAnotherEmail || 'Use another email'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
