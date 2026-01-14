import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useTheme } from '../../contexts/ThemeContext';

const ActivityLogs = () => {
  const { theme } = useTheme();
  const { logs, loading, error } = useActivityLogs(20);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '--';
    
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Handle string from cache or ISO string
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      // Handle timestamp in milliseconds
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      // Handle Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp && timestamp._seconds) {
      // Handle Firestore Timestamp object (from emulator or serialized)
      date = new Date(timestamp._seconds * 1000);
    } else {
      // Fallback
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '--';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActionDisplay = (action) => {
    const actionMap = {
      'generate_content': { label: 'Generated Content', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'payment_success': { label: 'Payment Success', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      'subscription_change': { label: 'Plan Changed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      'credit_refund_failed': { label: 'Refund Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    return actionMap[action] || { label: action, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
  };

  // NEVER show loading - always render UI immediately

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-4xl font-serif mb-8 transition-colors duration-300 ${
          theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
        }`}>Activity History</h2>
        
        {error && (
          <div className={`p-4 mb-4 rounded-sm border transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm">Error loading activity logs: {error}</p>
          </div>
        )}

        {logs.length === 0 && !loading ? (
          <div className={`p-12 text-center rounded-sm border transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-[#2C2A26] border-[#433E38] text-[#A8A29E]' 
              : 'bg-white border-[#D6D1C7] text-[#A8A29E]'
          }`}>
            <p>No activity logs yet. Start creating content to see your activity here!</p>
          </div>
        ) : (
          <div className={`border rounded-sm overflow-hidden transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-[#2C2A26] border-[#433E38]' 
              : 'bg-white border-[#D6D1C7]'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`text-xs uppercase tracking-widest transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-[#1C1B19] text-[#A8A29E]' 
                    : 'bg-[#F9F8F6] text-[#A8A29E]'
                }`}>
                  <tr>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Credits</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-300 ${
                  theme === 'dark' ? 'divide-[#433E38]' : 'divide-[#D6D1C7]'
                }`}>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`p-8 text-center transition-colors duration-300 ${
                        theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                      }`}>
                        Loading activity logs...
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => {
                      const actionDisplay = getActionDisplay(log.action);
                      const creditsChange = log.creditsAfter - log.creditsBefore;
                      
                      return (
                        <tr key={log.id} className={`transition-colors ${
                          theme === 'dark' ? 'hover:bg-[#433E38]/30' : 'hover:bg-[#F9F9F9]'
                        }`}>
                          <td className={`p-4 font-medium transition-colors duration-300 ${
                            theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#2C2A26]'
                          }`}>
                            {actionDisplay.label}
                          </td>
                          <td className={`p-4 text-sm transition-colors duration-300 ${
                            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'
                          }`}>
                            {creditsChange !== 0 ? (
                              <span className={creditsChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                {creditsChange > 0 ? '+' : ''}{creditsChange}
                              </span>
                            ) : (
                              <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}>--</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium ${
                              log.success 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className={`p-4 text-sm text-right transition-colors duration-300 ${
                            theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'
                          }`}>
                            {formatTimestamp(log.timestamp)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;

