# Luồng hoạt động Tab Video & So sánh với Flow Google (Veo)

## 1. Luồng hoạt động hiện tại trong ứng dụng (tab Video)

### 1.1 Luồng chính: Trang chủ Dashboard → AgentChat

1. **Người dùng chọn tab Video**  
   → Có 3 chế độ (dropdown):
   - **Từ văn bản sang video** (text-to-video)
   - **Tạo video từ các khung hình** (frame-to-video) — 2 ảnh đầu/cuối
   - **Tạo video từ các thành phần** (ingredients-to-video) — tối đa 3 ảnh tham chiếu

2. **Người dùng cấu hình**  
   - Model: Veo 3.1 Fast (300 credit) / Veo 3.1 Standard (500 credit)  
   - Tỉ lệ khung hình: 9:16 hoặc 16:9  
   - Ngôn ngữ: Tiếng Anh / Tiếng Việt  
   - Ô nhập mô tả (prompt) + (tùy chế độ) file đính kèm

3. **Bấm gửi (→)**  
   → Chuyển sang giao diện **AgentChat** kèm theo:
   - `initialPrompt` (nội dung prompt)
   - `initialFileUrls` (danh sách URL file đã upload)
   - `initialInputType = 'video'`
   - `initialModel` (model đã chọn, vd. Veo 3.1 Fast)
   - **Lưu ý:** `videoMode` (text-to-video / frame-to-video / ingredients) **không được truyền** sang AgentChat → AgentChat không biết người dùng chọn chế độ nào.

4. **Trong AgentChat**  
   → Khi gửi tin nhắn, gọi hàm **`generateContent`** (Firebase callable) với:
   - `contentType: 'video'`
   - `provider: 'gemini'` (mặc định, vì code chỉ xét `inputType === 'text'` hoặc `'image'`, không xét `'video'`)
   - `modelId`, `fileUrls`, `prompt`, v.v.

5. **Vấn đề mô hình (model) không khớp**  
   - Trang chủ chọn model **Veo** (`veo-3.1-fast`, `veo-3.1-standard`).
   - Nhưng AgentChat định nghĩa `MODELS.video` là **`nano-video`** và **`runway`** (không có Veo).
   - → Khi sang AgentChat, model Veo không tìm thấy trong danh sách → rơi về mặc định `nano-video`.
   - → **Model người dùng chọn bị mất** khi chuyển sang chat.

6. **Backend `generateContent`**  
   → Chỉ xử lý `contentType === 'text'` hoặc **else (coi là ảnh/image)**.  
   → **Không có nhánh `contentType === 'video'`** → yêu cầu video từ tab Video đang bị xử lý như **tạo ảnh**, không gọi Veo.  
   → Tính phí 8 credit (như tạo ảnh Gemini), không phải 300-500 credit (Veo).

**Kết luận luồng Dashboard:**  
Tab Video trên trang chủ chỉ mở chat với prompt + file; **không có bước nào gọi hàng đợi Veo** (`requestVideoGeneration`). Kết quả trả về là **ảnh**, không phải video.

---

### 1.2 Luồng phụ: Trang VideoGenerator (trang riêng biệt)

1. Người dùng vào trang **VideoGenerator** (route riêng, không phải tab Video trên Home).
2. Nhập prompt, chọn model (Veo 3.1 Fast/Standard), tỉ lệ (16:9, 9:16, 1:1), có thể đính kèm file.
3. Bấm tạo → gọi **`requestVideoGeneration`** với:
   - `prompt`, `model`, `aspectRatio`, `duration: 8`
   - **Lưu ý:** Trang VideoGenerator có gửi `fileUrls` trong object, **nhưng** hàm `requestVideoGeneration` trong `videoGeneration.js` chỉ lấy 4 tham số (`prompt`, `model`, `aspectRatio`, `duration`) → `fileUrls` **bị bỏ qua**, không gửi lên backend.
4. Backend thêm job vào **hàng đợi video** → `processVideoQueue` (chạy mỗi phút) lấy job → gọi **`generateVideoWithVeo(request)`**.
5. **`generateVideoWithVeo`** gọi Veo API với:
   - `prompt`, `aspectRatio`, `numberOfVideos: 1`
   - **Không** truyền ảnh (imageUrl / khung hình đầu / khung hình cuối / ảnh tham chiếu).
   - **Không** truyền `duration` vào config Veo (dù backend type có trường này).

