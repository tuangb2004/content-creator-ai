import * as functions from 'firebase-functions';
import { initializeUser } from './utils/credits';

/**
 * Callable function to initialize user document if it doesn't exist
 * This is a fallback if onUserCreate trigger doesn't run (e.g., in emulator)
 */
export const initializeUserIfNeeded = functions.https.onCall(
  async (data: {}, context: functions.https.CallableContext): Promise<{ success: boolean; message: string }> => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const email = context.auth.token.email;

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'User email not found');
    }

    try {
      console.log(`🔄 initializeUserIfNeeded called for user: ${userId}`);
      await initializeUser(userId, email);
      console.log(`✅ User ${userId} initialized successfully`);
      return { success: true, message: 'User initialized successfully' };
    } catch (error: any) {
      console.error(`❌ Error initializing user ${userId}:`, error);
      throw new functions.https.HttpsError('internal', 'Failed to initialize user', error.message);
    }
  }
);

