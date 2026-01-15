import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from '../../utils/toast';
import { checkPasswordStrength, validateEmail, passwordRequirements } from '../../utils/passwordValidation';
import VerificationWaitingScreen from './VerificationWaitingScreen';

const AuthModal = ({ isOpen, onClose, onLogin, onNavigate, type = 'signup', onSwitchType }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mode, setMode] = useState('options'); // 'options', 'email', or 'forgot_password'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', feedback: [] });
  const [emailError, setEmailError] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationSessionId, setVerificationSessionId] = useState(null);
  const [showWaitingScreen, setShowWaitingScreen] = useState(false);
  const { login, register, loginWithGoogle, loginWithFacebook, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Reset mode when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setMode('options');
      setResetSent(false);
      setShowVerificationMessage(false);
      
      // Load remembered email if exists (only for signin)
      const rememberedEmail = type === 'signin' ? localStorage.getItem('rememberedEmail') || '' : '';
      const shouldRemember = localStorage.getItem('rememberMe') === 'true';
      
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: rememberedEmail, 
        password: '', 
        confirmPassword: '' 
      });
      setRememberMe(shouldRemember);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordStrength({ score: 0, strength: 'weak', feedback: [] });
      setEmailError('');
    }
  }, [isOpen, type]); // Also reset when type changes

  // Check password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, strength: 'weak', feedback: [] });
    }
  }, [formData.password]);

  // Validate email when it changes
  useEffect(() => {
    if (formData.email && mode === 'email') {
      const validation = validateEmail(formData.email);
      setEmailError(validation.valid ? '' : validation.message);
    } else {
      setEmailError('');
    }
  }, [formData.email, mode]);

  // Show waiting screen if verification is in progress (even if modal is closed)
  if (showWaitingScreen && verificationSessionId) {
    return (
      <VerificationWaitingScreen
        email={verificationEmail}
        sessionId={verificationSessionId}
        onComplete={() => {
          setShowWaitingScreen(false);
          setVerificationSessionId(null);
          if (onLogin) onLogin();
          onClose(); // Close modal after completion
        }}
      />
    );
  }

  if (!isOpen) return null;

  const handleLegalNav = (e, page) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
      onClose();
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
        // Social login users are automatically verified
        toast.success(t?.auth?.signedInGoogle || 'Signed in with Google successfully!');
        if (onLogin) onLogin();
        onClose();
        navigate('/dashboard');
      } else if (provider === 'facebook') {
        await loginWithFacebook();
        // Social login users are automatically verified
        toast.success(t?.auth?.signedInFacebook || 'Signed in with Facebook successfully!');
        if (onLogin) onLogin();
        onClose();
        navigate('/dashboard');
      } else {
        toast.error(`${provider} login is not yet implemented`);
      }
    } catch (error) {
      // Better error handling for social login
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error(t?.auth?.popupClosed || 'Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error(t?.auth?.accountExists || 'An account already exists with the same email but different sign-in method.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error(t?.auth?.popupBlocked || 'Popup was blocked by browser. Please allow popups for this site.');
      } else {
      toast.error(error.message || t?.auth?.errorOccurred || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error(t?.auth?.fillAllFields || 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      toast.error(emailValidation.message);
      return;
    }

    // Password strength check for signup
    if (type === 'signup') {
      if (passwordStrength.score < 3) {
        toast.error(t?.auth?.passwordTooWeak || 'Password is too weak. Please choose a stronger password.');
        return;
      }
      
      // Confirm password check
      if (formData.password !== formData.confirmPassword) {
        toast.error(t?.auth?.passwordsNotMatch || 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (type === 'signup') {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || formData.lastName || 'User';
        const result = await register(fullName, formData.email, formData.password);
        
        const emailToVerify = result.email || formData.email;
        const sessionId = result.sessionId;
        
        if (sessionId) {
          // Show waiting screen with polling
          setVerificationEmail(emailToVerify);
          setVerificationSessionId(sessionId);
          setShowWaitingScreen(true);
          // Don't close modal - waiting screen will be shown instead
          toast.success(t?.auth?.accountCreated || 'Account created! Please check your email to verify your account.');
        } else if (emailToVerify) {
          // Fallback to old flow if no session
          setVerificationEmail(emailToVerify);
          setShowVerificationMessage(true);
          setMode('email');
          toast.success(t?.auth?.accountCreated || 'Account created! Please check your email to verify your account.');
        }
      } else {
        try {
        await login(formData.email, formData.password);
          
          // Handle remember me
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('rememberedEmail');
          }
          
          toast.success(t?.auth?.welcomeBackToast || 'Welcome back!');
      if (onLogin) onLogin();
      onClose();
      navigate('/dashboard');
        } catch (error) {
          // If email not verified error, show resend option
          if (error.code === 'auth/email-not-verified') {
            // Keep modal open, show verification message
            setVerificationEmail(formData.email);
            setShowVerificationMessage(true);
            toast.error(error.message || t?.auth?.emailNotVerified || 'Email not verified');
          } else {
            throw error; // Re-throw other errors to be caught by outer catch
          }
        }
      }
    } catch (error) {
      toast.error(error.message || t?.auth?.errorOccurred || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message);
      toast.error(emailValidation.message);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email);
      setResetSent(true);
      toast.success(t?.auth?.passwordResetSent || 'Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.message || t?.auth?.failedToSendReset || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const switchAuth = (newType) => {
    if (onSwitchType) {
      onSwitchType(newType);
      if (mode === 'forgot_password') {
        setMode('email');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm transition-opacity ${
          theme === 'dark' 
            ? 'bg-black/60' 
            : 'bg-[#2C2A26]/40'
        }`}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-md shadow-2xl overflow-hidden border animate-fade-in-up transition-all duration-300 rounded-sm ${
        theme === 'dark'
          ? 'bg-[#1C1B19] border-[#433E38]'
          : 'bg-[#F5F2EB] border-[#D6D1C7]'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 transition-colors z-10 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-[#A8A29E] hover:text-[#2C2A26]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Back Button (Only in Email Mode or Forgot PW) */}
        {(mode === 'email' || mode === 'forgot_password') && (
          <button 
            onClick={() => mode === 'forgot_password' ? setMode('email') : setMode('options')}
            className={`absolute top-4 left-4 transition-colors z-10 flex items-center gap-1 text-xs uppercase tracking-widest font-medium ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-[#A8A29E] hover:text-[#2C2A26]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t?.auth?.back || 'Back'}
          </button>
        )}

        <div className="p-8 md:p-10 text-center">
          
          {/* Header Text */}
          <div className="mb-8">
            <h2 className={`text-3xl font-serif mb-2 transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>
              {mode === 'forgot_password' 
                ? (t?.auth?.resetPassword || 'Reset Password')
                : (mode === 'options' 
                    ? (type === 'signin' ? (t?.auth?.welcomeBack || 'Welcome Back') : (t?.auth?.joinCreatorAI || 'Join CreatorAI'))
                    : (type === 'signin' ? (t?.auth?.signInToContinue || 'Sign in to Continue') : (t?.auth?.createAccount || 'Create Account'))
                  )
              }
            </h2>
            <p className={`font-light text-sm transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {mode === 'forgot_password'
                ? (t?.auth?.enterEmailReset || 'Enter your email to receive reset instructions.')
                : (mode === 'options'
                    ? (type === 'signin' ? (t?.auth?.accessStudio || 'Access your creative studio.') : (t?.auth?.startCreating || 'Start creating without limits today.'))
                    : (type === 'signin' ? (t?.auth?.enterCredentials || 'Enter your credentials.') : (t?.auth?.fillDetails || 'Fill in your details to get started.'))
                  )
              }
            </p>
          </div>

          {/* VIEW: OPTIONS */}
          {mode === 'options' && (
            <div className="space-y-3 animate-fade-in-up">
              <SocialButton icon="google" label={t?.auth?.loginWithGoogle || 'Continue with Google'} onClick={() => handleSocialLogin('google')} />
              <SocialButton icon="facebook" label={t?.auth?.loginWithFacebook || 'Continue with Facebook'} onClick={() => handleSocialLogin('facebook')} />
              <SocialButton icon="tiktok" label={t?.auth?.loginWithTikTok || 'Continue with TikTok'} onClick={() => handleSocialLogin('tiktok')} />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t transition-colors duration-300 ${
                    theme === 'dark' ? 'border-[#433E38]' : 'border-[#D6D1C7]'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className={`px-2 transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-[#1C1B19] text-[#A8A29E]'
                      : 'bg-[#F5F2EB] text-[#A8A29E]'
                  }`}>{t?.auth?.or || 'Or'}</span>
                </div>
              </div>

              <button 
                onClick={() => setMode('email')}
                className={`w-full py-3 text-xs font-medium uppercase tracking-widest transition-colors rounded-sm ${
                  theme === 'dark'
                    ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-[#EBE7DE]'
                    : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                }`}
              >
                {t?.auth?.continueWithEmail || 'Continue with Email'}
              </button>

              <div className="pt-4">
                {type === 'signin' ? (
                  <p className={`text-xs transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.dontHaveAccount || "Don't have an account?"} <button onClick={() => switchAuth('signup')} className={`font-bold transition-colors duration-300 hover:underline ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{t?.auth?.signUp || 'Sign Up'}</button>
                  </p>
                ) : (
                  <p className={`text-xs transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.alreadyHaveAccount || 'Already have an account?'} <button onClick={() => switchAuth('signin')} className={`font-bold transition-colors duration-300 hover:underline ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{t?.auth?.signIn || 'Sign In'}</button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form className="space-y-6 animate-fade-in-up" onSubmit={handleForgotPasswordSubmit}>
              {!resetSent ? (
                <>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="name@work-email.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 outline-none transition-colors text-sm rounded-sm ${
                        theme === 'dark'
                          ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]'
                          : 'bg-white border border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                      }`}
                      required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 ${
                      theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                    }`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <button 
                    type="submit" 
                    className={`w-full py-3 text-xs font-medium uppercase tracking-widest transition-colors rounded-sm mt-2 ${
                      theme === 'dark'
                        ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-[#EBE7DE]'
                        : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                    }`}
                  >
                    {t?.auth?.sendResetLink || 'Send Reset Link'}
                  </button>
                </>
              ) : (
                <div className={`border p-6 rounded-sm space-y-4 ${
                  theme === 'dark' 
                    ? 'bg-[#2C2A26] border-[#433E38]' 
                    : 'bg-[#EBE7DE] border-[#D6D1C7]'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                    theme === 'dark' ? 'bg-[#433E38] text-[#F5F2EB]' : 'bg-[#D6D1C7] text-[#2C2A26]'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-bold mb-1 ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{t?.auth?.checkInbox || 'Check your inbox'}</p>
                    <p className={`text-xs leading-relaxed ${
                      theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                    }`}>
                      {t?.auth?.resetEmailSent || 'We\'ve sent password reset instructions to'} <br/><strong className={theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}>{formData.email}</strong>.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setMode('email')}
                    className={`w-full border py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm ${
                      theme === 'dark'
                        ? 'bg-[#433E38] border-[#5D5A53] text-[#F5F2EB] hover:bg-[#5D5A53]'
                        : 'bg-[#2C2A26] border-[#D6D1C7] text-[#F5F2EB] hover:bg-[#433E38]'
                    }`}
                  >
                    {t?.auth?.backToLogIn || 'Back to Log In'}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* VIEW: EMAIL VERIFICATION MESSAGE */}
          {showVerificationMessage && mode === 'email' && (
            <div className={`border p-6 rounded-sm animate-fade-in-up text-left ${
              theme === 'dark' 
                ? 'bg-[#2C2A26] border-[#433E38]' 
                : 'bg-[#EBE7DE] border-[#D6D1C7]'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                }`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm mb-2 ${
                    theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>
                    {t?.auth?.verifyEmail || 'Verify your email address'}
                  </h3>
                  <p className={`text-xs mb-2 leading-relaxed ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.verificationEmailSent || 'We\'ve sent a verification email to'} <strong className={theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}>{verificationEmail}</strong>. 
                    {t?.auth?.checkInboxSpam || 'Please check your inbox (and spam folder) and click the verification link to activate your account.'}
                  </p>
                  <p className={`text-xs mb-0 leading-relaxed ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.afterVerifying || 'After verifying, you can sign in below.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    // Note: User is signed out, so can't use Cloud Function directly
                    // Show helpful message instead
                    toast('Please check your inbox and spam folder. If you don\'t see the email, try signing in with your email - you\'ll get a resend option.', { 
                      icon: 'ℹ️', 
                      duration: 5000 
                    });
                  }}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors rounded-sm ${
                    theme === 'dark'
                      ? 'bg-[#433E38] text-[#F5F2EB] hover:bg-[#5D5A53]'
                      : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                  }`}
                >
                  {t?.auth?.checkInboxButton || 'Check Inbox'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationMessage(false);
                    // After user confirms verification, switch to signin mode
                    if (onSwitchType) {
                      onSwitchType('signin');
                    }
                    setMode('email');
                    // Clear password fields for signin
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors border rounded-sm ${
                    theme === 'dark'
                      ? 'border-[#433E38] text-[#A8A29E] hover:bg-[#433E38]'
                      : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#D6D1C7]'
                  }`}
                >
                  {t?.auth?.iveVerified || 'I\'ve verified'}
                </button>
              </div>
            </div>
          )}

          {/* VIEW: EMAIL FORM */}
          {mode === 'email' && !showVerificationMessage && (
            <form className="space-y-4 animate-fade-in-up" onSubmit={handleEmailSubmit}>
              
              {/* Name Fields (Signup Only) */}
              {type === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text"
                    name="firstName"
                    placeholder={t?.auth?.firstName || 'First Name'}
                    value={formData.firstName}
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3 outline-none transition-colors text-sm rounded-sm ${
                      theme === 'dark'
                        ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]'
                        : 'bg-white border border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                    }`}
                  />
                  <input 
                    type="text" 
                    name="lastName"
                    placeholder={t?.auth?.lastName || 'Last Name'}
                    value={formData.lastName}
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3 outline-none transition-colors text-sm rounded-sm ${
                      theme === 'dark'
                        ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]'
                        : 'bg-white border border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                    }`}
                  />
                </div>
              )}

              <div>
              <input 
                type="email" 
                name="email"
                placeholder="name@work-email.com" 
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 outline-none transition-colors text-sm rounded-sm ${
                  theme === 'dark'
                      ? `bg-[#2C2A26] border ${emailError ? 'border-red-500' : 'border-[#433E38]'} text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]`
                      : `bg-white border ${emailError ? 'border-red-600' : 'border-[#D6D1C7]'} text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]`
                }`}
              />
                {emailError && (
                  <p className={`mt-1 text-xs ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>{emailError}</p>
                )}
              </div>
              
              <div>
                <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder={t?.auth?.password || 'Password'} 
                  value={formData.password}
                  onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-10 outline-none transition-colors text-sm rounded-sm ${
                    theme === 'dark'
                      ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]'
                      : 'bg-white border border-[#D6D1C7] text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]'
                  }`}
                />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1 rounded hover:bg-opacity-10 ${
                      theme === 'dark' 
                        ? 'text-[#A8A29E] hover:text-[#F5F2EB] hover:bg-[#F5F2EB]' 
                        : 'text-[#A8A29E] hover:text-[#2C2A26] hover:bg-[#2C2A26]'
                    }`}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3.98 8.223m8.25 3.75l3.75-3.75m-3.75 3.75l-3.75 3.75m3.75-3.75l3.75 3.75" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator (Signup Only) */}
                {type === 'signup' && formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-[#433E38]' : 'bg-[#EBE7DE]'
                      }`}>
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.strength === 'strong' 
                              ? (theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]') + ' w-full' :
                            passwordStrength.strength === 'good' 
                              ? (theme === 'dark' ? 'bg-[#A8A29E]' : 'bg-[#5D5A53]') + ' w-3/4' :
                            passwordStrength.strength === 'fair' 
                              ? (theme === 'dark' ? 'bg-[#5D5A53]' : 'bg-[#A8A29E]') + ' w-1/2' :
                              (theme === 'dark' ? 'bg-[#433E38]' : 'bg-[#D6D1C7]') + ' w-1/4'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                      }`}>
                        {passwordStrength.strength.toUpperCase()}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className={`text-xs space-y-0.5 ${
                        theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                      }`}>
                        {passwordRequirements.map(req => {
                          const met = req.test(formData.password);
                          return (
                            <div key={req.id} className={`flex items-center gap-1.5 ${
                              met 
                                ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]')
                                : ''
                            }`}>
                              <span className={`text-sm ${met ? '' : 'opacity-50'}`}>
                                {met ? '✓' : '○'}
                              </span>
                              <span>{req.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Confirm Password (Signup Only) */}
                {type === 'signup' && (
                  <div className="relative mt-4">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      placeholder={t?.auth?.confirmPassword || 'Confirm Password'} 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-10 outline-none transition-colors text-sm rounded-sm ${
                        theme === 'dark'
                          ? `bg-[#2C2A26] border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-[#433E38]'} text-[#F5F2EB] placeholder-[#A8A29E] focus:border-[#F5F2EB]`
                          : `bg-white border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-600' : 'border-[#D6D1C7]'} text-[#2C2A26] placeholder-[#A8A29E] focus:border-[#2C2A26]`
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1 rounded hover:bg-opacity-10 ${
                        theme === 'dark' 
                          ? 'text-[#A8A29E] hover:text-[#F5F2EB] hover:bg-[#F5F2EB]' 
                          : 'text-[#A8A29E] hover:text-[#2C2A26] hover:bg-[#2C2A26]'
                      }`}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228L3.98 8.223m8.25 3.75l3.75-3.75m-3.75 3.75l-3.75 3.75m3.75-3.75l3.75 3.75" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className={`mt-1 text-xs ${
                        theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>{t?.auth?.passwordsNotMatch || 'Passwords do not match'}</p>
                    )}
                  </div>
                )}
                
                {/* Forgot Password Link - VISIBLE ONLY IN SIGN IN */}
                {type === 'signin' && (
                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={`w-4 h-4 rounded transition-colors ${
                          theme === 'dark'
                            ? 'border-[#433E38] bg-[#2C2A26] text-[#F5F2EB] focus:ring-[#F5F2EB] checked:bg-[#F5F2EB] checked:border-[#F5F2EB]'
                            : 'border-[#D6D1C7] bg-white text-[#2C2A26] focus:ring-[#2C2A26] checked:bg-[#2C2A26] checked:border-[#2C2A26]'
                        }`}
                      />
                      <span className={`text-xs transition-colors ${
                        theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                      }`}>
                        {t?.auth?.rememberMe || 'Remember me'}
                      </span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot_password')}
                      className={`text-xs font-medium transition-colors hover:underline ${
                        theme === 'dark' ? 'text-[#A8A29E] hover:text-[#F5F2EB]' : 'text-[#5D5A53] hover:text-[#2C2A26]'
                      }`}
                    >
                      {t?.auth?.forgotPassword || 'Forgot Password?'}
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 text-xs font-medium uppercase tracking-widest transition-colors disabled:opacity-50 rounded-sm mt-2 ${
                  theme === 'dark'
                    ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-[#EBE7DE]'
                    : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                }`}
              >
                {loading ? (t?.auth?.processing || 'Processing...') : (type === 'signin' ? (t?.auth?.signIn || 'Sign In') : (t?.auth?.createAccount || 'Create Account'))}
              </button>

              <div className="pt-4">
                {type === 'signin' ? (
                  <p className={`text-xs transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.newHere || 'New here?'} <button type="button" onClick={() => switchAuth('signup')} className={`font-bold transition-colors duration-300 hover:underline ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{t?.auth?.createAnAccount || 'Create an account'}</button>
                  </p>
                ) : (
                  <p className={`text-xs transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>
                    {t?.auth?.memberAlready || 'Member already?'} <button type="button" onClick={() => switchAuth('signin')} className={`font-bold transition-colors duration-300 hover:underline ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{t?.auth?.logIn || 'Log in'}</button>
                  </p>
                )}
              </div>
            </form>
          )}

          {mode !== 'forgot_password' && (
            <p className={`mt-8 text-xs font-light transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
            }`}>
              {t?.auth?.agreeTerms || 'By clicking continue, you agree to our'} <button 
                type="button"
                onClick={(e) => handleLegalNav(e, 'terms')} 
                className={`underline transition-colors duration-300 hover:underline ${
                  theme === 'dark' ? 'hover:text-[#F5F2EB]' : 'hover:text-[#2C2A26]'
                }`}
              >{t?.footer?.termsOfService || 'Terms of Service'}</button> {t?.auth?.and || 'and'} <button 
                type="button"
                onClick={(e) => handleLegalNav(e, 'privacy')} 
                className={`underline transition-colors duration-300 hover:underline ${
                  theme === 'dark' ? 'hover:text-[#F5F2EB]' : 'hover:text-[#2C2A26]'
                }`}
              >{t?.footer?.privacyPolicy || 'Privacy Policy'}</button>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ icon, label, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-center gap-3 py-3 transition-colors group rounded-sm ${
        theme === 'dark'
          ? 'bg-[#2C2A26] border border-[#433E38] hover:bg-[#433E38]/80'
          : 'bg-white border border-[#D6D1C7] hover:bg-[#EBE7DE]'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon === 'google' && (
          <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        )}
        {icon === 'facebook' && (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        )}
        {icon === 'tiktok' && (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill={theme === 'dark' ? '#FFFFFF' : '#000000'}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
        )}
      </span>
      <span className={`text-sm font-medium transition-colors ${
        theme === 'dark'
          ? 'text-[#F5F2EB] group-hover:text-white'
          : 'text-[#5D5A53] group-hover:text-[#2C2A26]'
      }`}>{label}</span>
    </button>
  )
}

export default AuthModal;
