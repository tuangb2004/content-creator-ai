import { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import toast from '../../utils/toast';
import EnhancedMetricsCard from './EnhancedMetrics';


const DashboardHome = ({ onToolSelect, recentProjects, onViewAll, onViewAuditLog, onViewProjects, onOpenProject }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const [previousCredits, setPreviousCredits] = useState(null);
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

  // Track previous values for counter animation
  useEffect(() => {
    if (previousCredits === null) {
      setPreviousCredits(creditsRemaining);
    }
  }, [creditsRemaining, previousCredits]);

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

    // Debug: Log all actions to see what's being filtered
    console.log('🔍 Activity logs received:', logs.length, 'logs');
    logs.forEach((log, index) => {
      console.log(`  [${index}] ID: ${log.id}, Action: "${log.action}", Timestamp: ${log.timestamp}, Metadata:`, log.metadata);
    });

    const filtered = logs
      .filter((log) => {
        // Only show specific activity types
        const action = String(log.action || '').toLowerCase();

        // Debug: Check each action
        console.log(`🔎 Filtering log [${log.id}]: action="${log.action}" -> lowercase="${action}"`);

        // For credits_updated, only show when credits are added (change > 0)
        if (action === 'credits_updated') {
          const metadata = log.metadata || {};
          const change = metadata.change || 0;
          const included = change > 0;
          console.log(`  📊 Credits updated: change=${change}, included=${included}`);
          return included;
        }

        const isAllowed = action === 'generate_content' ||
          action === 'user_login' ||
          action === 'image_exported';

        // Debug: Log why logs are filtered out
        if (!isAllowed && action) {
          console.log(`  🚫 Filtered out: action="${action}" is not in allowed list [generate_content, user_login, image_exported]`);
        } else if (isAllowed) {
          console.log(`  ✅ Included: action="${action}"`);
        }

        return isAllowed;
      });

    // Debug: Log filtered results
    console.log('✅ Filtered activity logs:', filtered.length, 'logs');
    filtered.forEach((log, index) => {
      console.log(`  [${index}] ID: ${log.id}, Action: "${log.action}", Timestamp: ${log.timestamp}`);
    });

    return filtered
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
          <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>{greeting}, Creator.</h2>
          <p className={`transition-colors duration-300 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
            }`}>Here is what's happening in your studio today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedMetricsCard
          label="Content Generated"
          value={String(contentGenerated)}
          icon={<DocumentIcon />}
          trend={contentGenerated > 0 ? 'up' : undefined}
          trendValue={contentGenerated > 0 ? `+${contentGenerated} total` : undefined}
          tooltipData={{
            title: 'Content Generated',
            items: [
              { label: 'This week', value: String(contentGenerated) },
              { label: 'All time', value: String(contentGenerated) }
            ]
          }}
          previousValue="0"
        />
        <EnhancedMetricsCard
          label="Credits Used"
          value={String(creditsUsed)}
          icon={<ChartIcon />}
          trend={creditsUsed > 0 ? 'up' : undefined}
          trendValue={creditsUsed > 0 ? `${Math.round((creditsUsed / totalCredits) * 100)}% used` : undefined}
          tooltipData={{
            title: 'Credit Usage',
            items: [
              { label: 'Used', value: String(creditsUsed) },
              { label: 'Total', value: String(totalCredits) },
              { label: 'Avg per content', value: contentGenerated > 0 ? String(Math.round(creditsUsed / contentGenerated)) : '0' }
            ]
          }}
          previousValue="0"
        />
        <EnhancedMetricsCard
          label="Success Rate"
          value={contentGenerated ? '99.8%' : '--'}
          icon={<ShieldIcon />}
          trend={contentGenerated ? 'up' : undefined}
          trendValue={contentGenerated ? '+0.4%' : undefined}
          tooltipData={{
            title: 'Success Rate',
            items: [
              { label: 'Successful', value: contentGenerated ? String(Math.round(contentGenerated * 0.998)) : '0' },
              { label: 'Failed', value: contentGenerated ? String(Math.round(contentGenerated * 0.002)) : '0' }
            ]
          }}
          previousValue="--"
        />
        <EnhancedMetricsCard
          label="Credits Remaining"
          value={String(creditsRemaining)}
          icon={<WalletIcon />}
          highlight={isLowCredits}
          actionLabel={isLowCredits ? 'Top Up' : undefined}
          trend={creditsRemaining < (previousCredits || totalCredits) ? 'down' : undefined}
          trendValue={`${Math.round((creditsRemaining / totalCredits) * 100)}% left`}
          tooltipData={{
            title: 'Credits Overview',
            items: [
              { label: 'Remaining', value: String(creditsRemaining) },
              { label: 'Plan total', value: String(totalCredits) },
              { label: 'Plan', value: plan.toUpperCase() }
            ]
          }}
          previousValue={String(previousCredits || creditsRemaining)}
        />
      </div>

      {/* Main Grid: Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Recent Projects (Left - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Recent Activity</h3>
            {recentProjects.length > 0 && (
              <button onClick={onViewProjects} className={`text-xs font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                }`}>View Projects</button>
            )}
          </div>

          <div className={`border rounded-sm overflow-hidden shadow-sm min-h-[380px] flex flex-col transition-colors ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
            }`}>
            {recentProjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
                {/* Decorative Background for Empty State */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full scale-150 opacity-50 blur-3xl -z-10 group-hover:scale-[2] transition-transform duration-1000 ${theme === 'dark' ? 'bg-[#1C1B19]' : 'bg-[#F5F2EB]'
                  }`}></div>

                {/* Abstract Canvas Illustration */}
                <div className="mb-8 relative">
                  <div className={`w-20 h-24 border rounded-sm transform -rotate-6 transition-transform group-hover:rotate-0 duration-500 flex flex-col p-3 shadow-md ${theme === 'dark' ? 'bg-[#1C1B19] border-[#433E38]' : 'bg-[#F9F8F6] border-[#D6D1C7]'
                    }`}>
                    <div className={`w-full h-1.5 rounded-full mb-2 ${theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#EBE7DE]'
                      }`}></div>
                    <div className={`w-3/4 h-1.5 rounded-full mb-4 ${theme === 'dark' ? 'bg-[#2C2A26]' : 'bg-[#EBE7DE]'
                      }`}></div>
                    <div className={`flex-1 border border-dashed rounded-sm flex items-center justify-center ${theme === 'dark' ? 'border-[#433E38]' : 'border-[#D6D1C7]'
                      }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-[#A8A29E] animate-pulse">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                  </div>
                  <div className={`absolute inset-0 opacity-[0.02] rounded-sm transform rotate-3 -z-10 ${theme === 'dark' ? 'bg-[#F5F2EB]' : 'bg-[#2C2A26]'
                    }`}></div>
                </div>

                {/* Text Content */}
                <h4 className={`text-2xl font-serif mb-3 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                  }`}>Quiet in the studio</h4>
                <p className={`text-sm max-w-xs font-light leading-relaxed mb-8 ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'
                  }`}>
                  Your creative pulse is waiting for its first beat. Launch a tool to begin synthesizing intelligence.
                </p>

                {/* CTA Button */}
                <button
                  onClick={onViewAll}
                  className={`inline-flex items-center gap-2 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-sm shadow-lg ${theme === 'dark' ? 'bg-[#F5F2EB] text-[#2C2A26]' : 'bg-[#2C2A26] text-[#F5F2EB]'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  Start First Project
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className={`text-[10px] uppercase tracking-[0.2em] border-b ${theme === 'dark' ? 'bg-[#1C1B19] text-[#A8A29E] border-[#433E38]' : 'bg-[#F5F2EB] text-[#5D5A53] border-[#D6D1C7]'
                  }`}>
                  <tr>
                    <th className="p-5 font-bold">Project</th>
                    <th className="p-5 font-bold">Type</th>
                    <th className="p-5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#D6D1C7]'
                  }`}>
                  {/* Display only 4 most recent projects */}
                  {recentProjects.slice(0, 4).map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => onOpenProject?.(project)}
                      className={`transition-colors group cursor-pointer ${theme === 'dark' ? 'hover:bg-[#1C1B19]' : 'hover:bg-[#F9F8F6]'
                        }`}
                    >
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm truncate max-w-[200px] group-hover:underline decoration-1 underline-offset-4 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                            }`}>{project.prompt}</span>
                          <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">{project.toolName}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border ${project.type === 'image'
                            ? theme === 'dark'
                              ? 'bg-purple-900/20 text-purple-300 border-purple-800'
                              : 'bg-purple-50 text-purple-600 border-purple-100'
                            : theme === 'dark'
                              ? 'bg-blue-900/20 text-blue-300 border-blue-800'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          {project.type}
                        </span>
                      </td>
                      <td className="p-5 text-[#A8A29E] text-xs text-right font-medium font-mono">
                        {new Date(project.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>


        {/* Activity Feed (Right - 4 cols) - Editorial Design */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Studio Pulse</h3>
          <div className={`border p-6 rounded-sm shadow-sm transition-colors ${theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
            }`}>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-[#A8A29E]">
                <p className="text-sm font-light">No activity yet</p>
                <p className="text-xs mt-1">Generate content to see your studio pulse here.</p>
              </div>
            ) : (
              <div className={`space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] ${theme === 'dark' ? 'before:bg-[#433E38]' : 'before:bg-[#D6D1C7]'
                }`}>
                {/* Display only 4 most recent activities */}
                {activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="relative pl-8 group">
                    {/* Activity Circle with hover effect */}
                    <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 z-10 transition-all group-hover:scale-110 ${theme === 'dark' ? 'border-[#2C2A26]' : 'border-white'
                      } ${act.circleColor}`}></div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-xs font-bold text-[#2C2A26] dark:text-[#F5F2EB] uppercase tracking-wider group-hover:opacity-70 transition-opacity ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                          }`}>{act.title}</span>
                        <span className="text-[10px] text-[#A8A29E] italic">{act.time}</span>
                      </div>
                      <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                        }`}>{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activities.length > 0 && (
              <button
                onClick={onViewAuditLog}
                className={`w-full mt-8 py-3 border text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm ${theme === 'dark'
                  ? 'border-[#433E38] text-[#F5F2EB] hover:bg-[#1C1B19]'
                  : 'border-[#D6D1C7] text-[#2C2A26] hover:bg-[#F5F2EB]'
                  }`}
              >
                View Full Audit Log
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#A8A29E]">Launchpad</h3>
          <button onClick={onViewAll} className={`text-xs font-bold uppercase tracking-widest hover:underline ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
            }`}>All Tools</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.slice(0, 4).map((tool) => (
            <div
              key={tool.id}
              onClick={() => onToolSelect(tool)}
              className={`p-6 rounded-sm border transition-all cursor-pointer group ${theme === 'dark'
                ? 'bg-[#2C2A26] border-[#433E38] hover:shadow-md'
                : 'bg-white border-[#D6D1C7] hover:shadow-md'
                }`}
            >
              <div className={`w-10 h-10 rounded-full mb-4 flex items-center justify-center transition-colors ${theme === 'dark'
                ? 'bg-[#433E38] text-[#F5F2EB] group-hover:bg-[#F5F2EB] group-hover:text-[#2C2A26]'
                : 'bg-[#F5F2EB] text-[#2C2A26] group-hover:bg-[#2C2A26] group-hover:text-[#F5F2EB]'
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h4 className={`font-serif text-lg mb-1 transition-colors duration-300 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
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

// Icon Components
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
