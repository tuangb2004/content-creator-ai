import * as admin from 'firebase-admin';
import { generateContent } from './generateContent';
import { createPaymentLinkFunction } from './createPaymentLink';
import { payosWebhook } from './payosWebhook';
import { onUserCreate, onUserDelete } from './authTrigger';
import { saveProject, getProjects, getProject, deleteProject } from './projects';
import { uploadFile, getUploads, deleteUpload } from './uploads';
import { chat } from './chat';
import { initializeUserIfNeeded } from './initializeUser';
import { getTikTokAuthUrl, handleTikTokCallback } from './tiktokAuth';
import { logUserLogin } from './logUserLogin';
import { generateVideoDirect, onVideoRequestCreate } from './generateVideo';
import {
  createPost,
  getPosts,
  getPost,
  likePost,
  savePost,
  reportPost,
  deletePost,
  incrementPostUsage,
  getTopCreators,
  getWeeklyTrendingPosts,
  reconcilePostCounts,
} from './posts';
import {
  addComment,
  getComments,
  likeComment,
  deleteComment,
} from './comments';
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  followUser,
  getFollowers,
  getFollowing,
} from './profiles';
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notifications';

import {
  getUserInteractions
} from './interactions';
import {
  onLikeCreated,
  onCommentCreated,
  onFollowCreated
} from './triggers';

const resolveStorageBucket = (): string | undefined => {
  const explicitBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (explicitBucket) return explicitBucket;

  const firebaseConfigRaw = process.env.FIREBASE_CONFIG;
  if (firebaseConfigRaw) {
    try {
      const parsed = JSON.parse(firebaseConfigRaw);
      if (parsed?.storageBucket) return parsed.storageBucket;
      if (parsed?.projectId) return `${parsed.projectId}.appspot.com`;
    } catch {
      // ignore malformed FIREBASE_CONFIG
    }
  }

  const projectId = process.env.GCLOUD_PROJECT;
  return projectId ? `${projectId}.appspot.com` : undefined;
};

// Initialize Firebase Admin
// In emulator, Admin SDK automatically connects to emulators via environment variables
// FIREBASE_AUTH_EMULATOR_HOST is set automatically by firebase-tools
if (!admin.apps.length) {
  const storageBucket = resolveStorageBucket();
  admin.initializeApp(storageBucket ? { storageBucket } : undefined);
}

// Export Cloud Functions
export {
  generateContent,
  createPaymentLinkFunction as createPaymentLink,
  payosWebhook,
  onUserCreate,
  onUserDelete,
  saveProject,
  getProjects,
  getProject,
  deleteProject,
  uploadFile,
  getUploads,
  deleteUpload,
  chat,
  initializeUserIfNeeded,
  getTikTokAuthUrl,
  handleTikTokCallback,
  logUserLogin,
  // Video Generation (simplified)
  generateVideoDirect,
  onVideoRequestCreate,
  // Community Posts
  createPost,
  getPosts,
  getPost,
  likePost,
  savePost,
  reportPost,
  deletePost,
  incrementPostUsage,
  getTopCreators,
  getWeeklyTrendingPosts,
  reconcilePostCounts,
  // Comments
  addComment,
  getComments,
  likeComment,
  deleteComment,
  // Profiles
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  followUser,
  getFollowers,
  getFollowing,
  // Notifications
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserInteractions,
  // Triggers
  onLikeCreated,
  onCommentCreated,
  onFollowCreated,
};

