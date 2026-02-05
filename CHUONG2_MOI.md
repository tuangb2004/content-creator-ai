# CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Bài toán hỗ trợ sáng tạo nội dung

Để đáp ứng nhu cầu sáng tạo nội dung trong thời đại số và hỗ trợ các content creators tạo ra nội dung chất lượng cao một cách nhanh chóng, hệ thống phần mềm Content Creator AI cần được xây dựng như một nền tảng web ứng dụng trí tuệ nhân tạo với đầy đủ các chức năng phục vụ cả người dùng thông thường và quản trị viên. Cụ thể, hệ thống cần đảm bảo các yêu cầu sau:

**Chức năng chính:** Hỗ trợ tạo nội dung văn bản, hình ảnh và video sử dụng AI; quản lý dự án và tài sản; hệ thống credit và thanh toán; trang cảm hứng cộng đồng; và quản lý hệ thống (người dùng, bài đăng, thống kê).

**Hiệu suất:** Đảm bảo tốc độ tải trang nhanh (dưới 3 giây) trên nền tảng web, thời gian phản hồi AI chấp nhận được (dưới 60 giây cho text/image, dưới 5 phút cho video).

**Bảo mật:** Bảo vệ thông tin cá nhân người dùng và giao dịch tài chính bằng mã hóa, xác thực Firebase Auth với JWT, và giao thức HTTPS. Áp dụng Firestore Security Rules để bảo vệ dữ liệu.

**Khả năng mở rộng:** Hỗ trợ thêm tính năng mới (ví dụ: tích hợp thêm mô hình AI, cổng thanh toán, đăng bài lên mạng xã hội) mà không làm gián đoạn hệ thống nhờ kiến trúc Serverless.

**Trải nghiệm người dùng:** Giao diện trực quan, hiện đại với hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh), dark mode, và responsive design trên mọi thiết bị.

## 2.2. Nghiệp vụ bài toán

Hệ thống Content Creator AI không chỉ đơn thuần là một công cụ tạo nội dung AI, mà còn bao gồm các nghiệp vụ liên quan đến quản lý người dùng, quản lý tài nguyên và xây dựng cộng đồng. Các nghiệp vụ chính của bài toán bao gồm:

### 2.2.1. Quản lý người dùng

**Đăng ký, đăng nhập:** Cho phép người dùng tạo tài khoản bằng nhiều phương thức:
- Email/Password với xác thực email tự động
- Google OAuth (signInWithPopup)
- Facebook OAuth (signInWithPopup)  
- TikTok OAuth (custom implementation với Cloud Functions)

**Xác thực email:** Sử dụng Firebase sendEmailVerification, hiển thị blocking screen cho user chưa xác thực để đảm bảo tính xác thực của tài khoản.

**Cập nhật thông tin cá nhân:** Người dùng có thể thay đổi thông tin cá nhân như tên hiển thị, avatar, ngôn ngữ giao diện, và chế độ giao diện (sáng/tối).

**Quên mật khẩu:** Sử dụng Firebase sendPasswordResetEmail để gửi email đặt lại mật khẩu.

**Phân quyền truy cập:** Phân biệt rõ người dùng thông thường và quản trị viên để kiểm soát quyền truy cập và sử dụng hệ thống.

### 2.2.2. Hệ thống Credit và Thanh toán

**Cấp credit:** Mỗi người dùng mới nhận 10-20 credit miễn phí khi đăng ký.

**Tiêu thụ credit:** Mỗi lần tạo nội dung tốn credit tương ứng:
- Tạo văn bản với Groq: Miễn phí
- Tạo văn bản với Gemini: 1-3 credits
- Tạo hình ảnh: 5-10 credits
- Tạo video: 20-50 credits

**Nạp credit:** Thanh toán trực tuyến qua PayOS hỗ trợ nhiều phương thức: MoMo, ZaloPay, chuyển khoản ngân hàng.

**Lịch sử giao dịch:** Người dùng có thể xem lịch sử nạp credit và sử dụng credit.

### 2.2.3. Tạo nội dung AI

**Tạo văn bản:** Người dùng nhập prompt, chọn model AI (Groq miễn phí hoặc Gemini Pro), hệ thống gọi API tương ứng và trả về nội dung văn bản.