**Kết luận luồng VideoGenerator:**  
Đây là nơi **duy nhất** tạo video bằng Veo thực sự, nhưng chỉ hỗ trợ **text-to-video thuần** (prompt + tỉ lệ), chưa dùng ảnh hay thời lượng.

---

### 1.3 Chế độ "ingredients-to-video" (tạo từ thành phần)

- Có trong dropdown chế độ trên UI.
- Khi chọn, form hiển thị nút + chung (giống tab Image/Text), cho phép đính kèm file không giới hạn số lượng.
- **Không có ràng buộc "tối đa 3 ảnh"** trong code.
- **Không có backend/API riêng** cho chế độ này.
- Khi gửi → đi vào AgentChat → `generateContent` → xử lý như ảnh (giống các chế độ khác).

---

### 1.4 Bảng tóm tắt chức năng tab Video

| Thành phần | Có trên giao diện | Hành vi thực tế ở backend |
|------------|-------------------|---------------------------|
| Chế độ text-to-video | Có | Từ Home → chat → `generateContent` → bị xử lý như **tạo ảnh**. Từ VideoGenerator → Veo đúng (chỉ prompt + tỉ lệ). |
| Chế độ frame-to-video (2 khung đầu/cuối) | Có (2 ô tròn + nút đổi) | File gửi sang AgentChat nhưng **không** đưa vào Veo. Backend Veo không nhận khung hình đầu/cuối. |
| Chế độ ingredients (3 ảnh tham chiếu) | Có (mode trong dropdown) | Chỉ là chế độ giao diện; **không có API/backend riêng**. Không giới hạn 3 ảnh. |
| Chọn model Veo Fast / Standard | Có | Dùng được từ VideoGenerator; từ Home **bị mất** (model rơi về `nano-video` trong AgentChat). |
| Tỉ lệ 9:16, 16:9 | Có | Chỉ áp dụng thật khi gọi Veo từ VideoGenerator. |
| Ngôn ngữ EN/VI | Có | Chỉ hiển thị trên giao diện, không gửi trong payload Veo. |
| Thời lượng (4/6/8 giây) | Không có trong form Home | Backend type có trường `duration`; VideoGenerator gửi cố định 8; Veo API không nhận `duration` trong config. |
| Nhân đôi video (x2) | Có nút trên giao diện | Chỉ là giao diện, `numberOfVideos` luôn = 1 trong backend. |

---

## 2. Flow của Google (Veo) — ý tưởng đang áp dụng

Theo tài liệu / giao diện Google (AI Studio, Gemini, Google Vids):

| Tính năng | Mô tả |
|-----------|-------|
| **Text-to-video** | Tạo video từ mô tả bằng văn bản (cảnh, đối thoại, góc quay, ánh sáng, âm thanh). |
| **Image-to-video** | 1 ảnh tĩnh → hoạt hóa thành clip (vd. 8 giây), kèm mô tả chuyển động. |
| **Ảnh tham chiếu** | Tối đa 3 ảnh tham chiếu (nhân vật, phong cách, bố cục) để giữ nhất quán. |
| **Khung hình đầu/cuối** | Chỉ định ảnh **khung hình đầu** và/hoặc **khung hình cuối** để điều hướng nội dung video. |
| **Kéo dài video** | Kéo dài clip đã tạo (extend) thêm vài giây. |
| **Tỉ lệ khung hình** | 16:9 (ngang), 9:16 (dọc cho di động). |
| **Độ phân giải** | 720p, 1080p hoặc 4K. |
| **Âm thanh gốc** | Hội thoại, hiệu ứng âm thanh, nhạc nền đồng bộ với video. |
| **Thời lượng clip** | 4, 6 hoặc 8 giây. |
| **Số lượng video** | Tạo nhiều video cùng lúc (vd. x2). |

---

## 3. So sánh: Đủ và thiếu so với flow Google

### 3.1 Đã có (hoặc có một phần)

