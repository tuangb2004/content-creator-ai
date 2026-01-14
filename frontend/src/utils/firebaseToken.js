import { auth } from '../config/firebase';

/**
 * Get Firebase ID token for API requests
 * @returns {Promise<string|null>} Firebase ID token or null if not authenticated
 */
export async function getFirebaseIdToken() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    
    const idToken = await currentUser.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
}

