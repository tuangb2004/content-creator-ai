import * as functions from 'firebase-functions';
import { validateAuth } from './utils/validation';
import { createPaymentLink } from './utils/payos';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

interface CreatePaymentLinkRequest {
  amount: number; // Amount in VND
  planName: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Map plan names to credits
 * Updated to match frontend BillingPlans.jsx
 */
const PLAN_CREDITS: Record<string, number> = {
  pro_monthly: 2500,        // 2,500 credits/month
  pro_yearly: 30000,        // 2,500 * 12 months = 30,000 credits
  agency_monthly: 12000,    // 12,000 credits/month
  agency_yearly: 144000,    // 12,000 * 12 months = 144,000 credits
};

/**
 * Create PayOS payment link
 */
export const createPaymentLinkFunction = functions.https.onCall(
  async (data: CreatePaymentLinkRequest, context: functions.https.CallableContext) => {
    console.log('[createPaymentLink] Received request:', JSON.stringify(data, null, 2));

    // 1. Validate authentication
    let userId: string;
    try {
      userId = validateAuth(context);
      console.log(`[createPaymentLink] Authenticated user: ${userId}`);
    } catch (error: any) {
      console.error('[createPaymentLink] Authentication failed:', error);
      throw error;
    }

    // 2. Validate request data
    if (!data || typeof data !== 'object') {
      console.error('[createPaymentLink] Invalid request data: data is not an object');
      throw new functions.https.HttpsError('invalid-argument', 'Invalid request data');
    }

    if (!data.amount || data.amount <= 0) {
      console.error(`[createPaymentLink] Invalid amount: ${data.amount}`);
      throw new functions.https.HttpsError('invalid-argument', 'Amount must be greater than 0');
    }
    if (!data.planName) {
      console.error('[createPaymentLink] Missing planName');
      throw new functions.https.HttpsError('invalid-argument', 'Plan name is required');
    }

    if (!data.successUrl || !data.cancelUrl) {
      console.error('[createPaymentLink] Missing successUrl or cancelUrl');
      throw new functions.https.HttpsError('invalid-argument', 'successUrl and cancelUrl are required');
    }

    const { amount, planName, successUrl, cancelUrl } = data;

    // 3. Get user email
    const db = getDb();
    const userRef = db.collection('users').doc(userId);

    let userDoc;
    try {
      userDoc = await userRef.get();
    } catch (error: any) {
      console.error(`[createPaymentLink] Failed to fetch user ${userId}:`, error);
      throw new functions.https.HttpsError('internal', `Failed to fetch user: ${error.message}`);
    }

    let email: string;

    if (!userDoc.exists) {
      console.warn(`[createPaymentLink] User ${userId} not found in Firestore, creating user document...`);

      // Fallback: Create user document if it doesn't exist
      // This can happen if auth trigger didn't run or failed
      // Get email from context token (works in both emulator and production)
      email = (context.auth?.token?.email as string) || '';

      if (!email) {
        console.error(`[createPaymentLink] User ${userId} has no email in token`);
        console.error(`[createPaymentLink] Context auth:`, JSON.stringify(context.auth, null, 2));
        throw new functions.https.HttpsError('failed-precondition', 'User email not found in authentication token');
      }

      // Create user document with free plan (Starter)
      await userRef.set({
        email,
        plan: 'free',
        credits: 20, // Free tier: 20 credits (matches Starter plan)
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      console.log(`[createPaymentLink] User document created for ${userId} with email: ${email}`);
    } else {
      const userData = userDoc.data();
      email = userData?.email || '';
      if (!email) {
        // Fallback: try to get email from token if missing in Firestore
        email = (context.auth?.token?.email as string) || '';
        if (email) {
          console.warn(`[createPaymentLink] User ${userId} missing email in Firestore, updating from token...`);
          await userRef.update({
            email,
            updatedAt: FieldValue.serverTimestamp()
          });
        } else {
          console.error(`[createPaymentLink] User ${userId} missing email in both Firestore and token`);
          throw new functions.https.HttpsError('failed-precondition', 'User email not found');
        }
      }
    }

    console.log(`[createPaymentLink] User email: ${email}`);

    // 4. Generate unique order code (use timestamp - must be integer, not string)
    // PayOS requires orderCode to be a positive integer <= 9999999 (7 digits max)
    // Use last 6 digits of timestamp + 3-digit random number to ensure uniqueness
    const timestamp = Date.now();
    const orderCode = (timestamp % 1000000) * 10 + Math.floor(Math.random() * 10);

    // 5. Get credits for plan
    const credits = PLAN_CREDITS[planName] || 2000;

    // 6. Create payment link
    try {
      const paymentRequest = {
        orderCode,
        amount,
        description: `Nâng cấp gói ${planName} - ${credits} credits`,
        cancelUrl,
        returnUrl: successUrl,
        // PayOS requires items array
        items: [
          {
            name: `Gói ${planName}`,
            quantity: 1,
            price: amount,
          }
        ],
      };

      console.log(`[createPaymentLink] Creating PayOS payment link with orderCode: ${orderCode}`);
      const result = await createPaymentLink(paymentRequest);

      if (!result.data) {
        console.error('[createPaymentLink] PayOS response missing data field');
        throw new Error('No payment link data returned from PayOS');
      }

      console.log(`[createPaymentLink] Payment link created: ${result.data.paymentLinkId}`);

      // 7. Save payment link info to Firestore (for webhook verification)
      try {
        await db.collection('payment_links').doc(result.data.paymentLinkId).set({
          userId,
          orderCode,
          amount,
          planName,
          credits,
          status: 'pending',
          createdAt: FieldValue.serverTimestamp(),
          paymentLinkId: result.data.paymentLinkId,
        });
        console.log(`[createPaymentLink] Payment link saved to Firestore: ${result.data.paymentLinkId}`);
      } catch (firestoreError: any) {
        console.error(`[createPaymentLink] Failed to save payment link to Firestore:`, firestoreError);
        // Don't throw here - payment link was created successfully, just logging failed
        // The webhook might still work if PayOS retries
      }

      return {
        paymentLinkId: result.data.paymentLinkId,
        checkoutUrl: result.data.checkoutUrl,
        qrCode: result.data.qrCode,
        orderCode: result.data.orderCode,
      };
    } catch (error: any) {
      console.error('[createPaymentLink] Failed to create payment link:', error);
      console.error('[createPaymentLink] Error stack:', error.stack);
      console.error('[createPaymentLink] Error details:', {
        message: error.message,
        code: error.code,
        cause: error.cause,
        name: error.name
      });

      // Provide more detailed error message
      let errorMessage = error.message || 'Unknown error occurred';

      // Add helpful suggestions based on error type
      if (errorMessage.includes('Cannot connect') || errorMessage.includes('ENOTFOUND')) {
        errorMessage += ' Please check your internet connection and VPN settings.';
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create payment link: ${errorMessage}`
      );
    }
  }
);

