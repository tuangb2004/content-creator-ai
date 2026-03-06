/**
 * Video Generation Service
 * Frontend service for video generation with Veo 3.1
 */
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';

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
 * Direct video generation: call backend and get videoUrl in one step.
 * Bypass queue for highest reliability.
 */
export async function generateVideoDirect(params) {
    const fn = httpsCallable(functions, 'generateVideoDirect');
    const result = await fn(params);
    return result.data;
}

/**
 * Create a new video generation request document in Firestore.
 * Returns the request document ID.
 */
// Veo 3.1 only accepts 4, 6 or 8 seconds (not 5 or 7)
function clampDuration(d) {
    const n = Math.round(Number(d));
    if (!Number.isFinite(n) || n < 4) return 8;
    if (n > 8) return 8;
    if (n === 4 || n === 6 || n === 8) return n;
    return n <= 5 ? 6 : 8; // 5 -> 6, 7 -> 8
}

export async function createVideoRequest({
    userId,
    prompt,
    model = 'veo-3.1-fast',
    aspectRatio = '16:9',
    duration = 8,
    language = 'EN',
    videoMode = 'text-to-video',
    fileUrls,
    firstFrameUrl,
    lastFrameUrl,
    referenceImageUrls,
    resolution,
    personGeneration,
}) {
    const docRef = await addDoc(collection(db, 'video_requests'), {
        userId,
        prompt: prompt.trim(),
        model,
        aspectRatio,
        duration: clampDuration(duration),
        language,
        videoMode,
        fileUrls: fileUrls || [],
        firstFrameUrl: firstFrameUrl || null,
        lastFrameUrl: lastFrameUrl || null,
        referenceImageUrls: referenceImageUrls || [],
        resolution: resolution || null,
        personGeneration: personGeneration || null,
        status: 'queued',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Subscribe to a single video request document by ID.
 * Calls callback on every change. Returns unsubscribe function.
 */
export function subscribeVideoRequest(requestId, callback) {
    const ref = doc(db, 'video_requests', requestId);
    const unsubscribe = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        callback({ id: snap.id, ...snap.data() });
    });
    return unsubscribe;
}
