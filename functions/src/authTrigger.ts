import * as functions from 'firebase-functions';
import { initializeUser } from './utils/credits';

/**
 * Initialize user when they sign up (Firebase Auth trigger)
 * Creates user document in Firestore with free credits
 * 
 * Note: Email verification is handled by Firebase Auth automatically
 * when using sendEmailVerification() from frontend
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log(`🔔 onUserCreate triggered for user: ${user.uid}, email: ${user.email}`);

  try {
    const { uid, email } = user;

    if (!email) {
      console.error(`❌ User ${uid} created without email`);
      return;
    }

    console.log(`📝 Initializing user ${uid} with free credits...`);
    // Initialize user with free credits
    await initializeUser(uid, email);

    console.log(`✅ User ${uid} initialized with free credits`);

    // Note: Login activity is logged from frontend via logUserLogin function
    // This ensures we have accurate userAgent and platform info

    // Note: Email verification is handled by Firebase Auth automatically
    // Frontend calls sendEmailVerification() which uses Firebase's built-in email service

  } catch (error: any) {
    console.error(`❌ Error initializing user ${user.uid}:`, error);
    console.error(`❌ Error details:`, error.message, error.stack);
    // Don't throw - let user creation succeed even if initialization fails
    // You can handle this in your error monitoring system
  }
});

