import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAuth } from './utils/validation';


function getDb() {
    return admin.firestore();
}

// ============================================================================
// GET USER PROFILE
// ============================================================================

export const getUserProfile = functions.https.onCall(
    async (data: { userId: string }, context: functions.https.CallableContext) => {
        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId is required');
        }

        const currentUserId = context.auth?.uid;
        const db = getDb();

        try {
            // Get user data
            const userDoc = await db.collection('users').doc(data.userId).get();
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'User not found');
            }

            const userData = userDoc.data() || {};

            // Get user profile if exists
            const profileDoc = await db.collection('userProfiles').doc(data.userId).get();
            const profileData = profileDoc.exists ? profileDoc.data() : {};

            // Get post count
            const postsSnap = await db.collection('posts')
                .where('authorId', '==', data.userId)
                .count()
                .get();

            // Get followers/following count
            const followersSnap = await db.collection('follows')
                .where('followingId', '==', data.userId)
                .count()
                .get();

            const followingSnap = await db.collection('follows')
                .where('followerId', '==', data.userId)
                .count()
                .get();



            // Get total likes received - optimized using aggregation
            // Use a more efficient approach - sum from a counter field if available, 
            // otherwise just return 0 to avoid slow queries on large datasets
            let totalLikes = 0;
            try {
                // Try to use aggregate query for better performance
                const likesAggregate = await db.collection('posts')
                    .where('authorId', '==', data.userId)
                    .select('likes')
                    .get();
                
                likesAggregate.forEach(doc => {
                    totalLikes += doc.data().likes || 0;
                });
            } catch (aggregateError) {
                // If aggregate fails, try alternative method or skip
                console.warn('Could not get likes count:', aggregateError);
                // Set to a reasonable default or cached value
                totalLikes = profileData?.totalLikes || 0;
            }

            return {
                success: true,
                profile: {
                    id: data.userId,
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                    email: userData.email,
                    photoURL: userData.photoURL,
                    bio: profileData?.bio || '',
                    website: profileData?.website || '',
                    socialLinks: profileData?.socialLinks || {},
                    postCount: postsSnap.data().count,
                    followersCount: followersSnap.data().count,
                    followingCount: followingSnap.data().count,
                    totalLikes,
                    unreadNotificationCount: profileData?.unreadNotificationCount || 0,
                    isOwnProfile: currentUserId === data.userId,
                    createdAt: userData.createdAt,
                },
            };
        } catch (error: any) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('Error getting user profile:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get profile', error.message);
        }
    }
);

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

export const updateUserProfile = functions.https.onCall(
    async (data: { bio?: string; website?: string; socialLinks?: Record<string, string> }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);
        const db = getDb();

        const updateData: Record<string, any> = {
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (data.bio !== undefined) updateData.bio = data.bio.slice(0, 500);
        if (data.website !== undefined) updateData.website = data.website.slice(0, 200);
        if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;

        try {
            await db.collection('userProfiles').doc(userId).set(updateData, { merge: true });
            return { success: true, message: 'Profile updated' };
        } catch (error: any) {
            console.error('Error updating profile:', error);
            throw new functions.https.HttpsError('internal', 'Failed to update profile', error.message);
        }
    }
);

// ============================================================================
// GET USER POSTS
// ============================================================================

export const getUserPosts = functions.https.onCall(
    async (data: { userId: string; limit?: number; lastPostId?: string }, context: functions.https.CallableContext) => {
        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId is required');
        }


        const db = getDb();
        const limit = Math.min(data.limit || 20, 50);

        try {
            let query = db.collection('posts')
                .where('authorId', '==', data.userId)
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (data.lastPostId) {
                const lastDoc = await db.collection('posts').doc(data.lastPostId).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();

            const posts = snapshot.docs
                .filter(doc => doc.data().isDeleted !== true)
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

            return {
                success: true,
                posts,
                hasMore: posts.length === limit,
                lastPostId: posts.length > 0 ? posts[posts.length - 1].id : null,
            };
        } catch (error: any) {
            console.error('Error getting user posts:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get posts', error.message);
        }
    }
);

// ============================================================================
// FOLLOW USER (Toggle)
// ============================================================================

export const followUser = functions.https.onCall(
    async (data: { userId: string }, context: functions.https.CallableContext) => {
        const currentUserId = validateAuth(context);

        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId is required');
        }

        if (data.userId === currentUserId) {
            throw new functions.https.HttpsError('invalid-argument', 'Cannot follow yourself');
        }

        const db = getDb();
        const followRef = db.collection('follows').doc(`${currentUserId}_${data.userId}`);

        try {
            return await db.runTransaction(async (transaction) => {
                const followDoc = await transaction.get(followRef);

                if (followDoc.exists) {
                    // Unfollow
                    transaction.delete(followRef);

                    // Sync followersCount
                    const profileRef = db.collection('userProfiles').doc(data.userId);
                    transaction.set(profileRef, {
                        followersCount: FieldValue.increment(-1),
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });

                    return { success: true, following: false, message: 'User unfollowed' };
                } else {
                    // Follow
                    transaction.set(followRef, {
                        followerId: currentUserId,
                        followingId: data.userId,
                        createdAt: FieldValue.serverTimestamp(),
                    });

                    // Sync followersCount
                    const profileRef = db.collection('userProfiles').doc(data.userId);
                    transaction.set(profileRef, {
                        followersCount: FieldValue.increment(1),
                        updatedAt: FieldValue.serverTimestamp()
                    }, { merge: true });

                    // Notification now handled by Firestore Trigger: onFollowCreated


                    return { success: true, following: true, message: 'User followed' };
                }
            });
        } catch (error: any) {
            console.error('Error following user:', error);
            throw new functions.https.HttpsError('internal', 'Failed to follow user', error.message);
        }
    }
);

// ============================================================================
// GET FOLLOWERS
// ============================================================================

export const getFollowers = functions.https.onCall(
    async (data: { userId: string; limit?: number }, context: functions.https.CallableContext) => {
        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId is required');
        }

        const db = getDb();
        const limit = Math.min(data.limit || 50, 100);

        try {
            const snapshot = await db.collection('follows')
                .where('followingId', '==', data.userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const followerIds = snapshot.docs.map(doc => doc.data().followerId);

            // Get user info for each follower
            const followers = await Promise.all(
                followerIds.map(async (id) => {
                    const userDoc = await db.collection('users').doc(id).get();
                    const userData = userDoc.data() || {};
                    return {
                        id,
                        displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                        photoURL: userData.photoURL,
                    };
                })
            );

            return { success: true, followers, count: followers.length };
        } catch (error: any) {
            console.error('Error getting followers:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get followers', error.message);
        }
    }
);

// ============================================================================
// GET FOLLOWING
// ============================================================================

export const getFollowing = functions.https.onCall(
    async (data: { userId: string; limit?: number }, context: functions.https.CallableContext) => {
        if (!data.userId) {
            throw new functions.https.HttpsError('invalid-argument', 'userId is required');
        }

        const db = getDb();
        const limit = Math.min(data.limit || 50, 100);

        try {
            const snapshot = await db.collection('follows')
                .where('followerId', '==', data.userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const followingIds = snapshot.docs.map(doc => doc.data().followingId);

            // Get user info for each following
            const following = await Promise.all(
                followingIds.map(async (id) => {
                    const userDoc = await db.collection('users').doc(id).get();
                    const userData = userDoc.data() || {};
                    return {
                        id,
                        displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                        photoURL: userData.photoURL,
                    };
                })
            );

            return { success: true, following, count: following.length };
        } catch (error: any) {
            console.error('Error getting following:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get following', error.message);
        }
    }
);