**Tạo hình ảnh:** Người dùng nhập mô tả, chọn model (Nano Banana hoặc SDXL), hệ thống sinh hình ảnh và hiển thị kết quả.

**Tạo video:** Người dùng nhập prompt hoặc upload ảnh, chọn tỷ lệ khung hình, hệ thống đưa vào hàng đợi và xử lý bằng Veo 3.1.

**Lưu tự động:** Tất cả nội dung tạo ra được lưu tự động vào dự án tương ứng.

### 2.2.4. Quản lý dự án và tài sản

**Tạo dự án:** Mỗi phiên chat với AI tạo thành một dự án, lưu lịch sử chat và nội dung tạo ra.

**Xem lại dự án:** Người dùng có thể truy cập các dự án đã tạo, tiếp tục chat hoặc xem lại nội dung.

**Quản lý tài sản:** Upload, xem, tải xuống và xóa các file ảnh/video đã tạo.

**Chia sẻ:** Đăng nội dung lên trang Inspiration để chia sẻ với cộng đồng.

### 2.2.5. Trang Inspiration (Cảm hứng)

**Khám phá:** Xem các tác phẩm từ cộng đồng, lọc theo danh mục (hình ảnh, video, văn bản), sắp xếp theo mới nhất hoặc phổ biến nhất.

**Tương tác:** Like, save (lưu yêu thích), comment trên bài đăng.

**Sử dụng prompt:** Copy prompt hoặc áp dụng trực tiếp vào Agent Chat để tạo nội dung tương tự.

**Theo dõi creator:** Xem profile và follow các creator khác trong cộng đồng.

### 2.2.6. Quản trị hệ thống

**Quản lý tài khoản người dùng:** Xem danh sách, khóa/mở tài khoản, cấp quyền quản trị.

**Quản lý bài đăng:** Duyệt bài Inspiration, xóa bài vi phạm.

**Thống kê:** Xem số lượng người dùng, số bài đăng, doanh thu từ credit.

## 2.3. Xác định Use Case của hệ thống

### 2.3.1. Đối tượng sử dụng hệ thống

**Quản trị viên (Admin):** Là cá nhân sử dụng hệ thống để quản lý toàn bộ hệ thống, bao gồm việc thống kê, quản lý người dùng, duyệt bài đăng và xử lý các vấn đề phát sinh.

**Người dùng đã đăng ký (User):** Là những người đã có tài khoản, có thể sử dụng đầy đủ các chức năng: tạo nội dung AI, quản lý dự án, nạp credit, tương tác trên Inspiration.

**Khách vãng lai (Guest):** Là những người truy cập hệ thống mà không cần đăng nhập, có thể xem trang Landing Page, trang Pricing, và đăng ký tài khoản mới.

### 2.3.2. Các chức năng chính của hệ thống

#### Về phía Quản trị viên

**Quản lý người dùng:** Cho phép xem danh sách người dùng, khóa/mở khóa tài khoản, cấp quyền admin.

**Quản lý bài đăng Inspiration:** Cho phép duyệt, ẩn hoặc xóa các bài đăng vi phạm quy định cộng đồng.

**Thống kê báo cáo:** Xem số liệu về người dùng mới, doanh thu, số lượng nội dung tạo ra theo ngày/tuần/tháng.

**Đăng nhập tài khoản quản trị viên:** Chỉ quản trị viên được cấp quyền mới có thể truy cập trang quản lý.

**Đăng xuất:** Sau khi hoàn thành công việc, quản trị viên có thể đăng xuất tài khoản.

#### Về phía Người dùng đã đăng ký

**Chức năng tạo nội dung văn bản:** Người dùng nhập prompt, chọn model AI (Groq/Gemini), có thể đính kèm file để AI phân tích, và nhận kết quả văn bản với định dạng Markdown.

**Chức năng tạo hình ảnh:** Người dùng nhập mô tả chi tiết, chọn model (Nano Banana/SDXL), và nhận hình ảnh được tạo tự động.

**Chức năng tạo video:** Người dùng nhập prompt hoặc upload ảnh làm khung hình đầu, chọn tỷ lệ (16:9, 9:16, 1:1...), và nhận video sau khi xử lý.

**Chức năng quản lý dự án:** Xem danh sách dự án đã tạo, mở lại để tiếp tục chat, xóa dự án không cần thiết.

