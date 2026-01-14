import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initializeUser } from './utils/credits';
import { sendVerificationEmail } from './emailService';

/**
 * Initialize user when they sign up (Firebase Auth trigger)
 * Creates user document in Firestore with free credits
 * Sends custom verification email
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log(`🔔 onUserCreate triggered for user: ${user.uid}, email: ${user.email}`);
  
  try {
    const { uid, email, displayName } = user;

    if (!email) {
      console.error(`❌ User ${uid} created without email`);
      return;
    }

    console.log(`📝 Initializing user ${uid} with free credits...`);
    // Initialize user with free credits
    await initializeUser(uid, email);

    console.log(`✅ User ${uid} initialized with free credits`);

    // Check if user was created by resendCustomVerification (has skipVerificationEmail flag)
    // This prevents duplicate verification emails
    const userRecord = await admin.auth().getUser(uid);
    const skipEmail = userRecord.customClaims?.skipVerificationEmail === true;
    
    if (skipEmail) {
      console.log(`ℹ️ User ${uid} has skipVerificationEmail flag - email already sent by resendCustomVerification`);
      console.log(`   Skipping verification email in onUserCreate to avoid duplicate`);
      // Remove the flag after using it
      try {
        const { skipVerificationEmail, ...remainingClaims } = userRecord.customClaims || {};
        if (Object.keys(remainingClaims).length > 0) {
          await admin.auth().setCustomUserClaims(uid, remainingClaims);
        } else {
          await admin.auth().setCustomUserClaims(uid, null);
        }
        console.log(`   Removed skipVerificationEmail flag`);
      } catch (claimError: any) {
        console.log(`⚠️ Could not remove skipVerificationEmail flag: ${claimError.message}`);
      }
      return;
    }

    // Send custom verification email if email service is configured
    if (!user.emailVerified) {
      console.log(`📧 Attempting to send verification email to ${email}...`);
      try {
        await sendVerificationEmail(email, displayName || undefined, uid);
        console.log(`✅ Custom verification email sent to ${email}`);
      } catch (emailError: any) {
        console.error(`⚠️ Failed to send custom verification email:`, emailError);
        console.error(`⚠️ Error details:`, emailError.message, emailError.stack);
        // Don't fail user creation if email fails - Firebase will send default email
        // This allows graceful fallback to Firebase default emails
      }
    } else {
      console.log(`ℹ️ User ${uid} email already verified, skipping verification email`);
    }
    
  } catch (error: any) {
    console.error(`❌ Error initializing user ${user.uid}:`, error);
    console.error(`❌ Error details:`, error.message, error.stack);
    // Don't throw - let user creation succeed even if initialization fails
    // You can handle this in your error monitoring system
  }
});

