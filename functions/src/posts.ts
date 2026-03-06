import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAuth } from './utils/validation';


// Lazy load firestore
function getDb() {
    return admin.firestore();
}

// ============================================================================
// TYPES
// ============================================================================

export interface Post {
    id?: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    type: 'image' | 'video' | 'text';
    mediaUrl?: string; // Optional for text posts
    thumbnailUrl?: string;
    content?: string; // For text posts
    prompt: string;
    title: string;
    description?: string;
    model?: string;
    aspectRatio?: string;
    category?: string;
    tags: string[];
    likes: number;
    views: number;
    saves: number;
    comments: number;
    usageCount: number;
    isTrending: boolean;
    isPublic: boolean;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    isDeleted?: boolean;
}

export interface CreatePostRequest {
    type: 'image' | 'video' | 'text';
    mediaUrl?: string; // Optional for text posts
    thumbnailUrl?: string;
    content?: string; // Required for text posts
    prompt: string;
    title: string;
    description?: string;
    model?: string;
    aspectRatio?: string;
    category?: string;
    tags?: string[];
}

export interface GetPostsRequest {
    type?: 'image' | 'video' | 'text';
    category?: string;
    authorId?: string;
    savedByMe?: boolean;
    likedByMe?: boolean;
    sortBy?: 'recent' | 'popular' | 'views';
    timeRange?: 'today' | 'week' | 'month' | 'all';
    limit?: number;
    startAfter?: string;
}

// ============================================================================
// CREATE POST
// ============================================================================

export const createPost = functions.https.onCall(
    async (data: CreatePostRequest, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        // Validate required fields
        if (!data.type || !data.title) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'type and title are required'
            );
        }

        // Use default prompt if not provided
        const prompt = data.prompt?.trim() || 'Tác phẩm được chia sẻ';

        // Validate type-specific requirements
        if (data.type === 'text') {
            if (!data.content || !data.content.trim()) {
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'content is required for text posts'
                );
            }
        } else {
            if (!data.mediaUrl) {
                throw new functions.https.HttpsError(
                    'invalid-argument',
                    'mediaUrl is required for image/video posts'
                );
            }
        }

        const db = getDb();

        // Get user profile for author info
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        const postData = {
            authorId: userId,
            authorName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
            type: data.type,
            prompt: prompt,
            title: data.title.trim(),
            category: data.category || 'general',
            tags: data.tags || [],
            likes: 0,
            views: 0,
            saves: 0,
            comments: 0,
            usageCount: 0,
            isTrending: false,
            isPublic: true,
            isDeleted: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            // Optional fields - only include if defined
            ...(userData.photoURL && { authorAvatar: userData.photoURL }),
            ...(data.mediaUrl && { mediaUrl: data.mediaUrl }),
            ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
            ...(data.content?.trim() && { content: data.content.trim() }),
            ...(data.description?.trim() && { description: data.description.trim() }),
            ...(data.model && { model: data.model }),
            ...(data.aspectRatio && { aspectRatio: data.aspectRatio }),
        };

        try {
            const docRef = await db.collection('posts').add(postData);

            // Update user's post count
            await db.collection('userProfiles').doc(userId).set({
                postsCount: FieldValue.increment(1),
            }, { merge: true });

            return {
                success: true,
                postId: docRef.id,
                message: 'Post created successfully',
            };
        } catch (error: any) {
            console.error('Error creating post:', error);
            throw new functions.https.HttpsError('internal', 'Failed to create post', error.message);
        }
    }
);

// ============================================================================
// GET POSTS (Public feed)
// ============================================================================

