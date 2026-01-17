import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from '../utils/toast';

/**
 * Page to handle email verification from email link
 * Flow chuẩn: CHỈ verify email, không login, không redirect
 * URL: /verify-email?oobCode=...&mode=verifyEmail
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleVerification = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode || mode !== 'verifyEmail') {
        setStatus('error');
        toast.error(t?.auth?.invalidLink || 'Invalid verification link');
        return;
      }

      try {
        // CHỈ làm đúng 1 việc: Verify email trong Firebase Auth
        await applyActionCode(auth, oobCode);
        
        setStatus('success');
        toast.success(t?.auth?.emailVerified || 'Email verified successfully');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        
        let errorMessage = t?.auth?.verificationFailed || 'Verification failed';
        if (error?.code === 'auth/expired-action-code') {
          errorMessage = t?.auth?.linkExpired || 'Verification link has expired';
        } else if (error?.code === 'auth/invalid-action-code') {
          errorMessage = t?.auth?.invalidLink || 'Invalid verification link';
        }
        
        toast.error(errorMessage);
      }
    };

    handleVerification();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`w-full max-w-md p-8 rounded-lg border ${
        theme === 'dark'
          ? 'bg-[#1C1B19] border-[#433E38]'
          : 'bg-[#F5F2EB] border-[#D6D1C7]'
      }`}>
        {status === 'processing' && (
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin ${
              theme === 'dark' ? 'border-[#F5F2EB]' : 'border-[#2C2A26]'
            }`}></div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>
              {t?.auth?.verifyingEmail || 'Verifying Email...'}
            </h2>
          </div>
        )}

        {status === 'success' && (
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
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.youCanNowSignIn || 'You can now return to the app and sign in.'}
            </p>
            <button
              onClick={() => window.close()}
              className={`px-4 py-2 rounded-sm border transition-colors ${
                theme === 'dark'
                  ? 'border-[#433E38] text-[#A8A29E] hover:bg-[#433E38] hover:text-[#F5F2EB]'
                  : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#D6D1C7] hover:text-[#2C2A26]'
              }`}
            >
              {t?.auth?.closeTab || 'Close Tab'}
            </button>
          </div>
        )}

        {status === 'error' && (
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
              {t?.auth?.error || 'Error'}
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              {t?.auth?.verificationFailed || 'Verification failed. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

