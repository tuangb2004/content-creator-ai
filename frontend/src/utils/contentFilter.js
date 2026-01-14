/**
 * Content Filter Utility (Frontend)
 * Filters inappropriate content for image generation
 */

// List of inappropriate keywords (case-insensitive)
const inappropriateKeywords = [
  // Explicit sexual content
  'nude', 'naked', 'nsfw', 'porn', 'sex', 'sexual', 'explicit',
  'adult content', 'xxx', 'erotic', 'nudity', 'bare', 'undressed',
  
  // Violence and harmful content
  'violence', 'gore', 'blood', 'weapon', 'gun', 'knife', 'kill', 'murder',
  'suicide', 'self-harm', 'harmful', 'dangerous',
  
  // Hate speech and discrimination
  'hate', 'racist', 'discrimination', 'offensive', 'slur',
  
  // Illegal activities
  'illegal', 'drug', 'cocaine', 'heroin', 'meth', 'drugs',
  
  // Minor-related inappropriate content
  'minor', 'child', 'underage', 'teenager inappropriate',
  
  // Other inappropriate content
  'disturbing', 'graphic', 'extreme'
];

/**
 * Check if prompt contains inappropriate content
 * @param {string} prompt - User's prompt
 * @returns {Object} { isInappropriate: boolean, reason?: string }
 */
export function checkInappropriateContent(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { isInappropriate: false };
  }

  const lowerPrompt = prompt.toLowerCase().trim();
  
  // Check for inappropriate keywords
  for (const keyword of inappropriateKeywords) {
    // Use word boundary to avoid false positives
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerPrompt)) {
      return {
        isInappropriate: true,
        reason: `Nội dung không phù hợp: "${keyword}" không được phép trong mô tả hình ảnh.`
      };
    }
  }

  // Check for common inappropriate patterns
  const inappropriatePatterns = [
    /nude\s+(girl|woman|man|boy|person|body)/i,
    /naked\s+(girl|woman|man|boy|person|body)/i,
    /sexual\s+(content|image|photo|picture)/i,
    /explicit\s+(content|image|photo|picture)/i,
    /adult\s+(content|image|photo|picture)/i,
    /nsfw\s+(content|image|photo|picture)/i,
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(lowerPrompt)) {
      return {
        isInappropriate: true,
        reason: 'Nội dung không phù hợp. Vui lòng sử dụng mô tả phù hợp và tôn trọng.'
      };
    }
  }

  return { isInappropriate: false };
}

