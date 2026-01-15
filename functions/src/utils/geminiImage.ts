import { GoogleGenAI } from '@google/genai';
import * as functions from 'firebase-functions';

const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Set it using: firebase functions:config:set gemini.api_key="YOUR_KEY" or set GEMINI_API_KEY in .env');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

interface GeminiImageOptions {
  retries?: number;
  timeout?: number;
  model?: string;
  systemInstruction?: string;
}

export async function callGeminiImageAPI(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<string> {
  const { retries = 2, timeout = 30000, model = 'gemini-2.5-flash-image', systemInstruction } = options;

  const ai = getGenAI();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result: any = await Promise.race([
        ai.models.generateContent({
          model,
          contents: { parts: [{ text: prompt }] },
          config: systemInstruction ? { systemInstruction } : undefined
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout))
      ]);

      const parts = result?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part?.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error('Gemini image response missing inline image data.');
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini Image attempt ${attempt}/${retries} failed:`, error.message);

      if (attempt === retries) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(`Failed to generate image after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

