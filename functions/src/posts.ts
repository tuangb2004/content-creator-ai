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
    async (data: GetPostsRequest, context: functions.https.CallableContext) => {
        // Auth is optional for viewing public posts
        const userId = context.auth?.uid;

        const db = getDb();
        // Determine sort order
        const sortField = data.sortBy === 'popular' ? 'likes' : data.sortBy === 'views' ? 'views' : 'createdAt';

        let query: FirebaseFirestore.Query = db.collection('posts')
            .where('isPublic', '==', true)
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
            const posts: (Post & { id: string; isLiked?: boolean; isSaved?: boolean })[] = [];

            // Get user's likes and saves if authenticated
            let userLikes = new Set<string>();
            let userSaves = new Set<string>();

            if (userId) {
                const [likesSnap, savesSnap] = await Promise.all([
                    db.collection('postLikes').where('userId', '==', userId).get(),
                    db.collection('postSaves').where('userId', '==', userId).get(),
                ]);
                likesSnap.forEach(doc => userLikes.add(doc.data().postId));
                savesSnap.forEach(doc => userSaves.add(doc.data().postId));
            }

            snapshot.forEach((doc) => {
                const postData = doc.data() as Post;
                posts.push({
                    ...postData,
                    id: doc.id,
                    isLiked: userLikes.has(doc.id),
                    isSaved: userSaves.has(doc.id),
                });
            });

            // Handle savedByMe and likedByMe filters
            if (userId && data.savedByMe) {
                const savedPosts = posts.filter(p => p.isSaved);
                return { success: true, posts: savedPosts, count: savedPosts.length };
            }
            if (userId && data.likedByMe) {
                const likedPosts = posts.filter(p => p.isLiked);
                return { success: true, posts: likedPosts, count: likedPosts.length };
            }

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

            // Check if user liked/saved
            let isLiked = false;
            let isSaved = false;
            let isFollowing = false;

            if (userId) {
                const [likeDoc, saveDoc, followDoc] = await Promise.all([
                    db.collection('postLikes')
                        .where('postId', '==', data.postId)
                        .where('userId', '==', userId)
                        .limit(1)
                        .get(),
                    db.collection('postSaves')
                        .where('postId', '==', data.postId)
                        .where('userId', '==', userId)
                        .limit(1)
                        .get(),
                    db.collection('follows')
                        .where('followerId', '==', userId)
                        .where('followingId', '==', postData.authorId)
                        .limit(1)
                        .get(),
                ]);
                isLiked = !likeDoc.empty;
                isSaved = !saveDoc.empty;
                isFollowing = !followDoc.empty;
            }

            return {
                success: true,
                post: {
                    ...postData,
                    id: postDoc.id,
                    views: newViewCount,
                    isLiked,
                    isSaved,
                    isFollowing,
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
    async (data: { postId: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (!data.postId) {
            throw new functions.https.HttpsError('invalid-argument', 'postId is required');
        }

        const db = getDb();
        const postRef = db.collection('posts').doc(data.postId);
        const likesRef = db.collection('postLikes');

        try {
            // Check if already liked
            const existingLike = await likesRef
                .where('postId', '==', data.postId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!existingLike.empty) {
                // Unlike
                await existingLike.docs[0].ref.delete();
                await postRef.update({ likes: FieldValue.increment(-1) });
                return { success: true, liked: false, message: 'Post unliked' };
            } else {
                // Like
                await likesRef.add({
                    postId: data.postId,
                    userId,
                    createdAt: FieldValue.serverTimestamp(),
                });
                await postRef.update({ likes: FieldValue.increment(1) });
                return { success: true, liked: true, message: 'Post liked' };
            }
        } catch (error: any) {
            console.error('Error liking post:', error);
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
        const savesRef = db.collection('postSaves');

        try {
            // Check if already saved
            const existingSave = await savesRef
                .where('postId', '==', data.postId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!existingSave.empty) {
                // Unsave
                await existingSave.docs[0].ref.delete();
                await postRef.update({ saves: FieldValue.increment(-1) });
                return { success: true, saved: false, message: 'Post unsaved' };
            } else {
                // Save
                await savesRef.add({
                    postId: data.postId,
                    userId,
                    createdAt: FieldValue.serverTimestamp(),
                });
                await postRef.update({ saves: FieldValue.increment(1) });
                return { success: true, saved: true, message: 'Post saved' };
            }
        } catch (error: any) {
            console.error('Error saving post:', error);
            throw new functions.https.HttpsError('internal', 'Failed to save post', error.message);
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

            // Delete post and related data
            const batch = db.batch();

            // Delete likes
            const likesSnap = await db.collection('postLikes').where('postId', '==', data.postId).get();
            likesSnap.forEach(doc => batch.delete(doc.ref));

            // Delete saves
            const savesSnap = await db.collection('postSaves').where('postId', '==', data.postId).get();
            savesSnap.forEach(doc => batch.delete(doc.ref));

            // Delete comments
            const commentsSnap = await db.collection('comments').where('postId', '==', data.postId).get();
            commentsSnap.forEach(doc => batch.delete(doc.ref));

            // Delete post
            batch.delete(postRef);

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

            const creators = creatorsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return { success: true, creators };
        } catch (error: any) {
            console.error('Error getting top creators:', error);
            throw new functions.https.HttpsError('internal', 'Failed to get top creators', error.message);
        }
    }
);
