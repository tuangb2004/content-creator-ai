import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Component to show "Check your email" message after registration
 * Flow chuẩn: Chỉ hiển thị message, không poll, không auto-login
 * User phải verify email và login lại
 * Style: Áp dụng từ creatorai-studio với animation mượt mà
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
    <div className="animate-fade-in-up py-4">
      {/* Large Email Icon */}
      <div className={`w-20 h-20 bg-[#2C2A26] dark:bg-[#F5F2EB] rounded-full flex items-center justify-center mx-auto mb-8 text-[#F5F2EB] dark:text-[#2C2A26] shadow-xl`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839-2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V11.5z" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-serif text-[#2C2A26] dark:text-[#F5F2EB] mb-3">
        {t?.auth?.checkYourEmail || 'Check your email'}
      </h2>

      {/* Message */}
      <p className="text-[#5D5A53] dark:text-[#A8A29E] font-light text-sm mb-10 leading-relaxed">
        {t?.auth?.verificationEmailSent || 'We\'ve sent a verification link to'} <br/>
        <span className="font-bold text-[#2C2A26] dark:text-[#F5F2EB]">{email}</span>. <br/>
        {t?.auth?.pleaseVerifyEmail || 'Please click the link in the email to activate your studio.'}
      </p>

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

        {/* Back to Login Button */}
        <button
          onClick={handleBackToLogin}
          className="w-full bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] text-[#5D5A53] dark:text-[#A8A29E] py-3 text-xs font-medium uppercase tracking-widest hover:bg-[#EBE7DE] dark:hover:bg-[#433E38]/80 transition-colors"
        >
          {t?.auth?.backToLogin || 'Back to Login'}
        </button>

        {/* Info Text */}
        <div className="pt-4">
          <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest">
            {t?.auth?.afterVerifyingLogin || 'After verifying, you can sign in to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationWaitingScreen;
