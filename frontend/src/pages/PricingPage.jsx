import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../assets/images/Logo.png';

const PricingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language, changeLanguage } = useLanguage();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isScrolled, setIsScrolled] = useState(false);

    const handleAuth = (e) => {
        e?.preventDefault();
        if (user) {
            navigate('/dashboard');
        } else {
            setShowAuthModal(true);
        }
    };

    const handleLoginSuccess = () => {
        setShowAuthModal(false);
        navigate('/dashboard');
    };

    // Handle scroll for navbar effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-pricing-background-light dark:bg-pricing-background-dark text-pricing-text-light dark:text-pricing-text-dark transition-colors duration-200 font-sans">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 w-full h-[72px] transition-all duration-300 ${isScrolled
                ? 'bg-black/40 backdrop-blur-md border-b border-white/10'
                : 'bg-pricing-surface-light/80 dark:bg-pricing-surface-dark/80 backdrop-blur-sm border-b border-gray-100/50 dark:border-gray-800/50'
                }`}>
                <div className="flex items-center space-x-2 shrink-0" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={Logo} alt="Creator AI Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                    <span className={`font-brand font-bold text-lg tracking-tight ${isScrolled ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Creator AI</span>
                </div>

                <div className="hidden xl:flex items-center space-x-1 h-full">
                    <button onClick={() => user ? navigate('/dashboard') : handleAuth()} className={`px-4 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-white/90 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-pricing-primary dark:hover:text-pricing-primary-light'}`}>{t.nav.home}</button>

                    {/* Solutions Dropdown */}
                    <div className="nav-item-wrapper group cursor-pointer">
                        <div className={`px-4 py-2 flex items-center gap-1 text-sm font-medium transition-colors ${isScrolled ? 'text-white/90 group-hover:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-pricing-primary dark:group-hover:text-pricing-primary-light'}`}>
                            <span>{t.nav.solutions}</span>
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </div>
                        <div className="dropdown-panel-container">
                            <div className="dropdown-inner-content flex justify-center">
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="solution-card group/card" onClick={handleAuth}>
                                        <div className="w-full h-32 rounded-lg bg-blue-900/40 mb-3 overflow-hidden relative border border-white/5">
                                            <img alt="One Click Video Solution UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACYHwl2wHD9VPnvb-CTGpWm_rQLZk3oxUjLu-emI6U_qufTjtfkKdIjC44GTK3ElCdR5T4EqXBBjQSu8PRFraM2UHG05SmOOS8BfJ_VfOhxkSNQRn_SqiHVqqtFEnrRfh5gZW8yn498Dan1sajCocYjZ1zsmi3V7grkMxlQO-6RGq-si5K5DEgZN19aNYr8OQSd43Pj6RFXDHbcStlfqiIN_HOdIN_ZF2zdrufTMSbrXrlmqwbMRXqxGQDHTV6J3_BlQHOCBMpipY" />
                                        </div>
                                        <h4 className="font-bold text-white mb-1.5 text-sm">{t.footer.videoSolution}</h4>
                                        <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                            {t.nav.videoSub}
                                        </p>
                                    </div>
                                    <div className="solution-card group/card" onClick={handleAuth}>
                                        <div className="w-full h-32 rounded-lg bg-orange-900/40 mb-3 overflow-hidden relative border border-white/5">
                                            <img alt="AI Product Images UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtAQszxAUlJ4M0rGDMgjkf_9yEFsWzkAI5MWb6NtYQQBVvY-nv6mHyX8_iIZqN5hPydmoDLYMFNY4x-dJk9ICToKN8kghL-25znfd51M6Vuuu-zulS8WLsPy03v0wxh2tlOpPxPKcBUiSvIlgoweg0qrqwKU5NGCdScyFweAMohyyqzp-a216JlNHy4R3YbjDehzfIeJme63FdyqY_odZM_nHd_7gQ2r6xK14YRFdY0vBhX91MfvZrsfh0zjzL6RA5HhWEPJDHo9Q" />
                                        </div>
                                        <h4 className="font-bold text-white mb-1.5 text-sm">{t.footer.productImages}</h4>
                                        <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                            {t.nav.imageSub}
                                        </p>
                                    </div>
                                    <div className="solution-card group/card" onClick={handleAuth}>
                                        <div className="w-full h-32 rounded-lg bg-teal-900/40 mb-3 overflow-hidden relative border border-white/5">
                                            <img alt="AI Avatars UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe8isDH2ee9b1FqEOD0RMPfPuAMTAxL-bTkLgJdWNAd68xp2LxMUoRdsDUnuiY5qA9Bew27y2VeqYge9XCbr9tGe90WPaLP76Oy23B3hRkczyEZn6wzvB8L1hXOh1eUBSqcJGIATS_9iHypCETr0rLiE_9WxVrtRLEGIG_ULedQiMmO3-vkvuAhRJ32r6SMQB64FN9udBa0R5xKZk4ijzZqVzvSZn0KXjyn5eVDT2Lo-Cb7YISdqtq_27DmXe9Lmq1Q86BtK4ykqg" />
                                        </div>
                                        <h4 className="font-bold text-white mb-1.5 text-sm">{t.footer.avatarsAndVoices}</h4>
                                        <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                            {t.nav.avatarSub}
                                        </p>
                                    </div>
                                    <div className="solution-card group/card" onClick={handleAuth}>
                                        <div className="w-full h-32 rounded-lg bg-teal-900/40 mb-3 overflow-hidden relative border border-white/5">
                                            <img alt="Auto Publishing UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKeqHSTCUsfhHu0Bx18JpsgmSLSYmilt55lNaMJt_6U5IWJcjcsEbTToQExQ8pzeM7rfh0yjtxB2B_TAQWnqntd086YX3gYr4bQcCKrP0vj8uXCsglrJMjR43J9ynF6-eosN0S21FUFvWxyaYyJz6vZiZFEDIkMT-dja3dK0qzHQIE63XKZBS5zp8wDTHwY_JSwIGi-vkz06YAORq7-UNlHjqCyE4OzNzlkRkFzMwjUU44d0dr2L39piI3MLK_OA2LM-yi0jLthO4" />
                                        </div>
                                        <h4 className="font-bold text-white mb-1.5 text-sm">{t.footer.publishingAndAnalytics}</h4>
                                        <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                            {t.nav.analytics}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Resources Dropdown */}
                    <div className="nav-item-wrapper group cursor-pointer">
                        <div className={`px-4 py-2 flex items-center gap-1 text-sm font-medium transition-colors ${isScrolled ? 'text-white/90 group-hover:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-pricing-primary dark:group-hover:text-pricing-primary-light'}`}>
                            <span>{t.nav.res}</span>
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </div>
                        <div className="dropdown-panel-container">
                            <div className="dropdown-inner-content">
                                <div className="grid grid-cols-4 gap-12 pt-2 pb-4">
                                    <div className="border-r border-white/10 pr-6">
                                        <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">{t.nav.learn}</h4>
                                        <ul className="space-y-2">
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.affiliate}</a></li>
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.powerLab}</a></li>
                                        </ul>
                                    </div>
                                    <div className="border-r border-white/10 pr-6">
                                        <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">{t.nav.customerStories}</h4>
                                        <ul className="space-y-2">
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.kraftGeek}</a></li>
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.pawSmart}</a></li>
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.sleepShop}</a></li>
                                        </ul>
                                    </div>
                                    <div className="border-r border-white/10 pr-6">
                                        <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">{t.nav.helpCenter}</h4>
                                        <ul className="space-y-2">
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.footer.videoSolution}</a></li>
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.footer.productImages}</a></li>
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.footer.publishingAndAnalytics}</a></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">{t.nav.campaign}</h4>
                                        <ul className="space-y-2">
                                            <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">{t.nav.meet}</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => navigate('/pricing')} className={`px-4 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-white/90 font-medium' : 'text-pricing-primary font-medium'}`}>{t.nav.pricing}</button>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium border ${isScrolled ? 'text-white/90 hover:text-white border-white/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-600'}`}
                        onClick={() => changeLanguage(language === 'en' ? 'vi' : 'en')}
                    >
                        <span className="material-symbols-outlined text-[18px]">language</span>
                        <span className="hidden lg:inline">{language === 'en' ? 'English' : 'Tiếng Việt'}</span>
                    </button>
                    <button className={`hidden md:block px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm font-medium whitespace-nowrap cursor-pointer border hover:shadow-lg transform ${isScrolled ? 'text-white/90 hover:text-white border-white/20 hover:shadow-white/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-600'}`} onClick={handleAuth}>
                        {user ? t.nav.dashboard : t.auth.logIn}
                    </button>
                    <button className={`hidden md:block px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm font-medium whitespace-nowrap cursor-pointer border hover:shadow-lg transform ${isScrolled ? 'text-white/90 hover:text-white border-white/20 hover:shadow-white/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-gray-300 dark:border-gray-600'}`} onClick={handleAuth}>
                        {user ? t.nav.start : t.landing.hero.getStarted}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-bg pb-20 pt-16 px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                        {t.pricing.hero.title}
                    </h1>
                    <p className="text-3xl md:text-4xl font-playfair italic text-gray-800 dark:text-gray-200 mb-6">
                        {t.pricing.hero.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{t.pricing.hero.description}</p>
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${billingCycle === 'monthly'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {t.pricing.hero.monthly}
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${billingCycle === 'yearly'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {t.pricing.hero.yearly} <span className="text-pricing-primary text-xs font-bold ml-1">{t.pricing.hero.savePercent}</span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                    {/* Free Plan - Starter */}
                    <div className="bg-pricing-surface-light dark:bg-pricing-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-xl transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t.pricing.plans.starter.name}</h3>
                            <div className="flex items-baseline mb-2">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t.pricing.currency.prefix}{t.pricing.plans.starter.price}{t.pricing.currency.suffix}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.pricing.plans.starter.sub}</p>
                        </div>
                        <button className="block w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg text-center mb-8 hover:opacity-90 transition-opacity" onClick={handleAuth}>{t.pricing.plans.starter.cta}</button>
                        <div className="space-y-6 flex-grow">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.credits}</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-start">
                                        <span className="material-icons text-green-500 text-sm mr-2 mt-0.5">check</span>
                                        <div>
                                            <span className="font-medium">{t.pricing.plans.starter.credits}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Features</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {t.pricing.plans.starter.features.map((f, i) => (
                                        <li key={i} className="flex items-center">
                                            <span className="material-icons text-green-500 text-sm mr-2">check</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Pro Studio Plan */}
                    <div className="bg-pricing-surface-light dark:bg-pricing-surface-dark rounded-2xl p-8 shadow-lg border-2 border-pricing-primary/20 dark:border-pricing-primary/40 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-bl-lg">{t.pricing.labels.bestValue}</div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t.pricing.plans.pro.name}</h3>
                            <div className="flex items-baseline mb-2 gap-1 flex-wrap">
                                <span className={`${(billingCycle === 'monthly' ? t.pricing.plans.pro.priceMonthly : t.pricing.plans.pro.priceYearly).length > 3 ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900 dark:text-white`}>
                                    {t.pricing.currency.prefix}{billingCycle === 'monthly' ? t.pricing.plans.pro.priceMonthly : t.pricing.plans.pro.priceYearly}{t.pricing.currency.suffix}
                                </span>
                                <span className="text-sm text-gray-400 font-medium">{t.pricing.hero.perMonth}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {billingCycle === 'yearly' && t.pricing.plans.pro.billedYearly}{t.pricing.plans.pro.sub}
                            </p>
                        </div>
                        <button className="block w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg text-center mb-8 hover:opacity-90 transition-opacity" onClick={handleAuth}>{t.pricing.plans.pro.cta}</button>
                        <div className="space-y-6 flex-grow">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.credits}</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-start">
                                        <span className="material-icons text-green-500 text-sm mr-2 mt-0.5">check</span>
                                        <div>
                                            <span className="font-medium">{t.pricing.plans.pro.credits}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.features}</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {t.pricing.plans.pro.features.map((f, i) => (
                                        <li key={i} className="flex items-center">
                                            <span className="material-icons text-green-500 text-sm mr-2">check</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Agency Elite Plan */}
                    <div className="relative flex flex-col h-full rounded-2xl group">
                        <div className="absolute -inset-[2px] bg-gradient-to-br from-indigo-900 via-purple-700 to-indigo-900 dark:from-indigo-600 dark:via-purple-500 dark:to-indigo-600 rounded-2xl opacity-100"></div>
                        <div className="relative bg-pricing-surface-light dark:bg-pricing-surface-dark rounded-2xl p-8 flex flex-col h-full w-full hover:shadow-2xl transition-shadow">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t.pricing.plans.agency.name}</h3>
                                <div className="flex items-baseline mb-2 gap-1 flex-wrap">
                                    <span className={`${(billingCycle === 'monthly' ? t.pricing.plans.agency.priceMonthly : t.pricing.plans.agency.priceYearly).length > 3 ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900 dark:text-white`}>
                                        {t.pricing.currency.prefix}{billingCycle === 'monthly' ? t.pricing.plans.agency.priceMonthly : t.pricing.plans.agency.priceYearly}{t.pricing.currency.suffix}
                                    </span>
                                    <span className="text-sm text-gray-400 font-medium">{t.pricing.hero.perMonth}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {billingCycle === 'yearly' && t.pricing.plans.agency.billedYearly}{t.pricing.plans.agency.sub}
                                </p>
                            </div>
                            <button className="block w-full py-3 px-4 bg-pricing-primary hover:bg-pricing-primary-dark text-white font-semibold rounded-lg text-center mb-8 transition-colors shadow-md">{t.pricing.plans.agency.cta}</button>
                            <div className="space-y-6 flex-grow">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.credits}</p>
                                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <li className="flex items-start">
                                            <span className="material-icons text-pricing-primary text-sm mr-2 mt-0.5">verified</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{t.pricing.plans.agency.credits}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.features}</p>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        {t.pricing.plans.agency.features.map((f, i) => (
                                            <li key={i} className="flex items-center">
                                                <span className="material-icons text-pricing-primary text-sm mr-2">verified</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Plan */}
                    <div className="bg-pricing-surface-light dark:bg-pricing-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-xl transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t.pricing.plans.business.name}</h3>
                            <div className="flex items-baseline mb-2 gap-1 flex-wrap">
                                <span className={`${(billingCycle === 'monthly' ? t.pricing.plans.business.priceMonthly : t.pricing.plans.business.priceYearly).length > 3 ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900 dark:text-white`}>
                                    {t.pricing.currency.prefix}{billingCycle === 'monthly' ? t.pricing.plans.business.priceMonthly : t.pricing.plans.business.priceYearly}{t.pricing.currency.suffix}
                                </span>
                                <span className="text-sm text-gray-400 font-medium">{t.pricing.hero.perMonth}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {billingCycle === 'yearly' && t.pricing.plans.business.billedYearly}{t.pricing.plans.business.sub}
                            </p>
                        </div>
                        <button className="block w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg text-center mb-8 hover:opacity-90 transition-opacity" onClick={handleAuth}>{t.pricing.plans.business.cta}</button>
                        <div className="space-y-6 flex-grow">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.credits}</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-start">
                                        <span className="material-icons text-green-500 text-sm mr-2 mt-0.5">check</span>
                                        <div>
                                            <span className="font-medium">{billingCycle === 'monthly' ? t.pricing.plans.business.creditsMonthly : t.pricing.plans.business.creditsYearly}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t.pricing.labels.features}</p>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {t.pricing.plans.business.features.map((f, i) => (
                                        <li key={i} className="flex items-center">
                                            <span className="material-icons text-green-500 text-sm mr-2">check</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-20 bg-pricing-surface-light dark:bg-pricing-background-dark">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-playfair text-center mb-16 text-gray-900 dark:text-white">{t.pricing.whyChoose.title}</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-12">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-4">
                                    <span className="material-symbols-outlined text-pricing-primary">storefront</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t.pricing.whyChoose.item1.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.pricing.whyChoose.item1.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-4">
                                    <span className="material-symbols-outlined text-pricing-primary">movie_creation</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t.pricing.whyChoose.item2.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.pricing.whyChoose.item2.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-4">
                                    <span className="material-symbols-outlined text-pricing-primary">collections</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t.pricing.whyChoose.item3.title}</h3>
                                    <p className="text-pricing-primary dark:text-pricing-primary-light text-sm font-medium mb-1">{t.pricing.whyChoose.item3.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-4">
                                    <span className="material-symbols-outlined text-pricing-primary">calendar_month</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t.pricing.whyChoose.item4.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.pricing.whyChoose.item4.desc}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 relative min-h-[500px] flex items-center justify-center">
                            <img alt="Abstract interface showing analytics and product images" className="rounded-xl shadow-xl w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPibvcKQol9tcm0MjLFhtxXF_WxBbPZn4Ir7R2HenPwDYg72FfD8NhkpYHrwq48ONYejkK0h7yvAREErO2cCqCTbzTSere1pYv_mau1T6mSqyAOWgNypdN0oijZ0zH-ELErt-rQPN2-L8aH-8KUGKnPtZP89XUIYk6tMFYcA--x9-OgEyeAL2wA2fdLqIH5j-r7c-XQIAznSCF84nQYD5UUFy6SJTAyyVjduF6E2sP2Xhgb76utjBs_3X-pxSIpVbJvDDqr6S3qSE" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section className="py-20 bg-pricing-background-light dark:bg-pricing-background-dark">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-playfair mb-8 text-gray-900 dark:text-white text-center">{t.pricing.faqs.title}</h2>
                    <div className="space-y-4">
                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-4">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-900 dark:text-white">
                                <span>{t.pricing.faqs.q1.q}</span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-symbols-outlined text-gray-500">expand_more</span>
                                </span>
                            </summary>
                            <div className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                {t.pricing.faqs.q1.a}
                            </div>
                        </details>
                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-4">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-900 dark:text-white">
                                <span>{t.pricing.faqs.q2.q}</span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-symbols-outlined text-gray-500">expand_more</span>
                                </span>
                            </summary>
                            <div className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                {t.pricing.faqs.q2.a}
                            </div>
                        </details>
                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-4">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-900 dark:text-white">
                                <span>{t.pricing.faqs.q3.q}</span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-symbols-outlined text-gray-500">expand_more</span>
                                </span>
                            </summary>
                            <div className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                {t.pricing.faqs.q3.a}
                            </div>
                        </details>
                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-4">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-900 dark:text-white">
                                <span>{t.pricing.faqs.q4.q}</span>
                                <span className="transition group-open:rotate-180">
                                    <span className="material-symbols-outlined text-gray-500">expand_more</span>
                                </span>
                            </summary>
                            <div className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
                                {t.pricing.faqs.q4.a}
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="footer-cta-bg py-24 text-center">
                <h2 className="text-3xl md:text-5xl font-playfair text-gray-900 dark:text-white mb-2">{t.pricing.cta.title}</h2>
                <p className="text-2xl md:text-4xl font-playfair italic text-gray-800 dark:text-gray-200 mb-10">{t.pricing.cta.subtitle}</p>
                <button className="inline-flex items-center px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition-opacity" onClick={handleAuth}>
                    {t.pricing.cta.button} <span className="material-symbols-outlined text-sm ml-2">arrow_forward</span>
                </button>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-16 text-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src={Logo} alt="Creator AI Logo" className="w-10 h-10 object-contain" />
                                <span className="font-bold text-lg tracking-tight">Creator AI</span>
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                {t.footer.tagline}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-200 mb-6">{t.footer.solutions}</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><button className="hover:text-white" onClick={handleAuth}>{t.footer.videoSolution}</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>{t.footer.productImages}</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>{t.footer.avatarsAndVoices}</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>{t.footer.publishingAndAnalytics}</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-200 mb-6">{t.footer.resources}</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a className="hover:text-white" href="#">{t.nav.helpCenter}</a></li>
                                <li><a className="hover:text-white" href="#">{t.nav.customerStories}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-200 mb-6">{t.footer.legal}</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><button className="hover:text-white" onClick={() => navigate('/terms')}>{t.footer.terms}</button></li>
                                <li><button className="hover:text-white" onClick={() => navigate('/privacy')}>{t.footer.privacy}</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-wrap gap-6 text-xs text-gray-500">
                        <button className="hover:text-gray-300" onClick={() => navigate('/terms')}>{t.footer.terms}</button>
                        <button className="hover:text-gray-300" onClick={() => navigate('/privacy')}>{t.footer.privacy}</button>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default PricingPage;
