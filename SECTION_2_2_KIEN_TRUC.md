## 2.2. Thiết kế kiến trúc hệ thống

### 2.2.1. Kiến trúc tổng thể

Hệ thống Content Creator AI được xây dựng theo mô hình **Serverless 3 tầng (Three-tier Architecture)** kết hợp dịch vụ đám mây Firebase và các API AI bên ngoài:

- **Tầng trình bày (Presentation Tier):** React SPA chạy trên trình duyệt, xử lý giao diện và tương tác phía client.
- **Tầng xử lý nghiệp vụ (Business Logic Tier):** Firebase Cloud Functions — các hàm serverless xử lý logic: xác thực, credit, gọi API AI, thanh toán.
- **Tầng dữ liệu (Data Tier):** Firestore (NoSQL) + Firebase Storage (ảnh, video).

### 2.2.2. Mô tả chi tiết các thành phần, module

#### 2.2.2.1. Tầng trình bày (Frontend)

Single Page Application sử dụng React 19, đóng gói bằng Vite, styling với Tailwind CSS.

**Bảng 2.x: Các module chính của tầng Frontend**

| Module | Chức năng | Mô tả |
|--------|-----------|-------|
| Giao diện (Components) | Xây dựng các thành phần UI | Bao gồm các thành phần giao diện tái sử dụng cho xác thực, bảng điều khiển, quản lý dự án và các thành phần dùng chung |
| Trang (Pages) | Điều hướng ứng dụng | Các trang chính: Landing Page, Trang chủ, Bảng giá, Đăng nhập, Đăng ký |
| Quản lý trạng thái (Contexts) | Lưu trữ trạng thái toàn cục | Quản lý thông tin đăng nhập, chế độ sáng/tối, ngôn ngữ hiển thị, trạng thái sidebar |
| Dịch vụ (Services) | Giao tiếp với Backend | Lớp trung gian gọi Cloud Functions và xử lý tạo video bất đồng bộ |
| Đa ngôn ngữ (i18n) | Hỗ trợ song ngữ | Chuyển đổi giao diện giữa Tiếng Việt và Tiếng Anh |
| Tiện ích (Utils) | Các hàm hỗ trợ | Hiển thị thông báo, định dạng dữ liệu, kiểm tra đầu vào |

**Quản lý trạng thái:** React Context API với 3 context chính:
- **AuthContext:** Phiên đăng nhập, thông tin người dùng (credit, plan), hỗ trợ OAuth (Google, Facebook).
- **ThemeContext:** Chế độ sáng/tối.
- **LanguageContext:** Chuyển đổi ngôn ngữ Việt/Anh.

**Bảo vệ route:** Cơ chế kiểm tra xác thực và trạng thái xác minh email trước khi cho phép truy cập trang nội bộ. Chưa đăng nhập → chuyển hướng về Landing. Chưa xác thực email → màn hình chặn yêu cầu xác minh.

#### 2.2.2.2. Tầng xử lý nghiệp vụ (Backend – Cloud Functions)

TypeScript biên dịch sang JavaScript, chạy trên Node.js 20.

**Bảng 2.x: Phân nhóm Cloud Functions**

| Nhóm | Chức năng | Mô tả |
|------|-----------|-------|
| Tạo nội dung AI | Tạo văn bản, hình ảnh, video | Gọi API AI (Groq, Gemini, Stability, Veo), quản lý hàng đợi video bất đồng bộ |
| Quản lý dự án | CRUD dự án | Tạo, đọc, cập nhật, xóa dự án và lịch sử chat |
| Cộng đồng | Tương tác Inspiration | Đăng bài, lấy danh sách, like, lưu yêu thích, top tác giả |
| Thanh toán | Xử lý giao dịch | Tạo link thanh toán PayOS, xử lý webhook khi thanh toán thành công |
| Xác thực | Quản lý phiên | OAuth TikTok, ghi log đăng nhập, khởi tạo tài khoản mới |

**Cơ chế quản lý credit:** Sử dụng Firestore Transaction đảm bảo tính nguyên tử khi trừ credit. Nếu API AI thất bại → tự động hoàn trả credit.

**Bảng 2.x: Chi phí credit theo loại nội dung**

| Loại nội dung | Model | Chi phí (credit) |
|---------------|-------|-----------------|
| Văn bản | Groq (Llama 3.3/3.1) | 0 (miễn phí) |
| Văn bản | Gemini Flash | 1 |
| Văn bản | Gemini Pro | 3 |
| Hình ảnh | Nano Banana (SDXL) | 5 |
| Hình ảnh | Nano Banana Pro | 8 |
| Video | Veo 3.1 Fast | 30 |
| Video | Veo 3.1 Standard | 50 |

#### 2.2.2.3. Tầng dữ liệu

- **Firestore:** Cơ sở dữ liệu NoSQL dạng document, hỗ trợ lắng nghe thay đổi thời gian thực, tự động mở rộng, bảo vệ bằng Security Rules.
- **Firebase Storage:** Lưu trữ ảnh và video với CDN toàn cầu.

#### 2.2.2.4. Dịch vụ bên ngoài

**Bảng 2.x: Dịch vụ bên ngoài**

| Dịch vụ | Nhà cung cấp | Vai trò | Giao thức |
|---------|-------------|---------|-----------|
| Gemini API | Google DeepMind | Tạo văn bản + hình ảnh | Google AI SDK |
| Groq API | Groq Inc. | Tạo văn bản miễn phí (Llama) | REST |
| Stability AI | Stability AI | Tạo hình ảnh SDXL | REST |
| Veo 3.1 | Google DeepMind | Tạo video | Google AI SDK |
| PayOS | PayOS Vietnam | Thanh toán QR, MoMo, ZaloPay | REST + Webhook |
| SendGrid | Twilio | Email thông báo | REST |

#### 2.2.2.5. Biểu đồ Use Case tổng quát

Biểu đồ Use Case tổng quát mô tả 13 chức năng cốt lõi của hệ thống, được phân bổ vào 5 phân hệ chính: Xác thực & Cá nhân hóa, AI Agent & Tạo nội dung, Cộng đồng Inspiration, Quản lý Tài sản và Tài chính & Gói cước.

-- Hình 2.x: Biểu đồ Use Case tổng quát (Sơ đồ 1 – MERMAID_CODE.txt) --

#### 2.2.2.6. Nhóm chức năng Xác thực và Cá nhân hóa (UC01 – UC03)

Phân hệ này đảm nhận việc quản lý định danh và quyền truy cập, bao gồm các chức năng cốt lõi: Đăng ký (UC01), Đăng nhập (UC02) và Quản lý hồ sơ & Follow (UC03). Trong đó, chức năng Đăng ký tài khoản bắt buộc bao gồm (include) bước Xác thực email để đảm bảo tính chính danh; chức năng Đăng nhập hỗ trợ mở rộng (extend) qua các nền tảng OAuth; và chức năng Quản lý hồ sơ cho phép tùy chỉnh thông tin cá nhân kèm theo các tương tác theo dõi người dùng khác.

-- Hình 2.x: Biểu đồ Use Case phân rã – Nhóm Xác thực & Hồ sơ (Sơ đồ 2 – MERMAID_CODE.txt) --

**UC01 – Đăng ký tài khoản**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Đăng ký tài khoản |
| Tác nhân | Khách vãng lai |
| Mô tả | Khách vãng lai tạo tài khoản mới bằng email/mật khẩu hoặc qua Google/Facebook để sử dụng hệ thống. |
| Tiền điều kiện | - Chưa có tài khoản trong hệ thống. |
| Điều kiện kích hoạt | Khách vãng lai nhấn nút "Đăng ký" hoặc "Sign Up" trên giao diện. |
| Đảm bảo thành công | - Tài khoản được tạo thành công trên hệ thống. - Cấp 5 credit miễn phí cho tài khoản mới. - Gửi email xác thực đến địa chỉ email đã đăng ký. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hành động "Đăng ký bằng Email" |
|-----|----------|-------------------------------|
| 1 | Khách vãng lai | Chọn tab "Đăng ký" trên modal xác thực. |
| 2 | Hệ thống | Hiển thị form đăng ký gồm: Tên hiển thị, Email, Mật khẩu, Xác nhận mật khẩu. |
| 3 | Khách vãng lai | Nhập đầy đủ thông tin và nhấn "Đăng ký". |
| 4 | Hệ thống | Kiểm tra tính hợp lệ: email đúng định dạng, mật khẩu ≥ 6 ký tự, xác nhận khớp. |
| 5 | Hệ thống | Tạo tài khoản trên Firebase Auth, khởi tạo dữ liệu người dùng với 5 credit. |
| 6 | Hệ thống | Gửi email xác thực đến địa chỉ email đã đăng ký. |
| 7 | Hệ thống | Hiển thị màn hình yêu cầu xác thực email. |

