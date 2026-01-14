import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

/**
 * Check rate limit for user
 * Throws error if rate limit exceeded
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const db = getDb();
  const rateLimitRef = db.collection('rate_limits').doc(userId);
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();

  if (!rateLimitDoc.exists) {
    // First request - initialize
    await rateLimitRef.set({
      count: 1,
      lastRequest: now
    });
    return;
  }

  const data = rateLimitDoc.data()!;
  const lastRequest = data.lastRequest || 0;
  const count = data.count || 0;

  // Reset counter if window has passed
  if (now - lastRequest > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      lastRequest: now
    });
    return;
  }

  // Check if limit exceeded
  if (count >= MAX_REQUESTS_PER_WINDOW) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please try again later.`
    );
  }

  // Increment counter
  await rateLimitRef.update({
    count: count + 1,
    lastRequest: now
  });
}

