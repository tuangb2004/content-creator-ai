import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch activity logs from Firestore
 * Uses cache to avoid blocking UI
 */
export const useActivityLogs = (logLimit = 50) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const logsRef = collection(db, 'activity_logs');
    // Try simplified query first to avoid index issues during dev
    // In production, you strictly want created index: userId asc, timestamp desc
    const q = query(
      logsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(logLimit)
    );

    // Using onSnapshot for realtime updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // console.log(`🔄 Realtime activity logs: ${logsData.length} items`);
      setLogs(logsData);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to activity logs:', err);
      // Fallback if index missing
      if (err.message.includes('index')) {
        console.warn('Index missing, falling back to client-side sorting (not efficient)');
        const fallbackQuery = query(
          logsRef,
          where('userId', '==', user.uid),
          limit(logLimit)
        );
        // Try one-time fetch for fallback
        getDocs(fallbackQuery).then(snapshot => {
          const data = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date()
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
          setLogs(data);
          setLoading(false);
        }).catch(e => {
          setError(e.message);
          setLoading(false);
        });
      } else {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, logLimit]);

  const refetch = useCallback(() => {
    // No-op for realtime listener, but kept for API compatibility
    console.log('Refetch called on realtime listener');
  }, []);

  return { logs, loading, error, refetch };
};