| STT | Tác nhân | Hành động "Đăng ký bằng Google/Facebook" |
|-----|----------|------------------------------------------|
| 1 | Khách vãng lai | Nhấn nút "Đăng nhập bằng Google" hoặc "Đăng nhập bằng Facebook". |
| 2 | Hệ thống | Chuyển hướng sang trang xác thực của nhà cung cấp (Google/Facebook). |
| 3 | Khách vãng lai | Chọn tài khoản và cấp quyền truy cập. |
| 4 | Hệ thống | Nhận thông tin từ nhà cung cấp, tạo tài khoản mới với 5 credit. |
| 5 | Hệ thống | Chuyển hướng vào Dashboard. |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 4.1 | Hệ thống | Thông báo lỗi nếu email đã tồn tại hoặc định dạng không hợp lệ. |
| 4.2 | Khách vãng lai | Nhập lại thông tin và tiến hành đăng ký lại. |

**Mô tả hoạt động Đăng ký:** Sau khi khách vãng lai nhấn "Đăng ký" và điền đầy đủ thông tin, hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu. Controller sẽ gửi yêu cầu tạo tài khoản tới Firebase Auth service; nếu thành công, hệ thống tiếp tục khởi tạo hồ sơ người dùng trong Database và thực thi nghiệp vụ tặng 5 credit ban đầu kèm theo việc gửi email xác thực tự động.

