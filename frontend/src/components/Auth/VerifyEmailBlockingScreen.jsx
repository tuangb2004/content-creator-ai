import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import toast from '../../utils/toast';

/**
 * VerifyEmailBlockingScreen - Modal blocking component
 * 
 * Flow chuẩn industry:
 * - User đã login nhưng chưa verify email
 * - Show modal (không full-screen) để block app
 * - Poll user.reload() để check verification status
 * - Có nút back để sign out và quay về landing page
 * - Auto redirect khi verified
 */
function VerifyEmailBlockingScreen() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Poll user.reload() mỗi 3 giây để check verification
  useEffect(() => {
    if (!user || user.emailVerified) {
      return;
    }

    const pollVerification = async () => {
      try {
        await auth.currentUser?.reload();
        const updatedUser = auth.currentUser;
        
        if (updatedUser?.emailVerified) {
          // Email verified! Redirect to dashboard
          console.log('[VerifyEmailBlockingScreen] Email verified, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('[VerifyEmailBlockingScreen] Error checking verification:', error);
      }
    };

    // Poll immediately, then every 3 seconds
    pollVerification();
    const interval = setInterval(pollVerification, 3000);
    setPollingInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user, navigate]);

  // Manual check button
  const handleCheckVerification = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      await auth.currentUser?.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        console.log('[VerifyEmailBlockingScreen] Email verified via manual check');
        navigate('/dashboard', { replace: true });
      } else {
        // Still not verified
        toast.info(t?.auth?.emailNotVerifiedYet || 'Email not verified yet. Please check your email and click the verification link.');
      }
    } catch (error) {
      console.error('[VerifyEmailBlockingScreen] Error checking verification:', error);
      toast.error(t?.auth?.errorCheckingVerification || 'Error checking verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (!user) return;
    
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(user);
      toast.success(t?.auth?.verificationEmailResent || 'Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('[VerifyEmailBlockingScreen] Error resending verification email:', error);
      toast.error(t?.auth?.failedToResendEmail || 'Failed to resend verification email. Please try again.');
    }
  };

  // Open email client
  const openEmailClient = () => {
    if (!user?.email) return;
    
    const emailDomain = user.email.split('@')[1]?.toLowerCase() || '';
    const emailProviders = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail',
    };
    
    const emailUrl = emailProviders[emailDomain] || `mailto:${user.email}`;
    window.open(emailUrl, '_blank');
  };

  // Handle back to landing page - sign out and redirect
  const handleBackToLanding = async () => {
    try {
      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[VerifyEmailBlockingScreen] Error signing out:', error);
      // Still redirect even if sign out fails
      navigate('/', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C2A26] dark:border-[#F5F2EB] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || user.emailVerified) {
    // Should not happen, but redirect to dashboard if user is verified
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop - mờ trong suốt như AuthModal, che background trắng */}
      {/* Tăng opacity để che background trắng của page */}
      <div 
        className="absolute inset-0 bg-[#2C2A26]/50 dark:bg-black/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-[#F5F2EB] dark:bg-[#1C1B19] w-full max-w-md shadow-2xl overflow-hidden border border-[#D6D1C7] dark:border-[#433E38] animate-fade-in-up rounded-sm transition-all duration-300">
        
        {/* Back Button */}
        <button 
          onClick={handleBackToLanding}
          className="absolute top-4 left-4 text-[#A8A29E] hover:text-[#2C2A26] dark:hover:text-[#F5F2EB] transition-colors z-10 flex items-center gap-1 text-xs uppercase tracking-widest font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t?.auth?.back || 'Back'}
        </button>

        <div className="p-8 md:p-10 text-center">
          {/* Large Email Icon */}
          <div className={`w-20 h-20 bg-[#2C2A26] dark:bg-[#F5F2EB] rounded-full flex items-center justify-center mx-auto mb-8 text-[#F5F2EB] dark:text-[#2C2A26] shadow-xl`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839-2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V11.5z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-serif text-[#2C2A26] dark:text-[#F5F2EB] mb-3">
            {t?.auth?.verifyEmailRequired || 'Verify Your Email'}
          </h2>

          {/* Message */}
          <p className="text-[#5D5A53] dark:text-[#A8A29E] font-light text-sm mb-6 leading-relaxed">
            {t?.auth?.verificationEmailSent || 'We\'ve sent a verification link to'} <br/>
            <span className="font-bold text-[#2C2A26] dark:text-[#F5F2EB]">{user.email}</span>. <br/>
            {t?.auth?.pleaseVerifyEmail || 'Please click the link in the email to continue.'}
          </p>

          {/* Info Text */}
          <div className="mb-8">
            <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest">
              {t?.auth?.checkingAutomatically || 'We\'re checking automatically...'}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            {/* Check Email Button */}
            <button
              onClick={openEmailClient}
              className="w-full bg-[#2C2A26] dark:bg-[#F5F2EB] text-[#F5F2EB] dark:text-[#2C2A26] py-4 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              {t?.auth?.checkEmail || 'Open Mail App'}
            </button>

            {/* I've Verified Button */}
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] text-[#5D5A53] dark:text-[#A8A29E] py-3 text-xs font-medium uppercase tracking-widest hover:bg-[#EBE7DE] dark:hover:bg-[#433E38]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking 
                ? (t?.auth?.checking || 'Checking...')
                : (t?.auth?.iveVerified || 'I\'ve Verified')
              }
            </button>

            {/* Didn't receive email text with resend link */}
            <div className="pt-4 text-center">
              <p className="text-[#5D5A53] dark:text-[#A8A29E] text-xs font-light">
                {t?.auth?.didntReceiveEmail || "Didn't receive the email?"}{' '}
                <button
                  onClick={handleResendEmail}
                  className="font-bold text-[#2C2A26] dark:text-[#F5F2EB] hover:underline underline-offset-2"
                >
                  {t?.auth?.resendLink || 'Resend Link'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailBlockingScreen;