export const getPosts = functions.https.onCall(
    async (data: GetPostsRequest, _context: functions.https.CallableContext) => {
        // Auth is optional for viewing public posts

        const db = getDb();
        // Determine sort order
        const sortField = data.sortBy === 'popular' ? 'likes' : data.sortBy === 'views' ? 'views' : 'createdAt';

        let query: FirebaseFirestore.Query = db.collection('posts')
            .where('isPublic', '==', true)
            .where('isDeleted', '==', false)
            .orderBy(sortField, 'desc');

        // Time range filter
        if (data.timeRange && data.timeRange !== 'all') {
            const now = new Date();
            let startDate: Date;

            switch (data.timeRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                default:
                    startDate = new Date(0);
            }
            query = query.where('createdAt', '>=', startDate);
        }

        // Apply type/category/author filters
        if (data.type) {
            query = query.where('type', '==', data.type);
        }
        if (data.category) {
            query = query.where('category', '==', data.category);
        }
        if (data.authorId) {
            query = query.where('authorId', '==', data.authorId);
        }

        // Pagination
        const limit = Math.min(data.limit || 20, 50);
        query = query.limit(limit);

        if (data.startAfter) {
            const startAfterDoc = await db.collection('posts').doc(data.startAfter).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }

        try {
            const snapshot = await query.get();
            const posts: (Post & { id: string })[] = [];

            snapshot.forEach((doc) => {
                const postData = doc.data() as Post;
                posts.push({
                    ...postData,
                    id: doc.id
                });
            });

            return {
                success: true,
                posts,
                count: posts.length,
                hasMore: posts.length === limit,
            };
        } catch (error: any) {
            console.error('Error getting posts:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get posts', error.message);
        }
    }
);

// ============================================================================
// GET SINGLE POST
// ============================================================================

export const getPost = functions.https.onCall(
    async (data: { postId: string }, context: functions.https.CallableContext) => {
        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const userId = context.auth?.uid;
        const db = getDb();

        try {
            const postDoc = await db.collection('posts').doc(data.postId).get();

            if (!postDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Post not found');
            }

            const postData = postDoc.data() as Post;
            if (postData.isDeleted === true) {
                throw new functions.https.HttpsError('not-found', 'Post was deleted');
            }

            let newViewCount = postData.views || 0;

            // View spam prevention: Only count view if user hasn't viewed in last 24 hours
            if (userId) {
                const twentyFourHoursAgo = new Date();
                twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

                // Simple query with 2 fields (doesn't require composite index)
                const recentViewsSnap = await db.collection('postViews')
                    .where('postId', '==', data.postId)
                    .where('viewerId', '==', userId)
                    .orderBy('viewedAt', 'desc')
                    .limit(1)
                    .get();

                // Check if last view was within 24 hours
                let shouldCountView = true;
                if (!recentViewsSnap.empty) {
                    const lastView = recentViewsSnap.docs[0].data();
                    const lastViewTime = lastView.viewedAt?.toDate?.() || new Date(0);
                    shouldCountView = lastViewTime < twentyFourHoursAgo;
                }

                if (shouldCountView) {
                    // No recent view - count this view
                    await Promise.all([
                        postDoc.ref.update({ views: FieldValue.increment(1) }),
                        db.collection('postViews').add({
                            postId: data.postId,
                            viewerId: userId,
                            viewedAt: FieldValue.serverTimestamp(),
                        }),
                    ]);
                    newViewCount += 1;
                }
                // If user viewed recently, don't increment
            } else {
                // Anonymous users: always count (could add IP tracking later)
                await postDoc.ref.update({ views: FieldValue.increment(1) });
                newViewCount += 1;
            }

            return {
                success: true,
                post: {
                    id: postDoc.id,
                    ...postData
                },
            };
        } catch (error: any) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('Error getting post:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get post', error.message);
        }
    }
);

// ============================================================================
// LIKE POST (Toggle)
// ============================================================================

