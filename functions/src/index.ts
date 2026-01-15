import * as admin from 'firebase-admin';
import { generateContent } from './generateContent';
import { createPaymentLinkFunction } from './createPaymentLink';
import { payosWebhook } from './payosWebhook';
import { onUserCreate } from './authTrigger';
import { saveProject, getProjects, deleteProject } from './projects';
import { sendCustomPasswordReset, resendCustomVerification } from './customAuthFunctions';
import { 
  getSessionStatusEndpoint,
  getSessionStatusCallable,
  verifyEmailEndpoint, 
  createVerificationSession,
  markSessionCompletedCallable,
  markSessionVerifiedCallable
} from './authSession';
import { chat } from './chat';
import { initializeUserIfNeeded } from './initializeUser';

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
  saveProject,
  getProjects,
  deleteProject,
  sendCustomPasswordReset,
  resendCustomVerification,
  getSessionStatusEndpoint,
  getSessionStatusCallable,
  verifyEmailEndpoint,
  createVerificationSession,
  markSessionCompletedCallable,
  markSessionVerifiedCallable,
  chat,
  initializeUserIfNeeded
};

