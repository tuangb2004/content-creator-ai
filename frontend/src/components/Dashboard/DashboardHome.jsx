import { useEffect, useRef, useMemo } from 'react';
import { TOOLS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import toast from '../../utils/toast';

const DashboardHome = ({ onToolSelect, recentProjects, onViewAll, onViewAuditLog, onViewProjects, onOpenProject }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';
  if (currentHour >= 12) greeting = 'Good Afternoon';
  if (currentHour >= 18) greeting = 'Good Evening';

  const creditsRemaining = userData?.credits ?? 0;
  const plan = userData?.plan || 'free';
  const totalCredits = plan === 'pro' ? 2000 : plan === 'agency' ? 10000 : 10;
  const creditsUsed = Math.max(0, totalCredits - creditsRemaining);
  const isLowCredits = creditsRemaining < 2;
  const contentGenerated = recentProjects.length;
  const { logs } = useActivityLogs(6);

  const prevCreditsRef = useRef(creditsRemaining);

  useEffect(() => {
    const prevCredits = prevCreditsRef.current;
    const notificationKey = 'low-credits-notification-shown';
    const notificationShown = sessionStorage.getItem(notificationKey) === 'true';
    const creditsDecreased = creditsRemaining < prevCredits;
    const isVeryLow = creditsRemaining === 0 || (creditsRemaining > 0 && creditsRemaining <= 5);

    if (isVeryLow && creditsDecreased && !notificationShown) {
      toast.error(
        creditsRemaining === 0
          ? 'No credits remaining! Please upgrade your plan to continue creating content.'
          : `Low credits! You have ${creditsRemaining} credits remaining. Consider upgrading your plan.`,
        { duration: 5000 }
      );
      sessionStorage.setItem(notificationKey, 'true');
    }

    if (creditsRemaining > 5) {
      sessionStorage.removeItem(notificationKey);
    }

    prevCreditsRef.current = creditsRemaining;
  }, [creditsRemaining]);

  const formatRelativeTime = (date) => {
    const now = Date.now();
    const target = date instanceof Date ? date.getTime() : new Date(date).getTime();
    const diffMs = Math.max(0, now - target);
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const activities = useMemo(() => {
    if (!logs || logs.length === 0) {
      return [];
    }

    return logs
      .filter((log) => {
        // Only show specific activity types
        const action = String(log.action || '').toLowerCase();
        
        // For credits_updated, only show when credits are added (change > 0)
        if (action === 'credits_updated') {
          const metadata = log.metadata || {};
          const change = metadata.change || 0;
          return change > 0; // Only show when credits are added
        }
        
        return action === 'generate_content' || 
               action === 'user_login' ||
               action === 'image_exported';
      })
      .map((log) => {
        const action = String(log.action || '').toLowerCase();
        const metadata = log.metadata || {};

        // Determine event type and styling
        let eventType = 'content'; // default
        let title = '';
        let detail = '';
        let circleColor = 'bg-[#2C2A26] dark:bg-[#F5F2EB]'; // dark grey/black

        if (action === 'generate_content') {
          eventType = 'content';
          title = 'CONTENT GENERATED';
          // Format: "SEO Editorial: "Future of AI"" or "IMAGE: Tool Name"
          const contentType = metadata.contentType ? String(metadata.contentType).toUpperCase() : 'CONTENT';
          const toolName = metadata.toolName || 'Creative Tool';
          // For text content, show format like "SEO Editorial: "Title""
          if (contentType === 'TEXT' || contentType === 'CONTENT') {
            // Try to extract title from prompt or use tool name
            const prompt = metadata.prompt || '';
            const shortPrompt = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
            detail = `${toolName}: "${shortPrompt}"`;
          } else {
            detail = `${contentType}: ${toolName}`;
          }
          circleColor = 'bg-[#2C2A26] dark:bg-[#F5F2EB]'; // dark grey/black
        } else if (action === 'credits_updated') {
          // Only credits added (change > 0) pass the filter
          eventType = 'credits';
          title = 'CREDITS UPDATED';
          detail = metadata.reason || (metadata.planName ? `Plan upgrade: ${metadata.planName}` : 'Daily allowance added');
          circleColor = 'bg-emerald-500'; // green (#2ecc71)
        } else if (action === 'user_login') {
          eventType = 'login';
          title = 'NEW LOGIN';
          detail = metadata.platform || 'Chrome on Windows';
          circleColor = 'bg-orange-500'; // orange (#f39c12)
        } else if (action === 'image_exported') {
          eventType = 'export';
          title = 'IMAGE EXPORTED';
          detail = metadata.toolName || metadata.projectId || 'Visual Studio';
          circleColor = 'bg-[#2C2A26] dark:bg-[#F5F2EB]'; // dark grey/black
        }

        return {
          id: log.id,
          eventType,
          title,
          detail,
          time: formatRelativeTime(log.timestamp),
          circleColor
        };
      });
  }, [logs]);

  return (
    <div className="space-y-12 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${
            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>{greeting}, Creator.</h2>
          <p className={`transition-colors duration-300 ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>Here is what's happening in your studio today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard label="Content Generated" value={String(contentGenerated)} icon={<DocumentIcon />} />
        <AnalyticsCard label="Credits Used" value={String(creditsUsed)} icon={<ChartIcon />} />
        <AnalyticsCard label="Success Rate" value={contentGenerated ? '99.8%' : '--'} icon={<ShieldIcon />} trend={contentGenerated ? '+0.4%' : undefined} />
        <AnalyticsCard label="Credits Remaining" value={String(creditsRemaining)} icon={<WalletIcon />} highlight={isLowCredits} actionLabel={isLowCredits ? 'Top Up' : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Recent Activity</h3>
            <button onClick={onViewProjects} className={`text-xs font-bold uppercase tracking-widest hover:underline ${
              theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>View Projects</button>
          </div>

          <div className={`border rounded-sm overflow-hidden shadow-sm transition-colors ${
            theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
          }`}>
            {recentProjects.length === 0 ? (
              <div className="p-12 text-center text-[#A8A29E]">
                <p className="font-serif italic text-lg">Your canvas is waiting for the first stroke.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className={`text-[10px] uppercase tracking-[0.2em] ${
                  theme === 'dark' ? 'bg-[#1C1B19] text-[#A8A29E]' : 'bg-[#F5F2EB] text-[#5D5A53]'
                }`}>
                  <tr>
                    <th className="p-5 font-bold">Project</th>
                    <th className="p-5 font-bold">Type</th>
                    <th className="p-5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#D6D1C7]'}`}>
                  {recentProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => onOpenProject?.(project)}
                      className={`transition-colors cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-[#1C1B19]' : 'hover:bg-[#F9F8F6]'
                      }`}
                    >
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm line-clamp-2 max-w-[240px] ${
                            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                          }`}>{project.prompt}</span>
                          <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">{project.toolName}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${
                          project.type === 'image'
                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {project.type}
                        </span>
                      </td>
                      <td className="p-5 text-[#A8A29E] text-xs text-right font-medium">
                        {new Date(project.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Studio Pulse</h3>
          <div className={`border p-6 rounded-sm shadow-sm transition-colors ${
            theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-[#F8F6F2] border-[#D6D1C7]'
          }`}>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-[#A8A29E]">
                <p className="text-sm font-light">No activity yet</p>
                <p className="text-xs mt-1">Generate content to see your studio pulse here.</p>
              </div>
            ) : (
              <div className={`space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] ${
                theme === 'dark' ? 'before:bg-[#433E38]' : 'before:bg-[#D6D1C7]'
              }`}>
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-8">
                    <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 z-10 ${
                      theme === 'dark' ? 'border-[#2C2A26]' : 'border-[#F8F6F2]'
                    } ${act.circleColor}`}></div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                        }`}>{act.title}</span>
                        <span className="text-[10px] text-[#A8A29E] font-light">{act.time}</span>
                      </div>
                      <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activities.length > 0 && (
              <button
                onClick={onViewAuditLog}
                className={`w-full mt-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors ${
                theme === 'dark'
                  ? 'border-[#433E38] text-[#F5F2EB] hover:bg-[#1C1B19]'
                  : 'border-[#D6D1C7] text-[#2C2A26] hover:bg-[#F5F2EB]'
              }`}
              >
                VIEW FULL AUDIT LOG
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Launchpad</h3>
          <button onClick={onViewAll} className={`text-xs font-bold uppercase tracking-widest hover:underline ${
            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>All Tools</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.slice(0, 4).map((tool) => (
            <div 
              key={tool.id}
              onClick={() => onToolSelect(tool)}
              className={`p-6 rounded-sm border transition-all cursor-pointer group ${
                theme === 'dark'
                  ? 'bg-[#2C2A26] border-[#433E38] hover:shadow-md'
                  : 'bg-white border-[#D6D1C7] hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-full mb-4 flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-[#433E38] text-[#F5F2EB] group-hover:bg-[#F5F2EB] group-hover:text-[#2C2A26]'
                  : 'bg-[#F5F2EB] text-[#2C2A26] group-hover:bg-[#2C2A26] group-hover:text-[#F5F2EB]'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h4 className={`font-serif text-lg mb-1 transition-colors duration-300 ${
                theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
              }`}>{tool.name}</h4>
              <p className={`text-[11px] line-clamp-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}`}>
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ label, value, icon, trend, highlight, actionLabel }) => (
  <div className={`p-6 border rounded-sm flex flex-col justify-between h-32 relative overflow-hidden transition-colors ${
    highlight ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
    : 'bg-white dark:bg-[#2C2A26] border-[#D6D1C7] dark:border-[#433E38]'
  }`}>
    <div className="flex justify-between items-start z-10">
      <div>
        <span className={`block text-[10px] uppercase tracking-widest font-bold mb-1 ${
          highlight ? 'text-red-600 dark:text-red-400' : 'text-[#A8A29E]'
        }`}>
          {label}
        </span>
        <span className={`block text-3xl font-serif ${
          highlight ? 'text-red-700 dark:text-red-300' : 'text-[#2C2A26] dark:text-[#F5F2EB]'
        }`}>
          {value}
        </span>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        highlight ? 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200'
        : 'bg-[#F5F2EB] text-[#5D5A53] dark:bg-[#433E38] dark:text-[#A8A29E]'
      }`}>
        {icon}
      </div>
    </div>
    
    {trend && (
      <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 mt-auto z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        {trend}
      </div>
    )}

    {actionLabel && (
      <div className="mt-auto z-10">
        <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline">
          {actionLabel}
        </button>
      </div>
    )}
  </div>
);

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

export default DashboardHome;
