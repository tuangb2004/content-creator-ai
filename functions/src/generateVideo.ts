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
import { recordApiCall } from './utils/videoQueue';
import { getCreditCost, getModelId, getVideoDailyLimit } from './utils/creditCosts';
import { GenerateVideoRequest } from './types';
import got from 'got';
import { Storage } from '@google-cloud/storage';
import { pipeline } from 'stream/promises';

// Lazy load firestore
const getDb = () => admin.firestore();

// Shared Gemini API key helper
const getGeminiApiKey = (): string => {
    const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Gemini API key is not configured'
        );
    }
    return apiKey;
};

// Initialize Gemini client
const getGeminiClient = () => {
    const apiKey = getGeminiApiKey();
    return new GoogleGenAI({ apiKey });
};



/**
 * Get video queue status for current user
 */
/**
 * Direct video generation (no queue) — returns videoUrl immediately.
 * Use for prioritized, single-shot generations where you want a result
 * in the same request/response cycle.
 */
export const generateVideoDirect = functions
    .runWith({
        timeoutSeconds: 540,
        memory: '2GB',
    })
    .https.onCall(async (data: GenerateVideoRequest, context: functions.https.CallableContext) => {
        const userId = validateAuth(context);

        const db = getDb();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data()!;
        const userPlan = userData.plan || 'free';
        const userCredits = userData.credits || 0;

        // Check plan daily limit
        const dailyLimit = getVideoDailyLimit(userPlan);
        if (dailyLimit === 0) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Video generation is not available for free plan. Please upgrade to Pro or higher.'
            );
        }

        // Basic validation
        const {
            prompt,
            model = 'veo-3.1-fast',
            aspectRatio = '16:9',
            duration = 8,
            videoMode,
            fileUrls,
            firstFrameUrl,
            lastFrameUrl,
            referenceImageUrls,
        } = data;

        if (!prompt || prompt.trim().length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Prompt is required');
        }

        // Veo 3.1 only accepts 4, 6 or 8 seconds; normalize 5->6, 7->8
        const rawDur = Math.round(Number(duration)) || 8;
        const normalizedDuration: 4 | 6 | 8 = rawDur < 4 ? 8 : rawDur > 8 ? 8 : ([4, 6, 8].includes(rawDur) ? rawDur : (rawDur <= 5 ? 6 : 8)) as 4 | 6 | 8;

        if (!['veo-3.1-fast', 'veo-3.1-standard'].includes(model)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid model. Use veo-3.1-fast or veo-3.1-standard');
        }

        const creditCost = getCreditCost('video', model);
        if (userCredits < creditCost) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                `Insufficient credits. Video generation requires ${creditCost} credits, you have ${userCredits}.`
            );
        }

        try {
            // Record global API call for rate limiting
            await recordApiCall();

            // Build request for Veo (use normalized duration 4, 6 or 8)
            const request: GenerateVideoRequest = {
                prompt: prompt.trim(),
                model,
                aspectRatio,
                duration: normalizedDuration,
            };

            if (videoMode) request.videoMode = videoMode;
            if (fileUrls?.length) request.fileUrls = fileUrls;
            if (firstFrameUrl) request.firstFrameUrl = firstFrameUrl;
            if (lastFrameUrl) request.lastFrameUrl = lastFrameUrl;
            if (referenceImageUrls?.length) request.referenceImageUrls = referenceImageUrls;
            if (data.numberOfVideos === 2) request.numberOfVideos = 2;
            if (data.resolution && ['720p', '1080p', '4k'].includes(data.resolution)) request.resolution = data.resolution;
            if (data.language) request.language = data.language;
            if (data.personGeneration) request.personGeneration = data.personGeneration;

            // Call Veo directly
            const videoUrl = await generateVideoWithVeo(request);

            // Deduct credits only after successful generation
            const creditsAfter = await decrementCredits(userId, creditCost, {
                toolName: 'video_generation_direct',
                contentType: 'video',
            });

            await logActivity({
                userId,
                action: 'generate_video_direct',
                creditsBefore: userCredits,
                creditsAfter,
                success: true,
                metadata: {
                    model,
                    duration,
                    aspectRatio,
                },
            });

            return {
                success: true,
                videoUrl,
                creditCost,
                creditsAfter,
            };
        } catch (error: any) {
            console.error('Direct Veo generation failed:', error);
            throw new functions.https.HttpsError('internal', error.message || 'Failed to generate video');
        }
    });

