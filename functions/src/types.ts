export interface UserData {
  email: string;
  plan: 'free' | 'pro' | 'agency';
  credits: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type ContentType = 'text' | 'image' | 'video';
export type TextProvider = 'groq' | 'gemini';
export type ImageProvider = 'pollination' | 'gemini' | 'stability';
export type VideoProvider = 'gemini'; // Veo 3.1 via Gemini API
export type VideoModel = 'veo-3.1-fast' | 'veo-3.1-standard';

export interface GenerateContentRequest {
  prompt: string;
  template?: string;
  tone?: string;
  length?: string;
  contentType?: ContentType; // 'text' or 'image'
  provider?: TextProvider | ImageProvider; // 'groq', 'gemini', 'pollination'
  systemInstruction?: string; // Custom system instruction from tool definition (takes priority over template)
  toolId?: string;
  toolName?: string;
  toolCategory?: string;
  modelId?: string;
  image?: string; // base64 encoded image (legacy)
  /** File URLs to analyze (images, PDFs, text files). Will be uploaded to Gemini File API if provider is gemini. */
  fileUrls?: string[]; // Array of file URLs (from Firebase Storage or public URLs)
  /** When provider is gemini: enable Google Search Grounding for real-time, factual answers. Default true. */
  useGoogleSearchGrounding?: boolean;
}

export interface GenerateContentResponse {
  content: string; // Text content or image URL
  contentType: ContentType;
  provider: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export interface ActivityLog {
  userId: string;
  action: string;
  creditsBefore: number;
  creditsAfter: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: FirebaseFirestore.Timestamp;
}

export interface RateLimitData {
  count: number;
  lastRequest: number;
}

export interface WebhookEvent {
  eventId: string;
  processedAt: FirebaseFirestore.Timestamp;
  status: 'processing' | 'success' | 'failed';
  error?: string;
}

// Video Generation Types
export interface GenerateVideoRequest {
  prompt: string;
  model: VideoModel; // 'veo-3.1-fast' or 'veo-3.1-standard'
  aspectRatio?: '16:9' | '9:16' | '1:1'; // Default 16:9
  duration?: 5 | 8; // seconds, default 8
  imageUrl?: string; // Optional: image-to-video
}

export interface GenerateVideoResponse {
  videoUrl: string; // Firebase Storage URL
  thumbnailUrl?: string;
  duration: number;
  model: VideoModel;
  creditsUsed: number;
  creditsRemaining: number;
  queuePosition?: number; // If queued
}

export interface VideoQueueItem {
  id: string;
  userId: string;
  userPlan: string;
  request: GenerateVideoRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number; // Higher = more priority (agency > pro)
  createdAt: FirebaseFirestore.Timestamp;
  processedAt?: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  result?: {
    videoUrl: string;
    thumbnailUrl?: string;
  };
  error?: string;
}

