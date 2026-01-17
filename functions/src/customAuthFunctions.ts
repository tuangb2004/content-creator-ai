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


