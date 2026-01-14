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

// Initialize Firebase Admin
// In emulator, Admin SDK automatically connects to emulators via environment variables
// FIREBASE_AUTH_EMULATOR_HOST is set automatically by firebase-tools
if (!admin.apps.length) {
admin.initializeApp();
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

