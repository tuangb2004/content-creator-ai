import { GoogleGenAI } from '@google/genai';
import * as functions from 'firebase-functions';
import * as https from 'https';
import * as http from 'http';

const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not configured. Gemini File API will not be available.');
}

let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

/**
 * Upload a file to Gemini File API and get the file URI
 * Supports: images, PDFs, text files, audio, video
 * @param fileUrl - Public URL of the file (must be accessible from internet)
 * @param mimeType - MIME type of the file
 * @returns File URI that can be used in Gemini API calls
 */
export async function uploadFileToGemini(fileUrl: string, mimeType: string): Promise<string> {
  try {
    // Download file from URL
    const fileBuffer = await downloadFile(fileUrl);
    
    // Upload to Gemini File API (SDK expects string path or Blob; Node 18+ has Blob)
    const ai = getGenAI();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
    const file = await ai.files.upload({
      file: blob,
      config: { mimeType }
    });

    if (!file.uri) {
      throw new Error('Failed to get file URI from Gemini');
    }

    return file.uri;
  } catch (error: any) {
    console.error('Error uploading file to Gemini:', error);
    throw new Error(`Failed to upload file to Gemini: ${error.message}`);
  }
}

/**
 * Download file from URL and return as Buffer
 */
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Get MIME type from file extension or URL
 */
export function getMimeTypeFromUrl(url: string, fileName?: string): string {
  const name = fileName || url.split('/').pop() || '';
  const ext = name.split('.').pop()?.toLowerCase() || '';

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Documents
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    // Video
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
