/**
 * Function Options Configuration
 * Centralized configuration for all function-specific options
 */

export const functionOptions = {
  text: {
    hasOptions: true,
    fields: [
      {
        name: 'template',
        label: 'Mẫu',
        type: 'select',
        default: 'blog',
        options: [
          { value: 'blog', label: '📝 Blog', desc: 'Blog post' },
          { value: 'caption', label: '📱 Caption', desc: 'Social media caption' },
          { value: 'email', label: '📧 Email', desc: 'Marketing email' },
          { value: 'product', label: '🛍️ Product', desc: 'Product description' }
        ]
      },
      {
        name: 'tone',
        label: 'Giọng điệu',
        type: 'select',
        default: 'professional',
        options: [
          { value: 'professional', label: 'Chuyên nghiệp' },
          { value: 'casual', label: 'Thân thiện' },
          { value: 'friendly', label: 'Thân mật' },
          { value: 'persuasive', label: 'Thuyết phục' },
          { value: 'humorous', label: 'Hài hước' }
        ]
      },
      {
        name: 'length',
        label: 'Độ dài',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'short', label: 'Ngắn (100-200 từ)' },
          { value: 'medium', label: 'Vừa (300-500 từ)' },
          { value: 'long', label: 'Dài (700-1000 từ)' }
        ]
      }
    ]
  },

  image: {
    hasOptions: true,
    fields: [
      {
        name: 'mode',
        label: 'Model',
        type: 'radio',
        default: 'fast',
        options: [
          { 
            value: 'fast', 
            label: 'Nhanh', 
            desc: 'Pollinations AI • Trả lời nhanh'
          },
          { 
            value: 'highQuality', 
            label: 'Chất lượng cao', 
            desc: 'Stable Image Core • Hình ảnh chất lượng cao'
          }
        ]
      }
    ]
  },

  improver: {
    hasOptions: true,
    fields: [
      {
        name: 'action',
        label: 'Hành động',
        type: 'select',
        default: 'shorten',
        options: [
          { value: 'shorten', label: '📏 Làm ngắn' },
          { value: 'lengthen', label: '📐 Dài hơn' },
          { value: 'tone-happy', label: '😊 Tone vui vẻ' },
          { value: 'tone-sad', label: '😢 Tone buồn' },
          { value: 'add-emoji', label: '😀 Thêm emoji' },
          { value: 'custom', label: '⚙️ Tùy chỉnh' }
        ]
      }
    ]
  },

  script: {
    hasOptions: true,
    fields: [
      {
        name: 'platform',
        label: 'Nền tảng',
        type: 'select',
        default: 'tiktok',
        options: [
          { value: 'tiktok', label: '🎵 TikTok' },
          { value: 'reels', label: '📸 Instagram Reels' },
          { value: 'shorts', label: '▶️ YouTube Shorts' },
          { value: 'universal', label: '🌐 Đa nền tảng' }
        ]
      },
      {
        name: 'duration',
        label: 'Độ dài video',
        type: 'select',
        default: '30s',
        options: [
          { value: '15s', label: '15 giây' },
          { value: '30s', label: '30 giây' },
          { value: '60s', label: '60 giây' },
          { value: '90s', label: '90 giây' }
        ]
      },
      {
        name: 'style',
        label: 'Phong cách',
        type: 'select',
        default: 'engaging',
        options: [
          { value: 'engaging', label: '🔥 Hấp dẫn' },
          { value: 'educational', label: '📚 Giáo dục' },
          { value: 'entertaining', label: '🎭 Giải trí' },
          { value: 'storytelling', label: '📖 Kể chuyện' },
          { value: 'tutorial', label: '🎓 Hướng dẫn' }
        ]
      }
    ]
  },

  title: {
    hasOptions: true,
    fields: [
      {
        name: 'titleCount',
        label: 'Số lượng tiêu đề',
        type: 'select',
        default: '10',
        options: [
          { value: '5', label: '5 tiêu đề' },
          { value: '10', label: '10 tiêu đề' },
          { value: '15', label: '15 tiêu đề' },
          { value: '20', label: '20 tiêu đề' }
        ]
      },
      {
        name: 'style',
        label: 'Phong cách',
        type: 'multiselect',
        default: ['hook', 'curiosity', 'viral'],
        options: [
          { value: 'hook', label: '🎣 Hook mạnh' },
          { value: 'curiosity', label: '🤔 Curiosity Gap' },
          { value: 'viral', label: '🚀 Viral' },
          { value: 'seo', label: '🔍 SEO-friendly' },
          { value: 'emotional', label: '❤️ Cảm xúc' },
          { value: 'number', label: '🔢 Có số' }
        ]
      }
    ]
  },

  idea: {
    hasOptions: true,
    fields: [
      {
        name: 'ideaCount',
        label: 'Số lượng ý tưởng',
        type: 'select',
        default: '30',
        options: [
          { value: '10', label: '10 ý tưởng' },
          { value: '20', label: '20 ý tưởng' },
          { value: '30', label: '30 ý tưởng' },
          { value: '50', label: '50 ý tưởng' }
        ]
      },
      {
        name: 'contentType',
        label: 'Loại nội dung',
        type: 'multiselect',
        default: ['post', 'video'],
        options: [
          { value: 'post', label: '📝 Bài đăng' },
          { value: 'video', label: '🎥 Video' },
          { value: 'story', label: '📱 Story' },
          { value: 'reel', label: '🎬 Reel/Shorts' }
        ]
      }
    ]
  },

  thumbnail: {
    hasOptions: true,
    fields: [
      {
        name: 'platform',
        label: 'Nền tảng',
        type: 'select',
        default: 'youtube',
        options: [
          { value: 'youtube', label: '▶️ YouTube' },
          { value: 'tiktok', label: '🎵 TikTok' },
          { value: 'instagram', label: '📸 Instagram' }
        ]
      },
      {
        name: 'style',
        label: 'Phong cách',
        type: 'select',
        default: 'bold',
        options: [
          { value: 'bold', label: '💥 Bold & Dramatic' },
          { value: 'minimal', label: '✨ Minimal & Clean' },
          { value: 'professional', label: '💼 Professional' },
          { value: 'creative', label: '🎨 Creative' }
        ]
      }
    ]
  },

  calendar: {
    hasOptions: true,
    fields: [
      {
        name: 'duration',
        label: 'Thời gian',
        type: 'select',
        default: '7days',
        options: [
          { value: '7days', label: '7 ngày' },
          { value: '14days', label: '14 ngày' },
          { value: '30days', label: '30 ngày' }
        ]
      },
      {
        name: 'postsPerDay',
        label: 'Số bài/ngày',
        type: 'select',
        default: '1-2',
        options: [
          { value: '1', label: '1 bài/ngày' },
          { value: '1-2', label: '1-2 bài/ngày' },
          { value: '2-3', label: '2-3 bài/ngày' }
        ]
      }
    ]
  },

  caption: {
    hasOptions: true,
    fields: [
      {
        name: 'style',
        label: 'Phong cách',
        type: 'multiselect',
        default: ['professional', 'viral'],
        options: [
          { value: 'professional', label: '💼 Chuyên nghiệp' },
          { value: 'viral', label: '🚀 Viral' },
          { value: 'humorous', label: '😂 Hài hước' },
          { value: 'youthful', label: '🌟 Trẻ trung' },
          { value: 'kol', label: '👑 KOL Style' }
        ]
      },
      {
        name: 'length',
        label: 'Độ dài',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'short', label: 'Ngắn (1-2 dòng)' },
          { value: 'medium', label: 'Vừa (3-5 dòng)' },
          { value: 'long', label: 'Dài (6-10 dòng)' }
        ]
      }
    ]
  },

  repurpose: {
    hasOptions: true,
    fields: [
      {
        name: 'outputFormats',
        label: 'Định dạng đầu ra',
        type: 'multiselect',
        default: ['short_caption', 'video_script', 'tweet'],
        options: [
          { value: 'short_caption', label: '📱 Caption ngắn' },
          { value: 'video_script', label: '🎬 Kịch bản video' },
          { value: 'tweet', label: '🐦 Tweet' },
          { value: 'linkedin', label: '💼 Post LinkedIn' },
          { value: 'email', label: '📧 Email marketing' }
        ]
      }
    ]
  },

  trend: {
    hasOptions: true,
    fields: [
      {
        name: 'platforms',
        label: 'Nền tảng',
        type: 'multiselect',
        default: ['tiktok', 'instagram'],
        options: [
          { value: 'tiktok', label: '🎵 TikTok' },
          { value: 'instagram', label: '📸 Instagram' },
          { value: 'youtube', label: '▶️ YouTube' },
          { value: 'twitter', label: '🐦 Twitter/X' }
        ]
      },
      {
        name: 'timeRange',
        label: 'Khoảng thời gian',
        type: 'select',
        default: 'week',
        options: [
          { value: 'today', label: 'Hôm nay' },
          { value: 'week', label: '7 ngày qua' },
          { value: 'month', label: '30 ngày qua' }
        ]
      }
    ]
  },

  voiceover: {
    hasOptions: true,
    fields: [
      {
        name: 'duration',
        label: 'Độ dài script',
        type: 'select',
        default: '60s',
        options: [
          { value: '30s', label: '30 giây' },
          { value: '60s', label: '60 giây' },
          { value: '2min', label: '2 phút' },
          { value: '5min', label: '5 phút' }
        ]
      },
      {
        name: 'tone',
        label: 'Giọng điệu',
        type: 'select',
        default: 'friendly',
        options: [
          { value: 'professional', label: '💼 Chuyên nghiệp' },
          { value: 'friendly', label: '😊 Thân thiện' },
          { value: 'energetic', label: '⚡ Năng động' },
          { value: 'calm', label: '😌 Bình tĩnh' }
        ]
      }
    ]
  },

  audit: {
    hasOptions: true,
    fields: [
      {
        name: 'checkItems',
        label: 'Kiểm tra',
        type: 'multiselect',
        default: ['seo', 'cta', 'readability'],
        options: [
          { value: 'seo', label: '🔍 SEO Score' },
          { value: 'cta', label: '👆 CTA Analysis' },
          { value: 'readability', label: '📖 Readability' },
          { value: 'engagement', label: '💬 Engagement' },
          { value: 'grammar', label: '✍️ Grammar' }
        ]
      }
    ]
  },

  hashtag: {
    hasOptions: true,
    fields: [
      {
        name: 'count',
        label: 'Số lượng hashtags',
        type: 'select',
        default: '30',
        options: [
          { value: '10', label: '10 hashtags' },
          { value: '20', label: '20 hashtags' },
          { value: '30', label: '30 hashtags' },
          { value: '50', label: '50 hashtags' }
        ]
      },
      {
        name: 'mix',
        label: 'Phối hợp',
        type: 'multiselect',
        default: ['trending', 'niche'],
        options: [
          { value: 'trending', label: '🔥 Trending' },
          { value: 'niche', label: '🎯 Niche-specific' },
          { value: 'branded', label: '🏷️ Branded' }
        ]
      }
    ]
  }
};

/**
 * Get default options for a function
 * @param {string} functionId - Function ID
 * @returns {Object} Default options object
 */
export const getDefaultOptions = (functionId) => {
  const config = functionOptions[functionId];
  if (!config || !config.hasOptions) return {};
  
  const defaults = {};
  config.fields.forEach(field => {
    defaults[field.name] = field.default;
  });
  return defaults;
};

/**
 * Check if a function has options
 * @param {string} functionId - Function ID
 * @returns {boolean}
 */
export const hasOptions = (functionId) => {
  return functionOptions[functionId]?.hasOptions || false;
};

/**
 * Get options config for a function
 * @param {string} functionId - Function ID
 * @returns {Object|null}
 */
export const getFunctionOptions = (functionId) => {
  return functionOptions[functionId] || null;
};

