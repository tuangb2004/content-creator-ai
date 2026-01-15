export interface UserData {
  email: string;
  plan: 'free' | 'pro' | 'agency';
  credits: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type ContentType = 'text' | 'image';
export type TextProvider = 'groq' | 'gemini';
export type ImageProvider = 'pollination' | 'gemini' | 'stability';

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

