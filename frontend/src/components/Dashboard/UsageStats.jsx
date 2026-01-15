import { useUsageStats } from '../../hooks/useUsageStats';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const UsageStats = () => {
  const { userData } = useAuth();
  const stats = useUsageStats(30); // Last 30 days

  // NEVER show loading - always render UI with available data
  const creditsRemaining = userData?.credits || 0;
  const isLowCredits = creditsRemaining < 2;
  const successRate = stats.totalGenerated > 0 
    ? Math.round((stats.successfulGenerations / stats.totalGenerated) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Content Generated */}
      <AnalyticsCard 
        label="Content Generated" 
        value={stats.totalGenerated.toString()} 
        icon={<DocumentIcon />} 
      />
      
      {/* Credits Used */}
      <AnalyticsCard 
        label="Credits Used" 
        value={stats.creditsUsed.toString()} 
        icon={<ChartIcon />} 
      />
      
      {/* Success Rate */}
      <AnalyticsCard 
        label="Success Rate" 
        value={stats.totalGenerated > 0 ? `${successRate}%` : '--'}
        icon={<ShieldIcon />} 
        trend={stats.totalGenerated > 0 ? undefined : undefined}
      />
      
      {/* Credits Remaining */}
      <AnalyticsCard 
        label="Credits Remaining" 
        value={creditsRemaining.toString()} 
        icon={<WalletIcon />} 
        highlight={isLowCredits}
        actionLabel={isLowCredits ? "Top Up" : undefined}
      />
    </div>
  );
};

const AnalyticsCard = ({ label, value, icon, trend, highlight, actionLabel }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`p-6 border rounded-sm flex flex-col justify-between h-32 relative overflow-hidden transition-colors ${
      highlight 
        ? (theme === 'dark' 
            ? 'bg-red-900/10 border-red-900/30' 
            : 'bg-red-50 border-red-200')
        : (theme === 'dark'
            ? 'bg-[#2C2A26] border-[#433E38]'
            : 'bg-white border-[#D6D1C7]')
    }`}>
      <div className="flex justify-between items-start z-10">
        <div>
          <span className={`block text-[10px] uppercase tracking-widest font-bold mb-1 transition-colors duration-300 ${
            highlight 
              ? (theme === 'dark' ? 'text-red-400' : 'text-red-600')
              : 'text-[#A8A29E]'
          }`}>
            {label}
          </span>
          <span className={`block text-3xl font-serif transition-colors duration-300 ${
            highlight 
              ? (theme === 'dark' ? 'text-red-300' : 'text-red-700')
              : (theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]')
          }`}>
            {value}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
          highlight 
            ? (theme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-600')
            : (theme === 'dark' ? 'bg-[#433E38] text-[#A8A29E]' : 'bg-[#F5F2EB] text-[#5D5A53]')
        }`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold mt-auto z-10 transition-colors duration-300 ${
          theme === 'dark' ? 'text-green-400' : 'text-green-600'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
          {trend}
        </div>
      )}

      {actionLabel && (
        <div className="mt-auto z-10">
          <button className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 hover:underline ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

// Icons
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

export default UsageStats;
