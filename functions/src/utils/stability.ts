import * as functions from 'firebase-functions';

// Stability AI API key
const apiKey = functions.config().stability?.api_key || process.env.STABILITY_API_KEY;

interface StabilityOptions {
  retries?: number;
  timeout?: number;
  model?: string;
  width?: number;
  height?: number;
  style_preset?: string;
}

const STABILITY_MAX_PROMPT_LENGTH = 2000;

/**
 * Sanitize prompt for Stability AI: must be 1–2000 characters.
 */
function sanitizePromptForStability(prompt: string): string {
  const trimmed = (prompt || '').trim();
  if (trimmed.length === 0) {
    throw new Error('Prompt is empty. Stability AI requires a text prompt between 1 and 2000 characters.');
  }
  if (trimmed.length > STABILITY_MAX_PROMPT_LENGTH) {
    return trimmed.slice(0, STABILITY_MAX_PROMPT_LENGTH - 3) + '...';
  }
  return trimmed;
}

/**
 * Call Stability AI API for image generation
 * Stability AI provides high-quality image generation
 */
export async function callStabilityAPI(
  prompt: string,
  options: StabilityOptions = {}
): Promise<string> {
  const { 
    retries = 3, 
    timeout = 60000, 
    model = 'stable-diffusion-xl-1024-v1-0', // SDXL 1.0
    width = 1024, 
    height = 1024,
    style_preset
  } = options;

  if (!apiKey) {
    throw new Error('Stability AI API key is required. Please set STABILITY_API_KEY in .env file.');
  }

  const sanitizedPrompt = sanitizePromptForStability(prompt);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Stability AI API endpoint - use model in URL
      const apiUrl = `https://api.stability.ai/v1/generation/${model}/text-to-image`;
      
      const requestBody: any = {
        text_prompts: [
          {
            text: sanitizedPrompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height,
        width,
        steps: 30,
        samples: 1
      };

      if (style_preset) {
        requestBody.style_preset = style_preset;
      }

      const response = await Promise.race([
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stability AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Stability AI returns base64 images in artifacts array
      if (data.artifacts && data.artifacts.length > 0) {
        const imageBase64 = data.artifacts[0].base64;
        // Return data URL for base64 image
        return `data:image/png;base64,${imageBase64}`;
      }

      throw new Error('No image generated in response');
    } catch (error: any) {
      lastError = error;
      console.error(`Stability AI API attempt ${attempt}/${retries} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('401') || error.message?.includes('403')) {
        throw new Error('Invalid Stability AI API key or access denied.');
      }

      if (error.message?.includes('429')) {
        // Rate limit - wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      }

      // Last attempt - throw error
      if (attempt === retries) {
        break;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  throw new Error(`Failed to generate image with Stability AI after ${retries} attempts: ${lastError?.message || 'Unknown error'}`);
}

