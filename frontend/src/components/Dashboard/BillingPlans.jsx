import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createPaymentLink, ErrorTypes, isErrorType } from '../../services/firebaseFunctions';
import toast from 'react-hot-toast';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const BillingPlans = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { userData, refreshUserData } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  // Map plan names to amounts (VND)
  const PLAN_PRICES = {
    pro_monthly: 690000, // 29 USD * 23800 VND/USD ≈ 690,000 VND
    pro_yearly: 5712000, // 24 USD/month * 12 * 23800 VND/USD ≈ 5,712,000 VND
    agency_monthly: 2356200, // 99 USD * 23800 VND/USD ≈ 2,356,200 VND
  };

  const currentPlan = userData?.plan || 'free';
  const currentCredits = userData?.credits || 0;
  const maxCredits = currentPlan === 'free' ? 10 : currentPlan === 'pro' ? 2000 : 10000;

  const handleUpgrade = async (planKey, planName) => {
    const amount = PLAN_PRICES[planKey];
    if (!amount) {
      toast.error(t?.billing?.planPriceNotConfigured || 'Plan price not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await createPaymentLink({
        amount: amount,
        planName: planKey,
        successUrl: `${window.location.origin}/dashboard?payment=success&plan=${planName}`,
        cancelUrl: `${window.location.origin}/dashboard?payment=cancel`
      });
      
      // Check if this is test mode (local URL)
      if (checkoutUrl.includes('localhost') || checkoutUrl.includes('payment=test')) {
        // Test mode: Simulate payment success
        toast.success(t?.billing?.testModePayment || 'Test Mode: Payment link created. Simulating successful payment...');
        // Redirect to success page
        window.location.href = checkoutUrl;
      } else {
        // Production: Redirect to PayOS checkout page
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (isErrorType(error, ErrorTypes.UNAUTHENTICATED)) {
        toast.error(t?.billing?.pleaseLogin || 'Please log in to upgrade your plan.');
      } else {
        toast.error(error.message || t?.billing?.failedToCreatePayment || 'Failed to create payment link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const plan = params.get('plan');

    if (paymentStatus === 'success') {
      toast.success(`${t?.billing?.successfullyUpgraded || 'Successfully upgraded to'} ${plan || 'Pro'} ${t?.billing?.plan || 'plan!'}`);
      if (refreshUserData) refreshUserData();
      window.history.replaceState({}, '', '/dashboard');
    } else if (paymentStatus === 'cancel') {
      toast.error(t?.billing?.paymentCancelled || 'Payment cancelled.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [refreshUserData]);

  const plans = [
    {
      id: 'starter',
      name: t?.billing?.starter?.name || 'Starter',
      desc: t?.billing?.starter?.desc || 'Essential tools for hobbyists.',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        t?.billing?.starter?.features?.credits || '10 Credits (One Time)', 
        t?.billing?.starter?.features?.tools || 'Basic Text Tools', 
        t?.billing?.starter?.features?.support || 'Standard Support'
      ],
      button: t?.billing?.currentPlan || 'Current Plan',
      active: currentPlan === 'free',
      highlight: false
    },
    {
      id: 'pro',
      name: t?.billing?.pro?.name || 'Pro Studio',
      desc: t?.billing?.pro?.desc || 'For professional creators.',
      priceMonthly: 29,
      priceYearly: 24,
      features: [
        t?.billing?.pro?.features?.credits || '2,000 Credits / mo', 
        t?.billing?.pro?.features?.tools || 'All AI Tools Access', 
        t?.billing?.pro?.features?.images || 'High-Res Image Gen', 
        t?.billing?.pro?.features?.support || 'Priority Support'
      ],
      button: t?.billing?.upgradeToPro || 'Upgrade to Pro',
      active: currentPlan === 'pro',
      highlight: true
    },
    {
      id: 'agency',
      name: t?.billing?.agency?.name || 'Agency',
      desc: t?.billing?.agency?.desc || 'Scale your content operations.',
      priceMonthly: 99,
      priceYearly: 79,
      features: [
        t?.billing?.agency?.features?.credits || '10,000 Credits / mo', 
        t?.billing?.agency?.features?.seats || 'Multi-seat Access (3)', 
        t?.billing?.agency?.features?.api || 'API Access', 
        t?.billing?.agency?.features?.models || 'Custom Models'
      ],
      button: t?.billing?.contactSales || 'Contact Sales',
      active: currentPlan === 'agency',
      highlight: false
    }
  ];

  return (
    <div className={`max-w-6xl mx-auto space-y-16 pb-24 relative`}>

      <div className="text-center max-w-2xl mx-auto">
        <h2 className={`text-4xl font-serif mb-4 transition-colors duration-300 ${
          theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
        }`}>{t?.billing?.title || 'Plans & Pricing'}</h2>
        <p className={`font-light text-lg transition-colors duration-300 ${
          theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
        }`}>{t?.billing?.subtitle || 'Choose the perfect plan for your creative workflow.'} <br/> {t?.billing?.subtitle2 || 'Upgrade or downgrade at any time.'}</p>
        
        {/* Toggle Switch */}
        <div className="flex justify-center items-center mt-8 gap-4">
          <span className={`text-xs uppercase tracking-widest font-bold transition-colors ${
            billingCycle === 'monthly' 
              ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]') 
              : 'text-[#A8A29E]'
          }`}>{t?.billing?.monthly || 'Monthly'}</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-14 h-8 rounded-full relative transition-colors focus:outline-none ${
              theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-md ${
              billingCycle === 'yearly' ? 'left-7' : 'left-1'
            } ${theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#F5F2EB]'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-widest font-bold transition-colors ${
              billingCycle === 'yearly' 
                ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]') 
                : 'text-[#A8A29E]'
            }`}>{t?.billing?.yearly || 'Yearly'}</span>
            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">{t?.billing?.save20 || 'Save 20%'}</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-sm transition-all duration-300 ${
              plan.highlight 
                ? (theme === 'dark' 
                    ? 'bg-[#433E38] text-[#F5F2EB] shadow-2xl scale-105 border-none z-10' 
                    : 'bg-[#2C2A26] text-[#F5F2EB] shadow-2xl scale-105 border-none z-10')
                : (theme === 'dark'
                    ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] hover:shadow-lg'
                    : 'bg-white border border-[#D6D1C7] text-[#2C2A26] hover:shadow-lg')
            }`}
          >
            {plan.highlight && (
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${
                theme === 'dark' ? 'bg-[#F5F2EB] text-[#2C2A26]' : 'bg-[#F5F2EB] text-[#2C2A26]'
              }`}>
                {t?.billing?.mostPopular || 'Most Popular'}
              </div>
            )}

            <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
            <p className={`text-xs mb-8 ${
              plan.highlight 
                ? 'text-[#A8A29E]' 
                : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]')
            }`}>{plan.desc}</p>
            
            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-serif">
                  ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                </span>
                <span className={`text-xs mb-1.5 ${
                  plan.highlight 
                    ? 'text-[#A8A29E]' 
                    : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]')
                }`}>/ month</span>
              </div>
              {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
                <p className={`text-xs mt-2 ${
                  plan.highlight 
                    ? 'text-[#A8A29E]' 
                    : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]')
                }`}>
                  {t?.billing?.billedYearly || 'Billed'} ${plan.priceYearly * 12} {t?.billing?.perYear || '/year'}
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-light">
                  <div className={plan.highlight ? 'text-[#F5F2EB]' : (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]')}>
                    <CheckIcon />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button 
              disabled={plan.active || loading}
              onClick={() => {
                if (plan.id === 'pro') {
                  handleUpgrade(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly', 'Pro');
                } else if (plan.id === 'agency') {
                  handleUpgrade('agency_monthly', 'Agency');
                }
              }}
              className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-default ${
                plan.highlight
                  ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-white'
                  : (theme === 'dark'
                      ? 'border border-[#F5F2EB] hover:bg-[#F5F2EB] hover:text-[#2C2A26] disabled:hover:bg-transparent disabled:hover:text-[#F5F2EB]'
                      : 'border border-[#2C2A26] hover:bg-[#2C2A26] hover:text-[#F5F2EB] disabled:hover:bg-transparent disabled:hover:text-[#2C2A26]')
              }`}
            >
              {loading ? (t?.billing?.processing || 'Processing...') : (plan.active ? (t?.billing?.currentPlan || 'Current Plan') : plan.button)}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* History Table */}
        <div className={`border rounded-sm overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
        }`}>
          <div className={`p-6 border-b transition-colors duration-300 ${
            theme === 'dark' ? 'border-[#433E38]' : 'border-[#F5F2EB]'
          }`}>
            <h3 className={`font-serif text-lg transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>{t?.billing?.billingHistory || 'Billing History'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                theme === 'dark' ? 'bg-[#1C1B19] text-[#A8A29E]' : 'bg-[#F9F8F6] text-[#A8A29E]'
              }`}>
                <tr>
                  <th className="p-4 font-bold">{t?.billing?.date || 'Date'}</th>
                  <th className="p-4 font-bold">{t?.billing?.description || 'Description'}</th>
                  <th className="p-4 font-bold">{t?.billing?.amount || 'Amount'}</th>
                  <th className="p-4 font-bold text-right">{t?.billing?.invoice || 'Invoice'}</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#F5F2EB]'
              }`}>
                <tr className={`transition-colors hover:bg-opacity-30 ${
                  theme === 'dark' ? 'hover:bg-[#433E38]' : 'hover:bg-[#F9F9F9]'
                }`}>
                  <td className={`p-4 text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>--</td>
                  <td className={`p-4 text-sm font-medium transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>{t?.billing?.noBillingHistory || 'No billing history yet'}</td>
                  <td className={`p-4 text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                  }`}>--</td>
                  <td className="p-4 text-right">
                    <button className={`text-xs font-medium transition-colors duration-300 hover:underline ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>--</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPlans;
