import { FieldValue } from 'firebase-admin/firestore';
import { NotificationType } from '../notifications';

/**
 * Result of a notification event
 */
export interface SendNotificationResult {
    success: boolean;
    isNew: boolean; // True if a new document was created, false if aggregated
    id?: string;
}

/**
 * Internal helper to create or AGGREGATE notifications.
 * Implements TikTok/Facebook style grouping: "User A and 5 others liked..."
 */
export async function sendNotification(
    db: FirebaseFirestore.Firestore,
    data: {
        userId: string;       // Recipient
        type: NotificationType;
        actorId: string;      // Current Actor
        postId?: string;
        commentId?: string;
        message?: string;
    }
): Promise<SendNotificationResult> {
    // Never notify yourself
    if (data.userId === data.actorId) return { success: true, isNew: false };

    try {
        // PRODUCTION LOGIC: AGGREGATION WINDOW (24 hours)
        // Groups events into one record to avoid notification spam
        const aggregationWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);

        let notificationRef: FirebaseFirestore.DocumentReference | null = null;
        let existingData: any = null;

        // Query for unread notifications of same type
        let query = db.collection('notifications')
            .where('userId', '==', data.userId)
            .where('type', '==', data.type)
            .where('isRead', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(1);

        // Filter by target (essential for aggregation)
        if (data.postId) {
            query = query.where('postId', '==', data.postId);
        } else if (data.commentId) {
            query = query.where('commentId', '==', data.commentId);
        }

        const snapshot = await query.get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const docData = doc.data();
            const createdAt = docData.createdAt?.toDate?.() || new Date(0);

            // Only aggregate if within the window and not already aggregated too many (limit doc size)
            if (createdAt >= aggregationWindow && (docData.count || 0) < 100) {
                notificationRef = doc.ref;
                existingData = docData;
            }
        }

        // Fetch latest actor data
        const actorDoc = await db.collection('users').doc(data.actorId).get();
        const actorData = actorDoc.data() || {};
        const actorName = actorData.displayName || actorData.email?.split('@')[0] || 'Người dùng';
        const actorAvatar = actorData.photoURL || null;

        if (notificationRef && existingData) {
            // --- AGGREGATE MODE ---
            const actorIds = existingData.actorIds || [existingData.actorId];

            const updateData: any = {
                actorId: data.actorId, // Most recent actor
                actorName: actorName,
                actorAvatar: actorAvatar,
                count: FieldValue.increment(1),
                updatedAt: FieldValue.serverTimestamp()
            };

            // Deduplication: Avoid adding same actor multiple times to the list
            if (!actorIds.includes(data.actorId)) {
                updateData.actorIds = FieldValue.arrayUnion(data.actorId);
            }

            await notificationRef.update(updateData);
            return { success: true, isNew: false, id: notificationRef.id };

        } else {
            // --- CREATE NEW MODE ---
            let postTitle = '';
            let postThumbnail = '';
            if (data.postId) {
                const postDoc = await db.collection('posts').doc(data.postId).get();
                const postData = postDoc.data();
                postTitle = postData?.title || '';
                postThumbnail = postData?.mediaUrl || postData?.thumbnailUrl || '';
            }

            let commentPreview = '';
            if (data.commentId) {
                const commentDoc = await db.collection('comments').doc(data.commentId).get();
                const commentData = commentDoc.data();
                commentPreview = (commentData?.content || '').slice(0, 100);
            }

            const notification = {
                userId: data.userId,
                type: data.type,
                actorId: data.actorId,
                actorName: actorName,
                actorAvatar: actorAvatar,
                actorIds: [data.actorId],
                count: 1,
                postId: data.postId || null,
                postTitle,
                postThumbnail,
                commentId: data.commentId || null,
                commentPreview,
                message: data.message || null,
                isRead: false,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            };

            const newDoc = await db.collection('notifications').add(notification);
            return { success: true, isNew: true, id: newDoc.id };
        }
    } catch (error: any) {
        console.error('[sendNotification] Error:', error);
        return { success: false, isNew: false };
    }
}
