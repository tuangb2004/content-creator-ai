import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours (rolling)
const MAX_REQUESTS_PER_DAY = 100;

/**
 * Check rate limit for user (per minute + per day)
 * Throws error if rate limit exceeded
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const db = getDb();
  const rateLimitRef = db.collection('rate_limits').doc(userId);
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();

  if (!rateLimitDoc.exists) {
    await rateLimitRef.set({
      count: 1,
      lastRequest: now,
      dailyCount: 1,
      dailyWindowStart: now
    });
    return;
  }

  const data = rateLimitDoc.data()!;
  const lastRequest = data.lastRequest || 0;
  const count = data.count || 0;
  let dailyCount = data.dailyCount ?? 0;
  let dailyWindowStart = data.dailyWindowStart ?? now;

  // Reset daily counter if 24h has passed (rolling window)
  if (now - dailyWindowStart >= DAILY_WINDOW_MS) {
    dailyCount = 0;
    dailyWindowStart = now;
  }

  // Daily cap (protect against runaway cost)
  if (dailyCount >= MAX_REQUESTS_PER_DAY) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Daily limit reached. Maximum ${MAX_REQUESTS_PER_DAY} requests per day. Try again tomorrow.`
    );
  }

  // Reset per-minute counter if window has passed
  if (now - lastRequest > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      lastRequest: now,
      dailyCount: dailyCount + 1,
      dailyWindowStart
    });
    return;
  }

  // Per-minute limit
  if (count >= MAX_REQUESTS_PER_WINDOW) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Rate limit exceeded. Maximum ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please try again later.`
    );
  }

  await rateLimitRef.update({
    count: count + 1,
    lastRequest: now,
    dailyCount: dailyCount + 1,
    dailyWindowStart
  });
}

