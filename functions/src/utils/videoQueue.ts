/**
 * Video Queue System for Veo 3.1
 * Handles rate limiting (2 RPM, 10 RPD) and fair usage
 */
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { VideoQueueItem, GenerateVideoRequest } from '../types';
import { getVideoDailyLimit } from './creditCosts';

// Lazy load firestore
const getDb = () => admin.firestore();

// Priority levels by plan
const PLAN_PRIORITY: Record<string, number> = {
    business: 100,
    agency: 75,
    pro: 50,
    free: 0, // Should never get here, but just in case
};

/**
 * Add a video generation request to the queue
 */
export async function addToVideoQueue(
    userId: string,
    userPlan: string,
    request: GenerateVideoRequest
): Promise<{ queueId: string; position: number }> {
    const db = getDb();

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyRef = db.collection('video_usage').doc(`${userId}_${today}`);
    const dailyDoc = await dailyRef.get();
    const dailyCount = dailyDoc.exists ? (dailyDoc.data()?.count || 0) : 0;
    const dailyLimit = getVideoDailyLimit(userPlan);

    if (dailyLimit === 0) {
        throw new Error('Video generation is not available for your plan. Please upgrade to Pro or higher.');
    }

    if (dailyCount >= dailyLimit) {
        throw new Error(`Daily video limit reached (${dailyLimit}/day). Please try again tomorrow.`);
    }

    // Create queue item
    const queueItem: Omit<VideoQueueItem, 'id'> = {
        userId,
        userPlan,
        request,
        status: 'queued',
        priority: PLAN_PRIORITY[userPlan] || 0,
        retryCount: 0,
        createdAt: FieldValue.serverTimestamp() as any,
    };

    const docRef = await db.collection('video_queue').add(queueItem);

    // Increment daily usage
    await dailyRef.set({
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Calculate position in queue
    const pendingSnapshot = await db.collection('video_queue')
        .where('status', '==', 'queued')
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc')
        .get();

    let position = 1;
    for (const doc of pendingSnapshot.docs) {
        if (doc.id === docRef.id) break;
        position++;
    }

    return { queueId: docRef.id, position };
}

/**
 * Mark queue item as processing and return document data
 */
export async function startProcessing(queueId: string): Promise<VideoQueueItem | null> {
    const db = getDb();
    const docRef = db.collection('video_queue').doc(queueId);

    return await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) return null;

        const data = doc.data() as VideoQueueItem;
        if (data.status !== 'queued' && data.status !== 'error') return null;

        transaction.update(docRef, {
            status: 'processing',
            startedAt: FieldValue.serverTimestamp(),
            processedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        return { ...data, id: doc.id, status: 'processing' } as VideoQueueItem;
    });
}

/**
 * Increment retry count and put back to pending
 */
export async function incrementRetryCount(queueId: string, error: string): Promise<void> {
    const db = getDb();
    const docRef = db.collection('video_queue').doc(queueId);

    await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) return;

        const data = doc.data() as VideoQueueItem;
        const newRetryCount = (data.retryCount || 0) + 1;

        transaction.update(docRef, {
            status: 'queued',
            retryCount: newRetryCount,
            error: `Retry #${newRetryCount}: ${error}`,
            updatedAt: FieldValue.serverTimestamp()
        });
    });
}

/**
 * Mark queue item as processing
 */
export async function markAsProcessing(queueId: string): Promise<void> {
    const db = getDb();
    await db.collection('video_queue').doc(queueId).update({
        status: 'processing',
        processedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Mark queue item as completed
 */
export async function markAsCompleted(
    queueId: string,
    result: { videoUrl: string; thumbnailUrl?: string }
): Promise<void> {
    const db = getDb();
    await db.collection('video_queue').doc(queueId).update({
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
        result,
    });
}

/**
 * Mark queue item as failed
 */
export async function markAsFailed(queueId: string, error: string): Promise<void> {
    const db = getDb();
    await db.collection('video_queue').doc(queueId).update({
        status: 'error',
        completedAt: FieldValue.serverTimestamp(),
        error,
    });
}

/**
 * Get queue status for a user
 */
export async function getUserQueueStatus(userId: string): Promise<{
    pending: VideoQueueItem[];
    processing: VideoQueueItem[];
    completed: VideoQueueItem[];
}> {
    const db = getDb();

    const snapshot = await db.collection('video_queue')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoQueueItem));

    return {
        pending: items.filter(i => i.status === 'queued'),
        processing: items.filter(i => i.status === 'processing'),
        completed: items.filter(i => i.status === 'completed'),
    };
}

/**
 * Get queue position for a specific item
 */
export async function getQueuePosition(queueId: string): Promise<number> {
    const db = getDb();

    const itemDoc = await db.collection('video_queue').doc(queueId).get();
    if (!itemDoc.exists) return -1;

    const item = itemDoc.data() as VideoQueueItem;
    if (item.status !== 'queued') return 0; // Not in queue

    const pendingSnapshot = await db.collection('video_queue')
        .where('status', '==', 'queued')
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc')
        .get();

    let position = 1;
    for (const doc of pendingSnapshot.docs) {
        if (doc.id === queueId) break;
        position++;
    }

    return position;
}

/**
 * Check global rate limit (2 RPM for Veo 3)
 */
export async function checkGlobalRateLimit(): Promise<boolean> {
    const db = getDb();
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentSnapshot = await db.collection('video_api_calls')
        .where('timestamp', '>', oneMinuteAgo)
        .get();

    return recentSnapshot.size < 2; // Max 2 requests per minute
}

/**
 * Record an API call for rate limiting
 */
export async function recordApiCall(): Promise<void> {
    const db = getDb();
    await db.collection('video_api_calls').add({
        timestamp: Date.now(),
        createdAt: FieldValue.serverTimestamp(),
    });

    // Cleanup old records (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    const oldRecords = await db.collection('video_api_calls')
        .where('timestamp', '<', oneHourAgo)
        .get();

    const batch = db.batch();
    oldRecords.docs.forEach(doc => batch.delete(doc.ref));
    if (!oldRecords.empty) {
        await batch.commit();
    }
}
