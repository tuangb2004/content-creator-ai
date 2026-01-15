import { useEffect, useRef, useState } from 'react';

let historyListenerBound = false;
let lastPopTimestamp = 0;
let pageVisited = false;

const ensureHistoryListener = () => {
  if (historyListenerBound || typeof window === 'undefined') return;
  historyListenerBound = true;
  
  // Check if page was visited before in this session
  if (sessionStorage.getItem('page_visited')) {
    pageVisited = true;
  }
  
  window.addEventListener('popstate', () => {
    lastPopTimestamp = Date.now();
    // Mark that we're doing back navigation
    sessionStorage.setItem('is_back_navigation', 'true');
  });
  
  // Mark page as visited
  sessionStorage.setItem('page_visited', 'true');
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
    
    // Check for back navigation FIRST - highest priority
    const isBackNav = sessionStorage.getItem('is_back_navigation') === 'true';
    const isRestoring = sessionStorage.getItem('restoring_scroll') === 'true';
    const wasPageVisited = sessionStorage.getItem('page_visited') === 'true';
    
    // If back navigation or restoring, IMMEDIATELY show all elements without any delay
    if (isBackNav || isRestoring || (wasPageVisited && Date.now() - lastPopTimestamp < 5000)) {
      if (ref.current) {
        ref.current.dataset.revealed = 'true';
      }
      setIsVisible(true);
      setSkipAnimation(true);
      return;
    }
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isPopNavigation = Date.now() - lastPopTimestamp < 5000; // Increased to 5 seconds
    const alreadyRevealed = ref.current?.dataset?.revealed === 'true';
    const rect = ref.current?.getBoundingClientRect();
    const inViewport = rect
      ? rect.top < window.innerHeight + 300 && rect.bottom > -300 // Even larger detection area
      : false;

    // Skip animation if any of these conditions are met
    const shouldSkipAnimation = alreadyRevealed || 
                                 inViewport || 
                                 prefersReducedMotion || 
                                 isPopNavigation;

    if (shouldSkipAnimation) {
      if (ref.current) {
        ref.current.dataset.revealed = 'true';
      }
      setIsVisible(true);
      setSkipAnimation(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      // Double-check we're not in back navigation before animating
      const stillBackNav = sessionStorage.getItem('is_back_navigation') === 'true';
      const stillRestoring = sessionStorage.getItem('restoring_scroll') === 'true';
      
      if (entry.isIntersecting) {
        if (stillBackNav || stillRestoring) {
          // Skip animation even during observation
          setSkipAnimation(true);
        }
        setIsVisible(true);
        if (ref.current) {
          ref.current.dataset.revealed = 'true';
        }
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.05, rootMargin: '0px 0px 15% 0px' }); // More aggressive threshold

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

