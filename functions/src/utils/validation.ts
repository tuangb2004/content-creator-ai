import * as functions from 'firebase-functions';

/**
 * Validate authenticated user
 */
export function validateAuth(context: functions.https.CallableContext): string {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  return context.auth.uid;
}

/**
 * Validate generate content request
 */
export function validateGenerateContentRequest(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Request data is required'
    );
  }

  if (!data.prompt || typeof data.prompt !== 'string' || data.prompt.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required and must be a non-empty string'
    );
  }

  if (data.prompt.length > 10000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt must be less than 10000 characters'
    );
  }
}