**Chức năng Inspiration:** Duyệt xem bài đăng từ cộng đồng, like/save bài yêu thích, sử dụng prompt của người khác.

**Chức năng đăng bài:** Chia sẻ tác phẩm của mình lên Inspiration với tiêu đề, mô tả, tags.

**Chức năng nạp credit:** Chọn gói credit, thanh toán qua PayOS, nhận credit sau khi thanh toán thành công.

**Chức năng đăng nhập và đăng ký:** Đăng nhập bằng Email/Google/Facebook/TikTok, đăng ký tài khoản mới với xác thực email.

**Chức năng cài đặt:** Thay đổi tên hiển thị, avatar, ngôn ngữ giao diện, chế độ sáng/tối.

#### Về phía Khách vãng lai

**Chức năng xem trang giới thiệu:** Xem Landing Page với thông tin về sản phẩm, tính năng, pricing.

**Chức năng xem trang giá:** Xem chi tiết các gói credit và so sánh tính năng.

**Chức năng đăng ký:** Tạo tài khoản mới để sử dụng các chức năng của hệ thống.

## 2.4. Biểu đồ Use Case tổng quát

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONTENT CREATOR AI                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────┐     ┌────────────────────────────────────────┐       │
│  │   Khách   │────▶│  Xem Landing Page                      │       │
│  │  vãng lai │────▶│  Xem trang Pricing                     │       │
│  │           │────▶│  Đăng ký tài khoản                     │       │
│  └───────────┘     └────────────────────────────────────────┘       │
│                                                                      │
│  ┌───────────┐     ┌────────────────────────────────────────┐       │
│  │           │────▶│  Đăng nhập (Email/Google/Facebook/TikTok)│      │
│  │           │────▶│  Tạo nội dung văn bản với AI            │       │
│  │           │────▶│  Tạo hình ảnh với AI                    │       │
│  │  Người    │────▶│  Tạo video với AI                       │       │
│  │   dùng    │────▶│  Quản lý dự án và tài sản               │       │
│  │           │────▶│  Xem và tương tác Inspiration           │       │
│  │           │────▶│  Đăng bài lên Inspiration               │       │
│  │           │────▶│  Nạp credit                             │       │
│  │           │────▶│  Cài đặt profile                        │       │
│  └───────────┘     └────────────────────────────────────────┘       │
│                                                                      │
│  ┌───────────┐     ┌────────────────────────────────────────┐       │
│  │   Quản    │────▶│  Quản lý người dùng                    │       │
│  │   trị     │────▶│  Duyệt bài Inspiration                 │       │
│  │   viên    │────▶│  Xem thống kê hệ thống                 │       │
│  └───────────┘     └────────────────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 2.5. Phân tích yêu cầu hệ thống

### 2.5.1. Yêu cầu chức năng

**Bảng 2.1: Yêu cầu chức năng hệ thống**

| Mã | Yêu cầu | Mô tả chi tiết | Độ ưu tiên |
|----|---------|----------------|------------|
| F01 | Đăng ký/Đăng nhập | Hỗ trợ Email/Password, Google, Facebook, TikTok OAuth | Cao |
| F02 | Xác thực email | Gửi email verification, blocking screen cho user chưa xác thực | Cao |
| F03 | Tạo văn bản AI | Chat với AI (Gemini/Groq), hỗ trợ file attachment | Cao |
| F04 | Tạo hình ảnh AI | Prompt to Image với SDXL hoặc Nano Banana | Cao |
| F05 | Tạo video AI | Text/Image to Video với Veo 3.1 | Trung bình |
| F06 | Quản lý dự án | Lưu tự động, xem, tiếp tục, xóa dự án | Cao |
| F07 | Quản lý tài sản | Upload, xem, tải xuống, xóa ảnh/video | Trung bình |
| F08 | Inspiration | Xem feed, like, save, comment, share, use prompt | Trung bình |
| F09 | Nạp credit | Chọn gói, thanh toán qua PayOS, nhận credit | Cao |
| F10 | Cài đặt profile | Thay đổi avatar, tên, ngôn ngữ, theme | Thấp |
| F11 | Đa ngôn ngữ | Chuyển đổi giao diện Tiếng Việt/Tiếng Anh | Trung bình |
| F12 | Quản trị | Quản lý users, duyệt bài, thống kê (admin) | Trung bình |

