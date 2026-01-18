import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const EnhancedMetricsCard = ({
    label,
    value,
    icon,
    trend,
    trendValue, // e.g., "+12% this week"
    highlight,
    actionLabel,
    tooltipData, // { title, items: [{label, value}] }
    previousValue // For animation
}) => {
    const { theme } = useTheme();
    const [displayValue, setDisplayValue] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    const counterRef = useRef(null);

    // Animate counter on mount or value change
    useEffect(() => {
        const targetValue = parseInt(value) || 0;
        const startValue = parseInt(previousValue) || 0;
        const duration = 1000; // 1 second
        const steps = 30;
        const increment = (targetValue - startValue) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
                setDisplayValue(Math.round(startValue + increment * currentStep));
            } else {
                setDisplayValue(targetValue);
                clearInterval(timer);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, previousValue]);

    return (
        <div
            className={`relative p-6 border rounded-sm flex flex-col justify-between h-32 overflow-hidden transition-all cursor-pointer group ${highlight
                ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 hover:shadow-lg'
                : 'bg-white dark:bg-[#2C2A26] border-[#D6D1C7] dark:border-[#433E38] hover:shadow-lg'
                }`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Tooltip */}
            {showTooltip && tooltipData && (
                <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-[#2C2A26] text-white p-4 rounded-sm shadow-2xl border border-[#433E38]">
                    <div className="text-xs font-bold uppercase tracking-widest mb-3 text-[#F5F2EB]">
                        {tooltipData.title}
                    </div>
                    <div className="space-y-2">
                        {tooltipData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                                <span className="text-[#A8A29E]">{item.label}</span>
                                <span className="font-semibold text-[#F5F2EB]">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#2C2A26]"></div>
                </div>
            )}

            <div className="flex justify-between items-start z-10">
                <div>
                    <span
                        className={`block text-[10px] uppercase tracking-widest font-bold mb-1 ${highlight ? 'text-red-600 dark:text-red-400' : 'text-[#A8A29E]'
                            }`}
                    >
                        {label}
                    </span>
                    <span
                        ref={counterRef}
                        className={`block text-3xl font-serif transition-all ${highlight ? 'text-red-700 dark:text-red-300' : 'text-[#2C2A26] dark:text-[#F5F2EB]'
                            }`}
                    >
                        {displayValue}
                    </span>
                </div>
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${highlight
                        ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200'
                        : 'bg-[#F5F2EB] text-[#5D5A53] dark:bg-[#433E38] dark:text-[#A8A29E] group-hover:bg-[#2C2A26] group-hover:text-[#F5F2EB] dark:group-hover:bg-[#F5F2EB] dark:group-hover:text-[#2C2A26]'
                        }`}
                >
                    {icon}
                </div>
            </div>

            {/* Trend indicator or action */}
            {(trend || trendValue) && (
                <div className="flex items-center gap-1 text-[10px] font-bold mt-auto z-10">
                    {trend === 'up' && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3 text-green-600 dark:text-green-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                    {trend === 'down' && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3 text-red-600 dark:text-red-400"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                    {trendValue && (
                        <span className={trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-[#A8A29E]'}>
                            {trendValue}
                        </span>
                    )}
                </div>
            )}

            {actionLabel && (
                <div className="mt-auto z-10">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline">
                        {actionLabel}
                    </button>
                </div>
            )}

            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        </div>
    );
};

export default EnhancedMetricsCard;
