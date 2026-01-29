import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createPaymentLink, ErrorTypes, isErrorType } from '../../services/firebaseFunctions';
import toast from '../../utils/toast';
import PaymentModal from './PaymentModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const BillingPlans = ({ onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user, userData, refreshUserData } = useAuth(); // Add user to destructure
  const [billingCycle, setBillingCycle] = useState('monthly');
  // Fixed: Use string to track WHICH plan is loading, instead of boolean
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [billingHistory, setBillingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Billing History
  useEffect(() => {
    const fetchHistory = async () => {
      console.log('🔍 [Billing History] user:', user);
      console.log('🔍 [Billing History] userData:', userData);

      if (!user?.uid) {
        console.log('⚠️ [Billing History] No user.uid found. user:', user);
        return;
      }

      console.log('🔍 [Billing History] Starting fetch for userId:', user.uid);
      setHistoryLoading(true);
      try {
        const q = query(
          collection(db, 'payment_links'),
          where('userId', '==', user.uid),
          where('status', '==', 'success') // Only show successful payments
        );

        const querySnapshot = await getDocs(q);
        console.log('📊 [Billing History] Query returned', querySnapshot.size, 'successful transactions');

        const historyData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 [Billing History] Document:', doc.id, data);
          historyData.push({
            id: doc.id,
            date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('vi-VN') : 'N/A',
            description: data.description || `Plan Upgrade (${data.planName})`,
            amount: data.amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount) : '0 ₫',
            invoiceId: data.orderCode || doc.id.substring(0, 8),
            status: data.status
          });
        });

        console.log('✅ [Billing History] Processed history:', historyData);
        setBillingHistory(historyData);
        setCurrentPage(1); // Reset to first page on new data
      } catch (error) {
        console.error("❌ [Billing History] Error:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]); // Changed to user to get uid from Firebase Auth

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('PaymentModal state changed:', isPaymentModalOpen);
  }, [isPaymentModalOpen]);

  // Map plan names to amounts (VND)
  // Exchange rate: 1 USD ≈ 23,800 VND

  /* TEST MODE (Disabled)
  const PLAN_PRICES = {
    pro_monthly: 10000,
    pro_yearly: 20000,
    agency_monthly: 30000,
    agency_yearly: 50000,
  };
  */

  // PRODUCTION PRICES:
  const PLAN_PRICES = {
    pro_monthly: 690000, // 29 USD * 23,800 VND/USD ≈ 690,000 VND
    pro_yearly: 6840000, // 24 USD/month * 12 months * 23,800 VND/USD ≈ 6,840,000 VND
    agency_monthly: 2356200, // 99 USD * 23,800 VND/USD ≈ 2,356,200 VND
    agency_yearly: 22562400, // 79 USD/month * 12 months * 23,800 VND/USD ≈ 22,562,400 VND
    business_monthly: 4900000, // 206 USD * 23,800 VND/USD ≈ 4,900,000 VND
    business_yearly: 49000000, // 172 USD/month * 12 months * 23,800 VND/USD ≈ 49,000,000 VND
  };

  const currentPlan = userData?.plan || 'free';
  const [cardDetails, setCardDetails] = useState({
    last4: userData?.cardLast4 || '4242',
    expiry: userData?.cardExpiry || '12/28'
  });

  // Update card details when userData changes
  useEffect(() => {
    if (userData?.cardLast4 || userData?.cardExpiry) {
      setCardDetails({
        last4: userData.cardLast4 || '4242',
        expiry: userData.cardExpiry || '12/28'
      });
    }
  }, [userData]);

  const handlePaymentUpdate = (details) => {
    const last4 = details.cardNumber ? details.cardNumber.replace(/\s/g, '').slice(-4) : cardDetails.last4;
    setCardDetails({
      last4: last4 || '4242',
      expiry: details.expiry || cardDetails.expiry
    });
    toast.success(t?.billing?.paymentMethodUpdated || 'Payment method updated.');
    // TODO: Call API to save payment method to backend
  };

  const handleUpgrade = async (planKey, planName, planId) => {
    const amount = PLAN_PRICES[planKey];
    if (!amount) {
      toast.error(t?.billing?.planPriceNotConfigured || 'Plan price not configured. Please contact support.');
      return;
    }

    setLoadingPlanId(planId); // Set specific plan loading
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
      setLoadingPlanId(null); // Clear loading
    }
  };

  const handleBuyCredits = async (pkg) => {
    setLoadingPlanId(pkg.id);
    try {
      const { checkoutUrl } = await createPaymentLink({
        amount: pkg.price,
        planName: `credit_${pkg.id}`, // e.g., credit_starter, credit_popular
        creditAmount: pkg.credits, // Pass credit amount for backend processing
        successUrl: `${window.location.origin}/dashboard?payment=success&type=credits&amount=${pkg.credits}`,
        cancelUrl: `${window.location.origin}/dashboard?payment=cancel`
      });

      // Redirect to PayOS checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Credit purchase error:', error);
      if (isErrorType(error, ErrorTypes.UNAUTHENTICATED)) {
        toast.error(t?.billing?.pleaseLogin || 'Please log in to buy credits.');
      } else {
        toast.error(error.message || 'Failed to create payment link. Please try again.');
      }
    } finally {
      setLoadingPlanId(null);
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
  }, [refreshUserData, t]);

  const plans = [
    {
      id: 'starter',
      name: t?.billing?.starter?.name || 'Starter',
      desc: t?.billing?.starter?.desc || 'Perfect for small creators and explorers.',
      credits: t?.billing?.starter?.credits || '20',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        t?.billing?.starter?.features?.credits || '20 Free Monthly Credits',
        t?.billing?.starter?.features?.tools || 'Gemini 3 Flash Access',
        t?.billing?.starter?.features?.seo || 'Basic SEO Tools',
        t?.billing?.starter?.features?.support || 'Community Support'
      ],
      button: t?.billing?.currentPlan || 'Current Plan',
      active: currentPlan === 'free',
      highlight: false
    },
    {
      id: 'pro',
      name: t?.billing?.pro?.name || 'Pro Studio',
      desc: t?.billing?.pro?.desc || 'Best for professional content creators.',
      credits: t?.billing?.pro?.credits || '2,500',
      priceMonthly: 29,
      priceYearly: 24,
      features: [
        t?.billing?.pro?.features?.credits || '2,500 Monthly Credits',
        t?.billing?.pro?.features?.reasoning || 'Gemini 3 Pro Reasoning',
        t?.billing?.pro?.features?.images || 'Nano Banana Pro Access',
        t?.billing?.pro?.features?.support || 'Priority 24/7 Support'
      ],
      button: t?.billing?.upgradeToPro || 'Upgrade to Pro',
      active: currentPlan === 'pro',
      highlight: true
    },
    {
      id: 'agency',
      name: t?.billing?.agency?.name || 'Agency Elite',
      desc: t?.billing?.agency?.desc || 'For high-volume content operations.',
      credits: t?.billing?.agency?.credits || '12,000',
      priceMonthly: 99,
      priceYearly: 79,
      features: [
        t?.billing?.agency?.features?.credits || '12,000 Monthly Credits',
        t?.billing?.agency?.features?.unlimited || 'Unlimited Gemini 3 Pro',
        t?.billing?.agency?.features?.api || 'API & Multi-Seat Access',
        t?.billing?.agency?.features?.manager || 'Dedicated Account Manager'
      ],
      button: t?.billing?.goUnlimited || 'Go Unlimited',
      active: currentPlan === 'agency',
      highlight: false
    },
    {
      id: 'business',
      name: 'Business',
      desc: 'Enterprise-grade for large teams.',
      credits: billingCycle === 'monthly' ? '25,000' : '300,000',
      priceMonthly: 206,
      priceYearly: 172,
      features: [
        billingCycle === 'monthly' ? '25,000 Monthly Credits' : '300,000 Yearly Credits',
        'Unlimited team members',
        'Priority support 24/7',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options'
      ],
      button: 'Contact Sales',
      active: currentPlan === 'business',
      highlight: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 relative">
      {onBack && (
        <button
          onClick={onBack}
          className={`absolute top-0 left-0 p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className={`text-4xl font-serif mb-4 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>{t?.billing?.title || 'Choose Your Power'}</h2>
        <p className={`font-light text-lg transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>{t?.billing?.subtitle || 'Scale your creativity with our flexible credit plans.'}</p>

        <div className="flex justify-center items-center mt-8 gap-4">
          <span className={`text-xs uppercase tracking-widest font-bold transition-colors ${billingCycle === 'monthly'
            ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]')
            : 'text-[#A8A29E]'
            }`}>{t?.billing?.monthly || 'Monthly'}</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-14 h-8 rounded-full relative transition-colors focus:outline-none ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'
              }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-md ${billingCycle === 'yearly' ? 'left-7' : 'left-1'
              } ${theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#F5F2EB]'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-widest font-bold transition-colors ${billingCycle === 'yearly'
              ? (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]')
              : 'text-[#A8A29E]'
              }`}>{t?.billing?.yearly || 'Yearly'}</span>
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">{t?.billing?.save20 || 'Save 20%'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-sm transition-all duration-300 ${plan.highlight
              ? (theme === 'dark'
                ? 'bg-[#433E38] text-[#F5F2EB] shadow-2xl scale-105 border-none z-10'
                : 'bg-[#2C2A26] text-[#F5F2EB] shadow-2xl scale-105 border-none z-10')
              : (theme === 'dark'
                ? 'bg-[#2C2A26] border border-[#433E38] text-[#F5F2EB] hover:shadow-lg'
                : 'bg-white border border-[#D6D1C7] text-[#2C2A26] hover:shadow-lg')
              }`}
          >
            {plan.highlight && (
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${theme === 'dark' ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                {t?.billing?.bestValue || 'Best Value'}
              </div>
            )}

            <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
            <p className={`text-xs mb-8 ${plan.highlight
              ? 'text-[#A8A29E]'
              : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]')
              }`}>{plan.desc}</p>

            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-serif">
                  ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                </span>
                <span className={`text-xs mb-1.5 ${plan.highlight
                  ? 'text-[#A8A29E]'
                  : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]')
                  }`}>/ month</span>
              </div>
              <div className={`mt-2 py-1 px-3 inline-block rounded-full text-[10px] font-bold uppercase tracking-widest ${plan.highlight ? 'bg-white/10' : (theme === 'dark' ? 'bg-black/20' : 'bg-[#F9F8F6]')
                }`}>
                {plan.credits} Monthly Credits
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-light">
                  <div className={plan.highlight ? 'text-amber-400' : 'text-emerald-500'}>
                    <CheckIcon />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.active || (loadingPlanId !== null)}
              onClick={() => {
                if (plan.id === 'pro') {
                  handleUpgrade(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly', 'Pro Studio', plan.id);
                } else if (plan.id === 'agency') {
                  handleUpgrade(billingCycle === 'monthly' ? 'agency_monthly' : 'agency_yearly', 'Agency Elite', plan.id);
                } else if (plan.id === 'business') {
                  handleUpgrade(billingCycle === 'monthly' ? 'business_monthly' : 'business_yearly', 'Business', plan.id);
                }
              }}
              className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 relative
                ${plan.active
                  ? 'bg-slate-600 text-white border border-slate-600 shadow-lg scale-[1.02] cursor-default opacity-100'
                  : (plan.highlight
                    ? 'bg-[#F5F2EB] text-[#2C2A26] hover:bg-white border-transparent'
                    : (theme === 'dark'
                      ? 'border border-[#F5F2EB] hover:bg-[#F5F2EB] hover:text-[#2C2A26]'
                      : 'border border-[#2C2A26] hover:bg-[#2C2A26] hover:text-[#F5F2EB]')
                  )
                }
                ${(loadingPlanId !== null && !plan.active) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
              {loadingPlanId === plan.id ? (t?.billing?.processing || 'Processing...') : (
                plan.active ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckIcon /> {t?.billing?.currentPlan || 'Current Plan'}
                  </span>
                ) : (plan.id === 'starter' ? 'Free Plan' : plan.button)
              )}
            </button>
          </div>
        ))}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buy Credits Section */}
        <div className={`border p-8 rounded-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
          }`}>
          <div className="mb-6">
            <h3 className={`font-serif text-lg transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
              }`}>Buy Credits</h3>
            <p className={`text-xs mt-1 transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
              }`}>Top up your account with additional credits</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'starter', credits: 500, price: 55000, discount: null },
              { id: 'popular', credits: 1000, price: 100000, discount: '5%', popular: true },
              { id: 'pro', credits: 2500, price: 240000, discount: '10%' },
              { id: 'business', credits: 5000, price: 450000, discount: '15%' }
            ].map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-sm p-4 transition-all duration-300 ${theme === 'dark'
                  ? 'bg-[#1C1B19] border-[#433E38] hover:border-[#F5F2EB]'
                  : 'bg-[#F9F8F6] border-[#F5F2EB] hover:border-[#2C2A26]'
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F5F2EB] text-[#2C2A26] text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                      Popular
                    </span>
                  </div>
                )}

                {pkg.discount && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-1 rounded-sm">
                      Save {pkg.discount}
                    </span>
                  </div>
                )}

                <div className="text-center mb-3">
                  <p className={`text-2xl font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{pkg.credits.toLocaleString()}</p>
                  <p className={`text-[10px] uppercase tracking-wider transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                    }`}>Credits</p>
                </div>

                <div className="text-center mb-3">
                  <p className={`text-lg font-bold transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}</p>
                  <p className={`text-[9px] transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                    }`}>({(pkg.price / pkg.credits).toFixed(0)} ₫/credit)</p>
                </div>

                <button
                  onClick={() => handleBuyCredits(pkg)}
                  disabled={loadingPlanId === pkg.id}
                  className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm ${loadingPlanId === pkg.id
                    ? 'opacity-50 cursor-not-allowed'
                    : (theme === 'dark'
                      ? 'border border-[#F5F2EB] hover:bg-[#F5F2EB] hover:text-[#2C2A26] text-[#F5F2EB]'
                      : 'border border-[#2C2A26] hover:bg-[#2C2A26] hover:text-[#F5F2EB] text-[#2C2A26]')
                    }`}
                >
                  {loadingPlanId === pkg.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 border rounded-sm overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
          }`}>
          <div className={`p-6 border-b transition-colors duration-300 ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#F5F2EB]'
            }`}>
            <h3 className={`font-serif text-lg ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}`}>{t?.billing?.billingHistory || 'Billing History'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`text-[10px] uppercase tracking-widest transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1C1B19] text-[#A8A29E]' : 'bg-[#F9F8F6] text-[#A8A29E]'
                }`}>
                <tr>
                  <th className="p-4 font-bold">{t?.billing?.date || 'Date'}</th>
                  <th className="p-4 font-bold">{t?.billing?.description || 'Plan'}</th>
                  <th className="p-4 font-bold">{t?.billing?.amount || 'Amount'}</th>
                  <th className="p-4 font-bold text-right">{t?.billing?.invoice || 'Invoice'}</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#F5F2EB]'
                }`}>
                {historyLoading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-sm opacity-50">Loading history...</td>
                  </tr>
                ) : billingHistory.length > 0 ? (
                  billingHistory
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => (
                      <tr key={item.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#433E38]/30' : 'hover:bg-[#F9F9F9]'}`}>
                        <td className={`p-4 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{item.date}</td>
                        <td className={`p-4 text-sm font-medium ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}`}>{item.description}</td>
                        <td className={`p-4 text-sm font-medium text-emerald-600`}>{item.amount}</td>
                        <td className="p-4 text-right">
                          <span className={`text-xs font-mono opacity-70 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}`}>#{item.invoiceId}</span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#433E38]/30' : 'hover:bg-[#F9F9F9]'}`}>
                    <td className={`p-4 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>--</td>
                    <td className={`p-4 text-sm font-medium ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'}`}>
                      {t?.billing?.noBillingHistory || 'No billing history yet'}
                    </td>
                    <td className={`p-4 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>--</td>
                    <td className="p-4 text-right">--</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {billingHistory.length > itemsPerPage && (
              <div className={`flex items-center justify-center gap-2 p-4 border-t ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#F5F2EB]'}`}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === 1
                    ? 'opacity-30 cursor-not-allowed'
                    : (theme === 'dark' ? 'hover:bg-[#433E38] text-[#F5F2EB]' : 'hover:bg-[#F5F2EB] text-[#2C2A26]')
                    }`}
                >
                  &lt;
                </button>

                {Array.from({ length: Math.ceil(billingHistory.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === page
                      ? (theme === 'dark' ? 'bg-[#F5F2EB] text-[#2C2A26]' : 'bg-[#2C2A26] text-[#F5F2EB]')
                      : (theme === 'dark' ? 'hover:bg-[#433E38] text-[#F5F2EB]' : 'hover:bg-[#F5F2EB] text-[#2C2A26]')
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(billingHistory.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(billingHistory.length / itemsPerPage)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${currentPage === Math.ceil(billingHistory.length / itemsPerPage)
                    ? 'opacity-30 cursor-not-allowed'
                    : (theme === 'dark' ? 'hover:bg-[#433E38] text-[#F5F2EB]' : 'hover:bg-[#F5F2EB] text-[#2C2A26]')
                    }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handlePaymentUpdate}
      />
    </div>
  );
};

export default BillingPlans;
