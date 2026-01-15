import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const PaymentModal = ({ isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [method, setMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cardNumber') {
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (name === 'cvc') {
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
        onSave({ ...formData, paymentMethod: method });
        setIsSaving(false);
        onClose();
    }, 1500);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 min-h-screen" 
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'auto'
      }}
    >
      {/* Backdrop - Fixed to cover entire viewport */}
      <div 
        className="fixed inset-0 bg-[#2C2A26]/60 backdrop-blur-sm transition-opacity"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
        onClick={onClose}
      />

      {/* Modal Content - Centered */}
      <div 
        className={`relative w-full max-w-md shadow-2xl overflow-hidden border rounded-sm transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-[#1C1B19] border-[#433E38]' 
            : 'bg-[#F5F2EB] border-[#D6D1C7]'
        }`}
        style={{
          position: 'relative',
          zIndex: 10000,
          margin: 'auto'
        }}
      >
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b transition-colors ${
          theme === 'dark' ? 'border-[#433E38]' : 'border-[#D6D1C7]'
        }`}>
            <h3 className={`text-xl font-serif transition-colors ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>{t?.billing?.checkoutSettings || 'Checkout Settings'}</h3>
            <button 
              onClick={onClose} 
              className={`transition-colors ${
                theme === 'dark' 
                  ? 'text-[#A8A29E] hover:text-[#F5F2EB]' 
                  : 'text-[#A8A29E] hover:text-[#2C2A26]'
              }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Payment Method Switcher */}
        <div className={`flex p-1 mx-8 mt-6 rounded-sm transition-colors ${
          theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#EBE7DE]'
        }`}>
            <button 
                onClick={() => setMethod('stripe')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                  method === 'stripe' 
                    ? theme === 'dark'
                      ? 'bg-[#433E38] text-[#F5F2EB] shadow-sm'
                      : 'bg-white text-[#2C2A26] shadow-sm'
                    : 'text-[#A8A29E]'
                }`}
            >
                Stripe (Card)
            </button>
            <button 
                onClick={() => setMethod('payos')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                  method === 'payos' 
                    ? theme === 'dark'
                      ? 'bg-[#433E38] text-[#F5F2EB] shadow-sm'
                      : 'bg-white text-[#2C2A26] shadow-sm'
                    : 'text-[#A8A29E]'
                }`}
            >
                PayOS (QR Code)
            </button>
        </div>

        <div className="p-8">
            {method === 'stripe' ? (
                /* STRIPE INTERFACE */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`bg-gradient-to-br rounded-lg p-6 shadow-lg mb-6 relative overflow-hidden transition-colors ${
                      theme === 'dark' 
                        ? 'from-[#2C2A26] to-[#433E38] text-[#F5F2EB]' 
                        : 'from-[#2C2A26] to-[#433E38] text-[#F5F2EB]'
                    }`}>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-10 h-6 rounded-sm ${
                              theme === 'dark' ? 'bg-[#F5F2EB]/20' : 'bg-[#F5F2EB]/20'
                            }`}></div>
                            <span className="text-xs uppercase tracking-widest font-bold opacity-50">Stripe Secure</span>
                        </div>
                        <div className="text-xl font-mono tracking-widest mb-4">
                            {formData.cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Card Holder</div>
                                <div className="text-sm font-medium uppercase tracking-wide">{formData.name || 'YOUR NAME'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Expires</div>
                                <div className="text-sm font-medium">{formData.expiry || 'MM/YY'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors ${
                              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                            }`}>Card Number</label>
                            <input 
                                type="text" 
                                name="cardNumber"
                                placeholder="0000 0000 0000 0000"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                className={`w-full border px-4 py-3 outline-none focus:border-[#2C2A26] dark:focus:border-[#F5F2EB] transition-colors rounded-sm text-sm ${
                                  theme === 'dark'
                                    ? 'bg-[#2C2A26] border-[#433E38] text-[#F5F2EB]'
                                    : 'bg-white border-[#D6D1C7] text-[#2C2A26]'
                                }`}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="text" 
                                name="expiry"
                                placeholder="MM/YY"
                                value={formData.expiry}
                                onChange={handleInputChange}
                                className={`w-full border px-4 py-3 outline-none focus:border-[#2C2A26] dark:focus:border-[#F5F2EB] transition-colors rounded-sm text-sm ${
                                  theme === 'dark'
                                    ? 'bg-[#2C2A26] border-[#433E38] text-[#F5F2EB]'
                                    : 'bg-white border-[#D6D1C7] text-[#2C2A26]'
                                }`}
                                required
                            />
                            <input 
                                type="text" 
                                name="cvc"
                                placeholder="CVC"
                                value={formData.cvc}
                                onChange={handleInputChange}
                                className={`w-full border px-4 py-3 outline-none focus:border-[#2C2A26] dark:focus:border-[#F5F2EB] transition-colors rounded-sm text-sm ${
                                  theme === 'dark'
                                    ? 'bg-[#2C2A26] border-[#433E38] text-[#F5F2EB]'
                                    : 'bg-white border-[#D6D1C7] text-[#2C2A26]'
                                }`}
                                required
                            />
                        </div>
                    </div>
                </form>
            ) : (
                /* PAYOS INTERFACE */
                <div className="space-y-6">
                    <div className={`border p-6 rounded-sm text-center transition-colors ${
                      theme === 'dark' 
                        ? 'bg-[#2C2A26] border-[#433E38]' 
                        : 'bg-white border-[#D6D1C7]'
                    }`}>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 transition-colors ${
                          theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                        }`}>Scan QR to Upgrade</p>
                        <div className={`relative mx-auto w-48 h-48 flex items-center justify-center p-2 mb-4 border-2 transition-colors ${
                          theme === 'dark'
                            ? 'bg-[#1C1B19] border-[#F5F2EB]'
                            : 'bg-[#F5F2EB] border-[#2C2A26]'
                        }`}>
                            {/* Mock QR Code */}
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYOS_MOCK_PAYMENT_URL" 
                                alt="Payment QR" 
                                className="w-full h-full grayscale brightness-90"
                            />
                            <div className={`absolute inset-0 border-4 pointer-events-none transition-colors ${
                              theme === 'dark' ? 'border-[#1C1B19]' : 'border-[#F5F2EB]'
                            }`}></div>
                        </div>
                        <div className="space-y-1">
                            <p className={`text-sm font-bold transition-colors ${
                              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>VietQR / PayOS</p>
                            <p className={`text-[10px] transition-colors ${
                              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                            }`}>Automatic confirmation within 60s</p>
                        </div>
                    </div>

                    <div className={`p-4 border space-y-3 transition-colors ${
                      theme === 'dark'
                        ? 'bg-black/20 border-[#433E38]'
                        : 'bg-[#F9F8F6] border-[#D6D1C7]'
                    }`}>
                        <div className="flex justify-between text-xs">
                            <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}>Bank</span>
                            <span className={`font-bold transition-colors ${
                              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>MB Bank</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}>Account</span>
                            <span className={`font-bold transition-colors ${
                              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>0345678910</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}>Amount</span>
                            <span className={`font-bold transition-colors ${
                              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>725,000 VND</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Common Footer Actions */}
            <div className={`mt-8 flex justify-end gap-3 pt-6 border-t transition-colors ${
              theme === 'dark' ? 'border-[#433E38]' : 'border-[#D6D1C7]'
            }`}>
                <button 
                    onClick={onClose}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      theme === 'dark'
                        ? 'text-[#A8A29E] hover:text-[#F5F2EB]'
                        : 'text-[#A8A29E] hover:text-[#2C2A26]'
                    }`}
                >
                    {t?.billing?.cancel || 'Cancel'}
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-white'
                        : 'bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]'
                    }`}
                >
                    {isSaving && (
                      <div className={`w-3 h-3 border-2 rounded-full animate-spin ${
                        theme === 'dark'
                          ? 'border-[#2C2A26]/30 border-t-[#2C2A26]'
                          : 'border-white/30 border-t-white'
                      }`}></div>
                    )}
                    {method === 'stripe' ? (t?.billing?.saveAndUpgrade || 'Save & Upgrade') : (t?.billing?.iHavePaid || 'I have paid')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to body to avoid z-index issues
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default PaymentModal;
