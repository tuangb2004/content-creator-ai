import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyWebhookSignature, PayOSWebhookData } from './utils/payos';
import { setCredits } from './utils/credits';
import { logActivity } from './utils/logging';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

/**
 * PayOS webhook handler
 * PayOS sẽ gửi webhook về endpoint này khi thanh toán thành công
 */
export const payosWebhook = functions.https.onRequest(async (req, res) => {
  // PayOS chỉ gửi POST request
  if (req.method !== 'POST') {
    console.log(`[payosWebhook] Invalid method: ${req.method}`);
    res.status(405).send('Method Not Allowed');
    return;
  }

  console.log('[payosWebhook] Received webhook request');
  console.log('[payosWebhook] Request body:', JSON.stringify(req.body, null, 2));

  let webhookData: PayOSWebhookData;

  try {
    webhookData = req.body as PayOSWebhookData;
    
    // Validate webhook data structure
    if (!webhookData || typeof webhookData !== 'object') {
      throw new Error('Webhook data is not an object');
    }
    
    if (!webhookData.data || typeof webhookData.data !== 'object') {
      throw new Error('Webhook data.data is missing or invalid');
    }
    
    if (!webhookData.data.paymentLinkId) {
      throw new Error('Webhook data.data.paymentLinkId is missing');
    }
    
    if (!webhookData.code) {
      throw new Error('Webhook data.code is missing');
    }
  } catch (error: any) {
    console.error('[payosWebhook] Failed to parse/validate webhook data:', error);
    console.error('[payosWebhook] Error details:', error.message);
    res.status(400).json({ 
      error: -1, 
      message: `Invalid webhook data: ${error.message}`, 
      data: null 
    });
    return;
  }

  // Verify webhook signature
  // Enabled by default for production security
  // Set DISABLE_PAYOS_SIGNATURE_VERIFICATION=true to disable (for testing only)
  const ENABLE_SIGNATURE_VERIFICATION = process.env.DISABLE_PAYOS_SIGNATURE_VERIFICATION !== 'true';
  
  if (ENABLE_SIGNATURE_VERIFICATION) {
    try {
      const isValid = verifyWebhookSignature(webhookData);
      if (!isValid) {
        console.error('[payosWebhook] Invalid webhook signature');
        res.status(400).json({ 
          error: -1, 
          message: 'Invalid webhook signature', 
          data: null 
        });
        return;
      }
      console.log('[payosWebhook] Webhook signature verified successfully');
    } catch (error: any) {
      console.error('[payosWebhook] Webhook signature verification failed:', error.message);
      res.status(400).json({ 
        error: -1, 
        message: `Webhook Error: ${error.message}`, 
        data: null 
      });
      return;
    }
  } else {
    console.log('⚠️ WARNING: Signature verification is DISABLED for testing');
    console.log('⚠️ This should ONLY be used in local development');
    console.log('⚠️ To enable: Remove DISABLE_PAYOS_SIGNATURE_VERIFICATION from environment');
  }

  const { code, desc, data: paymentData } = webhookData;
  const { orderCode, amount, paymentLinkId } = paymentData;
  
  console.log(`[payosWebhook] Processing payment: paymentLinkId=${paymentLinkId}, code=${code}, orderCode=${orderCode}, amount=${amount}`);

  // Idempotency: Check if payment already processed
  const db = getDb();
  const paymentLinkRef = db.collection('payment_links').doc(paymentLinkId);
  
  let paymentLinkDoc;
  try {
    paymentLinkDoc = await paymentLinkRef.get();
  } catch (error: any) {
    console.error(`[payosWebhook] Failed to fetch payment link ${paymentLinkId}:`, error);
    res.status(500).json({ 
      error: -1, 
      message: `Database error: ${error.message}`, 
      data: null 
    });
    return;
  }

  if (!paymentLinkDoc.exists) {
    console.warn(`[payosWebhook] Payment link ${paymentLinkId} not found in Firestore`);
    console.warn(`[payosWebhook] This might be a test webhook from PayOS dashboard`);
    console.warn(`[payosWebhook] For test webhooks, we return 200 OK to acknowledge receipt`);
    
    // PayOS test webhooks don't have real payment links
    // Return 200 OK to acknowledge we received it, but don't process
    res.status(200).json({ 
      error: 0, 
      message: 'Test webhook received (payment link not found - this is normal for test webhooks)', 
      data: null 
    });
    return;
  }

  const paymentLinkData = paymentLinkDoc.data()!;
  
  if (!paymentLinkData.userId) {
    console.error(`[payosWebhook] Payment link ${paymentLinkId} missing userId`);
    res.status(400).json({ 
      error: -1, 
      message: 'Payment link data is invalid: missing userId', 
      data: null 
    });
    return;
  }

  // Check if already processed
  if (paymentLinkData.status === 'success') {
    console.log(`[payosWebhook] Payment ${paymentLinkId} already processed (idempotency check)`);
    res.status(200).json({ error: 0, message: 'Success', data: null });
    return;
  }

  // Process payment based on status code
  // PayOS code: 00 = success
  if (code === '00') {
    try {
      const userId = paymentLinkData.userId;
      const planName = paymentLinkData.planName;
      const credits = paymentLinkData.credits || 2000;

      // Update user plan and credits
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        plan: planName.includes('agency') ? 'agency' : 'pro',
        updatedAt: FieldValue.serverTimestamp(),
      });

      await setCredits(userId, credits, {
        reason: `Plan upgrade: ${planName}`,
        planName
      });

      // Update payment link status
      await paymentLinkRef.update({
        status: 'success',
        processedAt: FieldValue.serverTimestamp(),
        orderCode: paymentData.orderCode,
      });

      // Log activity
      await logActivity({
        userId,
        action: 'payment_success',
        creditsBefore: 0,
        creditsAfter: credits,
        success: true,
        metadata: {
          paymentLinkId,
          orderCode,
          amount,
          planName,
        },
      });

      console.log(`[payosWebhook] Payment ${paymentLinkId} processed successfully for user ${userId}`);
      res.status(200).json({ error: 0, message: 'Success', data: null });
    } catch (error: any) {
      console.error(`[payosWebhook] Error processing payment ${paymentLinkId}:`, error);
      console.error(`[payosWebhook] Error stack:`, error.stack);

      // Mark as failed
      try {
        await paymentLinkRef.update({
          status: 'failed',
          error: error.message || 'Unknown error',
          processedAt: FieldValue.serverTimestamp(),
        });
      } catch (updateError: any) {
        console.error(`[payosWebhook] Failed to update payment link status:`, updateError);
      }

      res.status(500).json({ 
        error: -1, 
        message: error.message || 'Internal server error', 
        data: null 
      });
    }
  } else {
    // Payment failed or cancelled
    console.log(`[payosWebhook] Payment ${paymentLinkId} failed with code: ${code}, desc: ${desc}`);
    
    try {
      await paymentLinkRef.update({
        status: 'failed',
        error: desc || `Payment failed with code: ${code}`,
        processedAt: FieldValue.serverTimestamp(),
      });
    } catch (updateError: any) {
      console.error(`[payosWebhook] Failed to update payment link status:`, updateError);
    }

    res.status(200).json({ error: 0, message: 'Received', data: null });
  }
});

