import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateGenerateContentRequest } from './utils/validation';
import { checkRateLimit } from './utils/rateLimit';
import { decrementCredits, incrementCredits, initializeUser } from './utils/credits';
import { callGeminiAPI } from './utils/gemini';
import { callGeminiImageAPI } from './utils/geminiImage';
import { callGroqAPI } from './utils/groq';
import { callPollinationAPI } from './utils/pollination';
import { callStabilityAPI } from './utils/stability';
import { logActivity } from './utils/logging';
import { sendNotificationIfEnabled } from './emailService';
import { sendNotification } from './utils/notificationHelper';
import { addToVideoQueue } from './utils/videoQueue';
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
export const generateContent = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(
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
        systemInstruction, // Custom system instruction from tool (takes priority)
        toolId,
        toolName,
        toolCategory,
        modelId,
        useGoogleSearchGrounding,
        fileUrls = [], // File URLs to analyze
        ratio, // Aspect ratio for image generation (e.g. '1:1', '16:9')
        count = 1 // Number of images to generate (1-4)
      } = data;

      // Clamp count to 1-4
      const imageCount = Math.max(1, Math.min(4, count || 1));

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
          // Free plan: default to Pollination (free, no API key needed)
          finalProvider = 'pollination';
        } else {
          // Paid plan: default to Stability (better quality)
          finalProvider = 'stability';
        }
      }

      // 6. Provider access: free users can use Gemini with credit deduction

      // 7. Calculate credit usage before execution
      const normalizedToolName = `${toolName || ''}`.toLowerCase();
      const normalizedToolCategory = `${toolCategory || ''}`.toLowerCase();
      const isHeavyTool = normalizedToolName.includes('editorial')
        || normalizedToolName.includes('strategy')
        || normalizedToolCategory.includes('editorial')
        || normalizedToolCategory.includes('strategy');
      const heavyMultiplier = isHeavyTool ? 1.5 : 1;

      const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
      const estimateOutputTokens = (lengthValue: string): number => {
        if (lengthValue === 'short') return 150;
        if (lengthValue === 'long') return 600;
        return 300;
      };

      let creditsToCharge = 0;
      if (contentType === 'text') {
        if (finalProvider === 'groq') {
          creditsToCharge = 0;
        } else {
          const inputTokens = estimateTokens(prompt);
          const outputTokens = estimateOutputTokens(length);
          const baseCredits = Math.max(1, Math.ceil((inputTokens + outputTokens) / 700));
          creditsToCharge = Math.ceil(baseCredits * heavyMultiplier);
        }
      } else {
        let perImageCredits = 0;
        if (finalProvider === 'gemini') {
          perImageCredits = 8;
        } else if (finalProvider === 'stability') {
          perImageCredits = 4;
        } else if (finalProvider === 'pollination') {
          perImageCredits = 0; // Free provider
        }
        creditsToCharge = perImageCredits * imageCount;
      }

      // 8. Decrement credits using Transaction (atomic) - Skip for free providers
      let creditsAfter: number;
      if (creditsToCharge === 0) {
        creditsAfter = creditsBefore;
      } else {
        try {
          creditsAfter = await decrementCredits(userId, creditsToCharge, {
            toolName,
            contentType
          });
        } catch (error: any) {
          if (error.code === 'failed-precondition') {
            throw error; // Re-throw credit errors
          }
          throw new functions.https.HttpsError('internal', 'Failed to process credits');
        }
      }

      // Helper: Map ratio string to pixel dimensions for Stability API
      const ratioToDimensions = (r: string | undefined): { width: number; height: number } => {
        switch (r) {
          case '16:9': return { width: 1344, height: 768 };
          case '9:16': return { width: 768, height: 1344 };
          case '4:3': return { width: 1152, height: 896 };
          case '3:4': return { width: 896, height: 1152 };
          case '1:1': default: return { width: 1024, height: 1024 };
        }
      };

      // 9. Call appropriate API based on provider and content type
      let content: string;
      try {
        if (contentType === 'text') {
          if (finalProvider === 'groq') {
            // Groq doesn't support file analysis, only text
            if (fileUrls && fileUrls.length > 0) {
              throw new Error('File analysis is only supported with Gemini provider. Please use Gemini model.');
            }
            content = await callGroqAPI(prompt, template, tone, length, { retries: 3, systemInstruction });
          } else if (finalProvider === 'gemini') {
            content = await callGeminiAPI(prompt, template, tone, length, {
              retries: 3,
              systemInstruction,
              model: modelId,
              useGoogleSearchGrounding,
              fileUrls: fileUrls || []
            });
          } else {
            throw new Error(`Invalid text provider: ${finalProvider}`);
          }
        } else if (contentType === 'image') {
          // Image generation — generate imageCount images
          const generateOneImage = async (seed?: number): Promise<string> => {
            if (finalProvider === 'stability') {
              const dims = ratioToDimensions(ratio);
              return await callStabilityAPI(prompt, { retries: 3, width: dims.width, height: dims.height });
            } else if (finalProvider === 'pollination') {
              const dims = ratioToDimensions(ratio);
              return await callPollinationAPI(prompt, { retries: 2, width: dims.width, height: dims.height, seed });
            } else if (finalProvider === 'gemini') {
              // Map internal model IDs to Gemini Imagen models
              let geminiModel = 'imagen-3.0-generate-001';
              if (modelId === 'nano-pro') geminiModel = 'gemini-3-pro-image-preview';
              if (modelId === 'nano') geminiModel = 'gemini-2.5-flash-image';

              // For Gemini native models, append aspect ratio instruction to prompt
              let adjustedPrompt = prompt;
              if (ratio && ratio !== '1:1') {
                adjustedPrompt = `${prompt}\n\n[Aspect ratio: ${ratio}]`;
              }

              console.log(`Using Gemini Image model: ${geminiModel} for toolId: ${modelId}, ratio: ${ratio || 'default'}, fileUrls: ${fileUrls?.length ?? 0}`);

              return await callGeminiImageAPI(adjustedPrompt, {
                retries: 3,
                systemInstruction,
                model: geminiModel,
                fileUrls: fileUrls || []
              });
            } else {
              throw new Error(`Invalid image provider: ${finalProvider}`);
            }
          };

          if (imageCount <= 1) {
            content = await generateOneImage(Math.floor(Math.random() * 999999));
          } else {
            // Generate multiple images in parallel with unique seeds
            const results = await Promise.all(
              Array.from({ length: imageCount }, (_, i) => generateOneImage(Math.floor(Math.random() * 999999) + i))
            );
            // Return as JSON array of data URLs
            content = JSON.stringify(results);
          }
        } else if (contentType === 'video') {
          // Special case: Video generation from Home tab
          // Cast ratio to valid aspect ratio type
          const validRatio = (ratio === '16:9' || ratio === '9:16' || ratio === '1:1') ? ratio : '16:9';

          const { queueId } = await addToVideoQueue(userId, userPlan, {
            prompt,
            model: 'veo-3.1-fast',
            aspectRatio: validRatio as any,
            duration: 8
          });

          // Enqueue task
          try {
            const queue = (functions.tasks as any).taskQueue('onVideoTaskDispatch');
            await queue.enqueue({ queueId });
          } catch (e) {
            console.error('Failed to enqueue video task from generateContent:', e);
          }

          return {
            content: `Video generation started. Queue ID: ${queueId}`,
            contentType: 'video',
            provider: 'gemini',
            creditsUsed: 20, // Veo cost
            creditsRemaining: creditsBefore - 20,
            metadata: { queueId }
          };
        } else {
          throw new Error(`Invalid content type: ${contentType}`);
        }
      } catch (error: any) {
        // Refund credits if API call fails (only if we charged credits)
        if (creditsToCharge > 0) {
          console.error(`${finalProvider} API failed, refunding credits:`, error.message);
          console.log(`[Refund] Attempting to refund ${creditsToCharge} credits. creditsBefore: ${creditsBefore}, creditsAfter: ${creditsAfter}`);
          try {
            const refundedCredits = await incrementCredits(userId, creditsToCharge);
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

      // 10. Log activity
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
          prompt: prompt.substring(0, 100), // Store first 100 chars for activity log
          promptLength: prompt.length,
          creditsUsed: creditsToCharge,
          estimatedInputTokens: estimateTokens(prompt),
          estimatedOutputTokens: estimateOutputTokens(length),
          heavyMultiplier,
          toolId,
          toolName,
          toolCategory
        }
      });

      // 11. Send project completed notification if enabled (for image generation or long operations)
      try {
        // Only send notification for image generation (typically takes longer)
        if (contentType === 'image') {
          const projectTitle = `Generated ${contentType}`;
          const projectType = 'image';

          // Email notification
          await sendNotificationIfEnabled(userId, 'projectCompleted', {
            projectTitle,
            projectType
          });

          // In-app notification (ai_complete)
          const db = getDb();
          const countMsg = (imageCount > 1) ? `${imageCount} ảnh` : '1 ảnh';
          await sendNotification(db, {
            userId,
            type: 'ai_complete',
            actorId: 'system',
            message: `✅ ${countMsg} đã được tạo xong! Kiểm tra Assets của bạn.`,
          });
        }
      } catch (notificationError) {
        // Don't fail the request if notification fails
        console.warn('Failed to send project completed notification:', notificationError);
      }

      // 12. Return result
      return {
        content,
        contentType,
        provider: finalProvider,
        creditsUsed: creditsToCharge,
        creditsRemaining: creditsAfter
      };
    }
  );

