import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth } from './utils/validation';

function getDb() {
    return admin.firestore();
}

/**
 * Get all interactions for the current authenticated user
 * Returns likedPostIds, savedPostIds, and followingUserIds
 */
export const getUserInteractions = functions.https.onCall(
    async (data: any, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);
        const db = getDb();

        try {
            const [likesSnap, savesSnap, followsSnap] = await Promise.all([
                db.collection('postLikes').where('userId', '==', userId).get(),
                db.collection('postSaves').where('userId', '==', userId).get(),
                db.collection('follows').where('followerId', '==', userId).get(),
            ]);

            const likedPostIds = likesSnap.docs.map(doc => doc.data().postId);
            const savedPostIds = savesSnap.docs.map(doc => doc.data().postId);
            const followingUserIds = followsSnap.docs.map(doc => doc.data().followingId);

            return {
                success: true,
                likedPostIds,
                savedPostIds,
                followingUserIds,
            };
        } catch (error: any) {
            console.error('Error getting user interactions:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get interactions', error.message);
        }
    }
);
