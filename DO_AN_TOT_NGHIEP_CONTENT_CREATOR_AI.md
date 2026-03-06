# TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI
## KHOA CÔNG NGHỆ THÔNG TIN

---

# XÂY DỰNG NỀN TẢNG HỖ TRỢ SÁNG TẠO NỘI DUNG SỬ DỤNG CÔNG NGHỆ AI
## (CONTENT CREATOR AI)

---

**Họ tên sinh viên:** Lương Gia Tuấn  
**Ngành đào tạo:** Công nghệ thông tin  

**NGƯỜI HƯỚNG DẪN:** [Tên giảng viên hướng dẫn]

Hà Nội – Năm 2026

---

## LỜI CAM ĐOAN

Em xin cam đoan khóa luận tốt nghiệp với đề tài "Xây dựng nền tảng hỗ trợ sáng tạo nội dung sử dụng công nghệ AI" là nghiên cứu độc lập của riêng em. Các số liệu và kết quả nghiên cứu hoàn toàn trung thực, không đạo nhái hay sao chép từ bất kỳ một công trình nghiên cứu nào khác. Tất cả tài liệu trích dẫn đều được ghi rõ nguồn gốc.

Em xin hoàn toàn chịu trách nhiệm trước nhà trường nếu phát hiện bất cứ sự sai phạm hay sao chép trong đề tài này!

| Giảng viên hướng dẫn | Sinh viên thực hiện |
|:--------------------:|:-------------------:|
| [Tên GV] | Lương Gia Tuấn |

---

## LỜI CẢM ƠN

Để hoàn thành khóa luận này, trước hết, em xin gửi lời cảm ơn chân thành đến các cán bộ, giảng viên Khoa Công nghệ Thông tin cùng toàn thể giảng viên Trường Đại học Tài nguyên và Môi trường Hà Nội, những người đã tận tình giảng dạy và truyền đạt kiến thức cho em trong suốt thời gian học tập.

Đặc biệt, em xin bày tỏ lòng biết ơn sâu sắc đến [Tên GV hướng dẫn], người đã tận tâm hướng dẫn, chỉ dạy và hỗ trợ em trong quá trình thực hiện khóa luận này.

Do kiến thức còn hạn chế, bài báo cáo của em chắc chắn không tránh khỏi những thiếu sót. Em rất mong nhận được những góp ý quý báu từ quý thầy cô để khóa luận được hoàn thiện hơn, đồng thời giúp em tích lũy thêm kinh nghiệm cho chặng đường phía trước.

Trân trọng!

---

## MỤC LỤC

