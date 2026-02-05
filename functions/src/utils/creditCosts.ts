/**
 * Credit Cost Configuration
 * Centralized pricing for all AI operations
 */

export const CREDIT_COSTS = {
    text: {
        groq: 0, // Free
        'gemini-flash': 1, // ~500đ cost, sell for 2000đ = 4x margin
        'gemini-pro': 3, // ~3000đ cost, sell for 6000đ = 2x margin
    },
    image: {
        'nano-banana': 5, // ~500đ cost, sell for 10000đ = 20x margin
        'nano-banana-pro': 8, // ~1000đ cost, sell for 16000đ = 16x margin
        'sdxl': 5, // ~750đ cost, sell for 10000đ = 13x margin
    },
    video: {
        'veo-3.1-fast': 30, // ~8750đ cost, sell for 60000đ = 6.8x margin
        'veo-3.1-standard': 50, // ~12000đ cost, sell for 100000đ = 8x margin
    }
} as const;

// Model mapping for API calls
export const MODEL_IDS = {
    image: {
        'nano-banana': 'gemini-2.5-flash-preview-image-generation',
        'nano-banana-pro': 'gemini-3-pro-image-preview',
        'sdxl': 'stable-diffusion-xl-1024-v1-0',
    },
    video: {
        'veo-3.1-fast': 'veo-3.1-fast-generate-preview',
        'veo-3.1-standard': 'veo-3.1-generate-preview',
    }
} as const;

// Rate limits per model (Tier 1)
export const RATE_LIMITS = {
    video: {
        'veo-3.1-fast': { rpm: 2, rpd: 10 },
        'veo-3.1-standard': { rpm: 2, rpd: 10 },
    },
    image: {
        'nano-banana': { rpm: 500, rpd: 2000 },
        'nano-banana-pro': { rpm: 20, rpd: 250 },
        'sdxl': { rpm: 10, rpd: 100 }, // Stability AI limits
    }
} as const;

// Daily video limits per user plan
export const VIDEO_DAILY_LIMITS = {
    free: 0, // No video access for free tier
    pro: 8,
    agency: 40,
    business: 83,
} as const;

// Helper functions
export function getCreditCost(
    type: 'text' | 'image' | 'video',
    model: string
): number {
    const costs = CREDIT_COSTS[type] as Record<string, number>;
    return costs[model] ?? 0;
}

export function getModelId(
    type: 'image' | 'video',
    model: string
): string | undefined {
    const models = MODEL_IDS[type] as Record<string, string>;
    return models[model];
}

export function getRateLimit(
    type: 'image' | 'video',
    model: string
): { rpm: number; rpd: number } | undefined {
    const limits = RATE_LIMITS[type] as Record<string, { rpm: number; rpd: number }>;
    return limits[model];
}

export function getVideoDailyLimit(plan: string): number {
    return VIDEO_DAILY_LIMITS[plan as keyof typeof VIDEO_DAILY_LIMITS] ?? 0;
}
