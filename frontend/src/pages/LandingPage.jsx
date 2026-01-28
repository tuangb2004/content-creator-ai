import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import Logo from '../assets/images/Logo.png';

// Carousel images
const carouselImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCeN3OKrHcxoZo5KHAmGhzRSzblwIke8qfxlsYNw5BhIw3QXBtFE5NHDvUJVrUeGP8TebHWFubq0UxjmxwwO9mU20Js6HmxG5jijIU2opIfnFoBh5ku23gUyukEqkg7xoiVaBilzfjahbFfiXMv1C1KnQaVlycm0sM-b-bSoAdbnHJhL7r4sRp__Yrogf3Wkd4KBGuu_oawB6MLod4DIQAq0KgdqsGSU1CorDvkb6jPoPdZoQ2cyAIy7O5e1MX8GxxxcVMyylPQHRw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD1TCH2T7cgv7ZrGNKA6wsCrQU1o0YE7TgymSqs_7fPjZH-GWhm1ci1NYf0JrtNWhKXqgD0VjiOgrzwqPChkzt1HQjtpy1Rb-PRyzzEXXl5uL9DxFkPmNCXItSwiJX_nxR5F9HUzfLSPNnEvqCBBSGZkskSYhegd-Go9St8loSPvYq2P8GvqrIQdVzBAkw2EakdaroTAYnZKlK44uNnYR1gBV_iovNIC0pdn3Jcx5F_EBAoaBhkhuxQvYt6iMXvxffkAmvQjNCxnDA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAgQFMkefxQSBUsvMqzVwi_rLPBb_NTIKlVeFI7u0rNjASGi-IYLLucVkABLnjcpZ-2WuDW-JKFBTcVfnO_-vl7dTrXIQxlCpbazVgEm62PrPjTRjOBcIpfGHxRuZ25wvUEBL-m2wFRmXvRZMK_tFq2ijzGF6L_dMDyvc60zmkzRBBtf9FLACNDNd3e4MNJb6HJyMCTzd6YBEQh5sZDpIKNC6Z29rjEp7L068-dVKMmOom6C88yEvk_1kZd3DXUXqzgzRSAtSw9Sww",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA5buRCf4FKhfAECA7NUDuPt_3OBGAPsya3KjEEgwAnridvwwcC4S-8MAptJuM_eu3ou6ive9Nigw8T-nF0vRqQNx8P7qNUBd4RaWOkb7EVAhAWZ9Jv2VMt3rIEkrKx2Ew23GzrPSvsCgdienJmbbgR-_9_5Ra9OSrG3lEJwnQTSWYrLWxVn51TH7TSt2zBit35mc0usFWR6bAqU-RaFQh5aFRuU8CBbXTBtiUxp6-q99i7azsHLWJHXjwcDELFE_B1Kj4Dhm8eIEw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCGb6NnMdWUd34y-I-SImtaSNhUA1F-2CfBvOX_E1Dwuqy-xq6V8AssMT7W_sPIBHj-I7gGGhNp2U0oScsFLYV1falJ_2jvsS9YvUeznkb9_vzfD8rNIkH6v0_gMhuverxY6SB5zkGyEgSErHJa9sT6ThVwvkI8ZngoNe7llZt4QAmatrx_K5k2gDbJfLpwEj5TQhFULNmWBytSFb08lV87Tz83ulQAk7SkKGRtaIexMCzq06ii1J0Vm-eCxPoBq8BFplkzY0Sy6WA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuACYHwl2wHD9VPnvb-CTGpWm_rQLZk3oxUjLu-emI6U_qufTjtfkKdIjC44GTK3ElCdR5T4EqXBBjQSu8PRFraM2UHG05SmOOS8BfJ_VfOhxkSNQRn_SqiHVqqtFEnrRfh5gZW8yn498Dan1sajCocYjZ1zsmi3V7grkMxlQO-6RGq-si5K5DEgZN19aNYr8OQSd43Pj6RFXDHbcStlfqiIN_HOdIN_ZF2zdrufTMSbrXrlmqwbMRXqxGQDHTV6J3_BlQHOCBMpipY",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBtAQszxAUlJ4M0rGDMgjkf_9yEFsWzkAI5MWb6NtYQQBVvY-nv6mHyX8_iIZqN5hPydmoDLYMFNY4x-dJk9ICToKN8kghL-25znfd51M6Vuuu-zulS8WLsPy03v0wxh2tlOpPxPKcBUiSvIlgoweg0qrqwKU5NGCdScyFweAMohyyqzp-a216JlNHy4R3YbjDehzfIeJme63FdyqY_odZM_nHd_7gQ2r6xK14YRFdY0vBhX91MfvZrsfh0zjzL6RA5HhWEPJDHo9Q",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKeqHSTCUsfhHu0Bx18JpsgmSLSYmilt55lNaMJt_6U5IWJcjcsEbTToQExQ8pzeM7rfh0yjtxB2B_TAQWnqntd086YX3gYr4bQcCKrP0vj8uXCsglrJMjR43J9ynF6-eosN0S21FUFvWxyaYyJz6vZiZFEDIkMT-dja3dK0qzHQIE63XKZBS5zp8wDTHwY_JSwIGi-vkz06YAORq7-UNlHjqCyE4OzNzlkRkFzMwjUU44d0dr2L39piI3MLK_OA2LM-yi0jLthO4",
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
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

    // Handle scroll for navbar blur effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Duplicate images for infinite scroll
    const allCarouselImages = [...carouselImages, ...carouselImages];

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-200">
            {/* Hero Section with Video Background */}
            <div className="kling-hero min-h-screen flex flex-col relative overflow-hidden justify-center">
                <div className="absolute inset-0 z-0">
                    <video autoPlay className="w-full h-full object-cover opacity-80" loop muted playsInline>
                        <source src="https://videos.pexels.com/video-files/5091624/5091624-hd_1920_1080_24fps.mp4" type="video/mp4" />
                        <img alt="Abstract Background" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS-7s91BV2qyhyzMl8hSAka5DW3OoM-8LXUQsk04HfNhLyUE75UXICsBlm21z4M1LcDrsJw3tq4rwrALlO8ecVyjOhMBQJnOwoCw-UdDyLOITEp6esld3SChIwAyLd1THIkHC1B_HHweuUvLGcUye-5sYT9VPwG-p-xYJ5ksIOapGVYVVJMrcngkp6F7DT7zDX-a5ShG8RnCzpyacR--on90bDv6yEe37WqfRBI2l5CATyOuE7dm_1YIY4uNwcn7qbMEfmZdgWH44" />
                    </video>
                    <div className="video-overlay absolute inset-0 z-10"></div>
                </div>

                {/* Navigation */}
                <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 w-full h-[72px] transition-all duration-300 ${isScrolled
                    ? 'bg-black/40 backdrop-blur-md border-b border-white/10'
                    : 'bg-transparent backdrop-blur-none border-b border-transparent'
                    }`}>
                    <div className="flex items-center space-x-2 shrink-0">
                        <img src={Logo} alt="CreatorAI Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                        <span className="font-brand font-bold text-lg tracking-tight text-white drop-shadow-md">CreatorAI</span>
                    </div>

                    <div className="hidden xl:flex items-center space-x-1 h-full">
                        <button onClick={() => user ? navigate('/dashboard') : handleAuth()} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">Home</button>

                        {/* Solutions Dropdown */}
                        <div className="nav-item-wrapper group cursor-pointer">
                            <div className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                                <span>Solutions</span>
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </div>
                            <div className="dropdown-panel-container">
                                <div className="dropdown-inner-content flex justify-center">
                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="solution-card group/card" onClick={handleAuth}>
                                            <div className="w-full h-32 rounded-lg bg-blue-900/40 mb-3 overflow-hidden relative border border-white/5">
                                                <img alt="One Click Video Solution UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACYHwl2wHD9VPnvb-CTGpWm_rQLZk3oxUjLu-emI6U_qufTjtfkKdIjC44GTK3ElCdR5T4EqXBBjQSu8PRFraM2UHG05SmOOS8BfJ_VfOhxkSNQRn_SqiHVqqtFEnrRfh5gZW8yn498Dan1sajCocYjZ1zsmi3V7grkMxlQO-6RGq-si5K5DEgZN19aNYr8OQSd43Pj6RFXDHbcStlfqiIN_HOdIN_ZF2zdrufTMSbrXrlmqwbMRXqxGQDHTV6J3_BlQHOCBMpipY" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1.5 text-sm">One-Click Video Solution</h4>
                                            <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                                Instantly create engaging marketing videos by entering a product link.
                                            </p>
                                        </div>
                                        <div className="solution-card group/card" onClick={handleAuth}>
                                            <div className="w-full h-32 rounded-lg bg-orange-900/40 mb-3 overflow-hidden relative border border-white/5">
                                                <img alt="AI Product Images UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtAQszxAUlJ4M0rGDMgjkf_9yEFsWzkAI5MWb6NtYQQBVvY-nv6mHyX8_iIZqN5hPydmoDLYMFNY4x-dJk9ICToKN8kghL-25znfd51M6Vuuu-zulS8WLsPy03v0wxh2tlOpPxPKcBUiSvIlgoweg0qrqwKU5NGCdScyFweAMohyyqzp-a216JlNHy4R3YbjDehzfIeJme63FdyqY_odZM_nHd_7gQ2r6xK14YRFdY0vBhX91MfvZrsfh0zjzL6RA5HhWEPJDHo9Q" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1.5 text-sm">AI Product Images</h4>
                                            <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                                Effortlessly generate professional product photos in batches for e-commerce.
                                            </p>
                                        </div>
                                        <div className="solution-card group/card" onClick={handleAuth}>
                                            <div className="w-full h-32 rounded-lg bg-teal-900/40 mb-3 overflow-hidden relative border border-white/5">
                                                <img alt="AI Avatars UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe8isDH2ee9b1FqEOD0RMPfPuAMTAxL-bTkLgJdWNAd68xp2LxMUoRdsDUnuiY5qA9Bew27y2VeqYge9XCbr9tGe90WPaLP76Oy23B3hRkczyEZn6wzvB8L1hXOh1eUBSqcJGIATS_9iHypCETr0rLiE_9WxVrtRLEGIG_ULedQiMmO3-vkvuAhRJ32r6SMQB64FN9udBa0R5xKZk4ijzZqVzvSZn0KXjyn5eVDT2Lo-Cb7YISdqtq_27DmXe9Lmq1Q86BtK4ykqg" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1.5 text-sm">AI Avatars and Voices</h4>
                                            <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                                Access a diverse range of realistic AI avatars and voices to elevate content.
                                            </p>
                                        </div>
                                        <div className="solution-card group/card" onClick={handleAuth}>
                                            <div className="w-full h-32 rounded-lg bg-teal-900/40 mb-3 overflow-hidden relative border border-white/5">
                                                <img alt="Auto Publishing UI" className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKeqHSTCUsfhHu0Bx18JpsgmSLSYmilt55lNaMJt_6U5IWJcjcsEbTToQExQ8pzeM7rfh0yjtxB2B_TAQWnqntd086YX3gYr4bQcCKrP0vj8uXCsglrJMjR43J9ynF6-eosN0S21FUFvWxyaYyJz6vZiZFEDIkMT-dja3dK0qzHQIE63XKZBS5zp8wDTHwY_JSwIGi-vkz06YAORq7-UNlHjqCyE4OzNzlkRkFzMwjUU44d0dr2L39piI3MLK_OA2LM-yi0jLthO4" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1.5 text-sm">Auto-Publishing &amp; Analytics</h4>
                                            <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                                                Schedule social content in advance for auto-publishing across platforms.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resources Dropdown */}
                        <div className="nav-item-wrapper group cursor-pointer">
                            <div className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                                <span>Resources</span>
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </div>
                            <div className="dropdown-panel-container">
                                <div className="dropdown-inner-content">
                                    <div className="grid grid-cols-4 gap-12 pt-2 pb-4">
                                        <div className="border-r border-white/10 pr-6">
                                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">Learn</h4>
                                            <ul className="space-y-2">
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Join Affiliate Program</a></li>
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">E-commerce PowerLab</a></li>
                                            </ul>
                                        </div>
                                        <div className="border-r border-white/10 pr-6">
                                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">Customer Stories</h4>
                                            <ul className="space-y-2">
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">KraftGeek&apos;s Story</a></li>
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Paw Smart&apos;s Story</a></li>
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Sleep Shop&apos;s Story</a></li>
                                            </ul>
                                        </div>
                                        <div className="border-r border-white/10 pr-6">
                                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">Help Center</h4>
                                            <ul className="space-y-2">
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">One-click Video Solution</a></li>
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Product Images</a></li>
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Publishing and Analytics</a></li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest opacity-60">Campaign</h4>
                                            <ul className="space-y-2">
                                                <li><a className="text-sm text-gray-300 hover:text-white hover:translate-x-1 transition-all block py-1 font-light" href="#">Meet CreatorAI</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => navigate('/pricing')} className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors">Pricing</button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="hidden md:flex items-center gap-1.5 text-white/90 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium border border-white/20">
                            <span className="material-symbols-outlined text-[18px]">language</span>
                            <span className="hidden lg:inline">English</span>
                        </button>
                        <button className="hidden md:block text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm font-medium whitespace-nowrap cursor-pointer border border-white/20 hover:shadow-lg hover:shadow-white/10 transform " onClick={handleAuth}>
                            {user ? 'Dashboard' : 'Log in'}
                        </button>
                        <button className="hidden md:block text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-sm font-medium whitespace-nowrap cursor-pointer border border-white/20 hover:shadow-lg hover:shadow-white/10 transform " onClick={handleAuth}>
                            {user ? 'Go to App' : 'Start for free'}
                        </button>
                    </div>
                </nav>

                {/* Hero Content */}
                <header className="flex-grow flex flex-col justify-center items-center text-center px-6 relative z-20">
                    <div className="max-w-5xl mx-auto flex flex-col items-center">
                        <div className="flex flex-col items-center justify-center mb-4 animate-fade-in-up">
                            <img src={Logo} alt="CreatorAI Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                            <h1 className="text-7xl md:text-9xl font-brand font-medium tracking-tighter text-white hero-glow mb-4 drop-shadow-xl">
                                CreatorAI
                            </h1>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-light text-gray-200 mb-8 tracking-wide font-serif italic drop-shadow-lg opacity-90">
                            Your Smart Creative Agent
                        </h2>
                    </div>
                </header>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
            </div>

            {/* AI Masterpieces Carousel Section */}
            <section className="py-16 relative z-20 overflow-hidden bg-[#f0fdfa] dark:bg-[#0f172a]">
                <div className="max-w-[1600px] mx-auto px-6 mb-12">
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-2">AI Masterpieces</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-light tracking-wide text-lg">Infinite rhythmic stream of high-fidelity generations</p>
                    </div>
                </div>
                <div className="scroller-wrapper">
                    <div className="infinite-track">
                        {allCarouselImages.map((src, index) => (
                            <div key={index} className="carousel-card">
                                <img alt={`Carousel item ${index}`} src={src} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Section 1 - Link to Video */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-white dark:from-slate-800 dark:to-slate-900 opacity-50"></div>
                        <img alt="Marketing video dashboard interface" className="relative z-10 w-full h-auto object-cover transform group-hover:scale-105 transition duration-700 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACYHwl2wHD9VPnvb-CTGpWm_rQLZk3oxUjLu-emI6U_qufTjtfkKdIjC44GTK3ElCdR5T4EqXBBjQSu8PRFraM2UHG05SmOOS8BfJ_VfOhxkSNQRn_SqiHVqqtFEnrRfh5gZW8yn498Dan1sajCocYjZ1zsmi3V7grkMxlQO-6RGq-si5K5DEgZN19aNYr8OQSd43Pj6RFXDHbcStlfqiIN_HOdIN_ZF2zdrufTMSbrXrlmqwbMRXqxGQDHTV6J3_BlQHOCBMpipY" />
                        <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Generated Output</div>
                            <div className="font-bold text-gray-900 dark:text-white">Summer Sale Campaign Video</div>
                            <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary w-2/3"></div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 text-primary font-medium text-sm bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-base">link</span>
                            <span>Link to Video</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white leading-tight">
                            Turn any website into multiple videos in just <span className="italic text-primary">a few clicks</span>
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Enter your website link, add key details, and let CreatorAI instantly generate multiple video options to showcase your product in just a few clicks!
                        </p>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition" onClick={handleAuth}>
                            Try it now →
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Section 2 - AI Avatars */}
            <section className="py-24 px-6 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-800/30 rounded-3xl">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 order-2 md:order-1">
                        <div className="inline-flex items-center space-x-2 text-primary font-medium text-sm bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-base">face</span>
                            <span>Avatar Video</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white leading-tight">
                            Turn Script to Video Fast with A Diverse <span className="italic text-primary">Selection of Avatars</span>
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Select from a range of realistic avatars or customize your own to speak multiple languages, effortlessly connecting you with a global audience.
                        </p>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition" onClick={handleAuth}>
                            Try it now →
                        </button>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 order-1 md:order-2">
                        <img alt="AI Avatar selection interface" className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtAQszxAUlJ4M0rGDMgjkf_9yEFsWzkAI5MWb6NtYQQBVvY-nv6mHyX8_iIZqN5hPydmoDLYMFNY4x-dJk9ICToKN8kghL-25znfd51M6Vuuu-zulS8WLsPy03v0wxh2tlOpPxPKcBUiSvIlgoweg0qrqwKU5NGCdScyFweAMohyyqzp-a216JlNHy4R3YbjDehzfIeJme63FdyqY_odZM_nHd_7gQ2r6xK14YRFdY0vBhX91MfvZrsfh0zjzL6RA5HhWEPJDHo9Q" />
                        <div className="p-4 grid grid-cols-3 gap-2 bg-white dark:bg-gray-900">
                            <img alt="Male avatar" className="rounded-lg w-full aspect-square object-cover border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwSq_dGyLDhUaDQpmYO-rqPRkN_y832oKXdMqcbjzCNepJudt8S-eF65M1m4c8gdY6cGEc4Qn3P2vHu29nPaMTlLB0GzW7X76bQKqORNNenPbp6P5jhHpB_ANRdvLujUbfnwWPNqjpnUw0_YXt4XDhnweVj_wJLn50FZprhMLnwe8SNYJrkwsUU1z0qTSYJmN7jD3KAP_c3iSl9Sg-CavuhlA4MFfqih9sRSHEXNDLe376HOW61J6HtA626Ci2LpIgR2XoXSAGuI8" />
                            <img alt="Female avatar 1" className="rounded-lg w-full aspect-square object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPZyJO6Qo6q_cQNQNsg0YQSZxtPSAwOFfgFzzsP54t_MqF9bWh10yU6lZlV3oIZ8Ez6GaMrcE5eQ3fFGMe5yuYypFxT5fK32j8meHwzvpWOYbRC9W4YEK3Ll2BfxiAs5Zc16UNSAvoHwaawaXPnSz4iiLbrcIfCQs7ps9y76g2KKM5kXgY-MvNEV4GY8un95i_IobPN9vo5n1V4MGfo6o0_tYc8JCZZWkLRn--nT9_mPmHHVAUhzQ7wRRMMPFLLkDC583h7WbA6nY" />
                            <img alt="Female avatar 2" className="rounded-lg w-full aspect-square object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdVTaE-tyG9Ox-cbokBrBphp27VzODDGo1haeMajaP9WQfyFKHDSdaLwVpAfWwM-p00lGCuXI6VgrN2XeKz2ziFUCrM9UhE_ZFFpUT0G9_YfOhOrUMK-JbWXHs_1_s0QiyrxnE-I14Yhbav86aZKIsRoN6Zdg4FgzHqhhNZhGDEUt7d4VYuw84FRkKewrsXy2O6WgM-eGSqD-c3USJpOqyVUrj7EvEe5a7hk3vA5hMIbFKdUcfESmCTwYRw-aNAe8gcxRkCz5FgQk" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section 3 - Image Studio */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 z-0"></div>
                        <div className="relative z-10 flex items-center justify-center h-80 md:h-96 bg-gray-50 dark:bg-gray-800">
                            <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-xs mx-auto">
                                <span className="material-symbols-outlined text-4xl text-primary mb-4">add_photo_alternate</span>
                                <div className="font-medium text-gray-900 dark:text-white mb-2">Drop your product here</div>
                                <div className="text-xs text-gray-500">We'll generate the perfect studio background</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-2 text-primary font-medium text-sm bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-base">image</span>
                            <span>Image Studio</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white leading-tight">
                            Create stunning, studio-quality visuals in seconds with <span className="italic text-primary">AI-powered tools</span>
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Effortlessly transform any setting into the perfect backdrop, making it easy to create and publish content that helps your brand stand out.
                        </p>
                        <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition" onClick={handleAuth}>
                            Try it now →
                        </button>
                    </div>
                </div>
            </section>

            {/* Smart Tools Section */}
            <section className="py-20 bg-white dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif mb-4 dark:text-white">All the Smart Tools You Need to<br /><span className="italic text-primary">Streamline Your Content Creation</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer group" onClick={handleAuth}>
                            <div className="h-40 rounded-xl bg-teal-100 dark:bg-teal-900/30 mb-4 overflow-hidden relative">
                                <img alt="Avatar tool" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe8isDH2ee9b1FqEOD0RMPfPuAMTAxL-bTkLgJdWNAd68xp2LxMUoRdsDUnuiY5qA9Bew27y2VeqYge9XCbr9tGe90WPaLP76Oy23B3hRkczyEZn6wzvB8L1hXOh1eUBSqcJGIATS_9iHypCETr0rLiE_9WxVrtRLEGIG_ULedQiMmO3-vkvuAhRJ32r6SMQB64FN9udBa0R5xKZk4ijzZqVzvSZn0KXjyn5eVDT2Lo-Cb7YISdqtq_27DmXe9Lmq1Q86BtK4ykqg" />
                            </div>
                            <h4 className="font-bold text-lg mb-1 dark:text-white">Custom Avatar</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2">Create your own unique digital avatar for a personalized touch.</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center group-hover:text-primary transition">
                                Try it now <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer group" onClick={handleAuth}>
                            <div className="h-40 rounded-xl bg-orange-100 dark:bg-orange-900/30 mb-4 overflow-hidden relative">
                                <img alt="Editor interface" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnqHPzslWArSwQvV_y4cS0okezgAlgnBXOJqMUOmq_kBGl8FIgYN8rL1SGvMLBuwjLXb20ZFFQCwgVqun5BPUpvTZTRr7cLi2QPtADs7WJpcGDeHaYnHUmoQrpIx88S602xb0bSu3YV3yTZBEpwdDf47qkFgL3ZE2PjlqU565ilmGQL0HsAcYMQ2KhmyUIvEaYW0M7lmxVw97AnO6rkCR6mpZ93C9pGM9JSqRxGry-2mCjmc6m9p8NP373rgPva1yRZrSXXC6-rw8" />
                            </div>
                            <h4 className="font-bold text-lg mb-1 dark:text-white">Image Editor</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2">Your go-to tool for creating and editing images with ease.</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center group-hover:text-primary transition">
                                Try it now <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer group" onClick={handleAuth}>
                            <div className="h-40 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-4 overflow-hidden relative">
                                <img alt="Video editing" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfq6sElxQDRJdhsbh-rFKAy-i_iKk7pBitJwj_Zb6gZ2m783VzQreBkkviJPi8phH66Qu0GKs1V3IJWDkQwB2zXFrsbKqeOCcc2BGyX--VSR6vcpuZex-NbpumXOWK5cHcmTkijUaBd-dt_pCv0cbKDqO397oLLrcnHVXev-v3NOpnPT8EB3iOUNKORlTQe-Tj4lijWwmFVBdOA2U8dB-ula5wHhmj_ecPNwQkjj_GzGWrglXgPJarfF4JObyZRlUcivOplRruQy0" />
                            </div>
                            <h4 className="font-bold text-lg mb-1 dark:text-white">Quick Cut</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2">Speed up video editing by transcribing and editing directly from text.</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center group-hover:text-primary transition">
                                Try it now <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer group" onClick={handleAuth}>
                            <div className="h-40 rounded-xl bg-green-100 dark:bg-green-900/30 mb-4 overflow-hidden relative">
                                <img alt="Background removal" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPp3gumoOXw700g5agtU82IeDOQ2I589DZ-C7YFhmxXDBci0K11qi_JXvBpvA_p7QlWUFO7VkQJ6ov7cJQqD_y_j6mmdIWbZ6LgVDIwkNESmp7dLDfXCnKE9ckMSV7oOufOzmyUgSSBjrTCSOixu7khmQURh3t71hHvl66IJFh66snz1NtmD8TdmuPY3nPJCwwnsl6H3B0hIMBUtiZwyzvj3VsMalzfT1TtiI_im85lenp_-wO-ExgiGo86YP8Q18jPMTWeJ5jVIU" />
                            </div>
                            <h4 className="font-bold text-lg mb-1 dark:text-white">Remove Background</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 line-clamp-2">Instantly remove backgrounds from images with one click.</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center group-hover:text-primary transition">
                                Try it now <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Impact Section */}
            <section className="py-24 bg-white dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif dark:text-white">Driving Business Impact Can <span className="italic font-light">Be Easier</span></h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reduce production costs by</div>
                            <div className="text-5xl font-bold text-primary mb-6">20%</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Increase organic reach on Instagram by</div>
                            <div className="text-5xl font-bold text-primary mb-6">98%</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reduce content production time by</div>
                            <div className="text-5xl font-bold text-primary mb-6">80%</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Free Trial CTA Section */}
            <section className="py-24 max-w-5xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-serif text-center mb-12 dark:text-white">Experience the Freedom to <span className="italic">Create</span><br />and <span className="italic">Publish Content</span></h2>
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
                    <div className="p-10 md:w-1/2 flex flex-col justify-center">
                        <div className="text-3xl font-bold mb-6 dark:text-white">$0</div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <span className="text-primary mr-2">✓</span> Unlimited access to CreatorAI during free trial.
                            </li>
                            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <span className="text-primary mr-2">✓</span> Unlock 600 credits to create up to 600 seconds of video or 200 images.
                            </li>
                            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <span className="text-primary mr-2">✓</span> Explore our AI features and the full catalog of pre-cleared commercial templates.
                            </li>
                            <li className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                <span className="text-primary mr-2">✓</span> No financial obligation or credit card is required.
                            </li>
                        </ul>
                        <button className="bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-lg font-bold hover:opacity-90 transition text-center w-full" onClick={handleAuth}>
                            Start your free trial →
                        </button>
                        <div className="text-center mt-3 text-xs text-gray-400 underline cursor-pointer" onClick={() => navigate('/pricing')}>View All Plans</div>
                    </div>
                    <div className="md:w-1/2 relative bg-teal-50 dark:bg-gray-700">
                        <img alt="Creative user" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0EozFXGjKu4GFmSxKvmNIdx27bzHb_4log_JolTedfVya2Z5T3j6fs0WQqZrnfzUGk6kVcwjZqas5nvjkHKlZbKGp-7PKqdjjDSIJJp52yIjzfqPwj_zzPnRkOO402iD4cZPQhwjWzfvrSO1dcl7MVpd8DQaebev4Hmm7fHu40ZIQl4v-SQnBKR11RtP7wSOEOnleRV6HmrVlIgYyDCOLaQFh7cwMeGBtkO6SybSvka4de1vX3_cRTgpZ0Fi6l2ylXyIFuMks_-w" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-xl text-white">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="text-xs font-bold">GENERATING...</span>
                                </div>
                                <div className="h-2 bg-white/30 rounded-full w-full overflow-hidden">
                                    <div className="h-full bg-white w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <div className="bg-gradient-to-b from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-900/50 py-24 text-center">
                <h2 className="text-3xl md:text-5xl font-serif mb-4 text-gray-900 dark:text-white">Create With Wings<br /><span className="italic">Supercharged Content Creation</span></h2>
                <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold mt-8 hover:scale-105 transition shadow-xl" onClick={handleAuth}>
                    Start your free trial →
                </button>
            </div>

            {/* Footer */}
            <footer className="bg-black text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src={Logo} alt="CreatorAI Logo" className="w-10 h-10 object-contain" />
                                <span className="font-brand font-bold text-lg tracking-tight">CreatorAI</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                Powered by AI, CreatorAI supercharges your content creation.
                            </p>
                            <div className="flex space-x-4">
                                <a className="text-gray-400 hover:text-white" href="#">IG</a>
                                <a className="text-gray-400 hover:text-white" href="#">X</a>
                                <a className="text-gray-400 hover:text-white" href="#">YT</a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-sm">Solutions</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><button className="hover:text-white" onClick={handleAuth}>One-click Video Solution</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>AI Product Images</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>AI Avatars and Voices</button></li>
                                <li><button className="hover:text-white" onClick={handleAuth}>Publishing and Analytics</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-sm">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a className="hover:text-white" href="#">Help Center</a></li>
                                <li><a className="hover:text-white" href="#">Customer Stories</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-sm">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><button className="hover:text-white" onClick={() => navigate('/terms')}>Terms of Service</button></li>
                                <li><button className="hover:text-white" onClick={() => navigate('/privacy')}>Privacy Policy</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4 md:mb-0">
                            <button className="hover:text-gray-300" onClick={() => navigate('/terms')}>Terms of Service</button>
                            <button className="hover:text-gray-300" onClick={() => navigate('/privacy')}>Privacy Policy</button>
                        </div>
                        <div>
                            Unleash your creativity with wings - supercharge your content now! <button className="text-primary ml-1 hover:underline" onClick={handleAuth}>Sign up for free</button>
                        </div>
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

export default LandingPage;
