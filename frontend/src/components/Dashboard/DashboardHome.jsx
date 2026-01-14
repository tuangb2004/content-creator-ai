import { TOOLS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UsageStats from './UsageStats';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const DashboardHome = ({ onToolSelect, recentProjects }) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12) greeting = "Good Afternoon";
  if (currentHour >= 18) greeting = "Good Evening";

  // Get credits from userData
  const creditsRemaining = userData?.credits || 0;
  const plan = userData?.plan || 'free';
  const maxCredits = plan === 'free' ? 10 : plan === 'pro' ? 2000 : 10000;

  // Track previous credits to only show notification when credits decrease
  const prevCreditsRef = useRef(creditsRemaining);
  
  // Low credits warning - only show once per login session using sessionStorage
  useEffect(() => {
    const prevCredits = prevCreditsRef.current;
    const notificationKey = 'low-credits-notification-shown';
    
    // Check if notification already shown in this session
    const notificationShown = sessionStorage.getItem(notificationKey) === 'true';
    
    // Only show notification if:
    // 1. Credits decreased (not just on mount)
    // 2. Credits are low/zero
    // 3. Notification hasn't been shown in this session yet
    const creditsDecreased = creditsRemaining < prevCredits;
    const isLowCredits = creditsRemaining === 0 || (creditsRemaining > 0 && creditsRemaining <= 5);
    
    if (isLowCredits && creditsDecreased && !notificationShown) {
      if (creditsRemaining === 0) {
        toast.error(
          'No credits remaining! Please upgrade your plan to continue creating content.',
          { duration: 5000, id: 'low-credits-warning' }
        );
      } else if (creditsRemaining > 0 && creditsRemaining <= 5) {
        toast.error(
          `Low credits! You have ${creditsRemaining} credits remaining. Consider upgrading your plan.`,
          { duration: 5000, id: 'low-credits-warning' }
        );
      }
      // Mark as shown in this session
      sessionStorage.setItem(notificationKey, 'true');
    }
    
    // Reset notification flag in sessionStorage if credits increase above threshold
    if (creditsRemaining > 5) {
      sessionStorage.removeItem(notificationKey);
    }
    
    // Update previous credits
    prevCreditsRef.current = creditsRemaining;
  }, [creditsRemaining]);

  return (
    <div className="space-y-12">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-4xl font-serif mb-2 transition-colors duration-300 ${
            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>{greeting}, Creator.</h2>
          <p className={`font-light transition-colors duration-300 ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
          }`}>Here is what's happening in your studio today.</p>
        </div>
      </div>

      {/* Analytics Grid - Use UsageStats với dữ liệu thật */}
      <UsageStats />

      {/* Quick Launch Tools */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-sm font-bold uppercase tracking-widest transition-colors duration-300 ${
            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
          }`}>Quick Launch</h3>
          <button className={`text-sm transition-colors duration-300 hover:underline ${
            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
          }`}>View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.slice(0, 4).map(tool => (
            <div 
              key={tool.id}
              onClick={() => onToolSelect(tool)}
              className={`p-6 rounded-sm border transition-all cursor-pointer group ${
                theme === 'dark'
                  ? 'bg-[#2C2A26] border-[#433E38] hover:shadow-lg hover:-translate-y-1'
                  : 'bg-white border-[#D6D1C7] hover:shadow-lg hover:-translate-y-1'
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
              <p className={`text-xs line-clamp-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
              }`}>{tool.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 transition-colors duration-300 ${
          theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
        }`}>Recent Activity</h3>
        <div className={`border rounded-sm overflow-hidden transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#2C2A26] border-[#433E38]' : 'bg-white border-[#D6D1C7]'
        }`}>
          {recentProjects.length === 0 ? (
            <div className={`p-12 text-center transition-colors duration-300 ${
              theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
            }`}>
              <p>No recent projects found. Start creating!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className={`text-xs uppercase tracking-wider transition-colors duration-300 ${
                theme === 'dark' ? 'bg-[#1C1B19] text-[#A8A29E]' : 'bg-[#F5F2EB] text-[#5D5A53]'
              }`}>
                <tr>
                  <th className="p-4 font-medium">Project Name</th>
                  <th className="p-4 font-medium">Tool</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#D6D1C7]'
              }`}>
                {recentProjects.map(project => (
                  <tr key={project.id} className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-[#433E38]/30' : 'hover:bg-[#F9F9F9]'
                  }`}>
                    <td className={`p-4 font-medium truncate max-w-xs transition-colors duration-300 ${
                      theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                    }`}>{project.prompt}</td>
                    <td className={`p-4 text-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                    }`}>{project.toolName}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider transition-colors duration-300 ${
                        project.type === 'image' 
                          ? (theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800')
                          : (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                      }`}>
                        {project.type}
                      </span>
                    </td>
                    <td className={`p-4 text-sm text-right transition-colors duration-300 ${
                      theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                    }`}>
                      {new Date(project.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