### 2.5.2. Yêu cầu phi chức năng

**Bảng 2.2: Yêu cầu phi chức năng**

| Mã | Yêu cầu | Tiêu chí đánh giá |
|----|---------|-------------------|
| NF01 | Hiệu suất | Thời gian tải trang < 3s; AI text response < 10s; AI image response < 30s; AI video queue < 5 phút |
| NF02 | Bảo mật | HTTPS, Firebase Auth với JWT, Firestore Security Rules, API keys không lộ trên client |
| NF03 | Khả năng mở rộng | Serverless auto-scaling với Firebase Cloud Functions, không giới hạn concurrent users |
| NF04 | Responsive | Hỗ trợ đầy đủ trên mobile, tablet, desktop với breakpoints chuẩn |
| NF05 | Accessibility | Dark mode, font scaling, contrast ratio đạt WCAG AA |
| NF06 | Reliability | 99.9% uptime theo Firebase SLA |
| NF07 | Maintainability | Code modular, component-based, có documentation |

## 2.6. Thiết kế kiến trúc hệ thống

### 2.6.1. Kiến trúc tổng thể

Hệ thống được xây dựng theo kiến trúc **Serverless** với Firebase làm backend, giúp giảm thiểu chi phí vận hành và tự động scale theo nhu cầu sử dụng.

`

                         CLIENT (Browser)                             
      
                React Frontend (Vite + Tailwind)                    
     Pages: Landing, Home, Pricing, Projects, Settings          
     Components: Auth, Dashboard, Inspiration (49 files)        
     Contexts: AuthContext, LanguageContext, ThemeContext       
      

                                  HTTPS / Firebase SDK

                         FIREBASE SERVICES                            
       
     Firebase        Cloud         Firestore     Storage     
       Auth        Functions       Database       (Files)    
    (OAuth 2.0)   (19 funcs)       (NoSQL)      (Images,     
                                                 Videos)     
       

                           

                         EXTERNAL APIs                                
       
    Gemini API      Groq API       Stability      PayOS      
     (Google)       (Llama)        AI / SDXL    (Payment)    
    Text/Vision    Text (Free)      Image       MoMo/Zalo    
       
                                      
    Veo 3.1        SendGrid                                       
     (Google)       (Email)                                       
      Video       Notification                                    
                                      

`

### 2.6.2. Mô tả các thành phần

**Frontend (React + Vite):**
- Single Page Application với React Router
- State management với React Context API
- Styling với Tailwind CSS và custom CSS
- i18n cho đa ngôn ngữ

**Firebase Authentication:**
- Xác thực Email/Password
- OAuth với Google, Facebook
- Custom OAuth với TikTok qua Cloud Functions

**Cloud Functions (TypeScript):**
- 19 serverless functions xử lý business logic
- Kết nối với các AI APIs
- Xử lý thanh toán và webhooks

**Firestore Database:**
- NoSQL document database
- Real-time listeners cho dữ liệu động
- Security Rules bảo vệ dữ liệu

**Firebase Storage:**
- Lưu trữ ảnh và video do user upload
- Lưu trữ nội dung AI tạo ra
- CDN tự động cho hiệu suất tốt

### 2.6.3. Danh sách Cloud Functions

**Bảng 2.6: Danh sách Cloud Functions**

| STT | Function | Mục đích | Trigger Type |
|-----|----------|----------|--------------|
| 1 | generateContent | Tạo text/image với AI (Gemini/Groq/SDXL) | onCall |
| 2 | requestVideoGeneration | Đưa yêu cầu tạo video vào hàng đợi | onCall |
| 3 | processVideoQueue | Xử lý hàng đợi video với Veo 3.1 | PubSub Schedule |
| 4 | getVideoQueueStatus | Kiểm tra trạng thái video đang xử lý | onCall |
| 5 | saveProject | Lưu dự án và lịch sử chat | onCall |
| 6 | getProjects | Lấy danh sách dự án của user | onCall |
| 7 | getProject | Lấy chi tiết một dự án | onCall |
| 8 | deleteProject | Xóa dự án | onCall |
| 9 | createPost | Tạo bài đăng Inspiration | onCall |
| 10 | getPosts | Lấy danh sách bài đăng (feed) | onCall |
| 11 | likePost | Like/unlike bài đăng | onCall |
| 12 | savePostToFavorites | Lưu bài vào danh sách yêu thích | onCall |
| 13 | getTopCreators | Lấy danh sách top creators | onCall |
| 14 | createPaymentLink | Tạo link thanh toán PayOS | onCall |
| 15 | payosWebhook | Xử lý callback khi thanh toán thành công | onRequest |
| 16 | getTikTokAuthUrl | Lấy URL OAuth TikTok | onCall |
| 17 | handleTikTokCallback | Xử lý callback từ TikTok | onRequest |
| 18 | logUserLogin | Ghi log hoạt động đăng nhập | onCall |
| 19 | initializeUser | Khởi tạo dữ liệu cho user mới | Auth Trigger |

