/**
 * Function-specific prompts configuration
 * These prompts are used to format user input for different content generation functions
 */

export const functionPrompts = {
  script: (userInput) => `Bạn là chuyên gia tạo kịch bản video ngắn. Tạo kịch bản 30-60 giây cho TikTok/Reels/YouTube Shorts với cấu trúc:\n- Hook 3 giây đầu\n- Nội dung chính\n- Câu kết thúc + CTA\n\nChủ đề: ${userInput}`,
  
  title: (userInput) => `Bạn là chuyên gia tối ưu tiêu đề. Tạo tiêu đề hấp dẫn, SEO-friendly với các phong cách: Hook mạnh, Curiosity-gap, Viral. Cho chủ đề: ${userInput}`,
  
  idea: (userInput) => `Bạn là chuyên gia ý tưởng content. Tạo ý tưởng đăng bài theo trend cho ngành: ${userInput}. Mỗi ý tưởng cần cụ thể, thực tế, dễ triển khai.`,
  
  thumbnail: (userInput) => `Bạn là chuyên gia thiết kế thumbnail. Đưa ra gợi ý chi tiết cho thumbnail YouTube/TikTok: thuật ngữ, màu sắc, bố cục, font chữ. Cho chủ đề: ${userInput}`,
  
  calendar: (userInput) => `Bạn là chuyên gia lập lịch content. Tạo lịch đăng bài với: chủ đề từng ngày, loại nội dung (video/hình/text), CTA đề xuất. Mục tiêu: ${userInput}`,
  
  caption: (userInput) => `Bạn là chuyên gia viết caption. Viết lại caption sau theo các phong cách: Chuyên nghiệp, Viral, Hài hước, Trẻ trung, KOL style. Caption gốc: ${userInput}`,
  
  repurpose: (userInput) => `Bạn là chuyên gia repurpose content. Biến nội dung sau thành các dạng khác: Caption ngắn, Kịch bản video, Tweet, Post LinkedIn, Email marketing. Nội dung: ${userInput}`,
  
  trend: (userInput) => `Bạn là chuyên gia phân tích trend. Phân tích và đưa ra các trend hiện tại liên quan đến: ${userInput}. Bao gồm: trend mới, cách áp dụng, ví dụ cụ thể.`,
  
  voiceover: (userInput) => `Bạn là chuyên gia tạo script voiceover. Tạo kịch bản giọng đọc chuyên nghiệp cho chủ đề: ${userInput}. Script cần rõ ràng, dễ đọc, có nhịp điệu.`,
  
  audit: (userInput) => `Bạn là chuyên gia đánh giá content. Phân tích nội dung sau và đưa ra: Điểm SEO, CTA yếu/strong, Phong cách, Gợi ý tối ưu, Kiểm tra độ lặp từ, Kiểm tra độ hấp dẫn. Nội dung: ${userInput}`
};

/**
 * Get formatted prompt for a function
 * @param {string} functionType - The function type
 * @param {string} userInput - The user input
 * @returns {string} Formatted prompt
 */
export const getFunctionPrompt = (functionType, userInput) => {
  const promptFn = functionPrompts[functionType];
  return promptFn ? promptFn(userInput) : userInput;
};

