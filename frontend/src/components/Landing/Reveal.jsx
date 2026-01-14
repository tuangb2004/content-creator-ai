import { useEffect, useRef, useState } from 'react';

/**
 * Reveal component for scroll animations
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 * @param {number} props.delay - delay in milliseconds
 * @param {'full' | 'fit'} props.width
 */
export const Reveal = ({ children, className = "", delay = 0, width = 'full' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, []);

  const baseClasses = "transition-all duration-700 ease-out transform";
  const visibleClasses = isVisible 
    ? "opacity-100 translate-y-0 blur-0" 
    : "opacity-0 translate-y-12 blur-sm";
  
  const style = { transitionDelay: isVisible ? `${delay}ms` : '0ms' };

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

