// Pollinations AI — free image generation (no API key required)

interface PollinationOptions {
  retries?: number;
  timeout?: number;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
}

/**
 * Call Pollinations AI free image generation API
 * Uses the free GET endpoint at image.pollinations.ai — no API key required
 * Returns a data URL (base64) of the generated image
 */
export async function callPollinationAPI(
  prompt: string,
  options: PollinationOptions = {}
): Promise<string> {
  const {
    retries = 2,
    timeout = 90000,
    model = 'flux',
    width = 1024,
    height = 1024,
    seed,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Build the free GET URL
      const encodedPrompt = encodeURIComponent(prompt);
      const params = new URLSearchParams({
        width: String(width),
        height: String(height),
        model,
        nologo: 'true',
        enhance: 'true',
      });
      if (seed !== undefined) {
        params.set('seed', String(seed));
      }

      const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
      console.log(`Pollinations API attempt ${attempt}/${retries}: ${model} ${width}x${height}`);

      const response = await Promise.race([
        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
          },
          redirect: 'follow',
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
      }

      // Read the image as ArrayBuffer → convert to base64 data URL
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;

      if (buffer.length < 1000) {
        throw new Error('Pollinations returned an empty or invalid image');
      }

      console.log(`Pollinations API success: ${buffer.length} bytes`);
      return dataUrl;
    } catch (error: any) {
      lastError = error;
      console.error(`Pollinations API attempt ${attempt}/${retries} failed:`, error.message);

      if (error.message?.includes('429')) {
        // Rate limit — wait before retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
          continue;
        }
      }

      if (attempt === retries) break;

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }

  throw new Error(
    `Failed to generate image with Pollinations AI after ${retries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}