/**
 * Firestore trigger: generate video when a new request document is created.
 * Collection: video_requests/{requestId}
 */
export const onVideoRequestCreate = functions.firestore
    .document('video_requests/{requestId}')
    .onCreate(async (snap, context) => {
        const data = snap.data() as any;
        const requestId = context.params.requestId as string;

        if (!data) {
            console.error('[onVideoRequestCreate] Missing data for request', requestId);
            return;
        }

        const userId = data.userId as string | undefined;
        if (!userId) {
            console.error('[onVideoRequestCreate] Missing userId for request', requestId);
            await snap.ref.update({
                status: 'error',
                error: 'Missing userId in request',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        const db = getDb();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error('[onVideoRequestCreate] User not found for request', requestId, userId);
            await snap.ref.update({
                status: 'error',
                error: 'User not found',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        const userData = userDoc.data()!;
        const userPlan = userData.plan || 'free';
        const userCredits = userData.credits || 0;

        // Check plan daily limit
        const dailyLimit = getVideoDailyLimit(userPlan);
        if (dailyLimit === 0) {
            await snap.ref.update({
                status: 'error',
                error: 'Video generation is not available for free plan. Please upgrade to Pro or higher.',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        const prompt = (data.prompt as string | undefined)?.trim();
        const model = (data.model as string | undefined) || 'veo-3.1-fast';
        const aspectRatio = (data.aspectRatio as string | undefined) || '16:9';
        // Veo 3.1 only accepts 4, 6, or 8 seconds; normalize from Firestore (may be string)
        const durationRaw = (data.duration as number | string | undefined) ?? 8;
        const n = Math.round(Number(durationRaw)) || 8;
        const duration = n < 4 ? 8 : n > 8 ? 8 : [4, 6, 8].includes(n) ? n : (n <= 5 ? 6 : 8);

        if (!prompt) {
            await snap.ref.update({
                status: 'error',
                error: 'Prompt is required',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        if (![4, 6, 8].includes(duration)) {
            await snap.ref.update({
                status: 'error',
                error: 'Invalid duration. Veo 3.1 only supports 4, 6 or 8 seconds.',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        if (!['veo-3.1-fast', 'veo-3.1-standard'].includes(model)) {
            await snap.ref.update({
                status: 'error',
                error: 'Invalid model. Use veo-3.1-fast or veo-3.1-standard',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        const creditCost = getCreditCost('video', model);
        if (userCredits < creditCost) {
            await snap.ref.update({
                status: 'error',
                error: `Insufficient credits. Video generation requires ${creditCost} credits, you have ${userCredits}.`,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }

        // Mark as processing
        await snap.ref.update({
            status: 'processing',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        try {
            // Record global API call for rate limiting
            await recordApiCall();

            const request: GenerateVideoRequest = {
                prompt,
                model: model as any,
                aspectRatio: aspectRatio as any,
                duration: duration as any,
            };

            if (Array.isArray(data.fileUrls) && data.fileUrls.length) request.fileUrls = data.fileUrls;
            if (typeof data.videoMode === 'string') request.videoMode = data.videoMode;
            if (typeof data.firstFrameUrl === 'string') request.firstFrameUrl = data.firstFrameUrl;
            if (typeof data.lastFrameUrl === 'string') request.lastFrameUrl = data.lastFrameUrl;
            if (Array.isArray(data.referenceImageUrls) && data.referenceImageUrls.length) request.referenceImageUrls = data.referenceImageUrls;
            if (typeof data.resolution === 'string') request.resolution = data.resolution;
            if (typeof data.language === 'string') request.language = data.language;
            if (typeof data.personGeneration === 'string') request.personGeneration = data.personGeneration;

            // Call Veo using shared helper (no queueId passed)
            const videoUrl = await generateVideoWithVeo(request);

            // Deduct credits only after successful generation
            const creditsAfter = await decrementCredits(userId, creditCost, {
                toolName: 'video_generation_firestore_trigger',
                contentType: 'video',
            });

            await logActivity({
                userId,
                action: 'generate_video_firestore_trigger',
                creditsBefore: userCredits,
                creditsAfter,
                success: true,
                metadata: {
                    model,
                    duration,
                    aspectRatio,
                },
            });

            await snap.ref.update({
                status: 'completed',
                videoUrl,
                creditCost,
                creditsAfter,
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            await admin.firestore().collection('notifications').add({
                userId,
                type: 'ai_complete',
                actorId: 'system',
                message: 'Video đã được tạo xong! Kiểm tra Assets của bạn.',
                mediaUrl: videoUrl,
                status: 'unread',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error: any) {
            console.error('[onVideoRequestCreate] Video generation failed:', error);

            await snap.ref.update({
                status: 'error',
                error: error?.message || 'Failed to generate video',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    });

/**
 * Fetch an image from URL and return as base64 bytes + mimeType
 */
async function fetchImageAsBase64(imageUrl: string): Promise<{ bytes: string; mimeType: string } | null> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.warn(`Failed to fetch image from ${imageUrl}: ${response.status}`);
            return null;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/png';
        const mimeType = contentType.split(';')[0].trim();
        const bytes = buffer.toString('base64');
        return { bytes, mimeType };
    } catch (error: any) {
        console.error(`Error fetching image ${imageUrl}:`, error.message);
        return null;
    }
}

/**
 * Generate video using Veo 3.1 API
 * Supports: text-to-video, frame-to-video (first/last frame), ingredients-to-video (reference images)
 */
async function generateVideoWithVeo(request: GenerateVideoRequest & { existingOperationName?: string }): Promise<string> {
    const client = getGeminiClient();
    const modelId = getModelId('video', request.model) || 'veo-3.1-fast-generate-preview';

    console.log(`Calling Veo API with model: ${modelId}, mode: ${request.videoMode || 'text-to-video'}`);

    try {
        // Build config
        const config: Record<string, any> = {
            aspectRatio: request.aspectRatio || '16:9',
            numberOfVideos: request.numberOfVideos || 1,
        };

        // Veo 3.1 API only accepts 4, 6, or 8 seconds (not 5 or 7)
        const VALID_DURATIONS = [4, 6, 8] as const;
        const durationSeconds = (() => {
            const n = Math.round(Number(request.duration));
            if (!Number.isFinite(n) || n < 4) return 8;
            if (n > 8) return 8;
            if (VALID_DURATIONS.includes(n as 4 | 6 | 8)) return n as 4 | 6 | 8;
            return n <= 5 ? 6 : 8; // 5 -> 6, 7 -> 8
        })();
        config.durationSeconds = durationSeconds;

        // Add resolution if specified
        if (request.resolution) {
            config.resolution = request.resolution;
        }

        // Add person generation policy
        if (request.personGeneration) {
            config.personGeneration = request.personGeneration;
        }

        // Build the API call params
        const apiParams: Record<string, any> = {
            model: modelId,
            prompt: request.language && request.language !== 'EN'
                ? `[Language: ${request.language}] ${request.prompt}`
                : request.prompt,
            config,
        };

        // Handle image inputs based on video mode
        if (request.videoMode === 'frame-to-video') {
            // Frame-to-video: use first/last frame as image input
            if (request.firstFrameUrl) {
                const imageData = await fetchImageAsBase64(request.firstFrameUrl);
                if (imageData) {
                    apiParams.image = {
                        imageBytes: imageData.bytes,
                        mimeType: imageData.mimeType,
                    };
                    // If last frame is also provided, add to config
                    if (request.lastFrameUrl) {
                        const lastFrameData = await fetchImageAsBase64(request.lastFrameUrl);
                        if (lastFrameData) {
                            config.lastFrame = {
                                imageBytes: lastFrameData.bytes,
                                mimeType: lastFrameData.mimeType,
                            };
                        }
                    }
                }
            }
        } else if (request.videoMode === 'ingredients-to-video' && request.referenceImageUrls?.length) {
            // Ingredients-to-video: pass reference images (max 3)
            // Veo 3.1 expects an array of VideoGenerationReferenceImage objects:
            // { image: { imageBytes, mimeType }, referenceType: 'asset' }
            const referenceImages = [];
            for (const url of request.referenceImageUrls.slice(0, 3)) {
                const imageData = await fetchImageAsBase64(url);
                if (imageData) {
                    referenceImages.push({
                        image: {
                            imageBytes: imageData.bytes,
                            mimeType: imageData.mimeType,
                        },
                        referenceType: 'asset',
                    });
                }
            }
            if (referenceImages.length > 0) {
                config.referenceImages = referenceImages;
            }
        } else if (request.imageUrl) {
            // Legacy single image input
            const imageData = await fetchImageAsBase64(request.imageUrl);
            if (imageData) {
                apiParams.image = {
                    imageBytes: imageData.bytes,
                    mimeType: imageData.mimeType,
                };
            }
        }

        // Veo 3.1 API call using Gemini SDK
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let operation: any;

        if (request.existingOperationName) {
            // Resume from an existing long-running operation name
            console.log(`Resuming existing operation: ${request.existingOperationName}`);
            operation = { name: request.existingOperationName } as any;
        } else {
            operation = await client.models.generateVideos(apiParams as any);
            const operationName = operation?.name;
            console.log(`Started new video generation operation: ${operationName}`);

            // CRITICAL for SaaS Idempotency: Store the operation name immediately
            if (operationName && request.queueId) {
                try {
                    await admin.firestore().collection('video_queue').doc(request.queueId).update({
                        veoOperationName: operationName,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                } catch (e) {
                    console.warn('Failed to store operation name for idempotency:', e);
                }
            }
        }

        // Poll for completion (max 8.5 minutes to stay within 9m Cloud Function limit)
        const maxAttempts = 50; // 50 * 10s = 500s = 8.3 minutes
        let attempts = 0;

        console.log(`Starting polling for video generation: ${operation?.name || 'unknown'}`);

        while (operation && !operation.done && attempts < maxAttempts) {
            attempts++;

            // Liveness Ping: update Firestore every 30s so user/frontend knows we are working
            if (attempts % 3 === 0 && request.queueId) {
                try {
                    await admin.firestore().collection('video_queue').doc(request.queueId).update({
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        processingAttempt: attempts,
                        statusDetail: `Polling Veo API... attempt ${attempts}/${maxAttempts}`
                    });
                } catch (e) {
                    console.warn('Failed to update liveness ping:', e);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

            try {
                // Use the dedicated video operation helper as per official docs:
                // https://ai.google.dev/gemini-api/docs/video?example=dialogue#javascript_2
                const opResult = await client.operations.getVideosOperation({
                    // Pass the operation object (or minimal stub with name)
                    // so the SDK can track and type it correctly.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    operation: operation as any,
                });
                operation = opResult as typeof operation;

                if (attempts % 3 === 0) {
                    console.log(`Polling video generation [${operation?.name || 'unknown'}]... attempt ${attempts}/${maxAttempts}`);
                }
            } catch (pollError: any) {
                console.log(`Polling attempt ${attempts} error:`, pollError.message);
            }
        }

        if (!operation?.done) {
            throw new Error(`Video generation timed out after ${attempts * 10}s. The API might still be working, but this worker must exit.`);
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
 * Upload generated video to Firebase Storage using streaming
 * Supports both public HTTPS URLs and gs:// URIs
 */
async function uploadVideoToStorage(
    sourceUrl: string,
    request: GenerateVideoRequest
): Promise<string> {
    const storage = new Storage();
    const bucket = admin.storage().bucket();
    const timestamp = Date.now();
    const fileName = `videos/${timestamp}_${request.model}.mp4`;
    const destinationFile = bucket.file(fileName);

    try {
        console.log(`Uploading video from ${sourceUrl} to ${fileName}`);

        if (sourceUrl.startsWith('gs://')) {
            // Case 1: Internal Google Cloud Storage URI
            const srcBucketName = sourceUrl.replace('gs://', '').split('/')[0];
            const srcFileName = sourceUrl.replace(`gs://${srcBucketName}/`, '');

            const srcBucket = storage.bucket(srcBucketName);
            const srcFile = srcBucket.file(srcFileName);

            // Copy file directly within GCS (fastest, no memory/bandwidth overhead)
            await srcFile.copy(destinationFile);
        } else {
            // Case 2: HTTPS URL from Gemini Files API (requires API key)
            const apiKey = getGeminiApiKey();

            const readStream = got.stream(sourceUrl, {
                headers: {
                    'x-goog-api-key': apiKey,
                },
                followRedirect: true,
            });
            const writeStream = destinationFile.createWriteStream({
                metadata: {
                    contentType: 'video/mp4',
                    metadata: {
                        model: request.model,
                        prompt: request.prompt.substring(0, 200),
                        aspectRatio: request.aspectRatio,
                        duration: String(request.duration),
                    },
                },
                resumable: false // Better for small/medium files
            });

            await pipeline(readStream, writeStream);
        }

        // Make publicly accessible
        await destinationFile.makePublic();

        // Get public URL
        return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (error: any) {
        console.error('Failed to upload video:', error);
        throw new Error(`Failed to save video: ${error.message}`);
    }
}