export const likePost = functions.https.onCall(
    async (data: { postId: string, action?: 'like' | 'unlike' }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();
        const postRef = db.collection('posts').doc(data.postId);
        const likeRef = db.collection('postLikes').doc(`${data.postId}_${userId}`);

        try {
            return await db.runTransaction(async (transaction) => {
                const postDoc = await transaction.get(postRef);
                const likeDoc = await transaction.get(likeRef);

                if (!postDoc.exists) {
                    throw new Error('Post not found');
                }

                const postData = postDoc.data()!;
                const currentLikes = postData.likes || 0;
                const authorId = postData.authorId;
                const exists = likeDoc.exists;

                // If explicit action is requested and already matches, return current state
                if (data.action === 'like' && exists) {
                    return { success: true, liked: true, newCount: currentLikes, message: 'Already liked' };
                }
                if (data.action === 'unlike' && !exists) {
                    return { success: true, liked: false, newCount: currentLikes, message: 'Already unliked' };
                }

                if (exists) {
                    // Unlike
                    transaction.delete(likeRef);
                    transaction.update(postRef, {
                        likes: Math.max(0, currentLikes - 1),
                        updatedAt: FieldValue.serverTimestamp()
                    });

                    // Sync totalLikes in userProfiles
                    if (authorId) {
                        const profileRef = db.collection('userProfiles').doc(authorId);
                        transaction.set(profileRef, {
                            totalLikes: FieldValue.increment(-1),
                            updatedAt: FieldValue.serverTimestamp()
                        }, { merge: true });
                    }

                    return { success: true, liked: false, newCount: Math.max(0, currentLikes - 1), message: 'Post unliked' };
                } else {
                    // Like
                    transaction.set(likeRef, {
                        postId: data.postId,
                        userId,
                        createdAt: FieldValue.serverTimestamp(),
                    });
                    transaction.update(postRef, {
                        likes: currentLikes + 1,
                        updatedAt: FieldValue.serverTimestamp()
                    });

                    // Sync totalLikes in userProfiles
                    if (authorId) {
                        const profileRef = db.collection('userProfiles').doc(authorId);
                        transaction.set(profileRef, {
                            totalLikes: FieldValue.increment(1),
                            updatedAt: FieldValue.serverTimestamp()
                        }, { merge: true });
                    }

                    return { success: true, liked: true, newCount: currentLikes + 1, message: 'Post liked' };
                }
            });
        } catch (error: any) {
            console.error('Error liking post:', error);
            if (error.message === 'Post not found') {
                throw new functions.https.HttpsError('not-found', error.message);
            }
            throw new functions.https.HttpsError('internal', 'Failed to like post', error.message);
        }
    }
);

// ============================================================================
// SAVE POST (Toggle - for Favorites)
// ============================================================================

