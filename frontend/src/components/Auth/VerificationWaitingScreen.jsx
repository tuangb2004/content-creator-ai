import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Component to show "Check your email" message after registration
 * Flow chuẩn: Chỉ hiển thị message, không poll, không auto-login
 * User phải verify email và login lại
 */
function VerificationWaitingScreen({ email, onComplete }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

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

  const handleBackToLogin = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md p-8 rounded-lg border ${
        theme === 'dark'
          ? 'bg-[#1C1B19] border-[#433E38]'
          : 'bg-[#F5F2EB] border-[#D6D1C7]'
      }`}>
        <div className="text-center">
          {/* Email Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-[#433E38] text-[#F5F2EB]' : 'bg-[#D6D1C7] text-[#2C2A26]'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          {/* Title */}
          <h2 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>
            {t?.auth?.checkYourEmail || 'Check your email'}
          </h2>

          {/* Message */}
          <p className={`text-sm mb-6 ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>
            {t?.auth?.verificationEmailSent || 'We\'ve sent a verification email to'} <strong className={theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}>{email}</strong>.
            <br /><br />
            {t?.auth?.pleaseVerifyEmail || 'Please verify your email to continue.'}
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

          {/* Back to Login Button */}
          <button
            onClick={handleBackToLogin}
            className={`w-full py-2 px-4 rounded-sm border transition-colors ${
              theme === 'dark'
                ? 'border-[#433E38] text-[#A8A29E] hover:bg-[#433E38] hover:text-[#F5F2EB]'
                : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#D6D1C7] hover:text-[#2C2A26]'
            }`}
          >
            {t?.auth?.backToLogin || 'Back to Login'}
          </button>

          {/* Info Text */}
          <p className={`text-xs mt-4 ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>
            {t?.auth?.afterVerifyingLogin || 'After verifying, you can sign in to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationWaitingScreen;
