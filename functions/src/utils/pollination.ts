import * as functions from 'firebase-functions';

// Pollination API key (new system requires API key)
const apiKey = functions.config().pollination?.api_key || process.env.POLLINATION_API_KEY;

interface PollinationOptions {
  retries?: number;
  timeout?: number;
  model?: string;
  width?: number;
  height?: number;
}

/**
 * Call Pollination API for image generation
 * Pollination has migrated to new system - API key required
 */
export async function callPollinationAPI(
  prompt: string,
  options: PollinationOptions = {}
): Promise<string> {
  const { retries = 3, timeout = 60000, model = 'flux', width = 1024, height = 1024 } = options;

  if (!apiKey) {
    throw new Error('Pollination API key is required. Please set POLLINATION_API_KEY in .env file.');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try new API endpoint (enter.pollinations.ai or api.pollinations.ai)
      // Pollinations has migrated - free endpoint no longer works
      const apiUrl = 'https://api.pollinations.ai/generate';
      
        const response = await Promise.race([
        fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              prompt,
              model,
              width,
              height
            })
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);

        if (!response.ok) {
          throw new Error(`Pollination API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
      return data.imageUrl || data.url || data.image || '';
    } catch (error: any) {
      lastError = error;
      console.error(`Pollination API attempt ${attempt}/${retries} failed:`, error.message);

      // Don't retry on certain errors
      if (error.message?.includes('401') || error.message?.includes('403')) {
        throw new Error('Invalid Pollination API key or access denied.');
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

  // Pollinations API is currently unavailable (522 timeout)
  // The service has migrated to a new system (enter.pollinations.ai) but API endpoint is not ready yet
  throw new Error(`Pollination API is currently unavailable. The service has migrated to a new system. Please check enter.pollinations.ai for updates. Error: ${lastError?.message || 'API endpoint timeout (522)'}`);
}

