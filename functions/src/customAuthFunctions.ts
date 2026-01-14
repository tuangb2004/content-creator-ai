import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendPasswordResetEmail } from './emailService';

/**
 * Callable function để gửi password reset email với custom template
 * 
 * Sử dụng function này thay vì Firebase Auth default password reset
 * 
 * Frontend call:
 * const sendPasswordReset = httpsCallable(functions, 'sendCustomPasswordReset');
 * await sendPasswordReset({ email: 'user@example.com' });
 */
export const sendCustomPasswordReset = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email || typeof email !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required and must be a string'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid email format'
    );
  }

  try {
    // Check if user exists
    try {
      await admin.auth().getUserByEmail(email);
    } catch (error: any) {
      // User doesn't exist - don't reveal this for security
      // Still return success to prevent email enumeration
      console.log(`Password reset requested for non-existent email: ${email}`);
      return { success: true, message: 'If that email exists, a password reset link has been sent.' };
    }

    // Send custom password reset email
    await sendPasswordResetEmail(email);

    return { 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.' 
    };

  } catch (error: any) {
    console.error(`❌ Error in sendCustomPasswordReset:`, error);
    
    // Don't reveal internal errors to client
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send password reset email. Please try again later.'
    );
  }
});

/**
 * Callable function để resend verification email với custom template
 * 
 * Frontend call:
 * const resendVerification = httpsCallable(functions, 'resendCustomVerification');
 * await resendVerification();
 */
export const resendCustomVerification = functions.https.onCall(async (data, context) => {
  console.log(`📧 resendCustomVerification called`);
  console.log(`📧 Context auth:`, context.auth ? `✅ Present (UID: ${context.auth.uid})` : '❌ Missing');
  
  // Require authentication
  if (!context.auth) {
    console.error(`❌ resendCustomVerification: User not authenticated`);
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to resend verification email'
    );
  }

  const { uid, token } = context.auth;
  const userEmail = token.email;
  const emailVerified = token.email_verified || false;
  
  console.log(`📧 User info from context: UID=${uid}, Email=${userEmail}, Verified=${emailVerified}`);

  if (!userEmail) {
    console.error(`❌ resendCustomVerification: User email not found in token`);
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User email not found'
    );
  }

  try {
    // Check if email is already verified
    if (emailVerified) {
      console.log(`ℹ️ Email ${userEmail} is already verified`);
      return { 
        success: true, 
        message: 'Email is already verified.',
        alreadyVerified: true
      };
    }

    // Get display name from token or try to get from Admin SDK (with retry for emulator)
    let displayName = token.name || undefined;
    
    // Try to get user from Admin SDK (with retry for emulator sync delay)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for emulator sync
      const user = await admin.auth().getUser(uid);
      displayName = user.displayName || displayName;
      console.log(`📧 Got user from Admin SDK: ${user.email}, displayName: ${displayName}`);
    } catch (adminError: any) {
      // In emulator, Admin SDK might not have user yet - that's OK, use token data
      console.log(`⚠️ Could not get user from Admin SDK (emulator sync delay?): ${adminError.message}`);
      console.log(`📧 Using email from token: ${userEmail}`);
    }

    // Import and send custom verification email
    const { sendVerificationEmail } = require('./emailService');
    
    // Send custom verification email using email from token and UID
    console.log(`📧 Sending verification email to ${userEmail}...`);
    await sendVerificationEmail(userEmail, displayName, uid);

    return { 
      success: true, 
      message: 'Verification email sent. Please check your inbox.' 
    };

  } catch (error: any) {
    console.error(`❌ Error in resendCustomVerification:`, error);
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send verification email. Please try again later.'
    );
  }
});

