import { GoogleGenAI } from '@google/genai';
import * as functions from 'firebase-functions';
import { uploadFileToGemini, getMimeTypeFromUrl } from './geminiFiles';

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
  /** File URLs (e.g. uploaded image) to use as reference for image generation */
  fileUrls?: string[];
}

export async function callGeminiImageAPI(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<string> {
  const { retries = 2, timeout = 30000, model = 'imagen-3.0-generate-001', systemInstruction, fileUrls = [] } = options;

  const ai = getGenAI();
  let lastError: Error | null = null;

  // Upload reference files to Gemini if provided (e.g. "tạo lại ảnh với biểu cảm X" + uploaded image)
  let fileData: Array<{ fileUri: string; mimeType: string }> = [];
  if (fileUrls.length > 0) {
    try {
      fileData = await Promise.all(
        fileUrls.map(async (url) => {
          const mimeType = getMimeTypeFromUrl(url);
          const fileUri = await uploadFileToGemini(url, mimeType);
          return { fileUri, mimeType };
        })
      );
    } catch (fileError: any) {
      console.error('Error uploading files to Gemini for image generation:', fileError);
      throw new Error(`Failed to process reference files: ${fileError.message}`);
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
      // Include reference image(s) + text so model can use them (e.g. edit/recreate with new expression)
      const parts: any[] =
        fileData.length > 0
          ? [
              ...fileData.map((f) => ({ fileData: { fileUri: f.fileUri, mimeType: f.mimeType } })),
              { text: fullPrompt }
            ]
          : [{ text: fullPrompt }];

      const result: any = await Promise.race([
        ai.models.generateContent({
          model,
          contents: { parts }
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout))
      ]);

      const responseParts = result?.candidates?.[0]?.content?.parts || [];
      for (const part of responseParts) {
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