## 2.7. Thiết kế cơ sở dữ liệu

Dự án sử dụng **Firestore** - cơ sở dữ liệu NoSQL document-based của Firebase. Dữ liệu được tổ chức thành các collections và documents với cấu trúc linh hoạt.

### 2.7.1. Collection: users

Lưu trữ thông tin người dùng và trạng thái tài khoản.

**Bảng 2.7: Thiết kế Collection users**

| Field | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-------|-------------|-------|-----------|
| uid | string | ID người dùng từ Firebase Auth | Primary Key, Unique |
| email | string | Địa chỉ email | Not Null, Unique |
| displayName | string | Tên hiển thị | Not Null |
| photoURL | string | URL avatar | Nullable |
| credits | number | Số credit hiện có | Default: 10, >= 0 |
| plan | string | Gói đăng ký | Enum: free, pro, premium |
| role | string | Vai trò người dùng | Enum: user, admin |
| language | string | Ngôn ngữ giao diện | Enum: vi, en |
| theme | string | Chế độ giao diện | Enum: light, dark, system |
| provider | string | Phương thức đăng nhập | Enum: email, google, facebook, tiktok |
| emailVerified | boolean | Trạng thái xác thực email | Default: false |
| notificationsEnabled | boolean | Nhận thông báo email | Default: true |
| createdAt | timestamp | Thời điểm tạo tài khoản | Auto-generated |
| updatedAt | timestamp | Thời điểm cập nhật cuối | Auto-updated |
| lastLoginAt | timestamp | Thời điểm đăng nhập cuối | Nullable |

### 2.7.2. Collection: projects

Lưu trữ các dự án và lịch sử chat với AI.

**Bảng 2.8: Thiết kế Collection projects**

| Field | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-------|-------------|-------|-----------|
| id | string | ID dự án | Primary Key, Auto-generated |
| userId | string | ID người tạo | Foreign Key  users.uid |
| title | string | Tiêu đề dự án | Not Null, Max 100 chars |
| type | string | Loại nội dung chính | Enum: text, image, video |
| lastModel | string | Model AI sử dụng cuối | Nullable |
| messages | array | Lịch sử chat | Array of Message objects |
| attachedFiles | array | Files đính kèm | Array of File objects |
| thumbnail | string | URL ảnh đại diện | Nullable |
| createdAt | timestamp | Thời điểm tạo | Auto-generated |
| updatedAt | timestamp | Thời điểm cập nhật | Auto-updated |

**Sub-document: Message**
- role: string (user/assistant)
- content: string (nội dung message)
- imageUrl: string (URL ảnh nếu có)
- videoUrl: string (URL video nếu có)
- timestamp: timestamp

### 2.7.3. Collection: posts (Inspiration)

Lưu trữ các bài đăng chia sẻ trên trang Inspiration.

**Bảng 2.9: Thiết kế Collection posts**

