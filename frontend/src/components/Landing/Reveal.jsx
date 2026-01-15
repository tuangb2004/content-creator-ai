import { useEffect, useRef, useState } from 'react';

let historyListenerBound = false;
let lastPopTimestamp = 0;

const ensureHistoryListener = () => {
  if (historyListenerBound || typeof window === 'undefined') return;
  historyListenerBound = true;
  window.addEventListener('popstate', () => {
    lastPopTimestamp = Date.now();
  });
};

/**
 * Reveal component for scroll animations
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 * @param {number} props.delay - delay in milliseconds
 * @param {'full' | 'fit'} props.width
 */
export const Reveal = ({ children, className = "", delay = 0, width = 'full' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    ensureHistoryListener();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isPopNavigation = Date.now() - lastPopTimestamp < 1500;
    const alreadyRevealed = ref.current?.dataset?.revealed === 'true';
    const rect = ref.current?.getBoundingClientRect();
    const inViewport = rect
      ? rect.top < window.innerHeight && rect.bottom > 0
      : false;

    if (alreadyRevealed || inViewport || prefersReducedMotion || isPopNavigation) {
      if (ref.current) {
        ref.current.dataset.revealed = 'true';
      }
      setIsVisible(true);
      setSkipAnimation(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) {
          ref.current.dataset.revealed = 'true';
        }
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px 12% 0px' });

    if (ref.current) observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const baseClasses = skipAnimation
    ? "block"
    : "transition-opacity transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu";
  const visibleClasses = isVisible 
    ? "opacity-100 translate-y-0 scale-100" 
    : "opacity-0 translate-y-6 scale-[0.98]";
  
  const style = skipAnimation
    ? { transition: 'none', willChange: 'auto' }
    : { transitionDelay: `${delay}ms`, willChange: 'transform, opacity' };

  return (
    <div 
      ref={ref} 
      className={`${baseClasses} ${visibleClasses} ${className} ${width === 'full' ? 'w-full' : 'w-fit'}`} 
      style={style}
    >
      {children}
    </div>
  );
};

