import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch activity logs from Firestore
 * Uses cache to avoid blocking UI
 */
export const useActivityLogs = (logLimit = 50) => {
  const { user } = useAuth();
  
  // Cache helper functions
  const getCache = useCallback((userId) => {
    if (!userId) return null;
    try {
      const cached = sessionStorage.getItem(`activityLogs_${userId}_${logLimit}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
        if (parsed.timestamp && (now - parsed.timestamp) < CACHE_DURATION) {
          // Convert timestamp strings back to Date objects
          const data = parsed.data.map(log => ({
            ...log,
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date()
          }));
          return data;
        }
      }
    } catch (error) {
      void error;
      // Ignore cache errors
    }
    return null;
  }, [logLimit]);

  const setCache = useCallback((userId, data) => {
    if (!userId) return;
    try {
      sessionStorage.setItem(`activityLogs_${userId}_${logLimit}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      void error;
      // Ignore cache errors
    }
  }, [logLimit]);

  // Initialize with cached data - NEVER start with loading
  const [logs, setLogs] = useState(() => {
    if (user?.uid) {
      const cached = getCache(user.uid);
      if (cached) return cached;
    }
    return [];
  });
  const loading = false; // Always false - never block UI
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      return;
    }

    try {
      setError(null);

      const logsRef = collection(db, 'activity_logs');
      const q = query(
        logsRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(logLimit)
      );

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (indexError) {
        const message = `${indexError?.message || ''}`.toLowerCase();
        if (message.includes('requires an index') || message.includes('failed-precondition')) {
          const fallbackQuery = query(
            logsRef,
            where('userId', '==', user.uid),
            limit(logLimit)
          );
          querySnapshot = await getDocs(fallbackQuery);
        } else {
          throw indexError;
        }
      }

      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })).sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return bTime - aTime;
      });

      // Update cache
      setCache(user.uid, logsData);
      
      // Update state (silently updates UI)
      setLogs(logsData);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err.message);
    }
  }, [user, logLimit, getCache, setCache]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogs([]);
      return;
    }

    // Check cache first - show cached data immediately
    const cachedData = getCache(user.uid);
    if (cachedData) {
      setLogs(cachedData);
      // Still fetch fresh data in background
    }

    // Always fetch in background, don't block UI
    fetchLogs();

    // Listen for refresh events (e.g., after login)
    const handleRefresh = () => {
      console.log('🔄 Refreshing activity logs...');
      fetchLogs();
    };
    window.addEventListener('refreshActivityLogs', handleRefresh);

    return () => {
      window.removeEventListener('refreshActivityLogs', handleRefresh);
    };
  }, [user, logLimit, getCache, setCache, fetchLogs]);

  const refetch = useCallback(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, fetchLogs]);

  return { logs, loading, error, refetch };
};