| Field | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-------|-------------|-------|-----------|
| id | string | ID bài đăng | Primary Key, Auto-generated |
| authorId | string | ID người đăng | Foreign Key  users.uid |
| authorName | string | Tên người đăng | Not Null |
| authorAvatar | string | Avatar người đăng | Nullable |
| type | string | Loại nội dung | Enum: image, video, text |
| title | string | Tiêu đề | Not Null, Max 200 chars |
| description | string | Mô tả chi tiết | Max 2000 chars |
| prompt | string | Prompt sử dụng | Max 1000 chars |
| mediaUrl | string | URL media chính | Not Null |
| category | string | Danh mục | Enum: art, marketing, social, other |
| tags | array | Danh sách tags | Array of strings |
| likes | number | Số lượt thích | Default: 0 |
| views | number | Số lượt xem | Default: 0 |
| saves | number | Số lượt lưu | Default: 0 |
| likedBy | array | Danh sách user đã like | Array of user IDs |
| savedBy | array | Danh sách user đã save | Array of user IDs |
| isPublic | boolean | Trạng thái công khai | Default: true |
| isFeatured | boolean | Được admin đề xuất | Default: false |
| createdAt | timestamp | Thời điểm đăng | Auto-generated |

### 2.7.4. Collection: transactions

Lưu trữ lịch sử giao dịch nạp credit.

**Bảng 2.10: Thiết kế Collection transactions**

| Field | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-------|-------------|-------|-----------|
| id | string | ID giao dịch | Primary Key, Auto-generated |
| userId | string | ID người dùng | Foreign Key  users.uid |
| orderCode | string | Mã đơn hàng PayOS | Unique |
| amount | number | Số tiền (VND) | > 0 |
| credits | number | Số credit nhận được | > 0 |
| packageName | string | Tên gói mua | Not Null |
| status | string | Trạng thái giao dịch | Enum: pending, success, failed, cancelled |
| paymentMethod | string | Phương thức thanh toán | Nullable |
| paymentLinkId | string | ID link thanh toán PayOS | Nullable |
| checkoutUrl | string | URL thanh toán | Nullable |
| createdAt | timestamp | Thời điểm tạo | Auto-generated |
| completedAt | timestamp | Thời điểm hoàn thành | Nullable |

### 2.7.5. Collection: videoQueue

Lưu trữ hàng đợi xử lý video.

**Bảng 2.11: Thiết kế Collection videoQueue**

| Field | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-------|-------------|-------|-----------|
| id | string | ID trong queue | Primary Key |
| userId | string | ID người yêu cầu | Foreign Key  users.uid |
| projectId | string | ID dự án liên quan | Foreign Key  projects.id |
| prompt | string | Prompt tạo video | Not Null |
| imageUrl | string | URL ảnh đầu vào (nếu có) | Nullable |
| aspectRatio | string | Tỷ lệ khung hình | Enum: 16:9, 9:16, 1:1, 4:3, 3:4 |
| model | string | Model sử dụng | Enum: veo-3.1-fast, veo-3.1-standard |
| status | string | Trạng thái | Enum: pending, processing, completed, failed |
| videoUrl | string | URL video kết quả | Nullable |
| error | string | Thông báo lỗi nếu có | Nullable |
| createdAt | timestamp | Thời điểm tạo | Auto-generated |
| processedAt | timestamp | Thời điểm xử lý xong | Nullable |

### 2.7.6. Sơ đồ quan hệ giữa các Collection (ERD)

`
       
      users                transactions  
       
 uid (PK)         userId (FK)     
 email                   id (PK)         
 displayName             orderCode       
 credits                 amount          
 plan                    credits         
 role                    status          
 ...                     ...             
       
         
          1:N
         
       
    projects                  posts      
       
 id (PK)                 id (PK)         
 userId (FK)             authorId (FK)   
 title                   title                 
 type                    type                  
 messages[]              mediaUrl              
 ...                     likes                 
        likedBy[]       
                          ...               N:M (users  posts)
          1:N            
         

   videoQueue    

 id (PK)         
 userId (FK)     
 projectId (FK)  
 prompt          
 status          
 videoUrl        
 ...             

`

## 2.8. Thiết kế giao diện người dùng

### 2.8.1. Nguyên tắc thiết kế

Giao diện người dùng được thiết kế theo các nguyên tắc UX/UI hiện đại:

**Responsive First:** Thiết kế ưu tiên mobile trước, sau đó mở rộng cho tablet và desktop với các breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Dark Mode:** Hỗ trợ chế độ giao diện tối, giảm mỏi mắt khi sử dụng lâu dài.

**Accessibility:** Đảm bảo contrast ratio đạt chuẩn WCAG AA, hỗ trợ screen readers.

**Consistency:** Sử dụng design system thống nhất với Tailwind CSS.

**Feedback:** Hiển thị loading states, success/error messages rõ ràng với Toast notifications.

