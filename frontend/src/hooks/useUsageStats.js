import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to calculate usage statistics from activity logs
 * Caches data to avoid unnecessary refetches
 */
export const useUsageStats = (days = 30) => {
  const { user } = useAuth();
  
  // Cache helper functions
  const getCache = (userId) => {
    if (!userId) return null;
    try {
      const cached = sessionStorage.getItem(`usageStats_${userId}_${days}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
        if (parsed.timestamp && (now - parsed.timestamp) < CACHE_DURATION) {
          return parsed.data;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return null;
  };

  const setCache = (userId, data) => {
    if (!userId) return;
    try {
      sessionStorage.setItem(`usageStats_${userId}_${days}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore cache errors
    }
  };

  // Initialize state with cached data if available - NEVER start with loading
  const defaultStats = {
    totalGenerated: 0,
    creditsUsed: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    byAction: {},
    loading: false // Always false - never block UI
  };

  const [stats, setStats] = useState(() => {
    // Check cache on initial mount
    if (user?.uid) {
      const cached = getCache(user.uid);
      if (cached) {
        return { ...cached, loading: false };
      }
    }
    return defaultStats;
  });

  useEffect(() => {
    if (!user) {
      setStats(defaultStats);
      return;
    }

    // Check cache first - show cached data immediately (if not already set)
    const cachedData = getCache(user.uid);
    if (cachedData) {
      setStats(prev => {
        // Only update if current stats are default/empty
        if (prev.totalGenerated === 0 && prev.creditsUsed === 0) {
          return { ...cachedData, loading: false };
        }
        return prev;
      });
    }

    const fetchStats = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const logsRef = collection(db, 'activity_logs');
        const q = query(
          logsRef,
          where('userId', '==', user.uid),
          where('timestamp', '>=', Timestamp.fromDate(startDate))
        );

        const querySnapshot = await getDocs(q);
        
        let totalGenerated = 0;
        let creditsUsed = 0;
        let successfulGenerations = 0;
        let failedGenerations = 0;
        const byAction = {};

        querySnapshot.forEach(doc => {
          const log = doc.data();
          
          if (log.action === 'generate_content') {
            totalGenerated++;
            creditsUsed += (log.creditsBefore - log.creditsAfter) || 0;
            
            if (log.success) {
              successfulGenerations++;
            } else {
              failedGenerations++;
            }
          }

          // Count by action type
          if (byAction[log.action]) {
            byAction[log.action]++;
          } else {
            byAction[log.action] = 1;
          }
        });

        const newStats = {
          totalGenerated,
          creditsUsed,
          successfulGenerations,
          failedGenerations,
          byAction,
          loading: false
        };

        // Update cache in sessionStorage
        setCache(user.uid, newStats);

        // Update state (this will silently update UI if already rendered)
        setStats(newStats);
      } catch (error) {
        // Handle missing index error gracefully (only log in development)
        if (error.code === 'failed-precondition' && error.message?.includes('index')) {
          // Missing index - this is expected if Firestore index hasn't been created yet
          // Emulator doesn't require indexes, but production Firestore does
          if (import.meta.env.DEV) {
            console.warn('Firestore index required. Create index at:', error.message.match(/https:\/\/[^\s]+/)?.[0] || 'Firestore console');
          }
          // Keep showing cached/default data
          setStats(prev => ({ ...prev, loading: false }));
        } else {
          // Other errors - only log in development
          if (import.meta.env.DEV) {
            console.error('Error fetching usage stats:', error);
          }
          // Don't update loading state - keep showing cached/default data
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Always fetch in background, but don't block UI
    fetchStats();
  }, [user, days]);

  return stats;
};

