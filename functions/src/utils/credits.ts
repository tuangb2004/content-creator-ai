import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { UserData } from '../types';

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
export async function decrementCredits(userId: string, amount: number = 1): Promise<number> {
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

  return creditsAfter;
}

/**
 * Increment credits (for refund or purchase)
 */
export async function incrementCredits(userId: string, amount: number): Promise<number> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);

  return db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }

    const userData = userDoc.data() as UserData;
    const currentCredits = userData.credits || 0;
    const creditsAfter = currentCredits + amount;

    transaction.update(userRef, {
      credits: creditsAfter,
      updatedAt: FieldValue.serverTimestamp()
    });

    return creditsAfter;
  });
}

/**
 * Set credits (for initial setup or plan upgrade)
 */
export async function setCredits(userId: string, credits: number): Promise<void> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);

  await userRef.update({
    credits,
    updatedAt: FieldValue.serverTimestamp()
  });
}

/**
 * Initialize user with free credits (on signup)
 */
export async function initializeUser(userId: string, email: string): Promise<void> {
  const db = getDb();
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  // Only initialize if user doesn't exist
  if (!userDoc.exists) {
    await userRef.set({
      email,
      plan: 'free',
      credits: 10, // Free tier: 10 credits
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

