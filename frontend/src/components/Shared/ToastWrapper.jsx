import { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ToastWrapper = () => {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#2C2A26' : '#F5F2EB',
          color: isDark ? '#F5F2EB' : '#2C2A26',
          padding: '0',
          borderRadius: '0',
          boxShadow: isDark 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: isDark ? '1px solid #433E38' : '1px solid #D6D1C7',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        },
        success: {
          icon: (
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-[#433E38]' : 'bg-[#EBE7DE]'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${
                isDark ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
              }`} />
            </div>
          ),
          style: {
            background: isDark ? '#2C2A26' : '#F5F2EB',
            color: isDark ? '#F5F2EB' : '#2C2A26',
            border: isDark ? '1px solid #433E38' : '1px solid #D6D1C7',
            padding: '14px 16px',
          },
        },
        error: {
          icon: (
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-[#433E38]' : 'bg-[#EBE7DE]'
            }`}>
              <XCircle className={`w-4 h-4 ${
                isDark ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
              }`} />
            </div>
          ),
          style: {
            background: isDark ? '#2C2A26' : '#F5F2EB',
            color: isDark ? '#F5F2EB' : '#2C2A26',
            border: isDark ? '1px solid #433E38' : '1px solid #D6D1C7',
            padding: '14px 16px',
          },
        },
      }}
    />
  );
};

export default ToastWrapper;

