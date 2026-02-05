/**
 * Video Generation with Veo 3.1
 * Cloud Function for generating videos using Google's Veo 3.1 models
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { validateAuth } from './utils/validation';
import { decrementCredits } from './utils/credits';
import { logActivity } from './utils/logging';
import {
    addToVideoQueue,
    getNextQueueItem,
    markAsProcessing,
    markAsCompleted,
    markAsFailed,
    checkGlobalRateLimit,
    recordApiCall,
    getQueuePosition,
} from './utils/videoQueue';
import { getCreditCost, getModelId, getVideoDailyLimit } from './utils/creditCosts';
import { GenerateVideoRequest } from './types';

// Lazy load firestore
const getDb = () => admin.firestore();

// Initialize Gemini client
const getGeminiClient = () => {
    const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Gemini API key is not configured'
        );
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Request video generation (adds to queue)
 */
export const requestVideoGeneration = functions
    .runWith({
        timeoutSeconds: 60,
        memory: '512MB',
    })
    .https.onCall(async (data: GenerateVideoRequest, context: functions.https.CallableContext) => {
        // 1. Validate authentication
        const userId = validateAuth(context);

        // 2. Get user data
        const db = getDb();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data()!;
        const userPlan = userData.plan || 'free';
        const userCredits = userData.credits || 0;

        // 3. Check if video is available for this plan
        const dailyLimit = getVideoDailyLimit(userPlan);
        if (dailyLimit === 0) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Video generation is not available for free plan. Please upgrade to Pro or higher.'
            );
        }

        // 4. Validate request
        const { prompt, model = 'veo-3.1-fast', aspectRatio = '16:9', duration = 8 } = data;

        if (!prompt || prompt.trim().length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Prompt is required');
        }

        if (!['veo-3.1-fast', 'veo-3.1-standard'].includes(model)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid model. Use veo-3.1-fast or veo-3.1-standard');
        }

        // 5. Check credits
        const creditCost = getCreditCost('video', model);
        if (userCredits < creditCost) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                `Insufficient credits. Video generation requires ${creditCost} credits, you have ${userCredits}.`
            );
        }

        // 6. Add to queue
        try {
            const { queueId, position } = await addToVideoQueue(userId, userPlan, {
                prompt: prompt.trim(),
                model,
                aspectRatio,
                duration,
            });

            return {
                success: true,
                queueId,
                position,
                estimatedWait: position * 30, // ~30 seconds per video
                creditCost,
                message: position === 1
                    ? 'Your video is being processed...'
                    : `Your video is queued. Position: ${position}`,
            };
        } catch (error: any) {
            throw new functions.https.HttpsError('internal', error.message);
        }
    });

/**
 * Get video queue status for current user
 */
export const getVideoQueueStatus = functions
    .https.onCall(async (data: { queueId?: string }, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        if (data.queueId) {
            // Get specific queue item
            const db = getDb();
            const itemDoc = await db.collection('video_queue').doc(data.queueId).get();

            if (!itemDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Queue item not found');
            }

            const item = itemDoc.data()!;
            if (item.userId !== userId) {
                throw new functions.https.HttpsError('permission-denied', 'Not your queue item');
            }

            const position = await getQueuePosition(data.queueId);

            return {
                ...item,
                id: itemDoc.id,
                position,
            };
        }

        // Get all queue items for user
        const db = getDb();
        const snapshot = await db.collection('video_queue')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    });

/**
 * Process video queue (called by scheduler or pubsub)
 * This should be triggered every 30 seconds
 */
