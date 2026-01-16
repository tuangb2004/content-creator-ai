import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const TIKTOK_CLIENT_KEY = functions.config().tiktok?.client_key || process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = functions.config().tiktok?.client_secret || process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = 'https://creator--ai.firebaseapp.com/__/auth/tiktok/callback';

/**
 * Get TikTok OAuth URL
 * Called from frontend to initiate TikTok login
 */
export const getTikTokAuthUrl = functions.https.onCall(async (data, context) => {
  const state = Math.random().toString(36).substring(7);
  const csrfState = Buffer.from(JSON.stringify({ state, timestamp: Date.now() })).toString('base64');
  
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.append('client_key', TIKTOK_CLIENT_KEY);
  authUrl.searchParams.append('scope', 'user.info.basic,user.info.profile');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('state', csrfState);
  
  return {
    authUrl: authUrl.toString(),
    state: csrfState
  };
});

/**
 * Handle TikTok OAuth Callback
 * This is the redirect URI endpoint
 */
export const handleTikTokCallback = functions.https.onRequest(async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  
  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user info
    const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        fields: 'open_id,union_id,avatar_url,display_name'
      }
    });
    
    const tiktokUser = userResponse.data.data.user;
    
    // Create Firebase custom token
    const uid = `tiktok:${tiktokUser.union_id || tiktokUser.open_id}`;
    const customToken = await admin.auth().createCustomToken(uid, {
      provider: 'tiktok',
      tiktok_id: tiktokUser.open_id,
      name: tiktokUser.display_name,
      picture: tiktokUser.avatar_url
    });
    
    // Create user in Firestore if not exists
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        email: `${uid}@tiktok.creatorai.com`, // Fake email for TikTok users
        displayName: tiktokUser.display_name,
        photoURL: tiktokUser.avatar_url,
        provider: 'tiktok',
        tiktokId: tiktokUser.open_id,
        plan: 'free',
        credits: 20,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Redirect to app with custom token
    res.redirect(`https://content-creator-ai-wheat.vercel.app/?tiktok_token=${customToken}`);
  } catch (error: any) {
    console.error('TikTok auth error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});
