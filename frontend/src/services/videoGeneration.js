/**
 * Video Generation Service
 * Frontend service for video generation with Veo 3.1
 */
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Credit costs for display (must match backend)
export const VIDEO_CREDIT_COSTS = {
    'veo-3.1-fast': 300,
    'veo-3.1-standard': 500,
};

// Video models info
export const VIDEO_MODELS = [
    {
        id: 'veo-3.1-fast',
        name: 'Veo 3.1 Fast',
        description: 'Nhanh, chất lượng tốt',
        credits: 300,
        duration: '~30s',
    },
    {
        id: 'veo-3.1-standard',
        name: 'Veo 3.1 Standard',
        description: 'Chất lượng cao nhất',
        credits: 500,
        duration: '~2 phút',
    },
];

/**
 * Request video generation
 * @param {Object} params - Video generation parameters
 * @param {string} params.prompt - Video prompt
 * @param {string} params.model - Model: 'veo-3.1-fast' or 'veo-3.1-standard'
 * @param {string} params.aspectRatio - Aspect ratio: '16:9', '9:16', or '1:1'
 * @param {number} params.duration - Duration in seconds: 5 or 8
 * @returns {Promise<Object>} Queue info with queueId and position
 */
export async function requestVideoGeneration({ prompt, model = 'veo-3.1-fast', aspectRatio = '16:9', duration = 8 }) {
    const fn = httpsCallable(functions, 'requestVideoGeneration');
    const result = await fn({ prompt, model, aspectRatio, duration });
    return result.data;
}

/**
 * Get video queue status
 * @param {string} queueId - Optional queue ID to check specific item
 * @returns {Promise<Object>} Queue status
 */
export async function getVideoQueueStatus(queueId) {
    const fn = httpsCallable(functions, 'getVideoQueueStatus');
    const result = await fn({ queueId });
    return result.data;
}

/**
 * Poll video generation status until complete or failed
 * @param {string} queueId - Queue ID to poll
 * @param {function} onProgress - Callback for progress updates
 * @param {number} intervalMs - Polling interval in ms (default 5000)
 * @param {number} maxAttempts - Max polling attempts (default 60 = 5 minutes)
 * @returns {Promise<Object>} Final result with videoUrl
 */
export async function pollVideoStatus(queueId, onProgress, intervalMs = 5000, maxAttempts = 60) {
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const status = await getVideoQueueStatus(queueId);

            if (onProgress) {
                onProgress(status);
            }

            if (status.status === 'completed') {
                return {
                    success: true,
                    videoUrl: status.result?.videoUrl,
                    thumbnailUrl: status.result?.thumbnailUrl,
                };
            }

            if (status.status === 'failed') {
                return {
                    success: false,
                    error: status.error || 'Video generation failed',
                };
            }

            // Still processing, wait and retry
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            attempts++;
        } catch (error) {
            console.error('Poll error:', error);
            attempts++;
        }
    }

    return {
        success: false,
        error: 'Video generation timed out',
    };
}

/**
 * Get user's recent video generations
 * @returns {Promise<Array>} List of video queue items
 */
export async function getUserVideos() {
    const fn = httpsCallable(functions, 'getVideoQueueStatus');
    const result = await fn({});
    return result.data;
}
