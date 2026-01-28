import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';

const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured. Gemini API will not be available.');
}

// Lazy initialization - only create when API key is available
let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Set it using: firebase functions:config:set gemini.api_key="YOUR_KEY" or set GEMINI_API_KEY in .env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// System prompts for different templates
const systemPrompts: Record<string, (tone: string, length: string) => string> = {
  blog: (tone, length) => {
    const lengthGuidance: Record<string, string> = {
      short: 'approximately 200-300 words',
      medium: 'approximately 500-700 words',
      long: 'approximately 1000-1500 words'
    };
    return `You are a professional blog writer. Write a ${length} blog post (${lengthGuidance[length] || 'appropriate length'}) in a ${tone} tone. Include an engaging introduction, well-structured main points with examples, and a strong conclusion. Make it SEO-friendly and easy to read.`;
  },

  caption: (tone, length) => {
    const lengthGuidance: Record<string, string> = {
      short: '50-100 words, very concise',
      medium: '150-250 words, moderate detail',
      long: '300-500 words, detailed and engaging'
    };
    return `You are a social media expert. Write an engaging ${tone} caption for Instagram/Facebook. The caption must be ${length} length (${lengthGuidance[length] || 'appropriate length'}). Include relevant emojis, a clear message, and a strong call-to-action. Add 3-5 relevant hashtags at the end.`;
  },

  email: (tone, length) => {
    const lengthGuidance: Record<string, string> = {
      short: '100-200 words, brief and direct',
      medium: '300-500 words, moderate detail',
      long: '600-1000 words, comprehensive and detailed'
    };
    return `You are a professional email marketing copywriter. Write a ${tone} marketing email that is ${length} length (${lengthGuidance[length] || 'appropriate length'}). Include: 1) Compelling subject line, 2) Friendly greeting, 3) Clear value proposition, 4) Main message with benefits, 5) Strong call-to-action, 6) Professional closing.`;
  },

  product: (tone, length) => {
    const lengthGuidance: Record<string, string> = {
      short: '100-200 words, concise highlights',
      medium: '300-500 words, detailed features',
      long: '600-1000 words, comprehensive description'
    };
    return `You are an e-commerce product description expert. Write a ${tone} product description that is ${length} length (${lengthGuidance[length] || 'appropriate length'}). Include: 1) Highlights key features, 2) Explains benefits clearly, 3) Creates desire to buy, 4) Uses persuasive language, 5) Includes a call-to-action.`;
  }
};

interface GeminiOptions {
  retries?: number;
  timeout?: number;
  systemInstruction?: string; // Custom system instruction (takes priority over template-based prompt)
  model?: string;
}

/**
 * Call Gemini API with retry logic
 */
export async function callGeminiAPI(
  prompt: string,
  template: string = 'blog',
  tone: string = 'professional',
  length: string = 'medium',
  options: GeminiOptions = {}
): Promise<string> {
  const { retries = 3, timeout = 30000, systemInstruction, model: modelId = 'gemini-2.0-flash' } = options;

  const genAI = getGenAI();
  // Standard SDK with v1beta is needed for these project-specific experimental models
  const model = genAI.getGenerativeModel({ model: modelId });

  // Get system prompt - prioritize custom systemInstruction from tool definition
  const systemPrompt = systemInstruction
    ? systemInstruction // Use custom system instruction from tool (most specific)
    : (systemPrompts[template]
      ? systemPrompts[template](tone, length)
      : systemPrompts.blog(tone, length)); // Fallback to template-based prompt

  const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        model.generateContent(fullPrompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      return text;
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini API attempt ${attempt}/${retries} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('API key') || error.message?.includes('401')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      }

      if (error.message?.includes('429')) {
        // Rate limit - wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }

      // Last attempt - throw error
      if (attempt === retries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(`Failed to generate content after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

