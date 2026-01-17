import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from '../../utils/toast';

/**
 * Component to poll session status and auto-login when verified
 * Shows "Waiting for verification" screen
 */
function VerificationWaitingScreen({ email, sessionId, onComplete }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [countdown, setCountdown] = useState(600); // 10 minutes

  // Check if email is verified by polling Firebase Auth directly
  const checkEmailVerified = async () => {
    try {
      const password = localStorage.getItem('pendingVerificationPassword');
      if (!password) {
        return; // No password stored, cannot check
      }

      const decodedPassword = atob(password);
      
      // Silent sign-in to check emailVerified status
      const userCredential = await signInWithEmailAndPassword(auth, email, decodedPassword);
      
      // Reload to get latest emailVerified status
      await userCredential.user.reload();
      
      if (userCredential.user.emailVerified) {
        setStatus('verified');
        
        // Clean up localStorage
        localStorage.removeItem('pendingVerificationSessionId');
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('pendingVerificationPassword');
        
        toast.success(t?.auth?.emailVerifiedSuccess || 'Email verified! Logging in...');
        
        // Mark session as completed if sessionId exists (optional)
        if (sessionId) {
          try {
            const markCompleted = httpsCallable(functions, 'markSessionCompletedCallable');
            await markCompleted({ session_id: sessionId });
          } catch (e) {
            console.warn('Failed to mark session completed:', e);
            // Continue anyway - session is optional
          }
        }
        
        if (onComplete) {
          onComplete();
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
        return true; // Email is verified
      }
      
      // Email not verified yet - sign out to avoid staying logged in
      await auth.signOut();
      return false;
    } catch (error) {
      // If login fails (e.g., wrong password or user not found), that's OK
      // Just means email not verified yet
      if (error.code !== 'auth/invalid-credential' && error.code !== 'auth/user-not-found') {
        console.error('Error checking email verified:', error);
      }
      return false;
    }
  };

  // Optional: Poll session status for faster cross-device detection (only if sessionId exists)
  const pollSessionStatus = async () => {
    if (!sessionId) {
      return;
    }

    try {
      const getSessionStatus = httpsCallable(functions, 'getSessionStatusCallable');
      const result = await getSessionStatus({ session_id: sessionId });
      const sessionStatus = result.data?.status;
      
      // If session is verified, trigger email check immediately
      if (sessionStatus === 'verified') {
        await checkEmailVerified();
      } else if (sessionStatus === 'expired') {
        setStatus('expired');
        toast.error(t?.auth?.sessionExpired || 'Verification link expired. Please request a new one.');
      }
    } catch (error) {
      // Session poll error is not critical - we still poll Firebase Auth directly
      console.warn('Error polling session status:', error);
    }
  };

  useEffect(() => {
    // PRIMARY: Poll Firebase Auth directly (source of truth)
    // This works even without sessionId
    checkEmailVerified();
    const authPollInterval = setInterval(checkEmailVerified, 1500);

    // SECONDARY (OPTIONAL): Poll session for faster cross-device detection
    // Only if sessionId exists - this is an optimization, not required
    let sessionPollInterval = null;
    if (sessionId) {
      pollSessionStatus();
      sessionPollInterval = setInterval(pollSessionStatus, 1500);
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(authPollInterval);
      if (sessionPollInterval) {
        clearInterval(sessionPollInterval);
      }
      clearInterval(countdownInterval);
    };
  }, [sessionId, email, navigate, onComplete, t]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Open email client (Gmail or default email app)
  const openEmailClient = () => {
    // Extract domain from email
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    
    // Map common email providers to their web URLs
    const emailProviders = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail',
    };
    
    const emailUrl = emailProviders[emailDomain] || `mailto:${email}`;
    window.open(emailUrl, '_blank');
  };

  // Allow component to be used as modal content or standalone
  const containerClass = 'flex items-center justify-center px-4 py-8';
  const contentClass = `w-full max-w-md p-8 rounded-lg border ${
    theme === 'dark'
      ? 'bg-[#1C1B19] border-[#433E38]'
      : 'bg-[#F5F2EB] border-[#D6D1C7]'
  }`;

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {status === 'pending' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin ${
              theme === 'dark' ? 'border-[#F5F2EB]' : 'border-[#2C2A26]'
            }`}></div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>
              {t?.auth?.waitingVerification || 'Waiting for Email Verification'}
            </h2>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.checkEmailVerify || 'Please check your email and click the verification link.'}
            </p>
            
            {/* Check Email Button */}
            <button
              onClick={openEmailClient}
              className={`w-full py-3 px-4 mb-4 rounded-sm border transition-colors flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-[#2C2A26] border-[#433E38] text-[#F5F2EB] hover:bg-[#433E38]'
                  : 'bg-[#2C2A26] border-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="font-medium">
                {t?.auth?.checkEmail || 'Check Email'}
              </span>
            </button>
            
            <p className={`text-xs ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.timeRemaining || 'Time remaining'}: {formatTime(countdown)}
            </p>
            <p className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.autoLoginWhenVerified || 'You will be automatically logged in once verified.'}
            </p>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.worksOnAnyDevice || 'Works on any device - verify on any device and this page will automatically update.'}
            </p>
          </div>
        )}

        {status === 'verified' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-[#433E38] text-[#F5F2EB]' : 'bg-[#D6D1C7] text-[#2C2A26]'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>
              {t?.auth?.emailVerified || 'Email Verified!'}
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.loggingIn || 'Logging you in...'}
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>
              {t?.auth?.sessionExpired || 'Session Expired'}
            </h2>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.pleaseRequestNew || 'Please request a new verification email.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationWaitingScreen;

