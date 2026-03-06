# Hướng dẫn Trang Cảm hứng (Inspiration Page)

Trang **Cảm hứng (Inspiration)** là một phần quan trọng của hệ thống Content Creator AI, nơi người dùng có thể chia sẻ các tác phẩm được tạo bởi AI và khám phá những ý tưởng mới từ cộng đồng.

---

## 1. Mục đích và Ý nghĩa
Trang Cảm hứng đóng vai trò như một kho lưu trữ và thư viện ý tưởng cộng đồng. Nó giúp:
- **Trưng bày**: Giới thiệu các kết quả ấn tượng từ các mô hình Image, Video và Text AI.
- **Học hỏi**: Xem cách người khác viết prompt để đạt được kết quả mong muốn.
- **Tái sử dụng**: Dễ dàng sao chép và thử nghiệm lại các prompt thành công.

---

## 2. Quy trình làm việc (Workflow)

### A. Từ Sáng tạo đến Chia sẻ
1. **Tạo nội dung**: Bạn tạo Ảnh, Video hoặc Văn bản tại trang **Dashboard**.
2. **Chia sẻ**: Sau khi hoàn thành, nhấn nút "Chia sẻ" (Share) trên kết quả.
3. **Thiết lập**: Một cửa sổ (ShareModal) hiện ra cho phép bạn đặt tiêu đề, chọn danh mục (Travel, Food, etc.) và thêm tags.
4. **Xuất bản**: Bài viết sẽ được lưu vào bộ sưu tập `posts` trên Firestore và xuất hiện công khai trên trang Inspiration.

### B. Khám phá và Tái sử dụng (Remix)
1. **Khám phá**: Truy cập trang **Cảm hứng** để lướt qua các bài viết mới nhất hoặc phổ biến.
2. **Sử dụng Prompt**: 
   - Nhấn vào một bài viết để xem chi tiết.
   - Nhấn nút **"Dùng prompt này" (Use Prompt)**.
   - Hệ thống sẽ tự động đưa bạn quay lại Dashboard, điền sẵn Prompt và các thông số (Model, Category) để bạn có thể tạo phiên bản mới của riêng mình.

---

## 3. Các Tính năng Chính

### 🖼️ Feed & Bộ lọc
- **Chuyển đổi Tab**: Lọc nhanh theo loại nội dung (Tất cả, Ảnh, Video, Văn bản).
- **Danh mục (Categories)**: Thu hẹp tìm kiếm theo chủ đề cụ thể.
- **Tìm kiếm**: Thanh tìm kiếm phía trên giúp bạn tìm các từ khóa trong tiêu đề hoặc prompt.

### ❤️ Tương tác & Cộng đồng
- **Thích (Like)**: Tăng độ phổ biến cho bài viết.
- **Lưu (Save/Bookmark)**: Lưu bài viết vào danh sách yêu thích cá nhân để xem lại sau.
- **Bình luận (Comments)**: Thảo luận và góp ý về các tác phẩm.
- **Theo dõi (Follow)**: Theo dõi các nhà sáng tạo nội dung mà bạn yêu thích để không bỏ lỡ bài viết của họ.

---

## 4. Chi tiết Kỹ thuật (Dành cho nhà phát triển)

### Cơ sở dữ liệu (Firestore)
- **Collection `posts`**: Lưu trữ thông tin bài viết (mediaUrl, prompt, authorName, authorAvatar, stats).
- **Collection `comments`**: Lưu trữ các bình luận theo `postId`.
- **Collection `followers`**: Quản lý mối quan hệ giữa người theo dõi và tác giả.

### Cloud Functions
Hệ thống sử dụng các functions chính:
- `getPosts`: Lấy danh sách bài viết với bộ lọc và phân trang.
- `createPost`: Xử lý việc đăng bài mới.
- `likePost` / `savePost`: Xử lý các tương tác toggle.
- `incrementPostUsage`: Theo dõi số lần một prompt được tái sử dụng.

---

## 5. Mẹo sử dụng (Tips)
- **Xem Prompt**: Luôn kiểm tra phần "Chi tiết" trong Modal bài viết để thấy chính xác prompt mà tác giả đã dùng.
- **Theo dõi Tác giả**: Nhấp vào avatar của tác giả để xem hồ sơ cá nhân và tất cả các bài viết họ đã chia sẻ.
- **Tương tác**: Hãy like và comment để khích lệ cộng đồng sáng tạo!