| Tính năng | Trạng thái hiện tại |
|-----------|---------------------|
| Text-to-video | **Có** khi dùng trang VideoGenerator (hàng đợi Veo). Từ Home → chat **không gọi Veo** (tạo ảnh thay vì video). |
| Hai chế độ khung hình / thành phần | **Có trên giao diện**: frame-to-video (2 khung), ingredients (tối đa 3 ảnh). **Chưa nối** tới Veo. |
| Chọn model (Fast / Standard) | **Có** trên giao diện tab Video và VideoGenerator. |
| Tỉ lệ khung hình (9:16, 16:9) | **Có** trên giao diện; backend Veo nhận tỉ lệ. |
| Thời lượng | Backend có trường `duration`; chỉ VideoGenerator gửi (cố định 8 giây); Veo API chưa dùng. |

### 3.2 Còn thiếu hoặc chưa hoạt động đúng

| # | Tính năng | Chi tiết vấn đề |
|---|-----------|-----------------|
| 1 | **Tab Video (Home) không gọi Veo** | Gửi từ Home → chỉ mở AgentChat → gọi `generateContent` → bị xử lý như tạo ảnh. **Cần:** khi `inputType === 'video'` thì gọi `requestVideoGeneration` (truyền prompt, chế độ, file, tỉ lệ, model). |
| 2 | **Chế độ video (`videoMode`) không truyền sang AgentChat** | AgentChat không biết người dùng chọn text-to-video, frame-to-video hay ingredients → không thể xử lý đúng theo chế độ. |
| 3 | **Model bị mất khi sang chat** | DashboardHome chọn Veo, nhưng AgentChat định nghĩa `MODELS.video = [nano-video, runway]` → model Veo không tìm thấy → rơi về `nano-video`. |
| 4 | **Khung hình đầu/cuối (first/last frame)** | Giao diện đã có 2 ô ảnh đầu/cuối. Backend `GenerateVideoRequest` có `imageUrl` (1 ảnh) nhưng không có `firstFrameUrl`/`lastFrameUrl`; `generateVideoWithVeo` không truyền ảnh lên Veo. **Cần:** mở rộng request và gọi Veo API với khung hình đầu/cuối. |
| 5 | **Ảnh tham chiếu (tối đa 3)** | Chế độ "ingredients" có trên giao diện nhưng không có API/backend. **Cần:** thêm `referenceImageUrls` (mảng tối đa 3) và hỗ trợ trong Veo. |
| 6 | **Image-to-video (1 ảnh → video)** | Chưa có chế độ riêng. Có thể gộp vào "ingredients" khi chỉ có 1 ảnh, hoặc thêm chế độ mới. Backend cần hỗ trợ `imageUrl` trong Veo. |
| 7 | **File không lên Veo** | `videoGeneration.js` bỏ qua `fileUrls`; backend hàng đợi chỉ lưu prompt/model/tỉ lệ/thời lượng. **Cần:** frontend gửi fileUrls, backend lưu vào request và `generateVideoWithVeo` truyền ảnh vào Veo. |
| 8 | **Thời lượng (4/6/8 giây)** | Trường type có; cần thêm lựa chọn trên form và truyền xuống Veo API. |
| 9 | **Kéo dài video (extend clip)** | Chưa có: không có giao diện "kéo dài video vừa tạo", không có API extend. |
| 10 | **Độ phân giải (720p/1080p/4K)** | Chưa có trên giao diện lẫn backend. |
| 11 | **Âm thanh gốc (native audio)** | Do Veo model tự quyết định; ứng dụng chưa có tùy chọn bật/tắt hay mô tả âm thanh. |
| 12 | **Số lượng video (x2)** | Nút x2 có trên giao diện nhưng `numberOfVideos` luôn = 1 trong backend. |
| 13 | **Ngôn ngữ prompt (EN/VI)** | Chỉ trên giao diện; chưa dùng trong payload (có thể dùng cho system prompt hoặc gợi ý). |

---

## 4. Gợi ý thứ tự triển khai (để bám đúng flow Google)

### Ưu tiên cao (nền tảng)

1. **Nối tab Video (Home) với Veo**  
   Khi `inputType === 'video'`: gọi `requestVideoGeneration` thay vì `generateContent`. Truyền đủ prompt, model, tỉ lệ, thời lượng, và (tùy chế độ) file URLs. Hiển thị trạng thái hàng đợi / kết quả video.

2. **Truyền `videoMode` sang AgentChat**  
   Thêm prop `initialVideoMode` để AgentChat biết chế độ nào (text / frame / ingredients).

