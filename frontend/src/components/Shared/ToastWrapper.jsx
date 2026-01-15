import { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ToastWrapper = () => {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  
  const baseStyle = {
    borderRadius: '2px',
    padding: '16px 18px',
    maxWidth: '420px',
    backdropFilter: 'blur(8px)',
    border: isDark ? '1px solid #433E38' : '1px solid #D6D1C7',
    boxShadow: isDark
      ? '0 20px 35px rgba(0,0,0,0.35)'
      : '0 20px 35px rgba(0,0,0,0.12)',
    fontSize: '13px',
    fontWeight: 500
  };

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4500,
        style: {
          background: isDark ? 'rgba(28,27,25,0.92)' : 'rgba(255,255,255,0.92)',
          color: isDark ? '#F5F2EB' : '#2C2A26',
          ...baseStyle
        },
        success: {
          icon: (
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${
                isDark ? 'text-emerald-200' : 'text-emerald-700'
              }`} />
            </div>
          ),
          style: {
            background: isDark ? 'rgba(6,78,59,0.2)' : 'rgba(236,253,245,0.9)',
            color: isDark ? '#ECFDF5' : '#065F46',
            border: '1px solid rgba(16,185,129,0.35)',
            ...baseStyle
          }
        },
        error: {
          icon: (
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-rose-900/30' : 'bg-rose-100'
            }`}>
              <XCircle className={`w-4 h-4 ${
                isDark ? 'text-rose-200' : 'text-rose-700'
              }`} />
            </div>
          ),
          style: {
            background: isDark ? 'rgba(127,29,29,0.2)' : 'rgba(254,242,242,0.9)',
            color: isDark ? '#FEE2E2' : '#991B1B',
            border: '1px solid rgba(244,63,94,0.35)',
            ...baseStyle
          }
        },
        loading: {
          icon: (
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <Info className={`w-4 h-4 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} />
            </div>
          )
        },
        iconTheme: {
          primary: isDark ? '#F5F2EB' : '#2C2A26',
          secondary: isDark ? '#2C2A26' : '#F5F2EB'
        },
        className: 'border'
      }}
    />
  );
};

export default ToastWrapper;

