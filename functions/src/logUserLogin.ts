import * as functions from 'firebase-functions';
import { validateAuth } from './utils/validation';
import { logActivity } from './utils/logging';

/**
 * Log user login activity
 * Called from frontend when user successfully logs in
 */
export const logUserLogin = functions.https.onCall(async (data, context) => {
  const userId = validateAuth(context);
  
  const userAgent = data.userAgent || 'Unknown';
  const platform = userAgent.includes('Windows') ? 'Windows' : 
                  userAgent.includes('Mac') ? 'macOS' : 
                  userAgent.includes('Linux') ? 'Linux' : 
                  userAgent.includes('Android') ? 'Android' :
                  userAgent.includes('iOS') ? 'iOS' : 'Unknown';
  
  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                 userAgent.includes('Firefox') ? 'Firefox' :
                 userAgent.includes('Safari') && !userAgent.includes('Chrome') ? 'Safari' :
                 userAgent.includes('Edge') ? 'Edge' : 'Unknown';

  const provider = data.provider || 'email';
  
  try {
    await logActivity({
      userId,
      action: 'user_login',
      creditsBefore: 0, // Will be updated from user data
      creditsAfter: 0,
      success: true,
      metadata: {
        provider,
        platform: `${browser} on ${platform}`,
        userAgent: userAgent.substring(0, 100) // Limit length
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to log user login:', error);
    // Don't throw - logging is non-critical
    return { success: false, error: error.message };
  }
});