3. **Đồng bộ MODELS.video**  
   AgentChat cần dùng chung danh sách model Veo (`veo-3.1-fast`, `veo-3.1-standard`) thay vì `nano-video`, `runway`.

4. **Sửa `videoGeneration.js` để gửi fileUrls**  
   Hàm `requestVideoGeneration` cần nhận và truyền `fileUrls` (hoặc `firstFrameUrl`, `lastFrameUrl`, `referenceImageUrls` tùy chế độ).

### Ưu tiên trung bình (tính năng nâng cao)

5. **Khung hình đầu/cuối (frame-to-video)**  
   Mở rộng `GenerateVideoRequest` (thêm `firstFrameUrl`, `lastFrameUrl`) và `generateVideoWithVeo` gửi lên Veo theo tài liệu API.

6. **Ảnh tham chiếu (ingredients, tối đa 3)**  
   Thêm `referenceImageUrls` vào request; ràng buộc tối đa 3 ảnh trên giao diện.

7. **Image-to-video (1 ảnh)**  
   Gộp hoặc thêm chế độ; backend hỗ trợ `imageUrl` trong Veo.

8. **Thời lượng & số lượng video**  
   Form chọn thời lượng (4/6/8 giây); truyền `numberOfVideos` khi x2.

### Ưu tiên thấp (tùy nhu cầu)

9. **Kéo dài video (extend)** — nếu Veo API hỗ trợ.
10. **Độ phân giải (720p/1080p/4K)** — theo khả năng API.
11. **Âm thanh / ngôn ngữ** — tùy chọn bổ sung.

---

## 5. Sơ đồ luồng hiện tại (tóm tắt)

```
┌─────────────────────────────────────────────────────────┐
│                    TAB VIDEO - TRANG CHỦ                │
│                                                         │
│  Chọn chế độ (text / frame-to-video / ingredients)      │
│  Chọn model Veo, tỉ lệ, ngôn ngữ                       │
│  Nhập prompt + đính kèm file                            │
│  Bấm gửi                                                │
│         │                                               │
│         ▼                                               │
│  Chuyển sang AgentChat                                  │
│  (prompt + fileUrls + inputType='video')                │
│  ⚠ videoMode KHÔNG được truyền                          │
│  ⚠ Model Veo → rơi về nano-video                       │
│         │                                               │
│         ▼                                               │
│  AgentChat gọi generateContent(contentType: 'video')    │
│         │                                               │
│         ▼                                               │
│  Backend: contentType ≠ 'text' → xử lý như TẠO ẢNH     │
│  ❌ Không gọi Veo                                       │
│  ❌ Tính phí 8cr (ảnh) thay vì 300-500cr (video)        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               TRANG VIDEOGENERATOR (RIÊNG)              │
│                                                         │
│  Nhập prompt, model, tỉ lệ, thời lượng: 8              │
│  Bấm tạo                                                │
│         │                                               │
│         ▼                                               │
│  requestVideoGeneration(prompt, model, ratio, duration) │
│  ⚠ fileUrls bị bỏ qua (hàm service không gửi)          │
│         │                                               │
│         ▼                                               │
│  Backend: thêm vào hàng đợi                             │
│  processVideoQueue → generateVideoWithVeo               │
│         │                                               │
│         ▼                                               │
│  Veo API: chỉ prompt + tỉ lệ                           │
│  ⚠ Không gửi ảnh (imageUrl/first/last/reference)        │
│  ⚠ Không gửi duration vào config Veo                    │
│  ✅ Tạo video thật bằng Veo                             │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Kết luận

Tab Video trên trang chủ hiện có **giao diện khá đầy đủ** (3 chế độ, chọn model, tỉ lệ, upload ảnh), nhưng **backend chưa nối đúng**: luồng từ Home đi qua `generateContent` (tạo ảnh), còn luồng Veo thật chỉ ở trang VideoGenerator riêng và chỉ hỗ trợ text-to-video thuần.

Để bám đúng flow Google (Veo), cần:
- **Nối Home → Veo** (thay vì generateContent)
- **Truyền đủ thông tin** (videoMode, model Veo, fileUrls)
- **Mở rộng backend Veo** để nhận khung hình đầu/cuối, ảnh tham chiếu, thời lượng
- Sau đó bổ sung các tính năng nâng cao (extend, độ phân giải, âm thanh, x2)
