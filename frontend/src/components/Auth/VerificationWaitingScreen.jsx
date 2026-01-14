import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const pollSessionStatus = async () => {
      try {
        // Call Cloud Function to get session status
        const getSessionStatus = httpsCallable(functions, 'getSessionStatusCallable');
        const result = await getSessionStatus({ session_id: sessionId });
        
        const sessionStatus = result.data?.status;
        
        if (sessionStatus === 'verified') {
          setStatus('verified');
          
          // Auto-login user
          try {
            const password = localStorage.getItem('pendingVerificationPassword');
            if (password) {
              const decodedPassword = atob(password);
              const userCredential = await signInWithEmailAndPassword(auth, email, decodedPassword);
              
              // Reload to get latest emailVerified status
              await userCredential.user.reload();
              
              if (userCredential.user.emailVerified) {
                // Clean up
                localStorage.removeItem('pendingVerificationSessionId');
                localStorage.removeItem('pendingVerificationEmail');
                localStorage.removeItem('pendingVerificationPassword');
                
                toast.success(t?.auth?.emailVerifiedSuccess || 'Email verified! Logging in...');
                
                // Mark session as completed
                try {
                  const markCompleted = httpsCallable(functions, 'markSessionCompletedCallable');
                  await markCompleted({ session_id: sessionId });
                } catch (e) {
                  console.warn('Failed to mark session completed:', e);
                }
                
                if (onComplete) {
                  onComplete();
                }
                
                // Redirect to dashboard
                setTimeout(() => {
                  navigate('/dashboard');
                }, 1000);
              }
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError);
            toast.error(t?.auth?.autoLoginFailed || 'Failed to auto-login. Please sign in manually.');
            setStatus('error');
          }
        } else if (sessionStatus === 'expired') {
          setStatus('expired');
          toast.error(t?.auth?.sessionExpired || 'Verification link expired. Please request a new one.');
        } else if (sessionStatus === 'completed') {
          // Already completed, user should be logged in
          setStatus('completed');
        }
      } catch (error) {
        console.error('Error polling session status:', error);
        // Don't show error for every poll, only log it
      }
    };

    // Poll every 2 seconds
    const intervalId = setInterval(pollSessionStatus, 2000);
    
    // Initial poll
    pollSessionStatus();

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
      clearInterval(intervalId);
      clearInterval(countdownInterval);
    };
  }, [sessionId, email, navigate, onComplete, t]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 rounded-lg border ${
        theme === 'dark'
          ? 'bg-[#1C1B19] border-[#433E38]'
          : 'bg-[#F5F2EB] border-[#D6D1C7]'
      }`}>
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

