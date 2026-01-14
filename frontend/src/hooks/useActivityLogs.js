import { useState, useEffect } from 'react';
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
  const getCache = (userId) => {
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
    } catch (e) {
      // Ignore cache errors
    }
    return null;
  };

  const setCache = (userId, data) => {
    if (!userId) return;
    try {
      sessionStorage.setItem(`activityLogs_${userId}_${logLimit}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore cache errors
    }
  };

  // Initialize with cached data - NEVER start with loading
  const [logs, setLogs] = useState(() => {
    if (user?.uid) {
      const cached = getCache(user.uid);
      if (cached) return cached;
    }
    return [];
  });
  const [loading, setLoading] = useState(false); // Always false - never block UI
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }

    // Check cache first - show cached data immediately
    const cachedData = getCache(user.uid);
    if (cachedData) {
      setLogs(cachedData);
      // Still fetch fresh data in background
    }

    const fetchLogs = async () => {
      try {
        setError(null);

        const logsRef = collection(db, 'activity_logs');
        const q = query(
          logsRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(logLimit)
        );

        const querySnapshot = await getDocs(q);
        const logsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        // Update cache
        setCache(user.uid, logsData);
        
        // Update state (silently updates UI)
        setLogs(logsData);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError(err.message);
      }
    };

    // Always fetch in background, don't block UI
    fetchLogs();
  }, [user, logLimit]);

  const refetch = () => {
    if (user) {
      const fetchLogs = async () => {
        try {
          setError(null);
          const logsRef = collection(db, 'activity_logs');
          const q = query(
            logsRef,
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(logLimit)
          );
          const querySnapshot = await getDocs(q);
          const logsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }));
          
          // Update cache
          setCache(user.uid, logsData);
          setLogs(logsData);
        } catch (err) {
          console.error('Error fetching activity logs:', err);
          setError(err.message);
        }
      };
      fetchLogs();
    }
  };

  return { logs, loading, error, refetch };
};

