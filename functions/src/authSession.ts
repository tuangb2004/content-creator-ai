import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendVerificationEmail } from './emailService';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

/**
 * LoginSession interface
 */
interface LoginSession {
  sessionId: string;
  userId: string;
  email: string;
  status: 'pending' | 'verified' | 'expired' | 'completed';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  verifiedAt?: Timestamp;
  completedAt?: Timestamp;
}

/**
 * Create a new login session for email verification
 */
export async function createLoginSession(
  userId: string,
  email: string
): Promise<string> {
  const sessionId = generateSessionId();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + 10 * 60 * 1000 // 10 minutes
  );

  const session: LoginSession = {
    sessionId,
    userId,
    email,
    status: 'pending',
    createdAt: now,
    expiresAt,
  };

  await getDb().collection('loginSessions').doc(sessionId).set(session);

  console.log(`✅ Created login session: ${sessionId} for user: ${userId}`);
  return sessionId;
}

/**
 * Get session status
 */
export async function getSessionStatus(sessionId: string): Promise<LoginSession | null> {
  const sessionDoc = await getDb().collection('loginSessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return null;
  }

  const session = sessionDoc.data() as LoginSession;
  
  // Check if expired
  const now = Timestamp.now();
  if (session.expiresAt.toMillis() < now.toMillis() && session.status === 'pending') {
    await getDb().collection('loginSessions').doc(sessionId).update({
      status: 'expired',
    });
    return { ...session, status: 'expired' };
  }

  return session;
}

/**
 * Mark session as verified
 */
export async function markSessionVerified(sessionId: string): Promise<void> {
  const now = Timestamp.now();
  
  await getDb().collection('loginSessions').doc(sessionId).update({
    status: 'verified',
    verifiedAt: now,
  });

  console.log(`✅ Session ${sessionId} marked as verified`);
}

/**
 * Callable function to mark session as verified
 */
export const markSessionVerifiedCallable = functions.https.onCall(async (data, context) => {
  try {
    const { session_id } = data;

    if (!session_id) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'session_id is required'
      );
    }

    await markSessionVerified(session_id);

    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error marking session verified:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to mark session verified'
    );
  }
});

/**
 * Mark session as completed
 */
export async function markSessionCompleted(sessionId: string): Promise<void> {
  const now = Timestamp.now();
  
  await getDb().collection('loginSessions').doc(sessionId).update({
    status: 'completed',
    completedAt: now,
  });

  console.log(`✅ Session ${sessionId} marked as completed`);
}

/**
 * Callable function to mark session as completed
 */
export const markSessionCompletedCallable = functions.https.onCall(async (data, context) => {
  try {
    const { session_id } = data;

    if (!session_id) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'session_id is required'
      );
    }

    await markSessionCompleted(session_id);

    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error marking session completed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to mark session completed'
    );
  }
});

/**
 * Clean up expired sessions (can be called by scheduled function)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const now = Timestamp.now();
  const db = getDb();
  const expiredSessions = await db
    .collection('loginSessions')
    .where('status', 'in', ['pending', 'verified'])
    .where('expiresAt', '<', now)
    .get();

  const batch = db.batch();
  expiredSessions.docs.forEach((doc) => {
    batch.update(doc.ref, { status: 'expired' });
  });

  await batch.commit();
  console.log(`🧹 Cleaned up ${expiredSessions.docs.length} expired sessions`);
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Callable function to get session status
 * Frontend calls this via httpsCallable
 */
export const getSessionStatusCallable = functions.https.onCall(async (data, context) => {
  try {
    const { session_id } = data;

    if (!session_id) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'session_id is required'
      );
    }

    const session = await getSessionStatus(session_id);

    if (!session) {
      throw new functions.https.HttpsError(
        'not-found',
        'Session not found'
      );
    }

    return {
      session_id: session.sessionId,
      status: session.status,
      user_id: session.userId,
      email: session.email,
      expires_at: session.expiresAt.toMillis(),
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error('Error getting session status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get session status'
    );
  }
});

/**
 * HTTP endpoint to get session status (for direct HTTP calls)
 * GET /auth/session-status?session_id=...
 */
export const getSessionStatusEndpoint = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    const session = await getSessionStatus(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      session_id: session.sessionId,
      status: session.status,
      user_id: session.userId,
      email: session.email,
      expires_at: session.expiresAt.toMillis(),
    });
  } catch (error: any) {
    console.error('Error getting session status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * HTTP endpoint to verify email and update session
 * GET /auth/verify-email?oobCode=...&session_id=...
 * This endpoint is called when user clicks verification link in email
 */
export const verifyEmailEndpoint = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Support both GET (from email link) and POST
    const oobCode = req.method === 'GET' ? req.query.oobCode as string : req.body.oobCode;
    const sessionId = req.method === 'GET' ? req.query.session_id as string : req.body.session_id;

    if (!oobCode) {
      res.status(400).json({ error: 'oobCode is required' });
      return;
    }

    // Get session if session_id provided
    let session: LoginSession | null = null;
    if (sessionId) {
      session = await getSessionStatus(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found or expired' });
        return;
      }

      if (session.status !== 'pending') {
        res.status(400).json({ error: `Session already ${session.status}` });
        return;
      }
    }

    // Apply action code to verify email (this is done by Firebase Auth)
    // We'll handle this in the frontend, but we can mark session as verified here
    if (session) {
      // Get user and verify email
      const user = await admin.auth().getUser(session.userId);
      if (!user.emailVerified) {
        await admin.auth().updateUser(session.userId, {
          emailVerified: true,
        });
      }

      // Mark session as verified
      await markSessionVerified(sessionId);
    }

    // Redirect to success page or return JSON
    if (req.method === 'GET') {
      // Get site URL from config or environment (same priority as emailService)
      let siteUrl = process.env.SITE_URL || functions.config().app?.site_url;
      if (!siteUrl) {
        siteUrl = 'https://creatorai.app';
        console.warn(`⚠️ SITE_URL not configured in verifyEmailEndpoint. Using default: ${siteUrl}`);
      }
      // Normalize: remove trailing slash
      siteUrl = siteUrl.replace(/\/+$/, '');
      res.redirect(`${siteUrl}/?verified=true${sessionId ? `&session_id=${sessionId}` : ''}`);
    } else {
      res.json({
        success: true,
        message: 'Email verified successfully',
        session_id: sessionId,
      });
    }
  } catch (error: any) {
    console.error('Error verifying email:', error);
    if (req.method === 'GET') {
      // Get site URL from config or environment (same priority as emailService)
      let siteUrl = process.env.SITE_URL || functions.config().app?.site_url;
      if (!siteUrl) {
        siteUrl = 'https://creatorai.app';
        console.warn(`⚠️ SITE_URL not configured in verifyEmailEndpoint (error). Using default: ${siteUrl}`);
      }
      // Normalize: remove trailing slash
      siteUrl = siteUrl.replace(/\/+$/, '');
      res.redirect(`${siteUrl}/?verified=false`);
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * Callable function to create session and send verification email
 * Called after user registration
 */
export const createVerificationSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { uid, token } = context.auth;
  const email = token.email;

  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User email not found'
    );
  }

  try {
    // Create login session
    const sessionId = await createLoginSession(uid, email);

    // Send verification email with session_id
    await sendVerificationEmail(email, token.name || undefined, uid, sessionId);

    return {
      success: true,
      session_id: sessionId,
      message: 'Verification email sent',
    };
  } catch (error: any) {
    console.error('Error creating verification session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create verification session'
    );
  }
});

