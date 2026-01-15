import { useMemo, useState } from 'react';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const ActivityLogs = ({ onBack }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { logs } = useActivityLogs(50);
  const [filter, setFilter] = useState('all');

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '--';

    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp && timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date();
    }

    if (isNaN(date.getTime())) {
      return '--';
    }

    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const getLogType = (action) => {
    if (!action) return 'task';
    const normalized = String(action).toLowerCase();
    if (normalized.includes('payment') || normalized.includes('billing') || normalized.includes('subscription')) {
      return 'billing';
    }
    if (normalized.includes('login') || normalized.includes('auth') || normalized.includes('security')) {
      return 'security';
    }
    return 'task';
  };

  const getActionTitle = (action) => {
    if (!action) return 'Activity';
    const normalized = String(action).toLowerCase();
    if (normalized === 'generate_content') return 'Content Generated';
    return normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getActionDetail = (log) => {
    const metadata = log.metadata || {};
    if (log.action === 'generate_content') {
      const contentType = metadata.contentType ? String(metadata.contentType).toUpperCase() : 'CONTENT';
      const toolName = metadata.toolName || 'Creative Tool';
      return `${contentType} • ${toolName}`;
    }
    return metadata.toolName || metadata.toolId || metadata.reason || 'Studio activity';
  };

  const getStatus = (log) => {
    if (typeof log.success === 'boolean') {
      return log.success ? 'Success' : 'Failed';
    }
    return 'Completed';
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (['success', 'completed', 'processed', 'secure', 'verified'].includes(normalized)) {
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    if (normalized === 'failed') {
      return {
        dot: 'bg-red-500',
        text: 'text-red-600 dark:text-red-400'
      };
    }
    return {
      dot: 'bg-gray-400',
      text: 'text-gray-500 dark:text-gray-400'
    };
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'task':
        return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'billing':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'security':
        return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const mappedLogs = useMemo(() => {
    return logs.map((log) => {
      const type = getLogType(log.action);
      return {
        id: log.id,
        type,
        title: getActionTitle(log.action),
        detail: getActionDetail(log),
        user: log.userEmail || user?.email || 'System',
        time: formatTimestamp(log.timestamp),
        status: getStatus(log)
      };
    });
  }, [logs, user?.email]);

  const filteredLogs = filter === 'all'
    ? mappedLogs
    : mappedLogs.filter((log) => log.type === filter);

  return (
    <div className="animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] dark:hover:text-[#F5F2EB] mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-4xl font-serif text-[#2C2A26] dark:text-[#F5F2EB]">Studio Audit Log</h2>
          <p className="text-[#5D5A53] dark:text-[#A8A29E] font-light mt-1">A transparent history of all intelligence operations.</p>
        </div>

        <div className="flex bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] p-1 rounded-sm shadow-sm">
          {['all', 'task', 'billing', 'security'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${
                filter === type 
                  ? 'bg-[#2C2A26] text-white dark:bg-[#F5F2EB] dark:text-[#2C2A26]' 
                  : 'text-[#A8A29E] hover:text-[#2C2A26] dark:hover:text-[#F5F2EB]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#2C2A26] border border-[#D6D1C7] dark:border-[#433E38] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9F8F6] dark:bg-[#1C1B19] text-[#A8A29E] text-[10px] uppercase tracking-[0.2em] border-b border-[#D6D1C7] dark:border-[#433E38]">
              <tr>
                <th className="p-6 font-bold">Activity</th>
                <th className="p-6 font-bold">Category</th>
                <th className="p-6 font-bold">Operator</th>
                <th className="p-6 font-bold">Timestamp</th>
                <th className="p-6 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] dark:divide-[#433E38]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F9F8F6] dark:hover:bg-[#1C1B19] transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-[#2C2A26] dark:text-[#F5F2EB] font-medium text-sm">{log.title}</span>
                      <span className="text-xs text-[#A8A29E] font-light mt-0.5">{log.detail}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold border ${getTypeStyle(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-[#5D5A53] dark:text-[#A8A29E] font-medium">{log.user}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-[#A8A29E] font-mono">{log.time}</span>
                  </td>
                  <td className="p-6 text-right">
                    {(() => {
                      const statusStyle = getStatusStyle(log.status);
                      return (
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${statusStyle.text}`}>{log.status}</span>
                    </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="p-20 text-center text-[#A8A29E]">
            <p className="font-serif italic text-lg">No records found for this category.</p>
          </div>
        )}

        <div className="p-6 bg-[#F9F8F6] dark:bg-[#1C1B19] border-t border-[#D6D1C7] dark:border-[#433E38] flex justify-between items-center text-[10px] text-[#A8A29E] uppercase tracking-widest font-bold">
          <span>Showing {filteredLogs.length} of {mappedLogs.length} entries</span>
          <div className="flex gap-4">
            <button className="opacity-30 cursor-not-allowed">Previous</button>
            <button className="opacity-30 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-sm flex items-start gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-1">Data Retention Policy</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-light leading-relaxed">
            Audit logs are stored for 90 days. For Agency accounts, logs can be exported to CSV or JSON for compliance auditing. 
            Logs are immutable and cannot be deleted by studio users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;

