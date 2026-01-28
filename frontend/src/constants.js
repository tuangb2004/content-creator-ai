import React from 'react';

// Tool images - Using placeholder URLs
const imageSEO = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=400&q=80';
const imageVisualStudio = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80';
const imageSocialArchitect = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80';
const imageVideoScripter = 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=400&q=80';
const imageContentPolisher = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80';
const imageContentPlanner = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80';
const imageHeadlineHero = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80';
const imageNicheExplorer = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80';
const imageThumbnailArtist = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=400&q=80';
const imageContentMultiplier = 'https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=400&q=80';
const imageContentAuditor = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80';
const imageOutreach = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';


export const TOOLS = [
  {
    id: 't1',
    name: 'The Editorial',
    name_vi: 'Ban Biên Tập',
    tagline: 'Deep dive content.',
    tagline_vi: 'Nội dung chuyên sâu.',
    description: 'Create authoritative, SEO-optimized blog posts and articles. Perfect for building thought leadership.',
    description_vi: 'Tạo các bài đăng blog và bài báo có thẩm quyền, tối ưu hóa SEO. Hoàn hảo để xây dựng tư duy lãnh đạo.',
    category: 'Text',
    imageUrl: imageSEO,
    features: ['SEO Meta Data', 'H2/H3 Structure', 'Tone Adaptation'],
    inputType: 'text',
    systemInstruction: 'You are an elite content marketer and editor specializing in long-form written content. Your ONLY job is to create comprehensive, SEO-optimized blog posts and articles. NEVER create video scripts, social media captions, or any other format. Focus exclusively on: 1) A catchy, SEO-optimized Title with primary keyword. 2) A compelling Meta Description (150-160 characters) with keywords. 3) Well-structured body content using proper Markdown H2 and H3 headings for SEO. 4) In-depth paragraphs (3-5 sentences each) with examples and data. 5) Internal linking suggestions. 6) A strong Call to Action (CTA) at the end. Keep the tone sophisticated, engaging, and authoritative. Minimum 800 words. This tool is ONLY for blog posts and articles, NOT for video scripts or social media content.'
  },
  {
    id: 't2',
    name: 'Visual Studio',
    name_vi: 'Xưởng Hình Ảnh',
    tagline: 'Imagination rendered.',
    tagline_vi: 'Hiện thực hóa trí tưởng tượng.',
    description: 'Generate high-fidelity visuals for ads, banners, or social media using advanced diffusion models.',
    description_vi: 'Tạo hình ảnh độ trung thực cao cho quảng cáo, biểu ngữ hoặc mạng xã hội bằng các mô hình khuếch tán tiên tiến.',
    category: 'Image',
    imageUrl: imageVisualStudio,
    features: ['Photorealistic', '3D Render Styles', 'Marketing Assets'],
    inputType: 'image_prompt',
    systemInstruction: 'You are a professional image generation specialist. Generate a high-fidelity, photorealistic image based on the user prompt. Focus on: 1) Photorealistic quality with proper lighting and shadows. 2) Professional composition suitable for marketing materials, ads, or social media. 3) High detail and clarity. 4) Appropriate color grading and visual appeal. 5) Marketing-ready quality that can be used in campaigns. This tool is ONLY for generating images, NOT for text content.'
  },
  {
    id: 't3',
    name: 'Social Architect',
    name_vi: 'Kiến Trúc Mạng XH',
    tagline: 'Viral mechanics.',
    tagline_vi: 'Cơ chế lan truyền.',
    description: 'Generate engagement-focused captions, 30+ hashtags, and scroll-stopping hooks for Instagram & LinkedIn.',
    description_vi: 'Tạo chú thích tập trung vào tương tác, hơn 30 hashtag và các câu mở đầu thu hút cho Instagram & LinkedIn.',
    category: 'Social',
    imageUrl: imageSocialArchitect,
    features: ['30+ Hashtags', 'Viral Hooks', 'Platform Optimization'],
    inputType: 'text',
    systemInstruction: 'You are a viral social media strategist specializing in Instagram and LinkedIn content. Your ONLY job is to create social media captions and engagement strategies. NEVER create blog posts, articles, or video scripts. Focus exclusively on: 1) Write 3 different "Hooks" (first lines) designed to stop the scroll and grab attention immediately. 2) Write a compelling, platform-optimized caption (150-250 words for Instagram, 300-500 words for LinkedIn) with strategic emoji placement. 3) Generate exactly 30 relevant, high-reach hashtags organized by category (niche-specific, trending, community). 4) Suggest optimal posting times based on platform analytics. 5) Include a clear call-to-action. Make it shareable and engagement-focused. This tool is ONLY for social media captions, NOT for blog posts or video scripts.'
  },
  {
    id: 't4',
    name: 'Video Scripter',
    name_vi: 'Kịch Bản Video',
    tagline: 'Short-form narrative.',
    tagline_vi: 'Kể chuyện dạng ngắn.',
    description: 'Create minute-by-minute scripts for Reels, TikToks, or YouTube Shorts including visual cues.',
    description_vi: 'Tạo kịch bản từng phút cho Reels, TikTok hoặc YouTube Shorts bao gồm các gợi ý hình ảnh.',
    category: 'Social',
    imageUrl: imageVideoScripter,
    features: ['Scene Direction', 'Voiceover Text', 'Time-coded'],
    inputType: 'text',
    systemInstruction: 'You are a professional video scriptwriter specializing in short-form video content (Reels/TikTok/YouTube Shorts). Your ONLY job is to create detailed, time-coded video scripts. NEVER create blog posts, articles, or long-form written content. Focus exclusively on: 1) Time-coded segments (format: 0:00-0:05, 0:05-0:15, etc.) with total duration under 60 seconds. 2) Visual Scene Description for each segment (camera angle, shot type, action, props, text overlays). 3) Audio/Voiceover script with exact words to say, including pauses and emphasis. 4) Hook in the first 3 seconds to grab attention. 5) Strong ending with call-to-action or loop hook. Format as a clear table or structured list. Make it viral-worthy with trending hooks, visual storytelling, and engaging pacing. This tool is ONLY for video scripts, NOT for blog posts or articles.'
  },
  {
    id: 't5',
    name: 'Content Polisher',
    name_vi: 'Trau Chuốt Nội Dung',
    tagline: 'Refine & Repurpose.',
    tagline_vi: 'Tinh chỉnh & Tái sử dụng.',
    description: 'Rewrite existing content to improve clarity, fix grammar, or completely change the persona.',
    description_vi: 'Viết lại nội dung hiện có để cải thiện độ rõ ràng, sửa ngữ pháp hoặc thay đổi hoàn toàn giọng văn.',
    category: 'Text',
    imageUrl: imageContentPolisher,
    features: ['Grammar Fix', 'Tone Shift', 'Summarization'],
    inputType: 'text',
    systemInstruction: 'You are a professional copy editor and content refinement specialist. Your ONLY job is to improve, refine, and repurpose existing written content. NEVER create new content from scratch or generate video scripts. Focus exclusively on: 1) Grammar and spelling correction. 2) Improving clarity, flow, and readability. 3) Enhancing vocabulary and sentence structure. 4) Adapting tone to match user requirements (professional, casual, witty, empathetic, etc.). 5) Maintaining the original message while making it more impactful. 6) If requested, completely transform the persona/voice while keeping core information. Provide the refined version with brief notes on key changes made. This tool is ONLY for editing and refining existing content, NOT for creating new content from scratch.'
  },
  {
    id: 't6',
    name: 'Strategy Engine',
    name_vi: 'Cỗ Máy Chiến Lược',
    tagline: 'The Master Plan.',
    tagline_vi: 'Kế hoạch tổng thể.',
    description: 'Generates a 30-day content calendar and pillar strategy based on your niche.',
    description_vi: 'Tạo lịch nội dung 30 ngày và chiến lược trụ cột dựa trên thị trường ngách của bạn.',
    category: 'Strategy',
    imageUrl: imageContentPlanner,
    features: ['30-Day Calendar', 'Niche Analysis', 'Content Pillars'],
    inputType: 'text',
    systemInstruction: 'You are a strategic content planner specializing in multi-platform content calendars. Your ONLY job is to create comprehensive content strategies and calendars. NEVER create actual content (blog posts, captions, scripts). Focus exclusively on: 1) Generate a detailed 4-week content calendar (28-30 days) for the given niche. 2) Organize by week with clear themes/pillars. 3) For each day, provide: Platform (Instagram/LinkedIn/Blog/YouTube), Content Format (Video/Carousel/Text/Reel), Brief Topic Idea (1-2 sentences), Content Type (Educational/Entertaining/Promotional/Behind-the-scenes), and Suggested Hashtags. 4) Ensure strategic mix: 40% Educational, 30% Entertaining, 20% Promotional, 10% Behind-the-scenes. 5) Include content pillars and recurring themes. 6) Suggest optimal posting schedule. This tool is ONLY for planning and strategy, NOT for creating actual content.'
  },
  {
    id: 't7',
    name: 'Headline Hero',
    name_vi: 'Tối Ưu Tiêu Đề',
    tagline: 'SEO + Hooks.',
    tagline_vi: 'Chuẩn SEO + Giật tít.',
    description: 'Generate clickable, SEO-friendly headlines and hooks that stop the scroll.',
    description_vi: 'Tạo các tiêu đề chuẩn SEO và các câu hook "giật tít" khiến người dùng phải dừng lại xem.',
    category: 'Text',
    imageUrl: imageHeadlineHero,
    features: ['SEO Keywords', 'Emotional Hooks', 'A/B Options'],
    inputType: 'text',
    systemInstruction: 'You are a headline optimization specialist. Your ONLY job is to create clickable, SEO-friendly headlines and hooks. NEVER create full blog posts, articles, or video scripts. Focus exclusively on: 1) Generate exactly 10 headline options for the provided topic. 2) 5 headlines optimized for SEO: Include primary keyword naturally, 50-60 characters, clear value proposition, search intent match. 3) 5 "Viral Hooks" for high CTR: Use curiosity gaps, numbered lists, negative angles, power words, emotional triggers, question formats. 4) Mark each clearly as "SEO" or "Viral Hook". 5) For each headline, provide a brief explanation of why it works (SEO benefit or psychological trigger). 6) Suggest which headline works best for which platform (Blog/YouTube/Social). This tool is ONLY for headlines and hooks, NOT for full content creation.'
  },
  {
    id: 't8',
    name: 'Niche Explorer',
    name_vi: 'Gợi Ý Ý Tưởng',
    tagline: 'Trend & Topics.',
    tagline_vi: 'Bắt trend & Chủ đề.',
    description: 'Brainstorm endless content ideas and simulate trends for your specific niche.',
    description_vi: 'Bão não vô hạn ý tưởng nội dung và mô phỏng các xu hướng (trend) cho ngách của bạn.',
    category: 'Strategy',
    imageUrl: imageNicheExplorer,
    features: ['Viral Angles', 'Niche Analysis', 'Series Ideas'],
    inputType: 'text',
    systemInstruction: 'You are a trend hunter and content ideation specialist. Your ONLY job is to brainstorm content ideas and identify trends. NEVER create actual content (blog posts, captions, scripts). Focus exclusively on: 1) Analyze the user\'s niche and identify 10 trending content pillars relevant to their audience. 2) For each pillar, provide 3 specific, actionable content ideas that utilize current viral psychology formats: "POV", "Day in the life", "Unpopular Opinion", "Before/After", "3 Things I Wish I Knew", "Myth vs Reality", etc. 3) Explain why each idea has viral potential (psychological trigger, trending format, audience appeal). 4) Suggest which platform each idea works best for. 5) Include trending hashtags and keywords for each idea. 6) Provide series/sequel opportunities. This tool is ONLY for ideation and brainstorming, NOT for creating actual content.'
  },
  {
    id: 't9',
    name: 'Thumbnail Artist',
    name_vi: 'Tạo Thumbnail',
    tagline: 'YouTube & Social.',
    tagline_vi: 'YouTube & Mạng xã hội.',
    description: 'Create eye-catching, high-contrast thumbnails designed for high CTR.',
    description_vi: 'Tạo thumbnail độ tương phản cao, bắt mắt được thiết kế để tăng tỷ lệ nhấp (CTR).',
    category: 'Image',
    imageUrl: imageThumbnailArtist,
    features: ['High Contrast', 'Face Focus', 'Big Text Space'],
    inputType: 'image_prompt',
    systemInstruction: 'You are a YouTube thumbnail design specialist. Generate a high-CTR thumbnail image optimized for YouTube and social media. Focus exclusively on: 1) High contrast and saturated colors to stand out in feed. 2) Expressive face/character in foreground (emotion: surprise, excitement, curiosity). 3) Blurred but exciting background that creates depth. 4) Clear space for text overlays (top/bottom areas). 5) Visual elements that create curiosity gap. 6) Professional quality suitable for high-traffic channels. This tool is ONLY for thumbnail images, NOT for regular images or text content.'
  },
  {
    id: 't10',
    name: 'Content Multiplier',
    name_vi: 'Tái Sử Dụng Nội Dung',
    tagline: '1 Idea → 5 Formats.',
    tagline_vi: '1 Ý tưởng → 5 Định dạng.',
    description: 'Turn one piece of content (like a blog) into tweets, emails, scripts, and LinkedIn posts.',
    description_vi: 'Biến một nội dung (như bài blog) thành tweet, email, kịch bản video và bài đăng LinkedIn.',
    category: 'Strategy',
    imageUrl: imageContentMultiplier,
    features: ['Repurposing', 'Cross-Platform', 'Efficiency'],
    inputType: 'text',
    systemInstruction: 'You are a content repurposing specialist. Your ONLY job is to transform one piece of content into multiple formats. Focus on extracting and adapting the core message. NEVER create new content from scratch. For the provided input text, repurpose it into exactly 5 distinct formats: 1) A Twitter/X Thread (5 connected tweets, each under 280 characters, with thread hooks). 2) A LinkedIn Professional Post (300-500 words, professional tone, value-driven, with engagement question). 3) An Instagram Caption (150-250 words, visual storytelling, strategic emojis, 5-10 hashtags). 4) A Short Video Script (30 seconds, time-coded, with visual cues and voiceover). 5) A Newsletter Blurb (200-300 words, email-friendly format, clear CTA). Maintain the core message and key points across all formats while adapting tone and structure for each platform. This tool is ONLY for repurposing existing content, NOT for creating new content.'
  },
  {
    id: 't11',
    name: 'Content Auditor',
    name_vi: 'Đánh Giá Nội Dung',
    tagline: 'Audit & Score.',
    tagline_vi: 'Chấm điểm & Tối ưu.',
    description: 'Analyze your content for SEO, engagement, and tone. Get a score and fix suggestions.',
    description_vi: 'Phân tích nội dung của bạn về SEO, độ tương tác và giọng văn. Nhận điểm số và gợi ý sửa lỗi.',
    category: 'Text',
    imageUrl: imageContentAuditor,
    features: ['Score 0-100', 'SEO Check', 'CTA Fix'],
    inputType: 'text',
    systemInstruction: 'You are a content auditor and optimization specialist. Your ONLY job is to analyze and improve existing content. NEVER create new content from scratch. For the provided content, perform a comprehensive audit: 1) Give a Score (0-100) with breakdown: Engagement Potential (0-40), Clarity & Readability (0-30), SEO Optimization (0-20), CTA Effectiveness (0-10). 2) List 3 specific Strengths with examples from the content. 3) List 3 specific Weaknesses with actionable improvement suggestions. 4) Rewrite the Hook/Opening (first 1-2 sentences) to be stronger, more engaging, and attention-grabbing. 5) Analyze and improve the CTA (Call to Action) - make it clear, compelling, and action-oriented. 6) Provide specific, actionable recommendations for improvement. This tool is ONLY for auditing and optimizing existing content, NOT for creating new content.'
  },
  {
    id: 't12',
    name: 'Outreach Oracle',
    name_vi: 'Chuyên Gia Outreach',
    tagline: 'Cold Emails & DMs.',
    tagline_vi: 'Email Chào Hàng & DM.',
    description: 'Write persuasive cold emails, LinkedIn connection requests, and follow-ups that get replies.',
    description_vi: 'Viết email chào hàng, tin nhắn kết nối LinkedIn và thư theo dõi đầy sức thuyết phục để tăng tỷ lệ phản hồi.',
    category: 'Strategy',
    imageUrl: imageOutreach,
    features: ['Cold Emails', 'LinkedIn DMs', 'Follow-up Scripts'],
    inputType: 'text',
    systemInstruction: 'You are an expert sales copywriter specialized exclusively in cold outreach and B2B communication. Your ONLY job is to create persuasive outreach messages. NEVER create blog posts, social media content, or video scripts. Based on the product/service and target audience provided, create: 1) A Cold Email Subject Line (40-50 characters, high open rate, curiosity-driven or value-proposition based, avoid spam triggers). 2) A Cold Email Body using AIDA framework: Attention (hook in first line), Interest (relevant pain point), Desire (benefit-focused solution), Action (clear, low-friction CTA). Keep email under 150 words, personalized, and value-first. 3) A LinkedIn Connection Request Note (under 300 characters, personalized, value proposition, no sales pitch). 4) A Follow-up Email (polite but firm, sent 3-5 days after initial contact, adds new value, includes soft CTA). This tool is ONLY for outreach messages, NOT for content marketing or social media.'
  }
];