### 2.8.2. Wireframe các màn hình chính

**Màn hình 1: Landing Page (LandingPage.jsx - 529 dòng)**
- Hero section với tiêu đề và CTA (Call-to-Action)
- Feature cards giới thiệu 3 tính năng chính
- Infinite carousel hiển thị các tác phẩm mẫu
- Pricing section với 3 gói
- Footer với links và social media

**Màn hình 2: Dashboard (DashboardHome.jsx - 560 dòng)**  
- Sidebar navigation (collapsible trên mobile)
- Header với user info, notifications, language switcher
- Suggestions cards để bắt đầu tạo nội dung
- Recent projects section

**Màn hình 3: Agent Chat (AgentChat.jsx - 1119 dòng)**
- Chat history panel (left sidebar trên desktop)
- Model selector dropdown (Groq, Gemini, SDXL, Veo)
- Chat messages area với Markdown rendering
- Input box với file upload và aspect ratio selector
- Generated content preview với lightbox

**Màn hình 4: Inspiration (Inspiration.jsx - 461 dòng)**
- Category tabs (All, Images, Videos, Text)
- Masonry grid layout cho posts
- Like, Save, Use Prompt buttons
- Top Creators sidebar
- Load more pagination

**Màn hình 5: Settings (ProfileSettings.jsx - 577 dòng)**
- Avatar upload with crop
- Form cập nhật thông tin cá nhân
- Language và Theme toggles
- Notification preferences
- Danger zone (delete account)

### 2.8.3. Cấu trúc thư mục Frontend

`
frontend/src/
 components/                    # 49 React components
    Auth/
       AuthModal.jsx          # Modal đăng nhập/đăng ký
       EmailVerificationBlocker.jsx
    Dashboard/
       Sidebar.jsx            # Navigation sidebar
       Header.jsx             # Top header
       DashboardHome.jsx      # Trang chủ dashboard
       AgentChat.jsx          # Chat với AI
       Inspiration.jsx        # Trang cảm hứng
       ProfileSettings.jsx    # Cài đặt
       Credits.jsx            # Nạp credit
       ...                    # 17 components khác
    Projects/
       ProjectsPage.jsx       # Danh sách dự án
       ProjectCard.jsx        # Card hiển thị dự án
    Shared/
        Button.jsx             # Button component
        Modal.jsx              # Modal component
        Toast.jsx              # Toast notification
 pages/
    LandingPage.jsx            # Trang giới thiệu
    Home.jsx                   # Trang chính (dashboard)
    Pricing.jsx                # Trang giá
    ...
 contexts/
    AuthContext.jsx            # Auth state management
    LanguageContext.jsx        # i18n context
    ThemeContext.jsx           # Dark/Light mode
 services/
    firebaseFunctions.js       # Wrapper gọi Cloud Functions
 i18n/
    translations.js            # Tiếng Việt & English
 utils/
    toast.js                   # Toast helper
 config/
     firebase.js                # Firebase config
`

### 2.8.4. Flow người dùng chính

**Flow 1: Đăng ký và bắt đầu sử dụng**
1. User truy cập Landing Page
2. Click "Bắt đầu miễn phí"  Mở AuthModal
3. Chọn đăng ký bằng Email/Google/Facebook
4. Nhận email verification (nếu dùng Email)
5. Xác thực email  Redirect về Dashboard
6. Nhận 10 credits miễn phí

**Flow 2: Tạo nội dung AI**
1. User vào Dashboard  Click "Tạo mới" hoặc suggestion card
2. Redirect sang Agent Chat
3. Chọn model AI (Groq miễn phí / Gemini / SDXL / Veo)
4. Nhập prompt, đính kèm file nếu cần
5. Click Send  AI xử lý và trả về kết quả
6. Kết quả được lưu tự động vào project
7. User có thể download hoặc share lên Inspiration

**Flow 3: Nạp credit**
1. User vào trang Credits hoặc click notification "Hết credit"
2. Chọn gói credit phù hợp
3. Click "Mua ngay"  Redirect sang trang PayOS
4. Thanh toán qua MoMo/ZaloPay/Bank Transfer
5. PayOS callback  Cloud Function xử lý
6. Credit được cộng vào tài khoản
7. User nhận thông báo thành công