- [LỜI CAM ĐOAN](#lời-cam-đoan)
- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [MỞ ĐẦU](#mở-đầu)
- [CHƯƠNG 1: CƠ SỞ LÝ THUYẾT](#chương-1-cơ-sở-lý-thuyết)
  - [1.1. Tổng quan về ngôn ngữ lập trình](#11-tổng-quan-về-ngôn-ngữ-lập-trình)
  - [1.2. Tổng quan về các công nghệ và thư viện hỗ trợ](#12-tổng-quan-về-các-công-nghệ-và-thư-viện-hỗ-trợ)
  - [1.3. Các công cụ hỗ trợ phát triển hệ thống](#13-các-công-cụ-hỗ-trợ-phát-triển-hệ-thống)
- [CHƯƠNG 2: PHÂN TÍCH THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-thiết-kế-hệ-thống)
  - [2.1. Bài toán hỗ trợ sáng tạo nội dung](#21-bài-toán-hỗ-trợ-sáng-tạo-nội-dung)
  - [2.2. Nghiệp vụ bài toán](#22-nghiệp-vụ-bài-toán)
  - [2.3. Xác định Use Case của hệ thống](#23-xác-định-use-case-của-hệ-thống)
  - [2.4. Biểu đồ Use Case tổng quát](#24-biểu-đồ-use-case-tổng-quát)
  - [2.5 - 2.10. Phân tích chức năng chi tiết](#25-phân-tích-các-chức-năng-chính)
  - [2.11. Thiết kế cơ sở dữ liệu](#211-thiết-kế-cơ-sở-dữ-liệu)
- [CHƯƠNG 3: XÂY DỰNG NỀN TẢNG CONTENT CREATOR AI](#chương-3-xây-dựng-nền-tảng-content-creator-ai)
  - [3.1. Giao diện Landing Page](#31-giao-diện-landing-page)
  - [3.2. Giao diện Dashboard](#32-giao-diện-dashboard)
  - [3.3. Giao diện Agent Chat](#33-giao-diện-agent-chat)
  - [3.4. Giao diện Quản trị viên](#34-giao-diện-quản-trị-viên)
- [KẾT LUẬN VÀ KIẾN NGHỊ](#kết-luận-và-kiến-nghị)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

## MỞ ĐẦU

### 1. Lý do chọn đề tài

Trong bối cảnh công nghệ trí tuệ nhân tạo (AI) đang phát triển vượt bậc, việc ứng dụng AI vào lĩnh vực sáng tạo nội dung đã trở thành xu hướng tất yếu. Đặc biệt, với sự bùng nổ của các nền tảng mạng xã hội như TikTok, Instagram, Facebook, YouTube, nhu cầu tạo ra nội dung chất lượng cao một cách nhanh chóng và hiệu quả ngày càng tăng.

Tuy nhiên, thực tế cho thấy:
- **Rào cản kỹ thuật**: Nhiều người sáng tạo nội dung không có kỹ năng sử dụng các công cụ AI phức tạp
- **Chi phí cao**: Các nền tảng AI chuyên nghiệp thường có chi phí đắt đỏ
- **Phân mảnh công cụ**: Người dùng phải sử dụng nhiều công cụ khác nhau cho các mục đích khác nhau (tạo ảnh, viết nội dung, tạo video)
- **Thiếu tính bản địa hóa**: Hầu hết các công cụ AI chưa hỗ trợ tốt tiếng Việt

Xuất phát từ nhu cầu thực tế đó, em lựa chọn đề tài **"Xây dựng nền tảng hỗ trợ sáng tạo nội dung sử dụng công nghệ AI"** nhằm:
- Tích hợp nhiều mô hình AI (Gemini, Groq, SDXL, Veo) vào một nền tảng thống nhất
- Cung cấp giao diện thân thiện, dễ sử dụng cho người Việt
- Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
- Tối ưu chi phí thông qua hệ thống credit linh hoạt

### 2. Mục tiêu của đề tài

#### Mục tiêu chung
Xây dựng một nền tảng web hỗ trợ sáng tạo nội dung đa phương tiện (văn bản, hình ảnh, video) sử dụng công nghệ AI, với giao diện thân thiện, hiệu suất cao và khả năng mở rộng tốt.

#### Mục tiêu cụ thể
- **Tích hợp AI đa năng**: Kết nối với nhiều mô hình AI (Google Gemini, Groq Llama, Stable Diffusion XL, Google Veo 3.1) để tạo nội dung đa dạng
- **Giao diện người dùng hiện đại**: Thiết kế UI/UX responsive, hỗ trợ dark mode, animations mượt mà với Framer Motion
- **Hệ thống xác thực đa dạng**: Firebase Auth với nhiều phương thức:
  - Email/Password với xác thực email
  - Google OAuth
  - Facebook OAuth
  - TikTok OAuth (đã triển khai, đang chờ TikTok approve app)
- **Quản lý tài nguyên**: Hệ thống credit cho việc sử dụng AI, quản lý dự án và tài sản
- **Đa ngôn ngữ**: Hỗ trợ hoàn chỉnh Tiếng Việt và Tiếng Anh với i18n
- **Trang cảm hứng**: Chia sẻ và khám phá các tác phẩm từ cộng đồng (like, save, comment, use prompt)

### 3. Phạm vi nghiên cứu

- **Frontend**: ReactJS, Vite, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **AI Integration**: Google Gemini API, Groq API, Replicate API (SDXL), Veo API
- **Deployment**: Vercel (Frontend), Firebase Hosting (Static assets)
- **Thanh toán**: PayOS (VNPay, MoMo, ZaloPay)

### 4. Kết quả đạt được

- Hoàn thành báo cáo tốt nghiệp và sản phẩm phần mềm đúng thời hạn
- Xây dựng nền tảng Content Creator AI với đầy đủ các chức năng:
  - Tạo nội dung văn bản với AI (Gemini, Groq)
  - Tạo hình ảnh với AI (SDXL, Nano Banana)
  - Tạo video với AI (Veo)
  - Quản lý dự án và tài sản
  - Hệ thống credit và thanh toán
  - Trang cảm hứng cộng đồng
  - Đa ngôn ngữ Việt-Anh

---

## CHƯƠNG 1: CƠ SỞ LÝ THUYẾT

### 1.1. Tổng quan về ngôn ngữ lập trình

#### 1.1.1. JavaScript

JavaScript là ngôn ngữ lập trình được sử dụng rộng rãi nhất trên web. Trong dự án này, JavaScript (ES6+) được sử dụng cho cả frontend và backend (Cloud Functions).

**Đặc điểm nổi bật:**
- Ngôn ngữ động, linh hoạt
- Hỗ trợ lập trình bất đồng bộ (async/await)
- Có hệ sinh thái npm phong phú
- Chạy được trên cả trình duyệt và server (Node.js)

#### 1.1.2. TypeScript

TypeScript là superset của JavaScript, bổ sung hệ thống kiểu tĩnh. Trong dự án, TypeScript được sử dụng cho Firebase Cloud Functions để đảm bảo type safety.

**Ưu điểm:**
- Phát hiện lỗi tại compile time
- IntelliSense tốt hơn trong IDE
- Dễ bảo trì và refactor code

#### 1.1.3. JSX

JSX (JavaScript XML) là cú pháp mở rộng của JavaScript, được sử dụng trong ReactJS để mô tả giao diện người dùng một cách trực quan.

```jsx
const WelcomeCard = ({ user }) => (
  <div className="card">
    <h1>Xin chào, {user.name}!</h1>
    <p>Chào mừng bạn đến với Content Creator AI</p>
  </div>
);
```

### 1.2. Tổng quan về các công nghệ và thư viện hỗ trợ

#### 1.2.1. ReactJS

ReactJS là thư viện JavaScript mã nguồn mở do Meta (Facebook) phát triển, được sử dụng để xây dựng giao diện người dùng.

**Đặc điểm chính:**
- **Component-based**: Chia giao diện thành các component tái sử dụng
- **Virtual DOM**: Tối ưu hiệu suất render
- **Unidirectional data flow**: Luồng dữ liệu một chiều, dễ debug
- **Hooks**: useState, useEffect, useContext cho quản lý state

**Trong dự án Content Creator AI:**
- Sử dụng React 18 với Concurrent Features
- Custom hooks cho các chức năng lặp lại
- Context API cho quản lý state toàn cục (AuthContext, LanguageContext)

#### 1.2.2. Vite

Vite là build tool thế hệ mới cho các ứng dụng web hiện đại.

**Ưu điểm:**
- **Khởi động nhanh**: Sử dụng ES modules native
- **Hot Module Replacement (HMR)**: Cập nhật code tức thì không cần reload
- **Build tối ưu**: Sử dụng Rollup cho production build

#### 1.2.3. Các dịch vụ API sử dụng

Để triển khai các chức năng sáng tạo nội dung và thanh toán, hệ thống tích hợp nhiều dịch vụ API từ các nhà cung cấp khác nhau:

| API | Nhà cung cấp | Chức năng chính | Mô hình/Đặc điểm |
|-----|-------------|-----------------|------------------|
| Gemini API | Google | Tạo và phân tích nội dung văn bản, hiểu ngữ cảnh, hỗ trợ đa ngôn ngữ | Gemini 2.x |
| Groq API | Groq | Tạo nội dung văn bản với tốc độ cao, chi phí thấp | LLaMA 3.x |
| Pollination API | Pollinations | Tạo hình ảnh từ mô tả văn bản | Text-to-Image |
| Stability AI API | Stability AI | Tạo hình ảnh chất lượng cao | Stable Diffusion |
| Veo API | Google | Tạo video từ văn bản hoặc hình ảnh | Veo 3.1 |
| PayOS API | PayOS | Xử lý thanh toán trực tuyến (QR Code, MoMo, ZaloPay, Bank Transfer) | REST + Webhook |

Việc sử dụng kết hợp nhiều dịch vụ API giúp hệ thống tận dụng được thế mạnh của từng công nghệ, đồng thời mang lại sự linh hoạt và tính chuyên nghiệp trong xử lý nghiệp vụ. Cách tiếp cận này cũng giúp giảm sự phụ thuộc vào một nhà cung cấp duy nhất, nâng cao khả năng mở rộng và duy trì hệ thống trong tương lai.

#### 1.2.4. Firebase

Firebase là nền tảng Backend-as-a-Service (BaaS) của Google, cung cấp các dịch vụ:

| Dịch vụ | Mục đích trong dự án |
|---------|---------------------|
| **Authentication** | Xác thực người dùng (Email/Password, Google, Facebook, TikTok) |
| **Firestore** | Cơ sở dữ liệu NoSQL thời gian thực |
| **Cloud Functions** | 19 serverless functions cho logic backend |
| **Storage** | Lưu trữ file (ảnh, video) |
| **Hosting** | Deploy static assets |

#### 1.2.5. Tailwind CSS

Tailwind CSS là utility-first CSS framework, cho phép xây dựng giao diện nhanh chóng.

**Đặc điểm:**
- Các class utility nhỏ, có thể kết hợp linh hoạt
- Hỗ trợ responsive design dễ dàng
- Dark mode tích hợp sẵn
- Tối ưu production build (purge unused CSS)

```html
<button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
  Tạo nội dung
</button>
```

### 1.3. Các công cụ hỗ trợ phát triển hệ thống

#### 1.3.1. Visual Studio Code
- IDE chính cho phát triển frontend và backend
- Extensions: ESLint, Prettier, React snippets, Firebase Explorer

#### 1.3.2. Firebase Console
- Quản lý Authentication, Firestore, Functions, Storage
- Monitoring và Analytics

#### 1.3.3. Postman
- Kiểm thử các Cloud Functions API
- Tạo collection cho các endpoints

#### 1.3.4. Vercel
- Platform deploy frontend
- Preview deployments cho mỗi PR
- Edge network cho hiệu suất tốt

### 1.4. Danh sách Cloud Functions

Dự án sử dụng **19 Cloud Functions** viết bằng TypeScript:

| Function | Mục đích | Trigger Type |
|----------|---------|-------------|
| `generateContent` | Tạo text/image với AI | onCall |
| `requestVideoGeneration` | Đưa video vào queue | onCall |
| `processVideoQueue` | Xử lý hàng đợi video | PubSub schedule |
| `getVideoQueueStatus` | Kiểm tra trạng thái video | onCall |
| `saveProject` | Lưu dự án | onCall |
| `getProjects` | Lấy danh sách dự án | onCall |
| `deleteProject` | Xóa dự án | onCall |
| `createPost` | Tạo bài Inspiration | onCall |
| `getPosts` | Lấy bài đăng | onCall |
| `likePost` | Like bài | onCall |
| `savePostToFavorites` | Lưu bài yêu thích | onCall |
| `createPaymentLink` | Tạo link thanh toán PayOS | onCall |
| `payosWebhook` | Xử lý callback thanh toán | onRequest |
| `getTikTokAuthUrl` | Lấy URL đăng nhập TikTok | onCall |
| `handleTikTokCallback` | Xử lý callback TikTok | onRequest |
| `logUserLogin` | Ghi log đăng nhập | onCall |
| `initializeUser` | Khởi tạo user mới | Auth trigger |
| `sendNotificationIfEnabled` | Gửi email thông báo | Internal |

### 1.5. Thư viện Frontend sử dụng

| Thư viện | Phiên bản | Mục đích |
|---------|-----------|--------|
| React | 19.2.0 | UI Library |
| React Router DOM | 7.9.6 | Routing |
| Firebase | 10.13.2 | BaaS |
| Tailwind CSS | 3.4.18 | Styling |
| Lucide React | 0.554.0 | Icons |
| React Markdown | 10.1.0 | Render markdown |
| Recharts | 3.4.1 | Charts/Analytics |
| jsPDF | 3.0.3 | Export PDF |
| docx | 9.5.1 | Export Word |

---

## CHƯƠNG 2: PHÂN TÍCH THIẾT KẾ HỆ THỐNG

### 2.0. Cấu trúc dự án

```
content-creator-ai/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── Auth/            # AuthModal, EmailVerification
│   │   │   ├── Dashboard/       # 24 components (AgentChat, Inspiration, ...)
│   │   │   ├── Projects/        # Project management
│   │   │   └── Shared/          # Reusable components
│   │   ├── pages/               # 6 pages (Home, LandingPage, Pricing...)
│   │   ├── contexts/            # AuthContext, LanguageContext, ThemeContext
│   │   ├── services/            # Firebase functions wrapper
│   │   ├── i18n/                # Đa ngôn ngữ (vi, en)
│   │   └── utils/               # Toast, helpers
│   ├── package.json             # Dependencies
│   └── vite.config.js
├── functions/                   # Firebase Cloud Functions
│   ├── src/
│   │   ├── generateContent.ts   # Text/Image generation
│   │   ├── generateVideo.ts     # Video generation (Veo 3.1)
│   │   ├── posts.ts             # Inspiration posts CRUD
│   │   ├── projects.ts          # Project management
│   │   ├── profiles.ts          # User profiles
│   │   ├── tiktokAuth.ts        # TikTok OAuth flow
│   │   ├── createPaymentLink.ts # PayOS integration
│   │   ├── payosWebhook.ts      # Payment webhooks
│   │   ├── emailService.ts      # SendGrid emails
│   │   ├── notifications.ts     # Push notifications
│   │   └── utils/               # Rate limiting, validation, ...
│   └── package.json
├── firestore.rules              # Security rules
├── firestore.indexes.json       # Database indexes
└── firebase.json                # Firebase config
```

### 2.1. Bài toán hỗ trợ sáng tạo nội dung

Để đáp ứng nhu cầu sáng tạo nội dung đa phương tiện sử dụng AI, hệ thống cần đảm bảo:

**Chức năng chính:**
- Tạo nội dung văn bản với AI (bài viết, caption, script)
- Tạo hình ảnh với AI theo mô tả
- Tạo video với AI từ text hoặc image
- Quản lý dự án và tài sản đã tạo
- Hệ thống credit và thanh toán
- Trang cảm hứng chia sẻ cộng đồng

**Yêu cầu phi chức năng:**
- **Hiệu suất**: Tốc độ tải trang < 3s, response AI < 30s
- **Bảo mật**: Xác thực JWT, HTTPS, bảo vệ API keys
- **Khả năng mở rộng**: Serverless architecture
- **UX**: Responsive, dark mode, đa ngôn ngữ

### 2.2. Nghiệp vụ bài toán

#### 2.2.1. Quản lý người dùng
- **Đăng ký/Đăng nhập**: Hỗ trợ nhiều phương thức:
  - Email/Password với xác thực email tự động
  - Google OAuth (signInWithPopup)
  - Facebook OAuth (signInWithPopup)
  - TikTok OAuth (custom implementation với Cloud Functions)
- **Xác thực email**: Sử dụng Firebase sendEmailVerification, blocking screen cho user chưa verify
- **Quản lý profile**: Avatar upload, tên hiển thị, ngôn ngữ, theme (dark/light)
- **Quên mật khẩu**: Firebase sendPasswordResetEmail

#### 2.2.2. Hệ thống Credit
- **Cấp credit**: Mỗi người dùng mới nhận credit miễn phí
- **Tiêu thụ credit**: Mỗi lần tạo nội dung tốn credit tương ứng
- **Nạp credit**: Thanh toán qua PayOS (MoMo, ZaloPay, Bank Transfer)

#### 2.2.3. Tạo nội dung AI
- **Text Generation**: Sử dụng Gemini/Groq để tạo văn bản
- **Image Generation**: Sử dụng SDXL/Nano Banana để tạo ảnh
- **Video Generation**: Sử dụng Veo để tạo video

#### 2.2.4. Quản lý dự án
- **Tạo dự án**: Lưu lịch sử chat và nội dung tạo ra
- **Xem lại**: Truy cập các dự án đã tạo
- **Chia sẻ**: Đăng lên trang Inspiration

#### 2.2.5. Trang Inspiration
- **Khám phá**: Xem các tác phẩm từ cộng đồng
- **Tương tác**: Like, save, comment, view
- **Sử dụng prompt**: Copy hoặc sử dụng trực tiếp prompt

### 2.3. Xác định Use Case của hệ thống

#### 2.3.1. Đối tượng sử dụng

| Actor | Vai trò |
|-------|---------|
| **Khách vãng lai** | Xem Landing Page, đăng ký tài khoản |
| **Người dùng** | Đăng nhập, tạo nội dung AI, quản lý dự án, nạp credit |
| **Quản trị viên** | Quản lý người dùng, nội dung, thống kê |

#### 2.3.2. Các chức năng chính

**Người dùng:**
- Đăng ký, đăng nhập, đăng xuất
- Tạo nội dung văn bản với AI
- Tạo hình ảnh với AI
- Tạo video với AI
- Quản lý dự án và tài sản
- Xem và tương tác trang Inspiration
- Nạp credit, xem lịch sử giao dịch

**Quản trị viên:**
- Quản lý người dùng (khóa/mở khóa)
- Duyệt bài đăng Inspiration
- Xem thống kê hệ thống
- Quản lý gói credit

### 2.4. Biểu đồ Use Case tổng quát

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT CREATOR AI                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐        ┌─────────────────────────┐             │
│  │  Khách  │───────▶│  Xem Landing Page       │             │
│  │ vãng lai│───────▶│  Đăng ký tài khoản      │             │
│  └─────────┘        └─────────────────────────┘             │
│                                                              │
│  ┌─────────┐        ┌─────────────────────────┐             │
│  │         │───────▶│  Đăng nhập/Đăng xuất    │             │
│  │         │───────▶│  Tạo nội dung văn bản   │             │
│  │ Người   │───────▶│  Tạo hình ảnh AI        │             │
│  │  dùng   │───────▶│  Tạo video AI           │             │
│  │         │───────▶│  Quản lý dự án          │             │
│  │         │───────▶│  Xem Inspiration        │             │
│  │         │───────▶│  Nạp credit             │             │
│  └─────────┘        └─────────────────────────┘             │
│                                                              │
│  ┌─────────┐        ┌─────────────────────────┐             │
│  │  Admin  │───────▶│  Quản lý người dùng     │             │
│  │         │───────▶│  Duyệt bài Inspiration  │             │
│  │         │───────▶│  Xem thống kê           │             │
│  └─────────┘        └─────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.5. Phân tích các chức năng chính

#### 2.5.1. Chức năng Tạo nội dung AI (Agent Chat)

**Use Case:** Tạo nội dung với AI

| Thuộc tính | Mô tả |
|------------|-------|
| **Tác nhân** | Người dùng đã đăng nhập |
| **Mô tả** | Người dùng nhập prompt, chọn model AI, hệ thống tạo nội dung |
| **Tiền điều kiện** | Đã đăng nhập, có đủ credit |
| **Luồng chính** | 1. Chọn loại nội dung (text/image/video) → 2. Chọn model AI → 3. Nhập prompt → 4. Gửi yêu cầu → 5. Nhận kết quả |
| **Luồng thay thế** | Nếu hết credit → Hiển thị thông báo nạp thêm |

#### 2.5.2. Chức năng Quản lý dự án

**Use Case:** Xem và quản lý các dự án đã tạo

| Thuộc tính | Mô tả |
|------------|-------|
| **Tác nhân** | Người dùng đã đăng nhập |
| **Mô tả** | Người dùng xem danh sách dự án, mở lại chat, xóa dự án |
| **Tiền điều kiện** | Đã đăng nhập |
| **Luồng chính** | 1. Vào trang Assets → 2. Xem danh sách dự án → 3. Click mở dự án → 4. Tiếp tục chat |

#### 2.5.3. Chức năng Inspiration

**Use Case:** Khám phá và tương tác với nội dung cộng đồng

| Thuộc tính | Mô tả |
|------------|-------|
| **Tác nhân** | Người dùng đã đăng nhập |
| **Mô tả** | Xem bài đăng, like, save, comment, sử dụng prompt |
| **Tiền điều kiện** | Đã đăng nhập |
| **Luồng chính** | 1. Vào Inspiration → 2. Duyệt bài đăng → 3. Tương tác (like/save) → 4. Click "Sử dụng phong cách" → 5. Chuyển đến Dashboard với prompt |

#### 2.5.4. Chức năng Nạp Credit

**Use Case:** Nạp credit để sử dụng dịch vụ AI

| Thuộc tính | Mô tả |
|------------|-------|
| **Tác nhân** | Người dùng đã đăng nhập |
| **Mô tả** | Chọn gói credit, thanh toán qua PayOS |
| **Tiền điều kiện** | Đã đăng nhập |
| **Luồng chính** | 1. Vào trang Credit → 2. Chọn gói → 3. Thanh toán → 4. Nhận credit |

### 2.11. Thiết kế cơ sở dữ liệu

Dự án sử dụng **Firestore** (NoSQL database) với cấu trúc collections như sau:

#### Collection: `users`

| Field | Type | Mô tả |
|-------|------|-------|
| `uid` | string | ID người dùng (từ Firebase Auth) |
| `email` | string | Email |
| `displayName` | string | Tên hiển thị |
| `photoURL` | string | URL avatar |
| `credits` | number | Số credit hiện có |
| `role` | string | Vai trò (user/admin) |
| `language` | string | Ngôn ngữ (vi/en) |
| `createdAt` | timestamp | Thời gian tạo |
| `updatedAt` | timestamp | Thời gian cập nhật |

#### Collection: `projects`

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | string | ID dự án |
| `userId` | string | ID người tạo |
| `title` | string | Tiêu đề |
| `type` | string | Loại (text/image/video) |
| `messages` | array | Lịch sử chat |
| `content` | object | Nội dung tạo ra |
| `createdAt` | timestamp | Thời gian tạo |
| `updatedAt` | timestamp | Thời gian cập nhật |

#### Collection: `posts` (Inspiration)

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | string | ID bài đăng |
| `userId` | string | ID người đăng |
| `title` | string | Tiêu đề |
| `prompt` | string | Prompt sử dụng |
| `imageUrl` | string | URL hình ảnh |
| `type` | string | Loại nội dung |
| `likes` | number | Số lượt thích |
| `views` | number | Số lượt xem |
| `status` | string | Trạng thái (pending/approved) |
| `createdAt` | timestamp | Thời gian đăng |

#### Collection: `transactions`

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | string | ID giao dịch |
| `userId` | string | ID người dùng |
| `amount` | number | Số tiền |
| `credits` | number | Số credit nhận |
| `status` | string | Trạng thái (pending/success/failed) |
| `paymentMethod` | string | Phương thức thanh toán |
| `createdAt` | timestamp | Thời gian tạo |

---

## CHƯƠNG 3: XÂY DỰNG NỀN TẢNG CONTENT CREATOR AI

### 3.1. Giao diện Landing Page (LandingPage.jsx - 529 dòng)

**Mô tả:** Trang giới thiệu sản phẩm với thiết kế hiện đại, animation mượt mà

**Các thành phần:**
- Hero section với tiêu đề và CTA (Call-to-Action)
- Feature cards giới thiệu tính năng
- Infinite carousel hiển thị các tác phẩm mẫu với animation scale khi vào tâm
- Pricing plans
- Footer với links

**Tính năng nổi bật:**
- Responsive design cho mobile/tablet/desktop
- Dark mode support
- Scroll-triggered animations

### 3.2. Giao diện Dashboard

**Mô tả:** Trang chính sau khi đăng nhập

**Các thành phần:**
- Sidebar navigation
- Welcome banner
- Suggestion buttons (tạo ảnh, text, video)
- Input box để bắt đầu chat với AI
- Recent projects section

### 3.3. Giao diện Agent Chat (AgentChat.jsx - 1119 dòng)

**Mô tả:** Giao diện chat với AI để tạo nội dung - thành phần chính của ứng dụng

**Các thành phần:**
- Chat messages (user và AI) với Markdown rendering
- Model selector:
  - **Text**: Groq (miễn phí), Gemini Pro, Gemini Flash
  - **Image**: Nano Banana, Nano Banana Pro, SDXL
  - **Video**: Veo 3.1 Fast, Veo 3.1 Standard
- Video aspect ratio selector (16:9, 4:3, 1:1, 3:4, 9:16)
- File upload (attach images để AI phân tích)
- Input area với morph animation
- Generated content preview với lightbox
- Project auto-save functionality
- Share to Inspiration

**Các API sử dụng:**
- `generateContent` (Cloud Function) - Text/Image
- `requestVideoGeneration` (Cloud Function) - Video queue
- `saveProject` (Cloud Function) - Lưu dự án

### 3.4. Giao diện Inspiration

**Mô tả:** Trang khám phá nội dung cộng đồng

**Các thành phần:**
- Masonry grid layout
- Post cards với thumbnail, title, stats
- Filter và search
- Modal xem chi tiết
- Interaction buttons (like, save, use prompt)

### 3.5. Giao diện Quản trị viên

**Mô tả:** Dashboard dành cho admin

**Các thành phần:**
- Thống kê tổng quan (users, posts, revenue)
- Quản lý người dùng
- Duyệt bài Inspiration
- Quản lý gói credit

---

## KẾT LUẬN VÀ KIẾN NGHỊ

### Kết luận

Đề tài "Xây dựng nền tảng hỗ trợ sáng tạo nội dung sử dụng công nghệ AI" đã được hoàn thành với các kết quả:

#### Kết quả đạt được:
- ✅ Xây dựng thành công nền tảng web với ReactJS và Firebase
- ✅ Tích hợp đa mô hình AI (Gemini, Groq, SDXL, Veo)
- ✅ Hệ thống xác thực an toàn với Firebase Auth
- ✅ Giao diện hiện đại, responsive, dark mode
- ✅ Hỗ trợ đa ngôn ngữ Việt-Anh
- ✅ Hệ thống credit và thanh toán PayOS
- ✅ Trang Inspiration cho cộng đồng
- ✅ Deploy thành công lên Vercel và Firebase

#### Hạn chế:
- Chưa có ứng dụng mobile native (chỉ có PWA)
- TikTok OAuth đã triển khai nhưng chưa được TikTok Developer Platform approve (yêu cầu review app)
- Chưa có tính năng scheduling post lên social media
- Video generation còn hạn chế số lượng do rate limit của Veo API

### Kiến nghị

#### Hướng phát triển:
1. **Mobile App**: Phát triển ứng dụng React Native
2. **Social Integration**: Tích hợp đăng nhập và đăng bài lên TikTok, Instagram
3. **AI Enhancement**: Thêm các model AI mới (Sora, Midjourney API)
4. **Collaboration**: Tính năng làm việc nhóm
5. **Templates**: Thư viện template sẵn có
6. **Analytics**: Thống kê chi tiết về nội dung đã tạo

---

## TÀI LIỆU THAM KHẢO

### Tài liệu Tiếng Việt
1. Nguyễn Văn Vỵ (2004), *Phân tích thiết kế hệ thống phần mềm theo hướng đối tượng*, Đại học Công nghệ, ĐHQG Hà Nội
2. Đặng Văn Đức (2003), *Phân tích thiết kế hướng đối tượng bằng UML*, NXB Giáo dục

### Tài liệu Tiếng Anh
3. React Documentation, https://react.dev
4. Firebase Documentation, https://firebase.google.com/docs
5. Vite Documentation, https://vitejs.dev
6. Tailwind CSS Documentation, https://tailwindcss.com/docs
7. Google Gemini API, https://ai.google.dev/docs
8. Replicate API (SDXL), https://replicate.com/docs

### Công cụ và Thư viện
9. Lucide React Icons, https://lucide.dev
10. React Hot Toast, https://react-hot-toast.com
11. Framer Motion, https://www.framer.com/motion
12. PayOS Documentation, https://payos.vn/docs

---

*Báo cáo được tạo cho dự án Content Creator AI - Năm 2026*
