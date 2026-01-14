import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const EmailVerificationBanner = () => {
  const { user, resendVerificationEmail } = useAuth();
  const { theme } = useTheme();
  const [isResending, setIsResending] = useState(false);

  // Don't show if user is verified or no user
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      
      // Check if we're using emulator
      const isEmulator = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isEmulator) {
        toast('Note: Email verification is disabled in emulator mode. In production, the email would be sent.', {
          icon: 'ℹ️',
          duration: 4000
        });
      } else {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${
      theme === 'dark'
        ? 'bg-[#2C2A26] border-[#A8A29E] text-[#F5F2EB]'
        : 'bg-[#EBE7DE] border-[#A8A29E] text-[#2C2A26]'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h3 className={`font-semibold text-sm ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>Verify your email address</h3>
          </div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>
            We've sent a verification email to <strong className={theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}>{user.email}</strong>. Please check your inbox and click the verification link to activate your account.
          </p>
        </div>
        <button
          onClick={handleResend}
          disabled={isResending}
          className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            theme === 'dark'
              ? 'bg-[#433E38] text-[#F5F2EB] hover:bg-[#5D5A53] disabled:opacity-50'
              : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38] disabled:opacity-50'
          }`}
        >
          {isResending ? 'Sending...' : 'Resend'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

