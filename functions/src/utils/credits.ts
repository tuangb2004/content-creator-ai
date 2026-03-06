import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { UserData } from '../types';
import { logActivity } from './logging';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

/**
 * Check if user has sufficient credits
 * Returns current credits if sufficient, throws error otherwise
 */
export async function checkCredits(userId: string): Promise<number> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'User not found'
    );
  }

  const userData = userDoc.data() as UserData;
  const credits = userData.credits || 0;

  if (credits <= 0) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Insufficient credits. Please upgrade your plan or purchase more credits.'
    );
  }

  return credits;
}

/**
 * Decrement credits using Firestore Transaction (atomic)
 * Returns credits after decrement
 */
export async function decrementCredits(userId: string, amount: number = 1, metadata?: { toolName?: string; contentType?: string }): Promise<number> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);
  let creditsAfter = 0;

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }

    const userData = userDoc.data() as UserData;
    const currentCredits = userData.credits || 0;

    if (currentCredits < amount) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient credits'
      );
    }

    creditsAfter = currentCredits - amount;

    transaction.update(userRef, {
      credits: creditsAfter,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  // Log transaction for billing history
  try {
    await db.collection('transactions').add({
      userId,
      type: 'deduct',
      amount,
      description: metadata?.toolName
        ? `Sử dụng ${metadata.toolName}${metadata.contentType ? ` (${metadata.contentType})` : ''}`
        : `Trừ ${amount} credit`,
      status: 'completed',
      referenceId: metadata?.toolName || 'content_generation',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (logError) {
    console.warn('Failed to log deduction transaction:', logError);
  }

  return creditsAfter;
}

/**
 * Increment credits (for refund or purchase)
 */
export async function incrementCredits(userId: string, amount: number, metadata?: { reason?: string }): Promise<number> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);
  let creditsBefore = 0;
  let creditsAfter = 0;

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }

    const userData = userDoc.data() as UserData;
    const currentCredits = userData.credits || 0;
    creditsBefore = currentCredits;
    creditsAfter = currentCredits + amount;

    transaction.update(userRef, {
      credits: creditsAfter,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  // Log credit update activity
  try {
    await logActivity({
      userId,
      action: 'credits_updated',
      creditsBefore,
      creditsAfter,
      success: true,
      metadata: {
        change: amount,
        reason: metadata?.reason || `Added ${amount} credits`,
        type: amount > 0 ? 'added' : 'deducted'
      }
    });
  } catch (logError) {
    console.warn('Failed to log credit increment activity:', logError);
  }

  // Log transaction for billing history
  try {
    await db.collection('transactions').add({
      userId,
      type: 'add',
      amount,
      description: metadata?.reason || `Nạp ${amount} credit`,
      status: 'completed',
      referenceId: 'credit_purchase',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (logError) {
    console.warn('Failed to log increment transaction:', logError);
  }

  return creditsAfter;
}

/**
 * Set credits (for initial setup or plan upgrade)
 */
export async function setCredits(userId: string, credits: number, metadata?: { reason?: string; planName?: string }): Promise<void> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);

  // Get current credits before update
  const userDoc = await userRef.get();
  const creditsBefore = userDoc.exists ? (userDoc.data() as UserData).credits || 0 : 0;

  await userRef.update({
    credits,
    updatedAt: FieldValue.serverTimestamp()
  });

  // Log credit update activity if credits changed
  if (credits !== creditsBefore) {
    const change = credits - creditsBefore;
    const description = metadata?.reason || (metadata?.planName ? `Nâng cấp gói: ${metadata.planName}` : `Cập nhật credit: ${credits}`);

    try {
      await logActivity({
        userId,
        action: 'credits_updated',
        creditsBefore,
        creditsAfter: credits,
        success: true,
        metadata: {
          change,
          reason: description,
          planName: metadata?.planName,
          type: credits > creditsBefore ? 'added' : 'set'
        }
      });
    } catch (logError) {
      console.warn('Failed to log credit set activity:', logError);
    }

    // Log transaction for billing history
    try {
      await db.collection('transactions').add({
        userId,
        type: change > 0 ? 'add' : 'deduct',
        amount: Math.abs(change),
        description,
        status: 'completed',
        referenceId: metadata?.planName || 'plan_update',
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.warn('Failed to log setCredits transaction:', logError);
    }
  }
}

/**
 * Initialize user with free credits (on signup)
 */
export async function initializeUser(userId: string, email: string, displayName?: string, photoURL?: string): Promise<void> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  // Only initialize if user doesn't exist
  if (!userDoc.exists) {
    await userRef.set({
      email,
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
      plan: 'free',
      credits: 10, // Default for new users
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