## Phân tích Kỹ thuật: Luồng dữ liệu và Tốc độ

Một trong những thắc mắc lớn nhất là **"Tại sao lại cảm thấy load dữ liệu chậm hơn TikTok?"**. Để hiểu điều này, chúng ta cần nhìn vào "xương sống" của hệ thống.

### 1. Cách hệ thống hiện tại load dữ liệu
Tôi đã code logic này theo mô hình **On-demand (Theo yêu cầu)**:
- **Client-side (React):** Khi bạn vào trang, `useEffect` sẽ gọi hàm `fetchPosts`.
- **Server-side (Cloud Functions):** Hệ thống gọi API `getPosts`. Tại đây, database (Firestore) sẽ quét các bài viết được đánh dấu `isPublic: true`.
- **Pagination (Phân trang):** Tôi sử dụng `limit(20)` để chỉ lấy 20 bản ghi mỗi lần. Nếu bạn cuộn xuống cuối, hệ thống mới lấy tiếp bằng `startAfter`.

### 2. Tại sao lại chậm hơn TikTok? (Phân tích nút thắt cổ chai)

TikTok là một "con quái vật" về tốc độ vì họ giải quyết được 3 vấn đề mà hệ thống hiện tại của chúng ta còn đang ở mức cơ bản:

| Vấn đề | Hệ thống hiện tại | TikTok |
| :--- | :--- | :--- |
| **Cold Starts** | Dùng Cloud Functions. Nếu lâu không có người truy cập, server "ngủ" và mất 2-3 giây để khởi động lại. | Server luôn chạy (Warm) trên hệ thống phân tán toàn cầu. |
| **Xử lý ảnh/video** | Load ảnh trực tiếp từ Storage với độ phân giải gốc. Nếu ảnh nặng 5MB, bạn phải chờ tải hết 5MB. | **Image Proxy:** Họ tự động nén ảnh thành thumbnail cực nhẹ (chỉ vài KB) và chỉ load bản chuẩn khi cần. |
| **Cơ chế nạp trước** | Chỉ load khi bạn truy cập trang. | **Predictive Prefetching:** Thuật toán đoán bạn sẽ xem gì tiếp theo và tải sẵn vào bộ nhớ đệm (Cache) ngay cả khi bạn chưa cuộn tới. |
| **Database Query** | Quét trực tiếp trên Firestore. Dù nhanh nhưng vẫn phụ thuộc vào số lượng Index. | Sử dụng **In-memory Database (Redis)** để truy xuất dữ liệu trong vài mili giây. |

### 3. Cách tôi đã code để tối ưu hóa
Dù chưa thể mạnh như một tập đoàn nghìn tỷ đô, tôi đã áp dụng các kỹ thuật "con nhà nghèo" nhưng hiệu quả:
- **Optimistic UI:** Khi bạn Like, số Like tăng ngay lập tức trên màn hình trước khi Server xác nhận.
- **Lazy Loading:** Tôi dùng thuộc tính `loading="lazy"` cho thẻ `<img>`. Trình duyệt sẽ trì hoãn việc tải ảnh cho đến khi nó sắp xuất hiện trong khung hình.
- **Skeleton Loading:** Hiển thị các ô xám mờ để người dùng cảm thấy hệ thống đang hoạt động, giảm bớt sự khó chịu khi chờ đợi.

### 4. Hướng cải thiện trong tương lai
Để trang Cảm hứng "bay" như TikTok, chúng ta có thể:
1. **Sử dụng CDN:** Đưa ảnh qua Cloudflare hoặc Akamai để tải từ server gần người dùng nhất.
2. **Thumbnail Service:** Tự động tạo ảnh thu nhỏ khi người dùng upload bài viết.
3. **Caching:** Lưu trữ danh sách bài viết phổ biến vào bộ nhớ tạm của Browser (LocalStorage).

Tôi đã viết chi tiết các mục này vào tài liệu hướng dẫn để bạn có cái nhìn tổng quan nhất về hệ thống mình đang sở hữu.
