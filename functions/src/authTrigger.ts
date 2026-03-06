import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initializeUser } from './utils/credits';

/**
 * Initialize user when they sign up (Firebase Auth trigger)
 * Creates user document in Firestore with free credits
 * 
 * Note: Email verification is handled by Firebase Auth automatically
 * when using sendEmailVerification() from frontend
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log(`🔔 onUserCreate triggered for user: ${user.uid}, email: ${user.email}`);

  try {
    const { uid, email, displayName, photoURL } = user;

    if (!email) {
      console.error(`❌ User ${uid} created without email`);
      return;
    }

    console.log(`📝 Initializing user ${uid} with free credits...`);
    // Initialize user with free credits and profile info
    await initializeUser(uid, email, displayName || undefined, photoURL || undefined);

    console.log(`✅ User ${uid} initialized with free credits`);

    // Note: Login activity is logged from frontend via logUserLogin function
    // This ensures we have accurate userAgent and platform info

    // Note: Email verification is handled by Firebase Auth automatically
    // Frontend calls sendEmailVerification() which uses Firebase's built-in email service

  } catch (error: any) {
    console.error(`❌ Error initializing user ${user.uid}:`, error);
    console.error(`❌ Error details:`, error.message, error.stack);
    // Don't throw - let user creation succeed even if initialization fails
    // You can handle this in your error monitoring system
  }
});

/**
 * Cleanup user data when their account is deleted from Firebase Auth
 * This includes deleting user document, userProfile, and soft-deleting posts.
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  console.log(`🗑️ onUserDelete triggered for user: ${uid}`);

  const db = admin.firestore();

  try {
    // 1. Delete user documents
    console.log(`📝 Deleting user and profile docs for ${uid}...`);
    const batch = db.batch();
    batch.delete(db.collection('users').doc(uid));
    batch.delete(db.collection('userProfiles').doc(uid));
    await batch.commit();

    // 2. Soft delete user's posts (mark as isDeleted: true)
    console.log(`📝 Soft deleting posts for ${uid}...`);
    const postsQuery = await db.collection('posts')
      .where('authorId', '==', uid)
      .get();

    if (!postsQuery.empty) {
      const postsBatch = db.batch();
      let count = 0;

      postsQuery.forEach((doc) => {
        // Only update if not already deleted
        if (doc.data().isDeleted !== true) {
          postsBatch.update(doc.ref, {
            isDeleted: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          count++;
        }
      });

      if (count > 0) {
        await postsBatch.commit();
        console.log(`✅ Successfully soft-deleted ${count} posts for user ${uid}`);
      }
    }

    // 3. Cleanup other related data (likes, saves, etc.) if needed
    // Note: We could also delete postLikes, postSaves from this user, 
    // but usually we keep them for historical analytics or handle them as needed.

    console.log(`✅ Completed cleanup for deleted user ${uid}`);

  } catch (error: any) {
    console.error(`❌ Error cleaning up data for user ${uid}:`, error);
  }
});

