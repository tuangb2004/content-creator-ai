import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { sendNotification } from './utils/notificationHelper';

const getDb = () => admin.firestore();

// ============================================================================
// FIRESTORE TRIGGERS (Production Pattern: Aggregation & Anti-Spam)
// ============================================================================

/**
 * onLikeCreated: Handles viral post aggregation and bot protection.
 */
export const onLikeCreated = functions.firestore
    .document('postLikes/{likeId}')
    .onCreate(async (snap) => {
        const data = snap.data();
        if (!data) return;

        const { postId, userId: actorId } = data;
        const db = getDb();

        try {
            // 1. Anti-Spam Check: Rate limiting (e.g., skip if > 10 likes/minute from same user)
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            const recentLikes = await db.collection('postLikes')
                .where('userId', '==', actorId)
                .where('createdAt', '>=', oneMinuteAgo)
                .count()
                .get();

            if (recentLikes.data().count > 20) {
                console.warn(`[onLikeCreated] Rate limit exceeded for user ${actorId}. Skipping notification.`);
                return;
            }

            // 2. Fetch target info
            const postDoc = await db.collection('posts').doc(postId).get();
            if (!postDoc.exists) return;

            const postData = postDoc.data();
            const recipientId = postData?.authorId;

            // 3. Self-Notification block
            if (!recipientId || recipientId === actorId) return;

            // 4. Send Aggregated Notification
            // handles grouping "A and 5 others liked..." to save cost and reduce noise
            await sendNotification(db, {
                userId: recipientId,
                type: 'like',
                actorId: actorId,
                postId: postId
            });

            // 5. Update Badge Count (Every like increments the "Unread Events" bubble)
            await db.collection('userProfiles').doc(recipientId).set({
                unreadNotificationCount: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('[onLikeCreated] Error:', error);
        }
    });

/**
 * onCommentCreated: High priority notification.
 */
export const onCommentCreated = functions.firestore
    .document('comments/{commentId}')
    .onCreate(async (snap) => {
        const data = snap.data();
        if (!data) return;

        const { postId, authorId: actorId } = data;
        const commentId = snap.id;
        const db = getDb();

        try {
            const postDoc = await db.collection('posts').doc(postId).get();
            if (!postDoc.exists) return;

            const postData = postDoc.data();
            const recipientId = postData?.authorId;

            if (!recipientId || recipientId === actorId) return;

            // Comments are high priority - aggregated by person usually, 
            // but here we keep them grouped per post if they happen close together
            await sendNotification(db, {
                userId: recipientId,
                type: 'comment',
                actorId: actorId,
                postId: postId,
                commentId: commentId
            });

            // Increment unread count
            await db.collection('userProfiles').doc(recipientId).set({
                unreadNotificationCount: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('[onCommentCreated] Error:', error);
        }
    });

/**
 * onFollowCreated: Growth priority notification.
 */
export const onFollowCreated = functions.firestore
    .document('follows/{followId}')
    .onCreate(async (snap) => {
        const data = snap.data();
        if (!data) return;

        const { followerId: actorId, followingId: recipientId } = data;
        const db = getDb();

        try {
            await sendNotification(db, {
                userId: recipientId,
                type: 'follow',
                actorId: actorId
            });

            // Increment unread count
            await db.collection('userProfiles').doc(recipientId).set({
                unreadNotificationCount: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('[onFollowCreated] Error:', error);
        }
    });
