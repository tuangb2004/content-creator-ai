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

export interface Comment {
    id?: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    likes: number;
    parentId?: string; // For replies
    createdAt: FirebaseFirestore.Timestamp;
}

// ============================================================================
// ADD COMMENT
// ============================================================================

export const addComment = functions.https.onCall(
    async (data: { postId: string; content: string; parentId?: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId || !data.content?.trim()) {
            throw new functions.https.HttpsError('invalid-argument', 'postId and content are required');
        }

        const db = getDb();

        // Get user info
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        const commentData = {
            postId: data.postId,
            authorId: userId,
            authorName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
            content: data.content.trim(),
            likes: 0,
            parentId: data.parentId || null,
            createdAt: FieldValue.serverTimestamp(),
            ...(userData.photoURL && { authorAvatar: userData.photoURL }),
        };

        try {
            const docRef = await db.collection('comments').add(commentData);

            // Update post comment count
            await db.collection('posts').doc(data.postId).update({
                comments: FieldValue.increment(1),
            });

            // Notification is now handled by Firestore Trigger: onCommentCreated


            return {
                success: true,
                commentId: docRef.id,
                comment: { ...commentData, id: docRef.id },
            };
        } catch (error: any) {
            console.error('Error adding comment:', error);
            throw new functions.https.HttpsError('internal', 'Failed to add comment', error.message);
        }
    }
);

// ============================================================================
// GET COMMENTS
// ============================================================================

export const getComments = functions.https.onCall(
    async (data: { postId: string; limit?: number }, context: functions.https.CallableContext) => {
        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const userId = context.auth?.uid;
        const db = getDb();
        const limit = Math.min(data.limit || 50, 100);

        try {
            const snapshot = await db.collection('comments')
                .where('postId', '==', data.postId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            // Get user's liked comments
            let userLikes = new Set<string>();
            if (userId) {
                const likesSnap = await db.collection('commentLikes')
                    .where('userId', '==', userId)
                    .where('postId', '==', data.postId)
                    .get();
                likesSnap.forEach(doc => userLikes.add(doc.data().commentId));
            }

            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isLiked: userLikes.has(doc.id),
            }));

            return { success: true, comments, count: comments.length };
        } catch (error: any) {
            console.error('Error getting comments:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get comments', error.message);
        }
    }
);

// ============================================================================
// LIKE COMMENT (Toggle)
// ============================================================================

export const likeComment = functions.https.onCall(
    async (data: { commentId: string; postId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.commentId) {
            throw new functions.https.HttpsError('invalid-argument', 'commentId is required');
        }

        const db = getDb();
        const likesRef = db.collection('commentLikes');
        const commentRef = db.collection('comments').doc(data.commentId);

        try {
            const existingLike = await likesRef
                .where('commentId', '==', data.commentId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!existingLike.empty) {
                // Unlike
                await existingLike.docs[0].ref.delete();
                await commentRef.update({ likes: FieldValue.increment(-1) });
                return { success: true, liked: false };
            } else {
                // Like
                await likesRef.add({
                    commentId: data.commentId,
                    postId: data.postId,
                    userId,
                    createdAt: FieldValue.serverTimestamp(),
                });
                await commentRef.update({ likes: FieldValue.increment(1) });
                return { success: true, liked: true };
            }
        } catch (error: any) {
            console.error('Error liking comment:', error);
            throw new functions.https.HttpsError('internal', 'Failed to like comment', error.message);
        }
    }
);

// ============================================================================
// DELETE COMMENT (Owner only)
// ============================================================================

export const deleteComment = functions.https.onCall(
    async (data: { commentId: string; postId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.commentId) {
            throw new functions.https.HttpsError('invalid-argument', 'commentId is required');
        }

        const db = getDb();
        const commentRef = db.collection('comments').doc(data.commentId);

        try {
            const commentDoc = await commentRef.get();

            if (!commentDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Comment not found');
            }

            const commentData = commentDoc.data();
            if (commentData?.authorId !== userId) {
                throw new functions.https.HttpsError('permission-denied', 'Not your comment');
            }

            // Delete comment likes
            const likesSnap = await db.collection('commentLikes')
                .where('commentId', '==', data.commentId)
                .get();
            const batch = db.batch();
            likesSnap.forEach(doc => batch.delete(doc.ref));
            batch.delete(commentRef);
            await batch.commit();

            // Update post comment count
            if (data.postId) {
                await db.collection('posts').doc(data.postId).update({
                    comments: FieldValue.increment(-1),
                });
            }

            return { success: true, message: 'Comment deleted' };
        } catch (error: any) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('Error deleting comment:', error);
            throw new functions.https.HttpsError('internal', 'Failed to delete comment', error.message);
        }
    }
);
