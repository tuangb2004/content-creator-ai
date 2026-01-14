import * as GroqModule from 'groq-sdk';
import * as functions from 'firebase-functions';

const Groq = (GroqModule as any).default || GroqModule;

const apiKey = functions.config().groq?.api_key || process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('GROQ_API_KEY is not configured. Groq API will not be available.');
}

let groq: any = null;
try {
  groq = apiKey ? new Groq({ apiKey }) : null;
} catch (error) {
  console.error('Failed to initialize Groq:', error);
  groq = null;
}

// System prompts for different templates (same as Gemini)
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

interface GroqOptions {
  retries?: number;
  timeout?: number;
  systemInstruction?: string; // Custom system instruction (takes priority over template-based prompt)
}

/**
 * Call Groq API with retry logic
 * Groq is free and fast, perfect for free plan users
 */
export async function callGroqAPI(
  prompt: string,
  template: string = 'blog',
  tone: string = 'professional',
  length: string = 'medium',
  options: GroqOptions = {}
): Promise<string> {
  if (!groq) {
    const currentKey = functions.config().groq?.api_key || process.env.GROQ_API_KEY;
    throw new Error(`Groq API is not configured. Please set GROQ_API_KEY. Current key: ${currentKey ? 'Set (but invalid)' : 'Not set'}`);
  }

  const { retries = 3, timeout = 30000, systemInstruction } = options;

  // Get system prompt - prioritize custom systemInstruction from tool definition
  const systemPrompt = systemInstruction 
    ? systemInstruction // Use custom system instruction from tool (most specific)
    : (systemPrompts[template] 
    ? systemPrompts[template](tone, length)
        : systemPrompts.blog(tone, length)); // Fallback to template-based prompt

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile', // Latest versatile model
          temperature: 0.7,
          max_tokens: length === 'short' ? 500 : length === 'medium' ? 1000 : 2000,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);

      const content = completion.choices[0]?.message?.content;

      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from Groq API');
      }

      return content.trim();
    } catch (error: any) {
      lastError = error;
      console.error(`Groq API attempt ${attempt}/${retries} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('API key') || error.message?.includes('401') || error.message?.includes('403')) {
        throw new Error('Invalid Groq API key. Please check your configuration.');
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

  throw new Error(`Failed to generate content with Groq after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Call Groq API for chat with messages array
 * Used for chat/conversation functionality
 */
export async function callGroqChatAPI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    retries?: number;
    timeout?: number;
  } = {}
): Promise<string> {
  if (!groq) {
    const currentKey = functions.config().groq?.api_key || process.env.GROQ_API_KEY;
    throw new Error(`Groq API is not configured. Please set GROQ_API_KEY. Current key: ${currentKey ? 'Set (but invalid)' : 'Not set'}`);
  }

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    max_tokens = 2000,
    retries = 3,
    timeout = 30000
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages: messages,
          model: model,
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: 1,
          stream: false
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);

      const content = completion.choices[0]?.message?.content;

      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from Groq API');
      }

      return content.trim();
    } catch (error: any) {
      lastError = error;
      console.error(`Groq Chat API attempt ${attempt}/${retries} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('API key') || error.message?.includes('401') || error.message?.includes('403')) {
        throw new Error('Invalid Groq API key. Please check your configuration.');
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

  throw new Error(`Failed to get chat response from Groq after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