export const processVideoQueue = functions
    .runWith({
        timeoutSeconds: 540, // 9 minutes for video generation
        memory: '2GB',
    })
    .pubsub.schedule('every 1 minutes')
    .onRun(async () => {
        console.log('Processing video queue...');

        // Check global rate limit
        const canProceed = await checkGlobalRateLimit();
        if (!canProceed) {
            console.log('Rate limit reached, skipping...');
            return null;
        }

        // Get next item from queue
        const queueItem = await getNextQueueItem();
        if (!queueItem) {
            console.log('No pending items in queue');
            return null;
        }

        console.log(`Processing video for user ${queueItem.userId}, queue ID: ${queueItem.id}`);

        // Mark as processing
        await markAsProcessing(queueItem.id);

        const db = getDb();
        const userRef = db.collection('users').doc(queueItem.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await markAsFailed(queueItem.id, 'User not found');
            return null;
        }

        const userData = userDoc.data()!;
        const creditCost = getCreditCost('video', queueItem.request.model);

        // Check credits again before processing
        if ((userData.credits || 0) < creditCost) {
            await markAsFailed(queueItem.id, 'Insufficient credits');
            return null;
        }

        try {
            // Record API call for rate limiting
            await recordApiCall();

            // Generate video with Veo 3.1
            const videoUrl = await generateVideoWithVeo(queueItem.request);

            // Deduct credits
            const creditsAfter = await decrementCredits(queueItem.userId, creditCost, {
                toolName: 'video_generation',
                contentType: 'video',
            });

            // Log activity
            await logActivity({
                userId: queueItem.userId,
                action: 'generate_video',
                creditsBefore: userData.credits,
                creditsAfter,
                success: true,
                metadata: {
                    model: queueItem.request.model,
                    duration: queueItem.request.duration,
                    aspectRatio: queueItem.request.aspectRatio,
                },
            });

            // Mark as completed
            await markAsCompleted(queueItem.id, { videoUrl });

            console.log(`Video generated successfully for user ${queueItem.userId}`);
            return { success: true, videoUrl };
        } catch (error: any) {
            console.error('Video generation failed:', error);
            await markAsFailed(queueItem.id, error.message);
            return { success: false, error: error.message };
        }
    });

/**
 * Generate video using Veo 3.1 API
 */
async function generateVideoWithVeo(request: GenerateVideoRequest): Promise<string> {
    const client = getGeminiClient();
    const modelId = getModelId('video', request.model) || 'veo-3.1-fast-generate-preview';

    console.log(`Calling Veo API with model: ${modelId}`);

    try {
        // Veo 3.1 API call using Gemini SDK
        // The SDK handles long-running operations automatically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let operation: any = await client.models.generateVideos({
            model: modelId,
            prompt: request.prompt,
            config: {
                aspectRatio: request.aspectRatio || '16:9',
                numberOfVideos: 1,
            },
        });

        // Poll for completion (max 5 minutes)
        // The SDK returns the operation with done flag and result
        const maxAttempts = 30; // 30 * 10s = 5 minutes
        let attempts = 0;

        while (operation && !operation.done && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

            // For long-running operations, we need to poll using the operation name
            if (operation.name) {
                try {
                    // Use the operations API to check status
                    const opResult = await client.operations.get({
                        operation: operation.name,
                    });
                    operation = opResult as typeof operation;
                } catch (pollError: any) {
                    console.log(`Polling attempt ${attempts + 1} error:`, pollError.message);
                    // Continue polling even if individual poll fails
                }
            }

            attempts++;
            console.log(`Polling video generation... attempt ${attempts}`);
        }

        if (!operation?.done) {
            throw new Error('Video generation timed out');
        }

        if ((operation as any).error) {
            throw new Error(`Video generation error: ${(operation as any).error.message}`);
        }

        // Get video URL from response
        // Structure may vary based on SDK version
        const generatedVideos = (operation as any).response?.generatedVideos
            || (operation as any).generatedVideos
            || [];

        const videoData = generatedVideos[0];
        if (!videoData?.video?.uri) {
            throw new Error('No video generated');
        }

        // Upload to Firebase Storage for permanent storage
        const videoUrl = await uploadVideoToStorage(videoData.video.uri, request);

        return videoUrl;
    } catch (error: any) {
        console.error('Veo API error:', error);
        throw new Error(`Failed to generate video: ${error.message}`);
    }
}

/**
 * Upload generated video to Firebase Storage
 */
async function uploadVideoToStorage(
    tempVideoUrl: string,
    request: GenerateVideoRequest
): Promise<string> {
    const storage = admin.storage().bucket();
    const timestamp = Date.now();
    const fileName = `videos/${timestamp}_${request.model}.mp4`;

    try {
        // Download from temp URL
        const response = await fetch(tempVideoUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch video');
        }
        const buffer = Buffer.from(await response.arrayBuffer());

        // Upload to Firebase Storage
        const file = storage.file(fileName);
        await file.save(buffer, {
            metadata: {
                contentType: 'video/mp4',
                metadata: {
                    model: request.model,
                    prompt: request.prompt.substring(0, 200),
                    aspectRatio: request.aspectRatio,
                    duration: String(request.duration),
                },
            },
        });

        // Make publicly accessible
        await file.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`;
        return publicUrl;
    } catch (error: any) {
        console.error('Failed to upload video:', error);
        throw new Error('Failed to save video');
    }
}