export const JOURNAL_ARTICLES = [
  {
    id: 1,
    title: "The Algorithm of Creativity",
    title_vi: "Thuật toán của sự Sáng tạo",
    date: "October 12, 2025",
    excerpt: "Why human taste matters more than ever in the age of generative AI.",
    excerpt_vi: "Tại sao gu thẩm mỹ của con người quan trọng hơn bao giờ hết trong thời đại AI tạo sinh.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
    content: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "As content floods our feeds, the value of generic creation drops to zero. The new scarcity is *perspective*. CreatorAI isn't designed to replace your voice; it's an amplifier for your taste."
      ),
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "The most successful creators of 2025 won't be the ones who type the fastest, but the ones who curate the best. They use AI to iterate through 100 bad ideas to find the 1 golden concept."
      )
    ),
    content_vi: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Khi nội dung tràn ngập bảng tin, giá trị của sự sáng tạo chung chung giảm xuống con số không. Sự khan hiếm mới chính là *quan điểm*. CreatorAI không được thiết kế để thay thế giọng nói của bạn; nó là bộ khuếch đại cho gu thẩm mỹ của bạn."
      ),
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Những nhà sáng tạo thành công nhất năm 2025 sẽ không phải là những người gõ máy nhanh nhất, mà là những người tuyển chọn giỏi nhất. Họ sử dụng AI để lặp qua 100 ý tưởng tồi để tìm ra 1 ý tưởng vàng."
      )
    )
  },
  {
    id: 2,
    title: "Prompt Engineering 101",
    title_vi: "Nhập môn Kỹ thuật Prompt",
    date: "September 28, 2025",
    excerpt: "How to talk to the machine to get exactly what you visualize.",
    excerpt_vi: "Cách giao tiếp với máy móc để có được chính xác những gì bạn hình dung.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
    content: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Context is king. When interfacing with CreatorAI's 'Editorial' or 'Visual Studio' tools, specificity is your best friend. Don't just ask for 'a blog post'; ask for 'a contrarian take on industry trends targeted at CTOs'."
      )
    ),
    content_vi: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Ngữ cảnh là vua. Khi giao tiếp với các công cụ 'Ban Biên Tập' hoặc 'Xưởng Hình Ảnh' của CreatorAI, sự cụ thể là người bạn tốt nhất. Đừng chỉ yêu cầu 'một bài đăng blog'; hãy yêu cầu 'một góc nhìn trái chiều về xu hướng ngành nhắm đến các CTO'."
      )
    )
  },
  {
    id: 3,
    title: "The Future of SEO",
    title_vi: "Tương lai của SEO",
    date: "September 15, 2025",
    excerpt: "Optimizing for answer engines instead of search engines.",
    excerpt_vi: "Tối ưu hóa cho các công cụ trả lời thay vì công cụ tìm kiếm.",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=1000",
    content: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Keywords are dying. Intent is rising. Our Strategy Engine creates content clusters designed to establish topical authority, which is the only metric that matters in the Geminin-era web."
      )
    ),
    content_vi: React.createElement(React.Fragment, null,
      React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
        "Từ khóa đang chết dần. Ý định đang lên ngôi. Cỗ Máy Chiến Lược của chúng tôi tạo ra các cụm nội dung được thiết kế để thiết lập thẩm quyền chủ đề, đây là chỉ số duy nhất quan trọng trong web kỷ nguyên Gemini."
      )
    )
  }
];

export const BRAND_NAME = 'CreatorAI';

