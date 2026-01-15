/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setToastHandler } from '../utils/toast';

const ToastContext = createContext(null);

const ToastIcon = ({ type }) => {
  if (type === 'success') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (type === 'warning') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  if (type === 'ai') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const typeStyles = {
    success: 'border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-500/50 bg-rose-50/90 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100',
    warning: 'border-amber-500/50 bg-amber-50/90 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100',
    info: 'border-slate-500/50 bg-slate-50/90 dark:bg-slate-900/20 text-slate-900 dark:text-slate-100',
    ai: 'border-yellow-600/50 bg-white/90 dark:bg-black/80 text-yellow-900 dark:text-yellow-100 shadow-[0_0_20px_rgba(202,138,4,0.15)]'
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-4 p-5 border backdrop-blur-md rounded-sm shadow-xl transition-all duration-500 animate-fade-in-up ${typeStyles[toast.type]}`}>
      <div className="mt-0.5 opacity-80">
        <ToastIcon type={toast.type} />
      </div>
      <div className="flex-1">
        <h4 className="font-serif text-lg leading-tight mb-1">{toast.title}</h4>
        <p className="font-sans text-xs opacity-80 font-light leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="opacity-40 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type, title, message, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  useEffect(() => {
    setToastHandler(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};

