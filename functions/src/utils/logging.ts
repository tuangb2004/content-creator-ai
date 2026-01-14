import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ActivityLog } from '../types';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

/**
 * Log user activity
 */
export async function logActivity(log: Omit<ActivityLog, 'timestamp'>): Promise<void> {
  try {
    const db = getDb();
    await db.collection('activity_logs').add({
      ...log,
      timestamp: FieldValue.serverTimestamp()
    });
  } catch (error) {
    // Don't throw - logging is non-critical
    console.error('Failed to log activity:', error);
  }
}