-- Hình 2.x: Biểu đồ tuần tự UC01 – Đăng ký (Sơ đồ 6 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ hoạt động UC01 – Đăng ký (Sơ đồ 7 – MERMAID_CODE.txt) --

**UC02 – Đăng nhập hệ thống**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Đăng nhập |
| Tác nhân | Khách vãng lai |
| Mô tả | Khách vãng lai đăng nhập vào hệ thống bằng email/mật khẩu hoặc qua Google/Facebook để truy cập các chức năng. |
| Tiền điều kiện | - Đã có tài khoản trong hệ thống. |
| Điều kiện kích hoạt | Khách vãng lai nhấn nút "Đăng nhập" hoặc "Sign In" trên giao diện. |
| Đảm bảo thành công | - Đăng nhập thành công, chuyển hướng vào Dashboard. - Hiển thị thông tin người dùng và số credit hiện có. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hành động "Đăng nhập bằng Email" |
|-----|----------|----------------------------------|
| 1 | Khách vãng lai | Chọn tab "Đăng nhập" trên modal xác thực. |
| 2 | Hệ thống | Hiển thị form đăng nhập gồm: Email, Mật khẩu. |
| 3 | Khách vãng lai | Nhập email và mật khẩu, nhấn "Đăng nhập". |
| 4 | Hệ thống | Xác thực thông tin đăng nhập với Firebase Auth. |
| 5 | Hệ thống | Kiểm tra trạng thái xác thực email. |
| 6 | Hệ thống | Chuyển hướng vào Dashboard, hiển thị thông tin người dùng. |

| STT | Tác nhân | Hành động "Đăng nhập bằng Google/Facebook" |
|-----|----------|--------------------------------------------|
| 1 | Khách vãng lai | Nhấn nút "Đăng nhập bằng Google" hoặc "Đăng nhập bằng Facebook". |
| 2 | Hệ thống | Chuyển hướng sang trang xác thực của nhà cung cấp. |
| 3 | Khách vãng lai | Chọn tài khoản và xác nhận. |
| 4 | Hệ thống | Nhận token xác thực, đăng nhập thành công. |
| 5 | Hệ thống | Chuyển hướng vào Dashboard. |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 4.1 | Hệ thống | Thông báo lỗi nếu email hoặc mật khẩu không chính xác. |
| 4.2 | Khách vãng lai | Nhập lại thông tin đăng nhập. |
| 5.1 | Hệ thống | Nếu email chưa xác thực, hiển thị màn hình chặn yêu cầu xác minh email. |
| 5.2 | Khách vãng lai | Kiểm tra email và thực hiện xác thực (xem UC03). |

**Mô tả hoạt động Đăng nhập:** Sau khi chọn phương thức đăng nhập trên giao diện, người dùng nhập thông tin (hoặc xác thực qua Provider). Hệ thống sẽ gửi yêu cầu xác thực tới Firebase Auth, controller xử lý kết quả trả về, kiểm tra trạng thái tài khoản và chuyển hướng người dùng vào Dashboard nếu thông tin hợp lệ.

-- Hình 2.x: Biểu đồ tuần tự UC02 – Đăng nhập (Sơ đồ 8 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ hoạt động UC02 – Đăng nhập (Sơ đồ 9 – MERMAID_CODE.txt) --

Các use case còn lại trong nhóm Xác thực và Cá nhân hóa (UC03) có luồng xử lý tương tự hoặc đơn giản hơn, được tóm tắt trong bảng sau:

| UC | Tên Use Case | Mô tả quy trình |
|----|--------------|-----------------|
| UC03 | Quản lý hồ sơ & Follow | Người dùng xem, cập nhật thông tin cá nhân (ảnh đại diện, tiểu sử, mật khẩu) và thực hiện theo dõi/bỏ theo dõi người dùng khác trên hệ thống. |


#### 2.2.2.7. Nhóm chức năng AI Agent & Tạo nội dung (UC04 – UC06)

Nhóm chức năng này là giá trị cốt lõi của hệ thống, cho phép người dùng tương tác với AI Agent để tạo ra các loại nội dung khác nhau (văn bản, hình ảnh, video) và quản lý tiến trình làm việc.

-- Hình 2.x: Biểu đồ Use Case phân rã – Nhóm AI Agent & Tạo nội dung (Sơ đồ 3 – MERMAID_CODE.txt) --

**UC04 – Trợ lý AI (Concierge / Chatbot)**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Trợ lý AI (Concierge / Chatbot) |
| Tác nhân | Người dùng |
| Mô tả | Người dùng tương tác với Trợ lý AI thông minh tích hợp sẵn các gợi ý "Hành động nhanh" (Quick Actions) như Viết blog, Tạo caption, Lên kế hoạch, v.v. để định hướng sáng tạo ban đầu một cách trơn tru, thay vì chỉ tạo nội dung thô (như UC05). |
| Tiền điều kiện | - Đã đăng nhập vào hệ thống. |
| Điều kiện kích hoạt | Người dùng mở giao diện Concierge/Chatbot ở góc màn hình hoặc tab chuyên dụng. |
| Đảm bảo thành công | - Trợ lý đóng vai trò dẫn dắt, gợi ý phương án kế hoạch/nội dung rõ ràng. - Phản hồi AI hiển thị thành công qua giao diện chat tự nhiên. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 1 | Người dùng | Mở cửa sổ Chatbot (Concierge). |
| 2 | Hệ thống | Hiển thị lời chào và danh sách các lựa chọn "Hành động nhanh" (Quick Actions: "Tôi muốn viết blog post", "Tạo caption Instagram", v.v.). |
| 3 | Người dùng | Bấm chọn một Quick Action hoặc nhập trực tiếp câu hỏi/yêu cầu vào ô "Ask anything...". |
| 4 | Hệ thống | Gửi ngữ cảnh (Context bao gồm Quick Action được chọn) và prompt lên dịch vụ AI Model. |
| 5 | Dịch vụ AI | Tiếp nhận, xử lý và stream câu trả lời đóng vai trò chuyên gia tư vấn (Concierge). |
| 6 | Hệ thống | Cập nhật giao diện Chat, hiển thị phản hồi thành các bước kế hoạch, gợi ý hoặc văn bản mẫu ngắn gọn. |
| 7 | Người dùng | Có thể chat tiếp để hội thoại hoặc dùng nút rẽ nhánh để chuyển sang bộ công cụ Tạo nội dung AI chuyên sâu (Chuyển sang UC05). |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 5.1 | Dịch vụ AI | Nếu API gặp sự cố (Timeout/Error), trả về mã lỗi. |
| 6.1 | Hệ thống | Hiển thị thông báo "Concierge đang bận, vui lòng thử lại sau" trong khung chat. |

**Mô tả hoạt động Trợ lý AI:** Sau khi mở cửa sổ Concierge, người dùng chọn một "Hành động nhanh" hoặc nhập yêu cầu trực tiếp. Giao diện sẽ gửi nội dung kèm ngữ cảnh tới AI Service thông qua Backend controller. AI xử lý và trả về luồng dữ liệu (stream) tư vấn, hệ thống cập nhật kết quả lên khung chat và gợi ý các bước thực hiện tiếp theo.

-- Hình 2.x: Biểu đồ tuần tự UC04 – Trợ lý AI (Sơ đồ 12 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ hoạt động UC04 – Trợ lý AI (Sơ đồ 13 – MERMAID_CODE.txt) --


**UC05 – Tạo nội dung AI**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Tạo nội dung AI (Text/Image/Video) |
| Tác nhân | Người dùng |
| Mô tả | Người dùng sử dụng các chức năng chuyên biệt để tạo ra Văn bản, Hình ảnh hoặc Video theo thông số đã thiết lập. |
| Đảm bảo thành công | - File kết quả được tạo thành công và cho phép tải về/lưu trữ. |

**Luồng sự kiện chính (Tiêu biểu: Tạo Hình ảnh AI):**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 1 | Người dùng | Chọn tab "Image" trên giao diện công cụ. |
| 2 | Hệ thống | Hiển thị ô nhập prompt và bảng cài đặt (Model, Tỷ lệ khung hình). |
| 3 | Người dùng | Chọn Model AI (vd: Stability) và Tỷ lệ khung hình (vd: 16:9). |
| 4 | Người dùng | Nhập prompt mô tả hình ảnh mong muốn và nhấn "Tạo ảnh". |
| 5 | Hệ thống | Kiểm tra số dư Credit của người dùng có đủ cho thao tác này không. |
| 6 | Hệ thống | Khấu trừ tiền Credit tương ứng (vd: trừ 4 Credit). |
| 7 | Hệ thống | Gọi API đến dịch vụ tạo ảnh (Stability/Gemini) kèm theo prompt và thông số cài đặt. |
| 8 | Dịch vụ AI | Nhận yêu cầu và trả về kết quả (URL hình ảnh). |
| 9 | Hệ thống | Lưu URL hình ảnh vào kho tài sản (Assets) của người dùng trên DB. |
| 10 | Hệ thống | Hiển thị hình ảnh kết quả lên giao diện và thông báo thành công. |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 5.1 | Hệ thống | Thông báo không đủ credit nếu số dư thấp hơn yêu cầu của tác vụ. |
| 5.2 | Người dùng | Mua thêm Credit thông qua hệ thống thanh toán. |
| 8.1 | Dịch vụ AI | Phát hiện nội dung vi phạm chính sách nội dung (NSFW), từ chối tạo và trả mã lỗi. |
| 8.2 | Hệ thống | Trả lại (Refund) số Credit đã trừ trước đó và thông báo lỗi vi phạm cho người dùng. |

**Mô tả hoạt động Tạo nội dung AI:** Sau khi người dùng thiết lập tham số (Model, tỷ lệ) và nhập Prompt tại trang công cụ, hệ thống sẽ kiểm tra số dư Credit. Nếu đủ điều kiện, backend sẽ gọi service tương ứng (Stability/Gemini) để sinh nội dung, sau đó lưu kết quả vào Firebase Storage và cập nhật thông tin vào Database kho tài sản (Assets).

-- Hình 2.x: Biểu đồ tuần tự UC05 – Tạo nội dung (Sơ đồ 14 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ hoạt động UC05 – Tạo nội dung (Sơ đồ 15 – MERMAID_CODE.txt) --

*(Ghi chú: Tạo Text và Tạo Video có luồng xử lý tương đồng, chỉ khác biệt về loại tham số cài đặt và thời gian xử lý đồng bộ/bất đồng bộ).*

Các use case còn lại trong nhóm AI Agent & Tạo nội dung (UC06) có luồng xử lý tương tự hoặc đơn giản hơn, được tóm tắt trong bảng sau:

| UC | Tên Use Case | Mô tả quy trình |
|----|--------------|-----------------|
| UC06 | Quản lý dự án chat | Người dùng xem danh sách dự án ở Sidebar. Sử dụng menu tùy chọn (ba chấm) để đổi tên hoặc xóa vĩnh viễn dự án chat cùng các tin nhắn liên quan. |

-- Hình 2.x: Biểu đồ tuần tự UC06 – Quản lý dự án (Sơ đồ 16 – MERMAID_CODE.txt) --

#### 2.2.2.8. Nhóm chức năng Cộng đồng Inspiration (UC07 – UC09)

Phân hệ Cộng đồng cho phép người dùng chia sẻ thành quả sáng tạo và tương tác với các nội dung nổi bật từ người dùng khác.

-- Hình 2.x: Biểu đồ Use Case phân rã – Nhóm Cộng đồng (Sơ đồ 4 – MERMAID_CODE.txt) --

Các use case còn lại trong nhóm Cộng đồng Inspiration (UC07, UC08, UC09) có luồng xử lý tương tự hoặc đơn giản hơn, được tóm tắt trong bảng sau:

| UC | Tên Use Case | Mô tả quy trình |
|----|--------------|-----------------|
| UC07 | Khám phá Feed | Truy cập trang Inspiration để duyệt danh sách các bài đăng công khai. Hỗ trợ cuộn vô hạn (Infinite Scroll) và xem chi tiết bài đăng qua cửa sổ Modal (bao gồm prompt gốc và bình luận). |
| UC08 | Đăng bài Inspiration | Chọn tác phẩm do AI tạo từ kho tài sản, mở form đăng bài để nhập tiêu đề, thêm nhãn (tags) và xuất bản lên Feed cộng đồng (chuyển `isPublic` thành true). |
| UC09 | Tương tác bài đăng | Người dùng thực hiện thả tim (Like) bài viết với giao diện phản hồi tức thì (Optimistic UI). Giao dịch được xử lý ngầm và tự động hoàn tác nếu lỗi mạng. Ngoài ra còn hỗ trợ lưu bài yêu thích và trích xuất Prompt. |

**Mô tả hoạt động Khám phá Feed:** Khi người dùng truy cập trang Inspiration, hệ thống thực hiện truy vấn danh sách các bài đăng công khai mới nhất từ Firestore qua service xử lý. Dữ liệu được trả về và hiển thị dưới dạng lưới (Masonry Layout), hỗ trợ tải thêm dữ liệu tự động (Infinite Scroll) khi người dùng cuộn đến cuối trang.

-- Hình 2.x: Biểu đồ hoạt động UC07 – Khám phá Feed (Sơ đồ 17 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ tuần tự UC08 – Đăng bài (Sơ đồ 18 – MERMAID_CODE.txt) --

-- Hình 2.x: Biểu đồ tuần tự UC09 – Tương tác (Sơ đồ 19 – MERMAID_CODE.txt) --

#### 2.2.2.9. Nhóm chức năng Quản lý Tài sản & File (UC10 – UC11)

Phân hệ này cho phép người dùng quản lý các nội dung đã tạo và các tệp tin lưu trữ cá nhân.

Các use case còn lại trong nhóm Quản lý Tài sản & File (UC10) có luồng xử lý tương tự hoặc đơn giản hơn, được tóm tắt trong bảng sau:

| UC | Tên Use Case | Mô tả quy trình |
|----|--------------|-----------------|
| UC10 | Quản lý tài sản số | Truy cập tab "Creations" để duyệt danh sách các tệp do AI tạo (Grid layout). Người dùng có thể thực hiện Tải xuống thiết bị, Xóa tệp vĩnh viễn, hoặc Chuyển tiếp sang form chia sẻ (như ở UC08). |

-- Hình 2.x: Biểu đồ hoạt động UC10 – Quản lý tài sản (Sơ đồ 20 – MERMAID_CODE.txt) --

**UC11 – Tải tệp lên hệ thống**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Tải tệp lên hệ thống |
| Tác nhân | Người dùng |
| Mô tả | Người dùng tải các tệp ảnh/tài liệu từ máy cá nhân lên Firebase Storage để làm dữ liệu đầu vào cho AI Agent. |
| Tiền điều kiện | - Đã đăng nhập vào hệ thống. |
| Điều kiện kích hoạt | Người dùng mở công cụ Upload hoặc kéo thả tệp vào vùng chỉ định. |
| Đảm bảo thành công | - Tệp được lưu trữ trên Firebase Storage. - Metadata của tệp được cập nhật vào Firestore. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 1 | Người dùng | Trong khung Chat hoặc trang Assets, mở công cụ Upload (hoặc kéo thả tệp). |
| 2 | Hệ thống | Kiểm tra định dạng tệp (mime type) và kích thước tệp có phù hợp (vd: < 5MB) hay không. |
| 3 | Hệ thống | Nếu hợp lệ, bắt đầu quá trình tải tệp lên bucket của Firebase Storage. |
| 4 | Hệ thống | Nhận lại public URL của tệp từ Storage. |
| 5 | Hệ thống | Lưu lại thông tin Metadata (Tên, Size, Loại, URL, userId) của tệp vào collection `Uploads` trong Firestore. |
| 6 | Hệ thống | Làm mới danh sách hiển thị và gửi thông báo "Tải tệp thành công". |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 2.1 | Hệ thống | Nếu tệp quá dung lượng hoặc sai định dạng, chặn tiến trình và báo lỗi trên UI. |

**Mô tả hoạt động Tải tệp lên:** Sau khi người dùng thực hiện kéo thả hoặc chọn tệp từ máy cá nhân, hệ thống kiểm tra tính hợp lệ của tệp. Nếu tệp đáp ứng yêu cầu, service sẽ thực thi tác vụ tải tệp lên Firebase Storage, nhận về URL công khai và lưu Metadata vào Firestore để quản lý trong kho tài sản cá nhân.

-- Hình 2.x: Biểu đồ hoạt động UC11 – Tải tệp lên (Sơ đồ 21 – MERMAID_CODE.txt) --

#### 2.2.2.10. Nhóm chức năng Tài chính & Gói cước (UC12 – UC13)

Quản lý thông tin thanh toán, gói dịch vụ và các giao dịch nạp Credit.

-- Hình 2.x: Biểu đồ Use Case phân rã – Nhóm Tài sản & Tài chính (Sơ đồ 5 – MERMAID_CODE.txt) --

Các use case còn lại trong nhóm Tài chính & Gói cước (UC12) có luồng xử lý tương tự hoặc đơn giản hơn, được tóm tắt trong bảng sau:

| UC | Tên Use Case | Mô tả quy trình |
|----|--------------|-----------------|
| UC12 | Xem gói & Giao dịch | Truy cập màn hình Billing để xem trạng thái gói cước đang sử dụng (Free/Pro/Agency), số dư Credit hiện tại, cùng với bảng lịch sử trạng thái các giao dịch Mua gói/Nạp thẻ. |

-- Hình 2.x: Biểu đồ tuần tự UC12 – Xem giao dịch (Sơ đồ 22 – MERMAID_CODE.txt) --

**UC13 – Thanh toán & Nạp Credit**

| Tiêu chí | Mô tả |
|----------|-------|
| Tên Use Case | Thanh toán & Nạp Credit |
| Tác nhân | Người dùng |
| Mô tả | Người dùng chọn gói nạp hoặc thuê bao → Hệ thống tạo URL PayOS → Người dùng quét mã QR thanh toán → Webhook PayOS phản hồi → Hệ thống cộng credit/nâng gói thành công. |
| Tiền điều kiện | - Đã đăng nhập vào hệ thống. |
| Điều kiện kích hoạt | Người dùng nhấn vào nút Mua gói (Subscribe) hoặc Nạp thẻ (Top-up). |
| Đảm bảo thành công | - Giao dịch được ghi nhận hợp lệ. - Credit hoặc Gói cước của người dùng được cập nhật tự động. |

**Luồng sự kiện chính:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 1 | Người dùng | Chọn Nhấn vào Nút "Mua gói" (Subscribe) hoặc "Nạp thẻ" (Top-up). |
| 2 | Hệ thống | Gửi payload chứa userId và PlanID tới Cloud Functions backend. |
| 3 | Môi trường hệ thống | Gọi API tới cổng thanh toán PayOS tạo Checkout URL (link thanh toán). |
| 4 | Hệ thống | Chuyển hướng trình duyệt của người dùng sang cổng thanh toán của PayOS. |
| 5 | Người dùng | Thực hiện quét mã QR / chuyển khoản ngân hàng trên ứng dụng của họ. |
| 6 | Cổng PayOS | Khi giao dịch thành công thực tế, bắn Webhook về lại Cloud Functions của Hệ thống. |
| 7 | Hệ thống | Nhận Webhook, kiểm chứng chữ ký an toàn, và cập nhật tăng Credit / Đổi gói người dùng trong Firestore. |
| 8 | Hệ thống | Chuyển hướng người dùng trở về trang Billing của ứng dụng và hiển thị số tiền mới. |

**Luồng sự kiện thay thế:**

| STT | Tác nhân | Hành động |
|-----|----------|-----------|
| 5.1 | Người dùng | Nhấn nút "Hủy" hoặc đóng trình duyệt thanh toán. |
| 6.1 | Hệ thống | Không nhận được Webhook thanh toán thành công, hệ thống không cập nhật trạng thái. |
| 7.1 | Người dùng | Truy cập lại trang Billing và thấy số dư như cũ. |

**Mô tả hoạt động Thanh toán:** Sau khi người dùng chọn gói cước và nhấn nút thanh toán, hệ thống khởi tạo đơn hàng và yêu cầu PayOS cung cấp Checkout URL. Người dùng thực hiện thanh toán qua mã QR, webhook từ PayOS sẽ gửi thông báo về Backend để controller xác thực và tự động cộng Credit hoặc nâng cấp gói cước cho người dùng trong Database.

-- Hình 2.x: Biểu đồ tuần tự UC13 – Thanh toán (Sơ đồ 23 – MERMAID_CODE.txt) --

#### 2.2.2.11. Biểu đồ lớp

Biểu đồ lớp mô tả 12 lớp đối tượng chính tương ứng với các collection trong cơ sở dữ liệu Firestore, thể hiện cấu trúc dữ liệu và mối quan hệ giữa các thực thể trong hệ thống.

-- Hình 2.x: Biểu đồ lớp (Sơ đồ 38 – MERMAID_CODE.txt) --

**Mô tả các mối quan hệ:**

| Quan hệ | Bản số | Mô tả |
|---------|--------|-------|
| NguoiDung → HoSoNguoiDung | 1 – 1 | Mỗi người dùng có một hồ sơ chi tiết |
| NguoiDung → DuAn | 1 – * | Người dùng tạo nhiều dự án |
| NguoiDung → BaiViet | 1 – * | Người dùng đăng nhiều bài Inspiration |
| NguoiDung → BinhLuan | 1 – * | Người dùng viết nhiều bình luận |
| NguoiDung → TheoDoiNguoiDung | 1 – * | Người dùng theo dõi nhiều người khác |
| NguoiDung → GiaoDich | 1 – * | Người dùng thực hiện nhiều giao dịch |
| NguoiDung → TepTaiLen | 1 – * | Người dùng tải lên nhiều tệp |
| NguoiDung → HangDoiVideo | 1 – * | Người dùng yêu cầu tạo nhiều video |
| NguoiDung → MauTemplate | 1 – * | Người dùng lưu nhiều mẫu |
| NguoiDung → NhatKyHoatDong | 1 – * | Hệ thống ghi nhiều log cho mỗi người dùng |
| DuAn → TinNhan | 1 – * | Mỗi dự án chứa nhiều tin nhắn (lịch sử chat) |
| BaiViet → BinhLuan | 1 – * | Mỗi bài viết có nhiều bình luận |

---

### 2.2.3. Lựa chọn công nghệ, nền tảng

**Bảng 2.x: Công nghệ Frontend**

| Công nghệ | Phiên bản | Lý do lựa chọn |
|-----------|-----------|-----------------|
| React | 19.2 | Component-based, virtual DOM, cộng đồng lớn |
| Vite | 7.2 | Nhanh hơn Webpack 10-100x nhờ ESM native |
| Tailwind CSS | 3.4 | Utility-first, giảm CSS nhờ purging |
| React Router | 7.9 | Nested routes, lazy loading |
| Firebase SDK | 10.13 | Auth, Firestore, Storage, Functions |

**Bảng 2.x: Công nghệ Backend**

| Công nghệ | Phiên bản | Lý do lựa chọn |
|-----------|-----------|-----------------|
| Cloud Functions | 4.5 | Serverless, auto-scale, tích hợp Firebase |
| TypeScript | 5.3 | Kiểu dữ liệu tĩnh, giảm lỗi runtime |
| Node.js | 20 LTS | Runtime ổn định |
| Firebase Admin | 12.7 | Truy cập dữ liệu quyền admin |

**Bảng 2.x: So sánh nền tảng backend**

| Tiêu chí | Firebase | AWS Amplify | Supabase | VPS |
|----------|----------|-------------|----------|-----|
| Chi phí khởi tạo | Miễn phí | Giới hạn | Miễn phí | $5-20/tháng |
| Serverless | ✅ | ✅ | ✅ | ❌ |
| Auth tích hợp | ✅ | ✅ | ✅ | ❌ |
| Real-time DB | ✅ | ❌ | ✅ | ❌ |
| Độ phức tạp | Thấp | Cao | Trung bình | Cao |

**Kết luận:** Firebase được chọn vì hệ sinh thái đầy đủ, chi phí pay-as-you-go, tích hợp sẵn Google AI (Gemini, Veo), và tự động mở rộng.

---

## 2.3. Thiết kế cơ sở dữ liệu

### 2.3.1. Lựa chọn hệ quản trị CSDL

Dự án sử dụng **Cloud Firestore** — CSDL NoSQL document-based của Firebase. Lý do:

- **Real-time sync:** Hỗ trợ lắng nghe thay đổi dữ liệu thời gian thực, giao diện cập nhật tức thì.
- **Auto-scaling:** Tự động mở rộng theo lượng truy cập.
- **Security Rules:** Quyền đọc/ghi cấp document, bảo vệ theo nguyên tắc tối thiểu quyền.
- **Tích hợp sẵn** với Firebase Auth, Cloud Functions và Firebase SDK.

### 2.3.2. Thiết kế các Collection

#### 2.3.2.1. Collection: users (Người dùng)

**Bảng 2.x: Cấu trúc collection users**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | uid | ID người dùng | String | Khóa chính, lấy từ Firebase Auth, duy nhất |
| 2 | email | Địa chỉ email | String | Định dạng email, không trùng lặp, bắt buộc |
| 3 | displayName | Tên hiển thị | String | Không được để trống |
| 4 | firstName | Họ | String | Không bắt buộc |
| 5 | lastName | Tên | String | Không bắt buộc |
| 6 | photoURL | URL ảnh đại diện (Auth) | String | URL từ Firebase Auth, không bắt buộc |
| 7 | avatarUrl | URL ảnh đại diện (tùy chỉnh) | String | URL từ Firebase Storage, không bắt buộc |
| 8 | bio | Giới thiệu bản thân | String | Không bắt buộc, tối đa 500 ký tự |
| 9 | plan | Gói đăng ký | String | Enum: free, pro, premium. Mặc định: free |
| 10 | credits | Số credit hiện có | Number | Mặc định: 5, giá trị ≥ 0 |
| 11 | role | Vai trò | String | Enum: user, admin. Mặc định: user |
| 12 | language | Ngôn ngữ giao diện | String | Enum: vi, en. Mặc định: vi |
| 13 | theme | Giao diện sáng/tối | String | Enum: light, dark, system. Mặc định: system |
| 14 | provider | Phương thức đăng nhập | String | Enum: email, google, facebook |
| 15 | emailVerified | Trạng thái xác thực email | Boolean | Mặc định: false. true khi đã xác thực |
| 16 | notifications | Cài đặt thông báo | Object | Chứa các tùy chọn bật/tắt thông báo |
| 17 | createdAt | Thời gian tạo tài khoản | Timestamp | Tự động gán khi tạo mới |
| 18 | updatedAt | Thời gian cập nhật gần nhất | Timestamp | Tự động cập nhật khi có thay đổi |

*(Collection userProfiles là phần mở rộng hồ sơ của users — xem bảng tổng hợp các collection phụ trợ bên dưới.)*

#### 2.3.2.2. Collection: projects (Dự án)

**Bảng 2.x: Cấu trúc collection projects**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | id | ID dự án | String | Khóa chính, tự động sinh bởi Firestore |
| 2 | userId | ID người tạo | String | Khóa ngoại → users.uid, bắt buộc |
| 3 | title | Tiêu đề dự án | String | Không được để trống |
| 4 | type | Loại nội dung | String | Enum: text, image, video |
| 5 | lastModel | Model AI sử dụng cuối | String | Không bắt buộc, tên model AI đã dùng |
| 6 | messages | Lịch sử chat | Array\<TinNhan\> | Mảng các tin nhắn theo thứ tự thời gian |
| 7 | thumbnail | Ảnh đại diện dự án | String | URL ảnh thu nhỏ, không bắt buộc |
| 8 | createdAt | Thời gian tạo | Timestamp | Tự động gán khi tạo mới |
| 9 | updatedAt | Thời gian cập nhật gần nhất | Timestamp | Tự động cập nhật khi có thay đổi |

**Bảng 2.x: Cấu trúc sub-document TinNhan (Message)**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | role | Vai trò người gửi | String | Enum: user, assistant |
| 2 | content | Nội dung tin nhắn | String | Văn bản nội dung, bắt buộc |
| 3 | imageUrl | URL hình ảnh đính kèm | String | URL ảnh AI tạo ra, không bắt buộc |
| 4 | videoUrl | URL video đính kèm | String | URL video AI tạo ra, không bắt buộc |
| 5 | timestamp | Thời gian gửi | Timestamp | Tự động gán khi gửi tin nhắn |

#### 2.3.2.3. Collection: posts (Bài đăng Inspiration)

**Bảng 2.x: Cấu trúc collection posts**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | id | ID bài đăng | String | Khóa chính, tự động sinh bởi Firestore |
| 2 | authorId | ID người đăng | String | Khóa ngoại → users.uid, bắt buộc |
| 3 | authorName | Tên người đăng | String | Denormalized từ users.displayName |
| 4 | authorAvatar | Avatar người đăng | String | Denormalized từ users.photoURL |
| 5 | type | Loại nội dung | String | Enum: image, video, text |
| 6 | title | Tiêu đề bài đăng | String | Không được để trống |
| 7 | content | Nội dung mô tả | String | Không bắt buộc |
| 8 | prompt | Prompt AI đã sử dụng | String | Tối đa 1000 ký tự, cho phép cộng đồng tái sử dụng |
| 9 | mediaUrl | URL media chính | String | URL ảnh hoặc video, bắt buộc |
| 10 | thumbnailUrl | URL ảnh thu nhỏ | String | Dùng cho video, không bắt buộc |
| 11 | model | Model AI đã dùng | String | Tên model (ví dụ: gemini-2.0-flash) |
| 12 | aspectRatio | Tỷ lệ khung hình | String | Enum: 1:1, 16:9, 9:16 |
| 13 | category | Danh mục | String | Enum: art, marketing, social, photography |
| 14 | tags | Thẻ gắn | Array\<String\> | Mảng các từ khóa phân loại |
| 15 | likes | Số lượt thích | Number | Mặc định: 0, giá trị ≥ 0 |
| 16 | views | Số lượt xem | Number | Mặc định: 0, giá trị ≥ 0 |
| 17 | saves | Số lượt lưu | Number | Mặc định: 0, giá trị ≥ 0 |
| 18 | comments | Số bình luận | Number | Mặc định: 0, giá trị ≥ 0 |
| 19 | usageCount | Số lần prompt được dùng | Number | Mặc định: 0, tăng khi có người dùng prompt |
| 20 | isTrending | Bài đăng nổi bật | Boolean | Mặc định: false |
| 21 | isPublic | Công khai | Boolean | Mặc định: true |
| 22 | createdAt | Thời gian đăng | Timestamp | Tự động gán khi tạo mới |
| 23 | updatedAt | Thời gian cập nhật gần nhất | Timestamp | Tự động cập nhật khi có thay đổi |

*(Collections comments và follows có cấu trúc đơn giản — xem bảng tổng hợp bên dưới.)*

#### 2.3.2.4. Collection: payment_links (Giao dịch thanh toán)

**Bảng 2.x: Cấu trúc collection payment_links**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | paymentLinkId | ID link thanh toán | String | Khóa chính, từ PayOS |
| 2 | userId | ID người dùng | String | Khóa ngoại → users.uid, bắt buộc |
| 3 | orderCode | Mã đơn hàng | Number | Duy nhất, sinh tự động |
| 4 | amount | Số tiền (VND) | Number | Giá trị > 0 |
| 5 | planName | Tên gói mua | String | Tên gói hoặc gói credit |
| 6 | credits | Số credit trong gói | Number | Giá trị > 0 |
| 7 | creditAmount | Số credit thực cộng | Number | Có thể khác credits nếu có khuyến mãi |
| 8 | description | Mô tả giao dịch | String | Mô tả ngắn về giao dịch |
| 9 | status | Trạng thái | String | Enum: pending, success, failed, cancelled |
| 10 | createdAt | Thời gian tạo | Timestamp | Tự động gán khi tạo mới |
| 11 | processedAt | Thời gian xử lý | Timestamp | Gán khi webhook xác nhận thanh toán |

#### 2.3.2.5. Collection: video_queue (Hàng đợi video)

**Bảng 2.x: Cấu trúc collection video_queue**

| STT | Tên thuộc tính | Ý nghĩa | Kiểu giá trị | Mô tả |
|-----|---------------|----------|--------------|-------|
| 1 | id | ID hàng đợi | String | Khóa chính, tự động sinh bởi Firestore |
| 2 | userId | ID người yêu cầu | String | Khóa ngoại → users.uid, bắt buộc |
| 3 | userPlan | Gói người dùng | String | Enum: free, pro, premium |
| 4 | request | Thông tin yêu cầu | Object | Chứa: prompt, model, aspectRatio, duration |
| 5 | status | Trạng thái | String | Enum: pending, processing, completed, failed |
| 6 | priority | Mức ưu tiên | Number | Số nhỏ hơn = ưu tiên cao hơn |
| 7 | result | Kết quả tạo video | Object | Chứa: videoUrl, thumbnailUrl khi thành công |
| 8 | error | Thông báo lỗi | String | Không bắt buộc, gán khi status = failed |
| 9 | createdAt | Thời gian tạo yêu cầu | Timestamp | Tự động gán khi tạo mới |
| 10 | processedAt | Thời gian bắt đầu xử lý | Timestamp | Gán khi status chuyển sang processing |
| 11 | completedAt | Thời gian hoàn thành | Timestamp | Gán khi status chuyển sang completed/failed |

#### 2.3.2.6. Các collection phụ trợ

Các collection còn lại có cấu trúc đơn giản hoặc mang tính hỗ trợ, được tổng hợp trong bảng sau:

**Bảng 2.x: Tổng hợp các collection phụ trợ**

| Collection | Mục đích | Số fields | Các field chính | Khóa ngoại |
|-----------|---------|-----------|----------------|------------|
| userProfiles | Hồ sơ chi tiết người dùng | 6 | bio, website, socialLinks, updatedAt | userId → users |
| comments | Bình luận bài đăng | 9 | content, likes, parentId (hỗ trợ reply), authorName/Avatar (denormalized) | postId → posts, authorId → users |
| follows | Theo dõi người dùng | 4 | followerId, followingId, createdAt | followerId/followingId → users |
| uploads | Tệp tải lên từ máy | 10 | fileName, fileType, fileSize (≤20MB), fileUrl, storagePath | userId → users |
| templates | Mẫu prompt tái sử dụng | 10 | title, prompt, type, model, likes, usageCount | userId → users |
| activity_logs | Nhật ký hoạt động | 9 | action, creditsBefore/After, success, error, metadata | userId → users |

---

## 2.4. Thiết kế giao diện người dùng

### 2.4.1. Thiết kế giao diện trực quan, dễ sử dụng

Giao diện hệ thống được thiết kế theo các nguyên tắc đảm bảo tính trực quan và thân thiện với người dùng:

**Bảng 2.x: Nguyên tắc thiết kế giao diện**

| Nguyên tắc | Mô tả | Cách áp dụng |
|-----------|-------|-------------|
| Consistency | Hệ thống thiết kế thống nhất | Bảng màu, typography, spacing nhất quán trên mọi trang |
| Feedback | Phản hồi trực quan cho mọi hành động | Loading states, toast notifications thành công/lỗi |
| Dark Mode | Hỗ trợ chế độ tối giảm mỏi mắt | Người dùng chuyển đổi tại Settings, hệ thống ghi nhớ lựa chọn |
| Accessibility | Khả năng tiếp cận | Contrast ratio đạt chuẩn WCAG AA, semantic HTML |
| Đa ngôn ngữ | Hỗ trợ Tiếng Việt và Tiếng Anh | Chuyển đổi ngôn ngữ tức thì, không cần tải lại trang |

### 2.4.2. Wireframe, mockup các màn hình chính

Dưới đây là giao diện thực tế các màn hình chính của hệ thống, tương ứng với các Use Case đã phân tích chi tiết ở mục 2.2.

#### a) Trang Landing Page

Trang chủ giới thiệu hệ thống đến khách vãng lai, gồm hero section, 3 card tính năng chính, carousel tác phẩm mẫu, và bảng so sánh 3 gói giá.

-- Hình 2.x: Giao diện Landing Page --

#### b) Trang Dashboard

Trang tổng quan sau đăng nhập, gồm sidebar điều hướng, thông tin người dùng, số credit, và các card gợi ý tạo nội dung nhanh.

-- Hình 2.x: Giao diện Dashboard --

#### c) Đăng ký và Đăng nhập (UC01, UC02)

Modal xác thực hỗ trợ 2 tab Đăng ký / Đăng nhập, cho phép nhập email + mật khẩu hoặc đăng nhập nhanh qua Google/Facebook.

-- Hình 2.x: Modal Đăng ký / Đăng nhập --

#### d) Agent Chat – Tạo văn bản AI (UC06)

Tab Text với ô nhập prompt, bộ chọn model AI (Groq / Gemini Flash / Gemini Pro), và vùng chat hiển thị kết quả.

-- Hình 2.x: Agent Chat – Tạo văn bản AI --

#### e) Agent Chat – Tạo video AI (UC08)

Tab Video với bộ chọn model (Fast / Standard), tỷ lệ video, và thanh tiến trình xử lý bất đồng bộ.

-- Hình 2.x: Agent Chat – Tạo video AI --

#### f) Trang Inspiration (UC11)

Hiển thị bài đăng dạng lưới với 4 tab danh mục, thông tin tác giả, và các nút tương tác (Like, Save, Use Prompt).

-- Hình 2.x: Giao diện Inspiration --

#### g) Trang Billing – Mua gói thuê bao (UC15)

So sánh 3 gói (Free, Pro, Agency) với danh sách tính năng, giá VND, và nút "Nâng cấp".

-- Hình 2.x: Giao diện Billing – Mua gói thuê bao --

### 2.4.3. Thiết kế giao diện trên các thiết bị khác nhau

Hệ thống hỗ trợ hiển thị trên 3 nhóm thiết bị: điện thoại, máy tính bảng và máy tính. Giao diện tự động điều chỉnh bố cục phù hợp với kích thước màn hình:

**Bảng 2.x: So sánh giao diện trên các thiết bị**

| Thành phần | Điện thoại | Máy tính bảng | Máy tính |
|-----------|-----------|--------------|---------|
| Sidebar | Ẩn, mở bằng nút menu | Thu gọn (chỉ icon) | Mở rộng đầy đủ |
| Trang Inspiration | 1 cột | 2 cột | 3-4 cột |
| Bảng giá | Xếp dọc từng gói | 2 cột | 3 cột ngang |
| Header | Thu gọn | Đầy đủ | Đầy đủ + thông tin credit |

Ngoài ra, hệ thống hỗ trợ chế độ giao diện **Sáng** và **Tối**. Người dùng chuyển đổi tại trang Cài đặt, lựa chọn được ghi nhớ cho các lần truy cập sau.

-- Hình 2.x: So sánh giao diện trên Desktop và Mobile --

-- Hình 2.x: So sánh giao diện chế độ Sáng và Tối --

---

# CHƯƠNG 3: TRIỂN KHAI VÀ THỬ NGHIỆM HỆ THỐNG

## 3.1. Mô tả quá trình triển khai hệ thống

### 3.1.1. Môi trường triển khai

Hệ thống được triển khai trên nền tảng **Firebase** của Google kết hợp với nền tảng **Vercel**, sử dụng các dịch vụ đám mây sẵn có giúp đội ngũ phát triển tập trung vào xây dựng sản phẩm thay vì quản lý máy chủ. Cụ thể:

- **Vercel** phụ trách triển khai và phân phối giao diện người dùng: tự động build và deploy mỗi khi đẩy mã lên GitHub, cung cấp tên miền HTTPS và CDN toàn cầu.
- **Firebase Hosting** là phương án triển khai dự phòng, tích hợp sẵn với các dịch vụ Firebase khác.
- **Cloud Functions** xử lý toàn bộ logic nghiệp vụ phía server: thanh toán, tạo video AI, gửi email, quản lý dự án, bài đăng, thông báo và hệ thống theo dõi.
- **Cloud Firestore** lưu trữ toàn bộ dữ liệu của hệ thống: người dùng, dự án, bài đăng và giao dịch.
- **Firebase Auth** quản lý đăng ký và đăng nhập qua Email, Google và Facebook.
- **Firebase Storage** lưu trữ tệp tin người dùng tải lên (tối đa 20MB/file) và kết quả tạo nội dung AI.

### 3.1.2. Các bước triển khai

Quy trình triển khai hệ thống được thực hiện theo 4 bước chính:

1. **Chuẩn bị môi trường:** Cài đặt các công cụ phát triển cần thiết, đăng nhập tài khoản Firebase và Vercel, khởi tạo dự án trên các nền tảng tương ứng.
2. **Cấu hình kết nối dịch vụ:** Thiết lập thông tin kết nối đến Firebase, cấu hình API key cho các dịch vụ AI (Groq, Stability AI, Google Gemini), PayOS và SendGrid.
3. **Đóng gói ứng dụng:** Biên dịch mã nguồn frontend thành bản phân phối tối ưu, giảm kích thước file và tăng tốc độ tải trang.
4. **Triển khai lên đám mây:** Đẩy mã nguồn lên GitHub để Vercel tự động build và deploy giao diện; triển khai các hàm xử lý backend và quy tắc bảo mật lên Firebase.

Sau khi triển khai, hệ thống được kiểm tra bằng cách truy cập trực tiếp qua trình duyệt để xác nhận các chức năng hoạt động bình thường.

### 3.1.3. Công cụ và thư viện được sử dụng

Các công cụ phát triển chính gồm: **Visual Studio Code** (IDE lập trình), **Firebase Console và Vercel Dashboard** (quản lý hệ thống trên đám mây), **Git và GitHub** (quản lý mã nguồn và tự động kích hoạt triển khai qua Vercel), và **Google Chrome** (để kiểm thử giao diện và hiệu năng).

---

## 3.2. Trình bày kết quả thử nghiệm

### 3.2.1. Xây dựng kịch bản thử nghiệm

Hệ thống được thử nghiệm theo 3 loại kiểm thử: **chức năng**, **hiệu năng**, và **bảo mật**. Các kịch bản kiểm thử bao phủ 16 use case đã xác định ở Chương 2.

### 3.2.2. Kiểm thử chức năng

**Bảng 3.x: Kịch bản kiểm thử chức năng**

| STT | Kịch bản | Đầu vào | Kết quả mong đợi | Kết quả thực tế | Đạt |
|-----|---------|---------|------------------|----------------|-----|
| 1 | Đăng ký bằng email | Tên, email, mật khẩu hợp lệ | Tài khoản được tạo, nhận 5 credit, email xác thực được gửi | Tài khoản tạo thành công, 5 credit được cấp, email gửi trong < 10 giây | ✅ |
| 2 | Đăng nhập bằng Google | Chọn tài khoản Google | Đăng nhập thành công, chuyển hướng vào Dashboard | Đăng nhập < 3 giây, chuyển hướng đúng | ✅ |
| 3 | Tạo văn bản AI (Groq) | Prompt: "Viết bài PR cho sản phẩm công nghệ" | Văn bản được tạo, không trừ credit | Văn bản 200-300 từ, 0 credit bị trừ | ✅ |
| 4 | Tạo văn bản AI (Gemini Pro) | Prompt: "Phân tích thị trường AI 2025" | Văn bản được tạo, trừ 3 credit | Văn bản chất lượng cao, 3 credit bị trừ đúng | ✅ |
| 5 | Tạo hình ảnh AI | Prompt: "A futuristic city at sunset", tỷ lệ 16:9 | Hình ảnh được tạo đúng tỷ lệ, trừ 5 credit | Hình ảnh 1024x576px, 5 credit bị trừ | ✅ |
| 6 | Tạo video AI (Veo) | Prompt: "Ocean waves crashing", model Fast | Yêu cầu vào hàng đợi, video tạo sau < 5 phút, trừ 30 credit | Video 6 giây, 30 credit bị trừ, hoàn thành trong 3 phút | ✅ |
| 7 | Mua gói Pro qua PayOS | Chọn gói Pro, thanh toán QR | Gói nâng cấp, credit cộng, giao dịch ghi nhận | Xử lý tự động, credit cộng đúng | ✅ |
| 8 | Tải file lên từ máy | Ảnh PNG 5MB | File tải lên bộ nhớ, hiển thị trong danh sách Assets | Upload thành công, preview hiển thị đúng | ✅ |
| 9 | Nhận email xác thực | Đăng ký tài khoản mới | Email xác thực gửi qua SendGrid | Email nhận trong vòng 10 giây, liên kết xác thực hoạt động đúng | ✅ |

### 3.2.3. Kiểm thử trường hợp biên

**Bảng 3.x: Kiểm thử trường hợp biên và xử lý lỗi**

| STT | Kịch bản | Đầu vào | Kết quả mong đợi | Kết quả thực tế | Đạt |
|-----|---------|---------|------------------|----------------|-----|
| 1 | Đăng ký email trùng | Email đã tồn tại | Thông báo lỗi "Email đã được sử dụng" | Hiển thị đúng thông báo lỗi | ✅ |
| 2 | Tạo AI khi hết credit | 0 credit, chọn Gemini | Thông báo "Không đủ credit" | Hiển thị toast cảnh báo, gợi ý nạp thêm | ✅ |
| 3 | Tạo video gói Free | Gói Free, chọn tab Video | Thông báo "Chỉ dành cho gói Pro trở lên" | Hiển thị đúng cảnh báo | ✅ |
| 4 | Upload file > 20MB | File 25MB | Từ chối upload, thông báo lỗi | Hiển thị "File vượt quá giới hạn 20MB" | ✅ |
| 5 | API AI thất bại | Prompt hợp lệ, server AI lỗi | Hoàn trả credit, hiển thị lỗi | Credit hoàn trả đúng, toast lỗi | ✅ |
| 6 | Truy cập không đăng nhập | URL Dashboard trực tiếp | Chuyển hướng về trang Landing | Redirect đúng về Landing Page | ✅ |

### 3.2.4. Kiểm thử hiệu năng

**Bảng 3.x: Kết quả kiểm thử hiệu năng**

| Tiêu chí | Kết quả | Đánh giá |
|----------|---------|---------|
| Thời gian tải trang | < 2.5 giây | Tốt |
| Thời gian tạo văn bản AI (Groq) | 1-3 giây | Tốt |
| Thời gian tạo văn bản AI (Gemini) | 2-5 giây | Khá |
| Thời gian tạo hình ảnh AI | 5-15 giây | Khá |
| Thời gian tạo video AI | 1-5 phút | Chấp nhận |
| Điểm hiệu năng tổng thể (Google Lighthouse) | 85-92/100 | Tốt |

### 3.2.5. Kiểm thử bảo mật

**Bảng 3.x: Kết quả kiểm thử bảo mật**

| Tiêu chí | Biện pháp | Kết quả |
|----------|----------|---------|
| Xác thực người dùng | Xác thực qua Firebase Auth | Chỉ người dùng đã đăng nhập mới truy cập được hệ thống |
| Phân quyền dữ liệu | Quy tắc bảo mật trên CSDL | Người dùng chỉ xem/sửa dữ liệu của chính mình |
| Bảo vệ chức năng backend | Kiểm tra danh tính trước khi xử lý | Yêu cầu không hợp lệ bị từ chối tự động |
| Bảo vệ file tải lên | Kiểm tra quyền và kích thước file | Chỉ cho phép upload khi đã đăng nhập, tối đa 20MB |
| Mã hóa đường truyền | Toàn bộ kết nối qua HTTPS | Dữ liệu được mã hóa khi truyền qua mạng |
| Bảo vệ khóa bí mật | Lưu riêng biệt, không công khai | Các khóa API không hiển thị trong mã nguồn |

### 3.2.6. Đánh giá kết quả thử nghiệm

Tổng hợp kết quả thử nghiệm:

- **Kiểm thử chức năng:** 8/8 kịch bản chính đạt yêu cầu (100%).
- **Kiểm thử trường hợp biên:** 6/6 kịch bản xử lý lỗi đúng (100%).
- **Kiểm thử hiệu năng:** Lighthouse Performance Score đạt 85-92/100, thời gian tải trang < 2.5 giây.
- **Kiểm thử bảo mật:** Tất cả các biện pháp bảo mật hoạt động đúng theo thiết kế.

---

## 3.3. Đánh giá hệ thống

### 3.3.1. Mức độ đáp ứng yêu cầu

Qua quá trình thử nghiệm, hệ thống đã đáp ứng đầy đủ  10/10 yêu cầu chức năng đã đặt ra:

1. Xác thực đa phương thức (Email, Google, Facebook) — hỗ trợ đầy đủ 3 phương thức.
2. Tạo văn bản AI với nhiều model — 3 model: Groq (miễn phí), Gemini Flash, Gemini Pro.
3. Tạo hình ảnh AI — hỗ trợ Stability AI, Pollinations AI và Gemini Imagen.
4. Tạo video AI — model Veo với 2 chế độ (nhanh và chuẩn).
5. Cộng đồng Inspiration — xem, thích, lưu, sử dụng lại prompt, bình luận.
6. Thanh toán trực tuyến — tích hợp cổng thanh toán PayOS, xử lý tự động.
7. Đa ngôn ngữ (Việt/Anh) — chuyển đổi tức thì, không cần tải lại trang.
8. Chế độ giao diện sáng/tối — hệ thống ghi nhớ lựa chọn của người dùng.
9. Quản lý dự án — lưu, mở lại, xóa dự án.
10. Tải file từ máy — hỗ trợ ảnh, video, tài liệu (tối đa 20MB).

### 3.3.2. Ưu điểm của hệ thống

1. **Tích hợp đa dạng model AI:** Hệ thống hỗ trợ nhiều model AI từ các nhà cung cấp khác nhau, cho phép người dùng lựa chọn model phù hợp với nhu cầu và ngân sách.

2. **Triển khai trên đám mây:** Hệ thống không cần quản lý máy chủ vật lý, tự động mở rộng theo lượng truy cập, giảm thiểu chi phí vận hành.

3. **Trải nghiệm người dùng tốt:** Giao diện hiển thị tốt trên mọi thiết bị, hỗ trợ chế độ sáng/tối, đa ngôn ngữ, và phản hồi trực quan cho mọi thao tác.

4. **Hệ thống credit linh hoạt:** Người dùng trả phí theo lượt sử dụng, có model miễn phí để trải nghiệm trước khi quyết định mua thêm.

5. **Cộng đồng chia sẻ sáng tạo:** Trang Inspiration cho phép người dùng chia sẻ tác phẩm và tái sử dụng prompt của nhau, thúc đẩy sáng tạo.

6. **Bảo mật tốt:** Hệ thống áp dụng nhiều lớp bảo mật: xác thực người dùng, phân quyền dữ liệu, mã hóa đường truyền.

### 3.3.3. Nhược điểm và hạn chế

1. **Phụ thuộc vào dịch vụ bên thứ 3:** Hệ thống phụ thuộc vào các dịch vụ đám mây và API AI bên ngoài. Nếu một trong các dịch vụ ngừng hoạt động hoặc thay đổi giá, hệ thống sẽ bị ảnh hưởng.

2. **Chi phí vận hành:** Các model AI cao cấp có chi phí sử dụng đáng kể. Với lượng người dùng lớn, chi phí vận hành sẽ tăng nhanh.

3. **Chưa có hệ thống quản trị:** Chưa có giao diện cho quản trị viên để quản lý người dùng, duyệt nội dung, hoặc xem thống kê.

4. **Yêu cầu kết nối internet:** Ứng dụng cần kết nối internet liên tục, chưa hỗ trợ sử dụng khi ngoại tuyến.

5. **Hạn chế tìm kiếm:** Nội dung trang web chưa được tối ưu tốt cho công cụ tìm kiếm (Google, Bing).

### 3.3.4. Hướng phát triển tiếp theo

1. **Xây dựng trang quản trị:** Phát triển giao diện quản trị để quản lý người dùng, duyệt nội dung, xem thống kê doanh thu.

2. **Tích hợp thêm model AI:** Mở rộng hỗ trợ các model AI mới từ nhiều nhà cung cấp khác nhau.

3. **Hỗ trợ sử dụng ngoại tuyến:** Cho phép một số chức năng hoạt động khi không có kết nối internet.

4. **Tính năng cộng tác nhóm:** Cho phép nhiều người dùng cùng làm việc trên một dự án.

5. **Phát triển ứng dụng di động:** Xây dựng ứng dụng trên iOS và Android để mở rộng đối tượng người dùng.

---

# KẾT LUẬN

## Kết quả đạt được

Luận văn đã hoàn thành mục tiêu xây dựng hệ thống **Content Creator AI** — một nền tảng sáng tạo nội dung đa phương tiện tích hợp trí tuệ nhân tạo. Các kết quả chính bao gồm:

1. **Xây dựng thành công hệ thống hoàn chỉnh:** Ứng dụng web bao gồm giao diện người dùng và hệ thống xử lý phía server, triển khai trên nền tảng đám mây Firebase.

2. **Tích hợp đa dạng model AI:** Hệ thống hỗ trợ 6 model AI từ 4 nhà cung cấp khác nhau, đáp ứng nhu cầu tạo văn bản, hình ảnh và video.

3. **Thiết kế cơ sở dữ liệu hoàn chỉnh:** 11 bảng dữ liệu phục vụ toàn bộ nghiệp vụ từ xác thực, tạo nội dung, cộng đồng đến thanh toán.

4. **Hệ thống thanh toán trực tuyến:** Tích hợp cổng thanh toán PayOS với xử lý giao dịch tự động, hỗ trợ quét mã QR và các ví điện tử phổ biến.

5. **Trải nghiệm người dùng chất lượng:** Giao diện hiển thị tốt trên mọi thiết bị, hỗ trợ đa ngôn ngữ (Việt/Anh), chế độ sáng/tối.

6. **Cộng đồng sáng tạo:** Trang Inspiration cho phép người dùng chia sẻ tác phẩm, tương tác và tái sử dụng prompt của nhau.

## Hạn chế của nghiên cứu

1. Hệ thống phụ thuộc vào các dịch vụ đám mây và API bên thứ 3, chưa có khả năng hoạt động độc lập.
2. Chưa có giao diện quản trị để quản lý hệ thống ở quy mô lớn.
3. Chưa hỗ trợ sử dụng khi không có kết nối internet.
4. Kiểm thử chủ yếu thực hiện thủ công, chưa có bộ kiểm thử tự động.
5. Chưa đánh giá hiệu năng với lượng người dùng đồng thời lớn.

## Hướng phát triển trong tương lai

1. **Ngắn hạn (3-6 tháng):** Xây dựng trang quản trị, hỗ trợ sử dụng ngoại tuyến, thêm kiểm thử tự động.
2. **Trung hạn (6-12 tháng):** Tích hợp thêm model AI mới, phát triển tính năng cộng tác nhóm.
3. **Dài hạn (> 12 tháng):** Phát triển ứng dụng di động trên iOS và Android, xây dựng hệ thống gợi ý nội dung thông minh.
