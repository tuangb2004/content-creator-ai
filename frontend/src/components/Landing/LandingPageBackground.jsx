import { useTheme } from '../../contexts/ThemeContext';

/**
 * Landing page background for verify email modal
 * Matches Hero component styling exactly for consistent backdrop blur
 */
function LandingPageBackground() {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
                ? 'bg-gray-900 text-gray-100'
                : 'bg-[#F5F2EB] text-[#2C2A26]'
            }`}>
            {/* Hero Section - Matching Hero.jsx exactly */}
            <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-[#D6D1C7] dark:bg-gray-900 transition-colors duration-300">
                {/* Background - Video (same as Hero) */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.4] dark:brightness-[0.2] transition-all duration-300"
                        poster="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=2000"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-186-large.mp4" type="video/mp4" />
                        <img
                            src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=2000"
                            alt="Abstract digital fluid art"
                            className="w-full h-full object-cover grayscale contrast-[0.85] brightness-[0.7] dark:brightness-[0.3] transition-all duration-300"
                        />
                    </video>

                    {/* Overlay for better text contrast (same as Hero) */}
                    <div className="absolute inset-0 bg-[#2C2A26]/20 dark:bg-black/40 mix-blend-multiply transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C2A26]/80 dark:from-black/80 via-transparent to-[#2C2A26]/30 dark:to-black/40 opacity-60 transition-all duration-300"></div>
                </div>

                {/* Content (same as Hero) */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                    <div className="animate-fade-in-up w-full max-w-4xl">
                        <span className="block text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white/90 mb-6 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full mx-auto w-fit border border-white/10">
                            AI-POWERED CONTENT SUITE
                        </span>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-normal text-white tracking-tight mb-8 drop-shadow-xl">
                            Create <span className="italic text-[#F5F2EB]">everything.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-lg md:text-xl text-white/90 font-light leading-relaxed mb-12 text-shadow-sm whitespace-pre-wrap">
                            From viral tweets to SEO articles.
                            CreatorAI creates tailored content for your brand in seconds.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>
        </div>
    );
}

export default LandingPageBackground;
