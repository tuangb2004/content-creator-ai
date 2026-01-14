import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateGenerateContentRequest } from './utils/validation';
import { checkRateLimit } from './utils/rateLimit';
import { decrementCredits, incrementCredits, initializeUser } from './utils/credits';
import { callGeminiAPI } from './utils/gemini';
import { callGroqAPI } from './utils/groq';
import { callPollinationAPI } from './utils/pollination';
import { callStabilityAPI } from './utils/stability';
import { logActivity } from './utils/logging';
import { sendNotificationIfEnabled } from './emailService';
import { GenerateContentRequest, GenerateContentResponse, TextProvider, ImageProvider } from './types';

// Lazy load firestore to avoid calling before initializeApp()
function getDb() {
  return admin.firestore();
}

/**
 * Generate content using multiple providers (Groq, Gemini, Pollination)
 * Free plan: Groq (text) / Pollination (image)
 * Paid plan: Can choose Groq or Gemini (text) / Pollination or Gemini (image)
 */
export const generateContent = functions.https.onCall(
  async (data: GenerateContentRequest, context: functions.https.CallableContext): Promise<GenerateContentResponse> => {
    // 1. Validate authentication
    const userId = validateAuth(context);

    // 2. Validate request data
    validateGenerateContentRequest(data);

    const { 
      prompt, 
      template = 'blog', 
      tone = 'professional', 
      length = 'medium',
      contentType = 'text',
      provider,
      systemInstruction // Custom system instruction from tool (takes priority)
    } = data;

    // 3. Rate limiting
    await checkRateLimit(userId);

    // 4. Get user data (plan, credits) - auto-create if not exists
    const db = getDb();
    const userRef = db.collection('users').doc(userId);
    let userDoc = await userRef.get();

    // Auto-initialize user if document doesn't exist (fallback for emulator/testing)
    if (!userDoc.exists) {
      console.log(`User ${userId} document not found, initializing...`);
      try {
        // Try to get email from auth token or user record
        let email = context.auth?.token?.email;
        if (!email) {
          // Try to get from Firebase Auth user record
          try {
            const userRecord = await admin.auth().getUser(userId);
            email = userRecord.email || `${userId}@unknown.com`;
          } catch {
            email = `${userId}@unknown.com`;
          }
        }
        await initializeUser(userId, email);
        userDoc = await userRef.get();
        console.log(`✅ User ${userId} initialized with free credits`);
      } catch (initError: any) {
        console.error(`Failed to initialize user ${userId}:`, initError);
        throw new functions.https.HttpsError('internal', 'Failed to initialize user account');
      }
    }

    const userData = userDoc.data()!;
    const userPlan = userData.plan || 'free';
    const creditsBefore = userData.credits || 0;

    if (creditsBefore <= 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient credits. Please upgrade your plan or purchase more credits.'
      );
    }

    // 5. Determine provider based on plan and user selection
    let finalProvider: TextProvider | ImageProvider;
    
    if (contentType === 'text') {
      // Text generation
      if (provider && (provider === 'groq' || provider === 'gemini')) {
        finalProvider = provider;
      } else if (userPlan === 'free') {
        // Free plan: default to Groq
        finalProvider = 'groq';
      } else {
        // Paid plan: default to Gemini (premium)
        finalProvider = 'gemini';
      }
    } else {
      // Image generation
      if (provider && (provider === 'pollination' || provider === 'gemini' || provider === 'stability')) {
        finalProvider = provider;
      } else if (userPlan === 'free') {
        // Free plan: default to Stability (Pollination is down)
        finalProvider = 'stability';
      } else {
        // Paid plan: default to Stability (better quality)
        finalProvider = 'stability';
      }
    }

    // 6. Check if provider is allowed for user's plan
    if (userPlan === 'free' && finalProvider === 'gemini') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Gemini is only available for paid plans. Please upgrade to use Gemini.'
      );
    }

    // 7. Decrement credits using Transaction (atomic) - Skip for free Groq
    let creditsAfter: number;
    const isFreeGroq = contentType === 'text' && finalProvider === 'groq';
    
    // Debug logging
    console.log(`[Credit Check] contentType: ${contentType}, finalProvider: ${finalProvider}, isFreeGroq: ${isFreeGroq}, creditsBefore: ${creditsBefore}`);
    
    if (isFreeGroq) {
      // Groq is free, don't charge credits
      console.log('[Credit Check] Groq is free - skipping credit charge');
      creditsAfter = creditsBefore;
    } else {
      try {
        creditsAfter = await decrementCredits(userId, 1);
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          throw error; // Re-throw credit errors
        }
        throw new functions.https.HttpsError('internal', 'Failed to process credits');
      }
    }

    // 8. Call appropriate API based on provider and content type
    let content: string;
    try {
      if (contentType === 'text') {
        if (finalProvider === 'groq') {
          content = await callGroqAPI(prompt, template, tone, length, { retries: 3, systemInstruction });
        } else if (finalProvider === 'gemini') {
          content = await callGeminiAPI(prompt, template, tone, length, { retries: 3, systemInstruction });
        } else {
          throw new Error(`Invalid text provider: ${finalProvider}`);
        }
      } else {
        // Image generation
        if (finalProvider === 'stability') {
          content = await callStabilityAPI(prompt, { retries: 3 });
        } else if (finalProvider === 'pollination') {
          content = await callPollinationAPI(prompt, { retries: 3 });
        } else if (finalProvider === 'gemini') {
          // Gemini image generation (not implemented yet)
          throw new Error('Gemini image generation is not yet implemented. Please use Stability or Pollination.');
        } else {
          throw new Error(`Invalid image provider: ${finalProvider}`);
        }
      }
    } catch (error: any) {
      // Refund credits if API call fails (only if we charged credits)
      if (!isFreeGroq) {
        console.error(`${finalProvider} API failed, refunding credits:`, error.message);
        console.log(`[Refund] Attempting to refund 1 credit. creditsBefore: ${creditsBefore}, creditsAfter: ${creditsAfter}`);
        try {
          const refundedCredits = await incrementCredits(userId, 1);
          creditsAfter = refundedCredits; // Update to refunded amount
          console.log(`[Refund] Successfully refunded. New creditsAfter: ${creditsAfter}`);
        } catch (refundError) {
          console.error('[Refund] Failed to refund credits:', refundError);
          await logActivity({
            userId,
            action: 'credit_refund_failed',
            creditsBefore: creditsAfter,
            creditsAfter: creditsAfter + 1,
            success: false,
            error: `Refund failed: ${refundError}`
          });
        }
      } else {
        console.error(`${finalProvider} API failed (free provider, no refund needed):`, error.message);
      }

      throw new functions.https.HttpsError(
        'internal',
        `Failed to generate content: ${error.message}`
      );
    }

    // 9. Log activity
    await logActivity({
      userId,
      action: 'generate_content',
      creditsBefore,
      creditsAfter,
      success: true,
      metadata: {
        contentType,
        provider: finalProvider,
        template,
        tone,
        length,
        promptLength: prompt.length
      }
    });

    // 10. Send project completed notification if enabled (for image generation or long operations)
    try {
      // Only send notification for image generation (typically takes longer)
      if (contentType === 'image') {
        const projectTitle = `Generated ${contentType}`;
        const projectType = 'image';
        
        await sendNotificationIfEnabled(userId, 'projectCompleted', {
          projectTitle,
          projectType
        });
      }
    } catch (notificationError) {
      // Don't fail the request if notification fails
      console.warn('Failed to send project completed notification:', notificationError);
    }

    // 11. Return result
    return {
      content,
      contentType,
      provider: finalProvider,
      creditsUsed: isFreeGroq ? 0 : 1,
      creditsRemaining: creditsAfter
    };
  }
);