export const savePost = functions.https.onCall(
    async (data: { postId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();
        const postRef = db.collection('posts').doc(data.postId);
        const saveRef = db.collection('postSaves').doc(`${data.postId}_${userId}`);

        try {
            return await db.runTransaction(async (transaction) => {
                const postDoc = await transaction.get(postRef);
                const saveDoc = await transaction.get(saveRef);

                if (!postDoc.exists) {
                    throw new Error('Post not found');
                }

                const postData = postDoc.data()!;
                const currentSaves = postData.saves || 0;

                if (saveDoc.exists) {
                    // Unsave
                    transaction.delete(saveRef);
                    transaction.update(postRef, {
                        saves: Math.max(0, currentSaves - 1),
                        updatedAt: FieldValue.serverTimestamp()
                    });
                    return { success: true, saved: false, newCount: Math.max(0, currentSaves - 1), message: 'Post unsaved' };
                } else {
                    // Save
                    transaction.set(saveRef, {
                        postId: data.postId,
                        userId,
                        createdAt: FieldValue.serverTimestamp(),
                    });
                    transaction.update(postRef, {
                        saves: currentSaves + 1,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                    return { success: true, saved: true, newCount: currentSaves + 1, message: 'Post saved' };
                }
            });
        } catch (error: any) {
            console.error('Error saving post:', error);
            if (error.message === 'Post not found') {
                throw new functions.https.HttpsError('not-found', error.message);
            }
            throw new functions.https.HttpsError('internal', 'Failed to save post', error.message);
        }
    }
);

// ============================================================================
// REPORT POST
// ============================================================================

export const reportPost = functions.https.onCall(
    async (data: { postId: string, reason?: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();

        try {
            // Verify post exists
            const postDoc = await db.collection('posts').doc(data.postId).get();
            if (!postDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Post not found');
            }

            // Check if user already reported this post
            const existingReport = await db.collection('reports')
                .where('postId', '==', data.postId)
                .where('userId', '==', userId)
                .get();

            if (!existingReport.empty) {
                return { success: true, message: 'You have already reported this post' };
            }

            const reportData = {
                postId: data.postId,
                postTitle: postDoc.data()?.title || '',
                postAuthorId: postDoc.data()?.authorId || '',
                userId,
                reason: data.reason || 'Báo cáo vi phạm',
                status: 'pending', // pending, reviewed, resolved
                createdAt: FieldValue.serverTimestamp(),
            };

            await db.collection('reports').add(reportData);

            return { success: true, message: 'Report submitted successfully' };
        } catch (error: any) {
            console.error('Error reporting post:', error);
            if (error instanceof functions.https.HttpsError) throw error;
            throw new functions.https.HttpsError('internal', 'Failed to report post', error.message);
        }
    }
);

// ============================================================================
// DELETE POST (Owner only)
// ============================================================================

export const deletePost = functions.https.onCall(
    async (data: { postId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();
        const postRef = db.collection('posts').doc(data.postId);

        try {
            const postDoc = await postRef.get();

            if (!postDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Post not found');
            }

            const postData = postDoc.data() as Post;

            if (postData.authorId !== userId) {
                throw new functions.https.HttpsError('permission-denied', 'Not your post');
            }

            // Perform soft delete
            const batch = db.batch();

            batch.update(postRef, {
                isDeleted: true,
                updatedAt: FieldValue.serverTimestamp()
            });

            // Update user post count
            batch.update(db.collection('userProfiles').doc(userId), {
                postsCount: FieldValue.increment(-1),
            });

            await batch.commit();

            return { success: true, message: 'Post deleted successfully' };
        } catch (error: any) {
            if (error instanceof functions.https.HttpsError) throw error;
            console.error('Error deleting post:', error);
            throw new functions.https.HttpsError('internal', 'Failed to delete post', error.message);
        }
    }
);

// ============================================================================
// INCREMENT PROMPT USAGE (when someone copies the prompt)
// ============================================================================

export const incrementPostUsage = functions.https.onCall(
    async (data: { postId: string }, context: functions.https.CallableContext) => {
        // Auth optional - track usage even for non-logged in users
        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();
        const postRef = db.collection('posts').doc(data.postId);

        try {
            await postRef.update({ usageCount: FieldValue.increment(1) });
            return { success: true };
        } catch (error: any) {
            console.error('Error incrementing usage:', error);
            throw new functions.https.HttpsError('internal', 'Failed to increment usage', error.message);
        }
    }
);

// ============================================================================
// GET TOP CREATORS (Weekly leaderboard)
// ============================================================================

export const getTopCreators = functions.https.onCall(
    async (data: { limit?: number }, context: functions.https.CallableContext) => {
        const db = getDb();
        const limit = Math.min(data.limit || 10, 20);

        try {
            // Get top creators by total likes
            const creatorsSnap = await db.collection('userProfiles')
                .orderBy('totalLikes', 'desc')
                .limit(limit)
                .get();

            const creators = await Promise.all(creatorsSnap.docs.map(async (doc) => {
                const profileData = doc.data();
                const userId = doc.id;

                // Fetch basic user info
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data() || {};

                // Fetch latest post for cover image
                // We use a broader query and filter client-side to avoid complex index requirements for now
                const latestPost = (await db.collection('posts')
                    .where('authorId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .limit(5)
                    .get()).docs.find(d => !d.data().isDeleted);

                return {
                    id: userId,
                    ...profileData,
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'Anonymous',
                    photoURL: userData.photoURL,
                    coverImage: latestPost?.data()?.mediaUrl || latestPost?.data()?.thumbnailUrl || null,
                    latestPostId: latestPost?.id || null
                };
            }));

            return { success: true, creators };
        } catch (error: any) {
            console.error('Error getting top creators:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get top creators', error.message);
        }
    }
);

// ============================================================================
// GET WEEKLY TRENDING POSTS (Top posts by views this week)
// ============================================================================

export const getWeeklyTrendingPosts = functions.https.onCall(
    async (data: { limit?: number }, _context: functions.https.CallableContext) => {
        const db = getDb();
        const limit = Math.min(data?.limit || 3, 10);

        try {
            // Calculate start of current week (7 days ago)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            // Query posts from the last week, sorted by views
            const weeklySnap = await db.collection('posts')
                .where('isPublic', '==', true)
                .orderBy('views', 'desc')
                .limit(limit * 2) // fetch extra to cover soft-deleted posts
                .get();

            let trendingPosts: (Post & { id: string })[] = [];

            weeklySnap.forEach((doc) => {
                if (trendingPosts.length >= limit) return;
                const postData = doc.data() as Post;
                if (postData.isDeleted === true) return;

                // Check if post was created within the last week
                const createdAt = postData.createdAt?.toDate?.() || new Date(0);
                if (createdAt >= weekAgo) {
                    trendingPosts.push({
                        ...postData,
                        id: doc.id,
                    });
                }
            });

            // If not enough weekly posts, fall back to all-time top viewed posts
            if (trendingPosts.length < limit) {
                const allTimeSnap = await db.collection('posts')
                    .where('isPublic', '==', true)
                    .orderBy('views', 'desc')
                    .limit(limit * 2)
                    .get();

                const existingIds = new Set(trendingPosts.map(p => p.id));

                allTimeSnap.forEach((doc) => {
                    if (trendingPosts.length >= limit) return;
                    if (existingIds.has(doc.id)) return;
                    const postData = doc.data() as Post;
                    if (postData.isDeleted === true) return;

                    trendingPosts.push({
                        ...postData,
                        id: doc.id,
                    });
                });
            }

            return {
                success: true,
                posts: trendingPosts.slice(0, limit),
            };
        } catch (error: any) {
            console.error('Error getting weekly trending posts:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get trending posts', error.message);
        }
    }
);

// ============================================================================
// TEMPORARY RECONCILIATION FUNCTION (Admin)
// ============================================================================

export const reconcilePostCounts = functions.https.onRequest(async (req, res) => {
    const db = getDb();
    let updatedPosts = 0;
    const traceTitle = req.query.traceTitle as string;
    const debugInfo: any[] = [];

    try {
        // --- Part 1: Reconcile Post Counts & Migrate isDeleted Field ---
        const postsSnap = await db.collection('posts').get();
        for (const postDoc of postsSnap.docs) {
            const postId = postDoc.id;
            const postData = postDoc.data();

            // Count actual documents
            const likesCount = (await db.collection('postLikes').where('postId', '==', postId).count().get()).data().count;
            const savesCount = (await db.collection('postSaves').where('postId', '==', postId).count().get()).data().count;

            const updates: any = {};
            if (postData.likes !== likesCount || postData.saves !== savesCount) {
                updates.likes = likesCount;
                updates.saves = savesCount;
            }

            // MIGRATION: Ensure isDeleted field exists
            if (postData.isDeleted === undefined) {
                updates.isDeleted = false;
            }

            // CLEANUP: Orphaned posts (author doesn't exist)
            const authorDoc = await db.collection('users').doc(postData.authorId).get();
            if (!authorDoc.exists) {
                updates.isDeleted = true;
            }

            if (Object.keys(updates).length > 0) {
                await postDoc.ref.update({
                    ...updates,
                    updatedAt: FieldValue.serverTimestamp()
                });
                updatedPosts++;
            }

            if (traceTitle && postData.title?.toLowerCase().includes(traceTitle.toLowerCase())) {
                const likers = await db.collection('postLikes').where('postId', '==', postId).get();
                const likerUserIds = likers.docs.map(d => d.data().userId);
                debugInfo.push({
                    id: postId,
                    title: postData.title,
                    currentLikes: postData.likes,
                    actualLikes: likesCount,
                    likerUserIds
                });
            }
        }

        // --- Part 2: Reconcile User Profile Metrics (totalLikes & followersCount) ---
        let updatedProfiles = 0;
        const usersSnap = await db.collection('users').get();

        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;

            // 1. Calculate total likes from all their posts
            const userPostsSnap = await db.collection('posts')
                .where('authorId', '==', userId)
                .get();

            let totalLikes = 0;
            userPostsSnap.forEach(p => {
                const pData = p.data();
                if (pData.isDeleted !== true) {
                    totalLikes += (pData.likes || 0);
                }
            });

            // 2. Calculate actual follower count
            const followersCount = (await db.collection('follows')
                .where('followingId', '==', userId)
                .count()
                .get()).data().count;

            // 3. Calculate actual unread notification count
            const unreadSnap = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('isRead', '==', false)
                .get();
            let unreadNotificationCount = 0;
            unreadSnap.forEach(doc => {
                unreadNotificationCount += (doc.data().count || 1);
            });

            // 4. Update userProfiles document
            const profileRef = db.collection('userProfiles').doc(userId);
            const profileDoc = await profileRef.get();
            const profileData = profileDoc.exists ? profileDoc.data() : {};

            if (profileData?.totalLikes !== totalLikes ||
                profileData?.followersCount !== followersCount ||
                profileData?.unreadNotificationCount !== unreadNotificationCount) {
                await profileRef.set({
                    totalLikes,
                    followersCount,
                    unreadNotificationCount,
                    updatedAt: FieldValue.serverTimestamp()
                }, { merge: true });
                updatedProfiles++;
            }
        }

        res.json({
            success: true,
            message: `Reconciled counters for ${updatedPosts} posts and ${updatedProfiles} user profiles with mismatching data.`,
            debugInfo: traceTitle ? debugInfo : undefined
        });
    } catch (error: any) {
        console.error('Reconciliation failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
