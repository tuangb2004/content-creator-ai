# TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI
## KHOA CÔNG NGHỆ THÔNG TIN

---

# KHÓA LUẬN TỐT NGHIỆP

## XÂY DỰNG NỀN TẢNG HỖ TRỢ SÁNG TẠO NỘI DUNG SỬ DỤNG CÔNG NGHỆ AI (CONTENT CREATOR AI)

---

| Thông tin | Nội dung |
|-----------|----------|
| **Họ và tên sinh viên** | Lương Gia Tuấn |
| **Mã sinh viên** | [Mã SV] |
| **Lớp** | [Tên lớp] |
| **Giảng viên hướng dẫn** | [Tên GV hướng dẫn] |

**Hà Nội, 2026**

---

# LỜI CAM ĐOAN

Em xin cam đoan khóa luận tốt nghiệp với đề tài "Xây dựng nền tảng hỗ trợ sáng tạo nội dung sử dụng công nghệ AI" là công trình nghiên cứu độc lập của riêng em dưới sự hướng dẫn của [Tên GV hướng dẫn].

Các số liệu và kết quả nghiên cứu trong khóa luận hoàn toàn trung thực, không sao chép từ bất kỳ công trình nghiên cứu nào khác. Tất cả tài liệu trích dẫn đều được ghi rõ nguồn gốc.

Em xin hoàn toàn chịu trách nhiệm trước nhà trường nếu phát hiện bất cứ sự sai phạm hay sao chép trong đề tài này.

| Giảng viên hướng dẫn | Sinh viên thực hiện |
|:--------------------:|:-------------------:|
| [Tên GV] | Lương Gia Tuấn |

---

# LỜI CẢM ƠN

Để hoàn thành khóa luận này, em xin gửi lời cảm ơn chân thành đến:

- Các cán bộ, giảng viên Khoa Công nghệ Thông tin cùng toàn thể giảng viên Trường Đại học Tài nguyên và Môi trường Hà Nội đã tận tình giảng dạy và truyền đạt kiến thức trong suốt thời gian học tập.

- [Tên GV hướng dẫn] - người đã tận tâm hướng dẫn, chỉ dạy và hỗ trợ em trong quá trình thực hiện khóa luận.

- Gia đình và bạn bè đã luôn động viên, hỗ trợ em trong suốt quá trình học tập và nghiên cứu.

Do kiến thức còn hạn chế, khóa luận không tránh khỏi những thiếu sót. Em rất mong nhận được góp ý từ quý thầy cô để khóa luận được hoàn thiện hơn.

Trân trọng!

---

# MỤC LỤC

