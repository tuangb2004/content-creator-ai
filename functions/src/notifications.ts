import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAuth } from './utils/validation';

function getDb() {
    return admin.firestore();
}

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system';

export interface Notification {
    id?: string;
    userId: string; // Recipient
    type: NotificationType;
    actorId: string; // Who triggered the notification
    actorName: string;
    actorAvatar?: string;
    postId?: string;
    postTitle?: string;
    postThumbnail?: string;
    commentId?: string;
    commentPreview?: string;
    message?: string;
    isRead: boolean;
    createdAt: FirebaseFirestore.Timestamp;
}

// ============================================================================
// CREATE NOTIFICATION (Internal helper, callable for testing)
// ============================================================================

export const createNotification = functions.https.onCall(
    async (data: {
        userId: string;
        type: NotificationType;
        actorId: string;
        postId?: string;
        commentId?: string;
        message?: string;
    }, context: functions.https.CallableContext) => {
        // Allow system calls or authenticated users

        if (!data.userId || !data.type || !data.actorId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId, type, actorId required');
        }

        // Don't notify yourself
        if (data.userId === data.actorId) {
            return { success: true, skipped: true };
        }

        const db = getDb();

        try {
            // Get actor info
            const actorDoc = await db.collection('users').doc(data.actorId).get();
            const actorData = actorDoc.data() || {};

            // Get post info if applicable
            let postTitle = '';
            let postThumbnail = '';
            if (data.postId) {
                const postDoc = await db.collection('posts').doc(data.postId).get();
                const postData = postDoc.data();
                postTitle = postData?.title || '';
                postThumbnail = postData?.mediaUrl || postData?.thumbnailUrl || '';
            }

            // Get comment preview if applicable
            let commentPreview = '';
            if (data.commentId) {
                const commentDoc = await db.collection('comments').doc(data.commentId).get();
                const commentData = commentDoc.data();
                commentPreview = (commentData?.content || '').slice(0, 100);
            }

            const notification: Omit<Notification, 'id'> = {
                userId: data.userId,
                type: data.type,
                actorId: data.actorId,
                actorName: actorData.displayName || actorData.email?.split('@')[0] || 'Người dùng',
                actorAvatar: actorData.photoURL,
                postId: data.postId,
                postTitle,
                postThumbnail,
                commentId: data.commentId,
                commentPreview,
                message: data.message,
                isRead: false,
                createdAt: FieldValue.serverTimestamp() as any,
            };

            const docRef = await db.collection('notifications').add(notification);

            return { success: true, notificationId: docRef.id };
        } catch (error: any) {
            console.error('Error creating notification:', error);
            throw new functions.https.HttpsError('internal', 'Failed to create notification', error.message);
        }
    }
);

// ============================================================================
// GET NOTIFICATIONS
// ============================================================================

export const getNotifications = functions.https.onCall(
    async (data: { limit?: number; unreadOnly?: boolean }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);
        const db = getDb();
        const limit = Math.min(data.limit || 50, 100);

        try {
            let query = db.collection('notifications')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (data.unreadOnly) {
                query = db.collection('notifications')
                    .where('userId', '==', userId)
                    .where('isRead', '==', false)
                    .orderBy('createdAt', 'desc')
                    .limit(limit);
            }

            const snapshot = await query.get();

            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Get unread count
            const unreadSnap = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('isRead', '==', false)
                .count()
                .get();

            return {
                success: true,
                notifications,
                unreadCount: unreadSnap.data().count,
            };
        } catch (error: any) {
            console.error('Error getting notifications:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get notifications', error.message);
        }
    }
);

// ============================================================================
// MARK AS READ
// ============================================================================

export const markNotificationAsRead = functions.https.onCall(
    async (data: { notificationId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.notificationId) {
            throw new functions.https.HttpsError('invalid-argument', 'notificationId is required');
        }

        const db = getDb();

        try {
            const notifRef = db.collection('notifications').doc(data.notificationId);
            const notifDoc = await notifRef.get();

            if (!notifDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Notification not found');
            }

            if (notifDoc.data()?.userId !== userId) {
                throw new functions.https.HttpsError('permission-denied', 'Not your notification');
            }

            await notifRef.update({ isRead: true });

            return { success: true };
        } catch (error: any) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('Error marking notification as read:', error);
            throw new functions.https.HttpsError('internal', 'Failed to mark as read', error.message);
        }
    }
);

// ============================================================================
// MARK ALL AS READ
// ============================================================================

export const markAllNotificationsAsRead = functions.https.onCall(
    async (data: any, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);
        const db = getDb();

        try {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('isRead', '==', false)
                .get();

            if (snapshot.empty) {
                return { success: true, count: 0 };
            }

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            await batch.commit();

            return { success: true, count: snapshot.size };
        } catch (error: any) {
            console.error('Error marking all as read:', error);
            throw new functions.https.HttpsError('internal', 'Failed to mark all as read', error.message);
        }
    }
);