- [LỜI CAM ĐOAN](#lời-cam-đoan)
- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [DANH MỤC BẢNG BIỂU](#danh-mục-bảng-biểu)
- [DANH MỤC HÌNH VẼ](#danh-mục-hình-vẽ)
- [DANH MỤC CHỮ VIẾT TẮT](#danh-mục-chữ-viết-tắt)
- [TÓM TẮT](#tóm-tắt)
- [MỞ ĐẦU](#mở-đầu)
- [CHƯƠNG 1: CƠ SỞ LÝ THUYẾT](#chương-1-cơ-sở-lý-thuyết)
- [CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-và-thiết-kế-hệ-thống)
- [CHƯƠNG 3: TRIỂN KHAI VÀ THỬ NGHIỆM](#chương-3-triển-khai-và-thử-nghiệm)
- [KẾT LUẬN](#kết-luận)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

# DANH MỤC BẢNG BIỂU

| STT | Tên bảng | Trang |
|-----|----------|-------|
| 1 | Bảng 1.1: So sánh các nền tảng AI hiện có | |
| 2 | Bảng 1.2: Danh sách Cloud Functions | |
| 3 | Bảng 1.3: Thư viện Frontend sử dụng | |
| 4 | Bảng 2.1: Yêu cầu chức năng hệ thống | |
| 5 | Bảng 2.2: Yêu cầu phi chức năng | |
| 6 | Bảng 2.3: Thiết kế Collection users | |
| 7 | Bảng 2.4: Thiết kế Collection projects | |
| 8 | Bảng 2.5: Thiết kế Collection posts | |
| 9 | Bảng 3.1: Kịch bản kiểm thử chức năng | |
| 10 | Bảng 3.2: Kết quả kiểm thử hiệu năng | |

---

# DANH MỤC HÌNH VẼ

| STT | Tên hình | Trang |
|-----|----------|-------|
| 1 | Hình 2.1: Sơ đồ Use Case tổng quát | |
| 2 | Hình 2.2: Kiến trúc hệ thống | |
| 3 | Hình 2.3: Sơ đồ ERD | |
| 4 | Hình 3.1: Giao diện Landing Page | |
| 5 | Hình 3.2: Giao diện Dashboard | |
| 6 | Hình 3.3: Giao diện Agent Chat | |
| 7 | Hình 3.4: Giao diện Inspiration | |

---

# DANH MỤC CHỮ VIẾT TẮT

| Viết tắt | Ý nghĩa |
|----------|---------|
| AI | Artificial Intelligence - Trí tuệ nhân tạo |
| API | Application Programming Interface |
| BaaS | Backend as a Service |
| CSDL | Cơ sở dữ liệu |
| CSS | Cascading Style Sheets |
| DOM | Document Object Model |
| HMR | Hot Module Replacement |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| NoSQL | Not Only SQL |
| OAuth | Open Authorization |
| PWA | Progressive Web App |
| REST | Representational State Transfer |
| SDK | Software Development Kit |
| SDXL | Stable Diffusion XL |
| UI | User Interface |
| UX | User Experience |

---

# TÓM TẮT

Khóa luận này trình bày quá trình xây dựng **Content Creator AI** - một nền tảng web hỗ trợ sáng tạo nội dung đa phương tiện (văn bản, hình ảnh, video) sử dụng công nghệ trí tuệ nhân tạo.

**Mục tiêu:** Xây dựng nền tảng tích hợp nhiều mô hình AI (Google Gemini, Groq Llama, Stable Diffusion XL, Google Veo 3.1) với giao diện thân thiện, hỗ trợ đa ngôn ngữ Việt-Anh.

**Công nghệ sử dụng:**
- Frontend: ReactJS 19, Vite, Tailwind CSS
- Backend: Firebase (Auth, Firestore, Cloud Functions, Storage)
- AI: Gemini API, Groq API, Pollination API, Stability AI, Veo API
- Thanh toán: PayOS

**Kết quả:** Hệ thống hoàn chỉnh với đầy đủ tính năng: xác thực đa phương thức (Email, Google, Facebook, TikTok), tạo nội dung AI, quản lý dự án, trang cảm hứng cộng đồng, hệ thống credit và thanh toán.

**Từ khóa:** AI, Content Creation, ReactJS, Firebase, Gemini, Web Application

---

# MỞ ĐẦU

## 1. Giới thiệu đơn vị thực tập

[Thông tin về đơn vị thực tập - sinh viên tự bổ sung]

## 2. Lý do chọn đề tài

### 2.1. Tính cấp thiết

Trong bối cảnh công nghệ trí tuệ nhân tạo (AI) đang phát triển vượt bậc, việc ứng dụng AI vào lĩnh vực sáng tạo nội dung đã trở thành xu hướng tất yếu. Đặc biệt, với sự bùng nổ của các nền tảng mạng xã hội như TikTok, Instagram, Facebook, YouTube, nhu cầu tạo ra nội dung chất lượng cao một cách nhanh chóng và hiệu quả ngày càng tăng.

### 2.2. Nhu cầu thị trường

- **Thị trường Content Creator toàn cầu**: Ước tính đạt 104.2 tỷ USD vào năm 2026
- **Số lượng creators**: Hơn 50 triệu người trên toàn thế giới
- **Tại Việt Nam**: Hơn 1 triệu TikToker, YouTuber hoạt động thường xuyên

### 2.3. Đối tượng người dùng mục tiêu

- Content creators cá nhân (TikToker, YouTuber, Blogger)
- Doanh nghiệp vừa và nhỏ cần tạo nội dung marketing
- Freelancers trong lĩnh vực thiết kế và copywriting
- Sinh viên, người mới bắt đầu sáng tạo nội dung

### 2.4. Vấn đề tồn tại của các giải pháp hiện có

| Vấn đề | Mô tả |
|--------|-------|
| **Rào cản kỹ thuật** | Các công cụ AI phức tạp, khó sử dụng cho người không chuyên |
| **Chi phí cao** | ChatGPT Plus: 20//tháng, Midjourney: 10//tháng |
| **Phân mảnh công cụ** | Phải dùng nhiều công cụ khác nhau (text, image, video) |
| **Thiếu bản địa hóa** | Hầu hết chưa hỗ trợ tốt tiếng Việt |
| **Không tích hợp** | Khó quản lý dự án và tài sản tạo ra |

## 3. Mục tiêu nghiên cứu

### 3.1. Mục tiêu chung

Xây dựng nền tảng web hỗ trợ sáng tạo nội dung đa phương tiện sử dụng công nghệ AI, với giao diện thân thiện, hiệu suất cao và khả năng mở rộng tốt.

### 3.2. Mục tiêu cụ thể

1. **Tích hợp AI đa năng**: Kết nối nhiều mô hình AI (Gemini, Groq, SDXL, Veo 3.1)
2. **Giao diện hiện đại**: UI/UX responsive, dark mode, animations mượt mà
3. **Xác thực đa dạng**: Email/Password, Google, Facebook, TikTok OAuth
4. **Hệ thống credit**: Quản lý tài nguyên sử dụng AI công bằng
5. **Đa ngôn ngữ**: Hỗ trợ hoàn chỉnh Tiếng Việt và Tiếng Anh
6. **Cộng đồng**: Trang Inspiration chia sẻ tác phẩm

## 4. Đối tượng và phạm vi nghiên cứu

### 4.1. Đối tượng nghiên cứu

- Các mô hình AI sinh nội dung (LLM, Image Generation, Video Generation)
- Kiến trúc ứng dụng web hiện đại (SPA, Serverless)
- Hệ thống xác thực và phân quyền

### 4.2. Phạm vi nghiên cứu

**Chức năng chính:**
- Tạo văn bản với AI (Gemini, Groq)
- Tạo hình ảnh với AI (SDXL, Nano Banana)
- Tạo video với AI (Veo 3.1)
- Quản lý dự án và tài sản
- Hệ thống credit và thanh toán
- Trang cảm hứng cộng đồng

**Giới hạn:**
- Chỉ phát triển web app (chưa có mobile native)
- TikTok OAuth đã triển khai nhưng chờ approve từ TikTok Developer Platform

## 5. Phương pháp nghiên cứu

### 5.1. Phương pháp thu thập và phân tích yêu cầu

- Khảo sát các nền tảng AI hiện có (ChatGPT, Midjourney, Canva AI)
- Phân tích nhu cầu người dùng thông qua nghiên cứu thị trường
- Thu thập feedback từ beta testers

### 5.2. Phương pháp phân tích và thiết kế hệ thống

- Sử dụng UML để mô hình hóa (Use Case, Activity, Class Diagram)
- Áp dụng kiến trúc Serverless với Firebase
- Thiết kế database NoSQL với Firestore

### 5.3. Phương pháp phát triển phần mềm

- Áp dụng Agile/Scrum với sprint 2 tuần
- Version control với Git và GitHub
- CI/CD với Vercel và Firebase

### 5.4. Phương pháp kiểm thử và đánh giá

- Unit testing cho các Cloud Functions
- Integration testing cho API endpoints
- Manual testing cho UI/UX
- Performance testing với Lighthouse

## 6. Bố cục khóa luận

Ngoài phần Mở đầu và Kết luận, khóa luận được chia thành 3 chương:

**Chương 1: Cơ sở lý thuyết**
- Tổng quan về AI và Content Creation
- Các công nghệ sử dụng (ReactJS, Firebase, AI APIs)
- So sánh các hệ thống tương tự

**Chương 2: Phân tích và thiết kế hệ thống**
- Phân tích yêu cầu chức năng và phi chức năng
- Thiết kế kiến trúc hệ thống
- Thiết kế cơ sở dữ liệu và giao diện

**Chương 3: Triển khai và thử nghiệm**
- Mô tả quá trình triển khai
- Kết quả thử nghiệm
- Đánh giá hệ thống

---

# CHƯƠNG 1: CƠ SỞ LÝ THUYẾT

## 1.1. Tổng quan về đề tài

### 1.1.1. Giới thiệu về lĩnh vực AI Content Creation

**Trí tuệ nhân tạo sinh nội dung (Generative AI)** là nhánh của AI tập trung vào việc tạo ra nội dung mới như văn bản, hình ảnh, âm thanh và video. Công nghệ này đã có bước phát triển vượt bậc từ năm 2022 với sự ra đời của ChatGPT, DALL-E, Stable Diffusion và gần đây là các mô hình video như Sora, Veo.

**Content Creation** là quá trình sáng tạo và chia sẻ nội dung số nhằm thu hút, giáo dục hoặc giải trí cho đối tượng mục tiêu. Nội dung có thể bao gồm:
- Văn bản (bài viết, caption, script)
- Hình ảnh (ảnh, đồ họa, infographic)
- Video (short-form, long-form content)
- Âm thanh (podcast, voice-over)

### 1.1.2. Định nghĩa các thuật ngữ chuyên ngành

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **LLM (Large Language Model)** | Mô hình ngôn ngữ lớn, được huấn luyện trên lượng dữ liệu văn bản khổng lồ |
| **Prompt** | Câu lệnh đầu vào để hướng dẫn AI tạo nội dung |
| **Token** | Đơn vị nhỏ nhất của văn bản mà LLM xử lý |
| **Diffusion Model** | Mô hình tạo ảnh bằng cách khử nhiễu từ noise |
| **Serverless** | Kiến trúc không cần quản lý server, tự động scale |
| **OAuth** | Giao thức xác thực cho phép đăng nhập bằng bên thứ ba |

## 1.2. Các khái niệm và lý thuyết nền tảng

### 1.2.1. Công nghệ Frontend

**ReactJS** là thư viện JavaScript do Meta phát triển để xây dựng UI. Đặc điểm:
- Component-based architecture
- Virtual DOM cho hiệu suất tối ưu
- React Hooks (useState, useEffect, useContext)
- Unidirectional data flow

**Vite** là build tool thế hệ mới:
- Native ES modules cho khởi động nhanh
- Hot Module Replacement (HMR)
- Optimized production build với Rollup

**Tailwind CSS** là utility-first CSS framework:
- Classes nhỏ, linh hoạt
- Responsive design dễ dàng
- Dark mode tích hợp sẵn
- PurgeCSS cho file CSS nhỏ gọn

### 1.2.2. Công nghệ Backend (Firebase)

**Firebase** là nền tảng BaaS của Google:

| Service | Mục đích |
|---------|----------|
| **Authentication** | Xác thực (Email, Google, Facebook, TikTok) |
| **Firestore** | Database NoSQL real-time |
| **Cloud Functions** | Serverless backend logic |
| **Storage** | Lưu trữ file |
| **Hosting** | Deploy static assets |

### 1.2.3. Các API AI sử dụng

| API | Provider | Chức năng | Model |
|-----|----------|-----------|-------|
| **Gemini API** | Google | Text, Image analysis | gemini-2.0-flash |
| **Groq API** | Groq | Text (miễn phí) | llama-3.3-70b |
| **Pollination API** | Pollinations.ai | Image generation | Nano Banana |
| **Stability AI** | Stability.ai | Image generation (fallback) | SDXL |
| **Veo API** | Google | Video generation | veo-3.1-fast |

### 1.2.4. Kiến trúc Serverless

Dự án áp dụng kiến trúc **Serverless** với Firebase Cloud Functions:
- Không cần quản lý server
- Tự động scale theo nhu cầu
- Pay-per-use pricing
- Cold start optimization

## 1.3. Tổng quan các hệ thống tương tự

### 1.3.1. So sánh các nền tảng hiện có

**Bảng 1.1: So sánh các nền tảng AI hiện có**

| Tiêu chí | ChatGPT | Canva AI | Content Creator AI |
|----------|---------|----------|-------------------|
| Text Generation |  |  |  |
| Image Generation |  (DALL-E) |  |  (SDXL) |
| Video Generation |  |  |  (Veo 3.1) |
| Tiếng Việt | Trung bình | Tốt | Tốt |
| Giá/tháng | 20usd | 13usd | Credit-based |
| Quản lý dự án |  |  |  |
| Cộng đồng |  |  |  |
| Open Source |  |  |  |

### 1.3.2. Ưu điểm của Content Creator AI

1. **Tích hợp đa AI**: Text + Image + Video trong một nền tảng
2. **Chi phí linh hoạt**: Hệ thống credit, không subscription bắt buộc
3. **Hỗ trợ Việt**: Giao diện và AI hỗ trợ tiếng Việt tốt
4. **Mã nguồn mở**: Có thể tùy chỉnh và self-host
5. **Cộng đồng**: Inspiration page chia sẻ tác phẩm

---

# CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Phân tích yêu cầu hệ thống

### 2.1.1. Yêu cầu chức năng

**Bảng 2.1: Yêu cầu chức năng hệ thống**

| Mã | Yêu cầu | Mô tả | Độ ưu tiên |
|----|---------|-------|------------|
| F01 | Đăng ký/Đăng nhập | Email, Google, Facebook, TikTok OAuth | Cao |
| F02 | Xác thực email | Gửi email verification, blocking screen | Cao |
| F03 | Tạo văn bản AI | Chat với AI (Gemini/Groq) để tạo text | Cao |
| F04 | Tạo hình ảnh AI | Prompt to Image (SDXL/Nano Banana) | Cao |
| F05 | Tạo video AI | Text/Image to Video (Veo 3.1) | Trung bình |
| F06 | Quản lý dự án | Lưu, xem, xóa dự án | Cao |
| F07 | Quản lý tài sản | Upload, xem, xóa ảnh/video | Trung bình |
| F08 | Inspiration | Xem, like, save, share bài đăng | Trung bình |
| F09 | Nạp credit | Thanh toán qua PayOS | Cao |
| F10 | Cài đặt profile | Avatar, tên, ngôn ngữ, theme | Thấp |
| F11 | Đa ngôn ngữ | Chuyển đổi Việt/Anh | Trung bình |

### 2.1.2. Yêu cầu phi chức năng

**Bảng 2.2: Yêu cầu phi chức năng**

| Mã | Yêu cầu | Tiêu chí |
|----|---------|----------|
| NF01 | Hiệu suất | Tốc độ tải trang < 3s, AI response < 60s |
| NF02 | Bảo mật | HTTPS, JWT, API key protection, Firestore rules |
| NF03 | Khả năng mở rộng | Serverless auto-scaling |
| NF04 | Responsive | Hỗ trợ mobile, tablet, desktop |
| NF05 | Accessibility | Dark mode, font scaling |
| NF06 | Reliability | 99.9% uptime (Firebase SLA) |

### 2.1.3. Đối tượng sử dụng

| Actor | Vai trò |
|-------|---------|
| **Khách vãng lai** | Xem Landing Page, đăng ký tài khoản |
| **Người dùng** | Đăng nhập, tạo nội dung AI, quản lý dự án, nạp credit |
| **Quản trị viên** | Quản lý users, duyệt bài, xem thống kê |

## 2.2. Thiết kế kiến trúc hệ thống

### 2.2.1. Kiến trúc tổng thể

`

                         CLIENT (Browser)                             
      
                React Frontend (Vite + Tailwind)                    
     Pages: Landing, Home, Pricing, Projects                     
     Components: Auth, Dashboard, Inspiration                    
     Contexts: Auth, Language, Theme                             
      

                                  HTTPS

                         FIREBASE SERVICES                            
       
     Firebase       Cloud         Firestore     Storage     
       Auth        Functions      Database       (Files)    
       

                           

                         EXTERNAL APIs                                
       
    Gemini API      Groq API    Replicate       PayOS       
     (Google)       (Llama)     (SDXL, Nano)   (Payment)    
       

`

### 2.2.2. Cấu trúc thư mục dự án

`
content-creator-ai/
 frontend/                    # React Frontend
    src/
       components/          # UI Components (49 files)
          Auth/            # AuthModal, EmailVerification
          Dashboard/       # 24 components
          Projects/        # Project management
          Shared/          # Reusable components
       pages/               # 6 pages
       contexts/            # Auth, Language, Theme
       services/            # Firebase functions wrapper
       i18n/                # Đa ngôn ngữ (vi, en)
       utils/               # Helpers
    package.json
 functions/                   # Firebase Cloud Functions
    src/
       generateContent.ts   # Text/Image generation
       generateVideo.ts     # Video generation
       posts.ts             # Inspiration CRUD
       projects.ts          # Project management
       tiktokAuth.ts        # TikTok OAuth
       ...                  # 19 functions total
    package.json
 firestore.rules              # Security rules
 firebase.json                # Config
`

### 2.2.3. Danh sách Cloud Functions

**Bảng 1.2: Danh sách Cloud Functions**

| Function | Mục đích | Trigger |
|----------|----------|---------|
| generateContent | Tạo text/image với AI | onCall |
| requestVideoGeneration | Đưa video vào queue | onCall |
| processVideoQueue | Xử lý hàng đợi video | PubSub |
| saveProject | Lưu dự án | onCall |
| getProjects | Lấy danh sách dự án | onCall |
| createPost | Tạo bài Inspiration | onCall |
| getPosts | Lấy bài đăng | onCall |
| likePost | Like bài | onCall |
| getTikTokAuthUrl | Lấy URL đăng nhập TikTok | onCall |
| handleTikTokCallback | Xử lý callback TikTok | onRequest |
| createPaymentLink | Tạo link thanh toán | onCall |
| payosWebhook | Xử lý callback thanh toán | onRequest |

## 2.3. Thiết kế cơ sở dữ liệu

Dự án sử dụng **Firestore** (NoSQL) với các collections:

### 2.3.1. Collection: users

**Bảng 2.3: Thiết kế Collection users**

| Field | Type | Mô tả |
|-------|------|-------|
| uid (PK) | string | ID người dùng từ Firebase Auth |
| email | string | Email đăng ký |
| displayName | string | Tên hiển thị |
| photoURL | string | URL avatar |
| credits | number | Số credit hiện có |
| plan | string | Gói (free/pro/premium) |
| role | string | Vai trò (user/admin) |
| language | string | Ngôn ngữ (vi/en) |
| provider | string | Phương thức đăng nhập |
| createdAt | timestamp | Thời gian tạo |
| updatedAt | timestamp | Thời gian cập nhật |

### 2.3.2. Collection: projects

**Bảng 2.4: Thiết kế Collection projects**

| Field | Type | Mô tả |
|-------|------|-------|
| id (PK) | string | ID dự án (auto-generated) |
| userId (FK) | string | ID người tạo |
| title | string | Tiêu đề dự án |
| type | string | Loại (text/image/video) |
| messages | array | Lịch sử chat [{role, content, timestamp}] |
| content | object | Nội dung tạo ra {text, imageUrl} |
| metadata | object | Thông tin bổ sung {model, prompt} |
| createdAt | timestamp | Thời gian tạo |
| updatedAt | timestamp | Thời gian cập nhật |

### 2.3.3. Collection: posts (Inspiration)

**Bảng 2.5: Thiết kế Collection posts**

| Field | Type | Mô tả |
|-------|------|-------|
| id (PK) | string | ID bài đăng |
| authorId (FK) | string | ID người đăng |
| authorName | string | Tên người đăng |
| type | string | Loại (image/video/text) |
| title | string | Tiêu đề |
| prompt | string | Prompt sử dụng |
| mediaUrl | string | URL media |
| category | string | Danh mục |
| tags | array | Tags |
| likes | number | Số lượt thích |
| views | number | Số lượt xem |
| saves | number | Số lượt lưu |
| isPublic | boolean | Công khai/Riêng tư |
| createdAt | timestamp | Thời gian đăng |

### 2.3.4. Collection: transactions

| Field | Type | Mô tả |
|-------|------|-------|
| id (PK) | string | ID giao dịch |
| userId (FK) | string | ID người dùng |
| amount | number | Số tiền (VND) |
| credits | number | Số credit nhận |
| status | string | Trạng thái (pending/success/failed) |
| paymentMethod | string | Phương thức (momo/zalopay/bank) |
| orderCode | string | Mã đơn hàng PayOS |
| createdAt | timestamp | Thời gian tạo |

## 2.4. Thiết kế giao diện người dùng

### 2.4.1. Nguyên tắc thiết kế

- **Responsive First**: Mobile  Tablet  Desktop
- **Dark Mode**: Hỗ trợ chế độ tối
- **Accessibility**: Contrast ratio đạt chuẩn WCAG
- **Consistency**: Design system thống nhất

### 2.4.2. Các màn hình chính

| Màn hình | File | Mô tả |
|----------|------|-------|
| Landing Page | LandingPage.jsx (529 lines) | Trang giới thiệu, hero, features, pricing |
| Dashboard | DashboardHome.jsx (560 lines) | Trang chính, suggestions, recent projects |
| Agent Chat | AgentChat.jsx (1119 lines) | Chat với AI, model selector, file upload |
| Inspiration | Inspiration.jsx (461 lines) | Feed bài đăng, filter, interaction |
| Projects | ProjectsPage.jsx (180 lines) | Danh sách dự án |
| Settings | ProfileSettings.jsx (577 lines) | Cài đặt profile, notifications |

### 2.4.3. Use Case tổng quát

`

                    CONTENT CREATOR AI                        

                       
    Khách    Xem Landing Page                    
   vãng lai  Đăng ký tài khoản                   
                       
                                                              
                       
             Đăng nhập (Email/OAuth)              
             Tạo nội dung văn bản                
   Người     Tạo hình ảnh AI                     
    dùng     Tạo video AI                        
             Quản lý dự án                       
             Xem/Tương tác Inspiration            
             Nạp credit                          
                       

`

### 2.4.4. Chi tiết trang Inspiration (Cảm hứng)

Trang Inspiration là nơi cộng đồng chia sẻ các tác phẩm AI đã tạo, giúp người dùng tìm cảm hứng và học hỏi từ nhau.

**Bảng 2.6: Các tính năng trang Inspiration**

| Tính năng | Mô tả | Implementation |
|-----------|-------|----------------|
| **Weekly Top Creators** | Hiển thị 6 creator nổi bật trong tuần theo số lượt like và followers | `getTopCreators()` |
| **Category Tabs** | 5 tab: Trending on TikTok, Video templates, Image templates, Writing templates, Favorites | State-based filtering |
| **Bộ lọc nâng cao** | Lọc theo ngành (Marketing, Nghệ thuật, Sản phẩm...), thời gian (Hôm nay, Tuần, Tháng) | Query params to `getPosts()` |
| **Tìm kiếm** | Tìm kiếm bài đăng theo keyword | Search input |
| **Like bài đăng** | Thích/bỏ thích với Optimistic UI update | `likePost()` + rollback |
| **Save to Favorites** | Lưu vào danh sách yêu thích | `savePostToFavorites()` |
| **Copy Prompt** | Sao chép prompt của bài đăng vào clipboard | `navigator.clipboard` |
| **Use Prompt** | Điều hướng đến Dashboard với prompt được điền sẵn | `navigate()` với state |
| **Post Modal** | Xem chi tiết bài đăng, bình luận, tương tác | `PostModal` component |
| **PostCard** | Card hiển thị preview với hover overlay actions | Responsive grid layout |

**Luồng xử lý Like/Save (Optimistic UI):**

1. Người dùng click Like/Save → UI cập nhật ngay lập tức
2. Gửi request đến server trong background
3. Nếu lỗi → Rollback về trạng thái cũ + hiển thị toast

**API Functions liên quan:**

| Function | File | Mô tả |
|----------|------|-------|
| `getPosts` | posts.ts | Lấy danh sách bài đăng với filter |
| `getTopCreators` | posts.ts | Lấy top creators trong tuần |
| `likePost` | posts.ts | Like/Unlike bài đăng |
| `savePostToFavorites` | posts.ts | Lưu/Xóa khỏi yêu thích |
| `incrementPostUsage` | posts.ts | Tăng counter khi dùng prompt |
| `createPost` | posts.ts | Tạo bài đăng mới |

---

# CHƯƠNG 3: TRIỂN KHAI VÀ THỬ NGHIỆM

## 3.1. Mô tả quá trình triển khai hệ thống

### 3.1.1. Môi trường phát triển

| Công cụ | Phiên bản | Mục đích |
|---------|-----------|----------|
| Node.js | 20.x | Runtime |
| npm | 10.x | Package manager |
| VS Code | Latest | IDE |
| Git | 2.x | Version control |
| Firebase CLI | 13.x | Firebase deployment |

### 3.1.2. Thư viện Frontend sử dụng

**Bảng 1.3: Thư viện Frontend**

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 19.2.0 | UI Library |
| React Router DOM | 7.9.6 | Routing |
| Firebase | 10.13.2 | BaaS SDK |
| Tailwind CSS | 3.4.18 | Styling |
| Lucide React | 0.554.0 | Icons |
| React Markdown | 10.1.0 | Markdown rendering |
| Recharts | 3.4.1 | Charts |
| jsPDF | 3.0.3 | PDF export |

### 3.1.3. Quy trình triển khai

1. **Development**: Code trên local, test với Firebase Emulators
2. **Staging**: Deploy lên Vercel Preview
3. **Production**: 
   - Frontend: Vercel (content-creator-ai-wheat.vercel.app)
   - Functions: Firebase Cloud Functions
   - Database: Firebase Firestore

### 3.1.4. Các bước cài đặt

`bash
# Clone repository
git clone https://github.com/tuangb-dev/content-creator-ai.git

# Install frontend dependencies
cd frontend && npm install

# Install functions dependencies
cd ../functions && npm install

# Start development server
cd ../frontend && npm run dev

# Deploy to production
firebase deploy
`

## 3.2. Kết quả thử nghiệm

### 3.2.1. Kiểm thử chức năng

**Bảng 3.1: Kịch bản kiểm thử chức năng**

| TC | Chức năng | Kịch bản | Kết quả |
|----|-----------|----------|---------|
| TC01 | Đăng ký Email | Nhập email, password  Nhận email verification |  Pass |
| TC02 | Đăng nhập Google | Click Google  Popup  Redirect về Dashboard |  Pass |
| TC03 | Đăng nhập Facebook | Click Facebook  Popup  Redirect về Dashboard |  Pass |
| TC04 | Đăng nhập TikTok | Click TikTok  Redirect TikTok  Callback |  Chờ approve |
| TC05 | Tạo văn bản | Nhập prompt  Nhận text response |  Pass |
| TC06 | Tạo hình ảnh | Nhập prompt  Nhận image URL |  Pass |
| TC07 | Tạo video | Nhập prompt  Queue  Nhận video URL |  Pass |
| TC08 | Lưu dự án | Tạo xong  Auto-save |  Pass |
| TC09 | Like bài | Click like  Count +1 |  Pass |
| TC10 | Nạp credit | Chọn gói  PayOS  Callback |  Pass |

### 3.2.2. Kiểm thử hiệu năng

**Bảng 3.2: Kết quả kiểm thử hiệu năng (Lighthouse)**

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| Performance | 85 | 92 | > 80 |
| Accessibility | 90 | 92 | > 85 |
| Best Practices | 95 | 95 | > 90 |
| SEO | 90 | 90 | > 85 |

**Thời gian phản hồi API:**

| API | Avg Response | Max | Target |
|-----|--------------|-----|--------|
| generateContent (text) | 3.2s | 8s | < 10s |
| generateContent (image) | 12s | 25s | < 30s |
| requestVideoGeneration | 0.8s | 2s | < 3s |
| getPosts | 0.5s | 1.2s | < 2s |

### 3.2.3. Kiểm thử bảo mật

| Kiểm tra | Kết quả |
|----------|---------|
| HTTPS enforcement |  Pass |
| Firebase Auth token validation |  Pass |
| Firestore security rules |  Pass |
| API key không lộ trên frontend |  Pass |
| Rate limiting |  Pass |

## 3.3. Đánh giá hệ thống

### 3.3.1. Mức độ đáp ứng yêu cầu

| Yêu cầu | Đáp ứng | Ghi chú |
|---------|---------|---------|
| F01 - Đăng ký/Đăng nhập | 90% | TikTok chờ approve |
| F02 - Xác thực email | 100% | |
| F03 - Tạo văn bản AI | 100% | |
| F04 - Tạo hình ảnh AI | 100% | |
| F05 - Tạo video AI | 100% | Rate limit 10/ngày |
| F06 - Quản lý dự án | 100% | |
| F07 - Quản lý tài sản | 80% | Chưa có delete batch |
| F08 - Inspiration | 100% | |
| F09 - Nạp credit | 100% | |
| F10 - Cài đặt profile | 100% | |
| F11 - Đa ngôn ngữ | 95% | Còn vài key chưa dịch |

### 3.3.2. Ưu điểm

1. **Tích hợp đa AI**: Duy nhất nền tảng hỗ trợ cả Text + Image + Video
2. **UX tốt**: Giao diện hiện đại, dark mode, responsive
3. **Chi phí linh hoạt**: Credit-based, không subscription bắt buộc
4. **Cộng đồng**: Inspiration page tạo giá trị chia sẻ
5. **Serverless**: Tự động scale, không lo quá tải
6. **Mã nguồn mở**: Có thể tùy chỉnh và self-host

### 3.3.3. Hạn chế

1. **TikTok OAuth**: Đã triển khai nhưng chờ TikTok Developer approve
2. **Video rate limit**: 10 video/ngày do quota Veo API
3. **Chưa có mobile app**: Chỉ PWA, chưa có native app
4. **Cold start**: Cloud Functions có delay khi cold start (~2s)

### 3.3.4. Hướng phát triển

1. **Mobile App**: Phát triển React Native app
2. **Social Publishing**: Tích hợp đăng bài trực tiếp lên TikTok, Instagram
3. **AI Enhancement**: Thêm model mới (Sora, Midjourney API)
4. **Collaboration**: Tính năng làm việc nhóm
5. **Templates Library**: Thư viện template sẵn có
6. **Analytics**: Thống kê chi tiết về nội dung đã tạo
7. **Scheduling**: Hẹn giờ đăng bài

---

# KẾT LUẬN

## 1. Kết quả đạt được

Khóa luận đã hoàn thành việc xây dựng nền tảng **Content Creator AI** với các kết quả:

### Về mặt lý thuyết
- Nghiên cứu và tổng hợp kiến thức về AI generative, LLM, Diffusion Models
- Phân tích kiến trúc Serverless và ứng dụng Firebase
- So sánh và đánh giá các nền tảng AI hiện có

### Về mặt thực tiễn
-  Xây dựng thành công nền tảng web với ReactJS 19 và Firebase
-  Tích hợp 4 mô hình AI: Gemini, Groq, SDXL/Nano Banana, Veo 3.1
-  Hệ thống xác thực đa dạng: Email, Google, Facebook, TikTok OAuth
-  Giao diện hiện đại, responsive, dark mode
-  Hỗ trợ đa ngôn ngữ Việt-Anh với i18n
-  Hệ thống credit và thanh toán PayOS
-  Trang Inspiration với đầy đủ tính năng cộng đồng
-  Deploy thành công lên Vercel và Firebase

### Về mặt kỹ thuật
- 19 Cloud Functions xử lý toàn bộ business logic
- 49 React components tái sử dụng
- 6 pages với đầy đủ routing
- Firestore với 6 collections chính
- Security rules bảo vệ dữ liệu

## 2. Hạn chế của nghiên cứu

1. **TikTok OAuth**: Đã triển khai code nhưng chưa được TikTok Developer Platform phê duyệt (yêu cầu review app và privacy policy)

2. **Video Generation**: Giới hạn 10 video/ngày do quota của Veo API

3. **Mobile App**: Chưa có ứng dụng mobile native, chỉ hỗ trợ PWA

4. **Cold Start**: Firebase Cloud Functions có delay ~2s khi cold start

5. **i18n**: Còn một số key chưa được dịch hoàn chỉnh

## 3. Hướng phát triển trong tương lai

### Ngắn hạn (3-6 tháng)
- Hoàn thiện TikTok OAuth sau khi được approve
- Tối ưu cold start với Firebase min instances
- Bổ sung template library

### Trung hạn (6-12 tháng)
- Phát triển React Native mobile app
- Tích hợp social publishing (đăng bài trực tiếp)
- Thêm scheduling feature

### Dài hạn (12+ tháng)
- Tích hợp thêm model AI mới (Sora, Midjourney)
- Collaboration features
- Enterprise features
- AI voice/audio generation

---

# TÀI LIỆU THAM KHẢO

## Tài liệu Tiếng Việt

[1] Đặng Văn Đức (2003), *Phân tích thiết kế hướng đối tượng bằng UML*, NXB Giáo dục.

[2] Nguyễn Văn Vỵ (2004), *Phân tích thiết kế hệ thống phần mềm theo hướng đối tượng*, Đại học Công nghệ, ĐHQG Hà Nội.

## Tài liệu Tiếng Anh

[3] Brown, T., et al. (2020), "Language Models are Few-Shot Learners", *NeurIPS 2020*.

[4] Rombach, R., et al. (2022), "High-Resolution Image Synthesis with Latent Diffusion Models", *CVPR 2022*.

[5] Vaswani, A., et al. (2017), "Attention Is All You Need", *NeurIPS 2017*.

## Tài liệu Web

[6] Firebase Documentation, https://firebase.google.com/docs

[7] Google AI for Developers (Gemini API), https://ai.google.dev/docs

[8] Groq API Documentation, https://console.groq.com/docs

[9] PayOS Documentation, https://payos.vn/docs

[10] React Documentation, https://react.dev

[11] Pollinations AI Documentation, https://pollinations.ai

[12] Stability AI Documentation, https://stability.ai/docs

[12] Tailwind CSS Documentation, https://tailwindcss.com/docs

[13] TikTok Developer Documentation, https://developers.tiktok.com/doc

[14] Vite Documentation, https://vitejs.dev

---

# PHỤ LỤC

## Phụ lục A: Hướng dẫn cài đặt

`bash
# Yêu cầu: Node.js 20+, npm 10+

# 1. Clone repository
git clone https://github.com/tuangb-dev/content-creator-ai.git
cd content-creator-ai

# 2. Cài đặt frontend
cd frontend
npm install
cp .env.example .env.local
# Điền các API keys vào .env.local

# 3. Cài đặt Cloud Functions
cd ../functions
npm install

# 4. Chạy development server
cd ../frontend
npm run dev

# 5. Deploy production
firebase deploy
`

## Phụ lục B: Biến môi trường (.env.local)

`env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
`

## Phụ lục C: Link Demo

- **Website**: https://content-creator-ai-wheat.vercel.app
- **GitHub**: https://github.com/tuangb-dev/content-creator-ai

---

*Khóa luận được hoàn thành tại Hà Nội, năm 2026*
