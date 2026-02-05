# 📊 PHÂN TÍCH CHI PHÍ VÀ RỦI RO - CONTENT CREATOR AI

## 0. ĐÁNH GIÁ NHANH: PLAN HIỆN TẠI + PAID TIER 1

### 0.0. Pay-as-you-go (Paid Tier) hoạt động thế nào

**Lưu ý quan trọng:** Pay-as-you-go **không** có nghĩa là “chỉ trả khi vượt mức free”.  
**Cứ dùng là tính tiền** – từ request đầu tiên trở đi, mỗi token/ảnh/video đều bị bill theo bảng giá Paid Tier. Không có “mức free” trong gói Paid; Free tier và Paid tier là hai chế độ khác nhau (Free = có hạn mức free rồi hết, Paid = trả theo usage ngay từ đầu). Nên set **Budget Alert** sớm để tránh bất ngờ khi xem hóa đơn.

---

**Ví dụ minh họa (không dùng làm mốc cố định):** Có thể thấy trên dashboard tổng chi phí theo kỳ, spike theo ngày, và usage chính (Nano Banana Pro, Nano Banana, …). Chi phí thực tế phụ thuộc usage; nên theo dõi dashboard và Budget Alert thường xuyên.

### 0.2. Lỗ / Lãi theo từng hành động (Paid Tier 1 chính thức)

Quy ước: **1 credit = 2,000 VND** (giá bán quy đổi). Chi phí API theo [Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing) (Paid Tier 1).

| Hành động | Credit thu | Doanh thu (VND) | Chi phí API (VND) | Lãi/lần (VND) |
|-----------|------------|------------------|-------------------|----------------|
| Nano Banana (2.5 Flash Image) | 5 | 10,000 | ~975 ($0.039/ảnh) | **+9,025** |
| Nano Banana Pro (3 Pro Image) | 8 | 16,000 | ~3,350 ($0.134/ảnh) | **+12,650** |
| Chat Gemini Flash | 1 | 2,000 | ~750 ($0.30/1M input) | **+1,250** |
| Chat Gemini Pro | 3 | 6,000 | ~3,000 | **+3,000** |
| Video Veo 3.1 Fast (6s) | 30 | 60,000 | ~22,500 ($0.15/s × 6) | **+37,500** |

**Kết luận số:** Mỗi đơn vị sử dụng (ảnh/chat/video) đều **có lãi**. Plan hiện tại (credit/giá) **ổn** so với Paid Tier 1.

### 0.3. Rủi ro cụ thể

| Rủi ro | Mức | Hành động đề xuất |
|--------|-----|-------------------|
| Spike chi phí 1 ngày lặp lại | Trung bình | Set **Google Cloud Budget** (vd: 300K–500K VND) + alert; bật **Budget Action** tắt billing khi vượt ngưỡng |
| Free user dùng hết 5 credits | Thấp | Tối đa ~16,750đ/user (5 ảnh Pro); chấp nhận được cho acquisition |
| Spam / abuse (bypass credit) | Rất cao | Đảm bảo **rate limit** và **credit check** ở mọi API; xoay API key nếu lộ |

### 0.4. Checklist nhanh

- [ ] Thiết lập **Budget Alert** (vd: 100K → 300K → 500K VND) và **Budget Action** khi vượt ngưỡng → xem hướng dẫn từng bước: **[BUDGET_ALERT_SETUP.md](./BUDGET_ALERT_SETUP.md)**.
- [x] **Giá & đơn vị tiền trong app:** `BillingPlans.jsx`: **USD_TO_VND = 25.000** (1 USD = 25.000 VND, tỷ giá tham chiếu SBV ~24.726, làm tròn); **VND_PER_CREDIT = 2.000**; hiển thị lấy từ PLAN_PRICES (200.000 / 600.000 / 1.200.000₫). Cập nhật USD_TO_VND khi tỷ giá thay đổi.
- [x] **Rate limit trong code:** đã có giới hạn 30 request/phút + **100 request/user/ngày** (rolling 24h) trong `functions/src/utils/rateLimit.ts`.
- [x] Giữ nguyên **credit cost** trong code (nano-banana 5, nano-banana-pro 8) – vẫn có lãi với Paid Tier 1.

---

## 1. CHI PHÍ API THỰC TẾ (Paid Tier 1 – Google Gemini, quy đổi 1 USD = 25,000 VND)

### 1.1. Gemini API Pricing (Google – Paid Tier 1)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Ghi chú |
|-------|----------------------|------------------------|---------|
| Gemini 2.5 Flash | $0.30 (7,500đ) | $2.50 (62,500đ) | Nhanh, rẻ |
| Gemini 2.5 Pro | $1.25 (31,250đ) | $10.00 (250,000đ) | Chất lượng cao |
| Gemini 3 Flash | $0.50 (12,500đ) | $3.00 (75,000đ) | Mới |
| Gemini 3 Pro | $2.00 (50,000đ) | $12.00 (300,000đ) | Mạnh nhất |

### 1.2. Image Generation Pricing (Paid Tier 1 – chính thức)

| Model (trong app) | API model | Giá/ảnh (USD) | Giá/ảnh (VND) |
|-------------------|-----------|---------------|---------------|
| Nano Banana | Gemini 2.5 Flash Image | $0.039 | ~975đ |
| Nano Banana Pro | Gemini 3 Pro Image Preview | $0.134 (1K/2K), $0.24 (4K) | ~3,350đ – 6,000đ |
| Stability AI SDXL (Fallback) | - | ~$0.03 | ~750đ |

### 1.3. Video Generation Pricing (Veo 3.1 – Paid Tier 1)

| Loại | Giá (USD) | Giá (VND) |
|------|-----------|-----------|
| Veo 3.1 Fast (per second) | $0.15 | ~3,750đ/s |
| Veo 3.1 Standard (per second) | $0.40 | ~10,000đ/s |
| Video 5–8 giây (Fast) | ~$0.75–1.20 | ~18,750–30,000đ |
| Rate limit | 10 videos/ngày/project | - |

---

## 2. TÍNH TOÁN CHI PHÍ THEO KỊCH BẢN

### 2.1. Kịch bản 1: 1 User (Bạn test - Hiện tại)

| Hoạt động | Số lượng/tháng | Chi phí/lần | Tổng |
|-----------|----------------|-------------|------|
| Chat Gemini Flash | 50 messages | 500đ | 25,000đ |
| Chat Gemini Pro | 10 messages | 3,000đ | 30,000đ |
| Tạo ảnh | 20 ảnh | 1,000đ | 20,000đ |
| Tạo video | 2 video | 8,750đ | 17,500đ |
| **TỔNG** | | | **92,500đ/tháng** |

→ Khớp với 78k bạn đã chi (ít hơn vì chưa dùng hết)

---

### 2.2. Kịch bản 2: 10 Users active (Demo cho giáo viên/bạn bè)

| Hoạt động | Số lượng/user/tháng | 10 users | Chi phí/lần | Tổng |
|-----------|---------------------|----------|-------------|------|
| Chat Gemini Flash | 20 messages | 200 | 500đ | 100,000đ |
| Chat Gemini Pro | 5 messages | 50 | 3,000đ | 150,000đ |
| Tạo ảnh | 10 ảnh | 100 | 1,000đ | 100,000đ |
| Tạo video | 1 video | 10 | 8,750đ | 87,500đ |
| **TỔNG** | | | | **437,500đ/tháng** |

---

### 2.3. Kịch bản 3: 100 Users (Production thực tế)

| Hoạt động | Số lượng/user/tháng | 100 users | Chi phí/lần | Tổng |
|-----------|---------------------|-----------|-------------|------|
| Chat Groq (FREE) | 30 messages | 3,000 | 0đ | **0đ** |
| Chat Gemini Flash | 10 messages | 1,000 | 500đ | 500,000đ |
| Chat Gemini Pro | 2 messages | 200 | 3,000đ | 600,000đ |
| Tạo ảnh | 5 ảnh | 500 | 1,000đ | 500,000đ |
| Tạo video | 0.5 video | 50 | 8,750đ | 437,500đ |
| **TỔNG** | | | | **2,037,500đ/tháng** |

---

### 2.4. ⚠️ KỊCH BẢN TỒI TỆ NHẤT: SPAM ATTACK

**Giả sử 1 user spam 24/7 trong 1 ngày:**

| Hoạt động | Rate limit | Max requests/ngày | Chi phí/lần | Tổng/ngày |
|-----------|------------|-------------------|-------------|-----------|
| Gemini Flash | 1000 RPM | 1,440,000 | 500đ | 720,000,000đ 💀 |
| Gemini Pro | 150 RPM | 216,000 | 3,000đ | 648,000,000đ 💀 |
| Nano Banana Pro | 500 RPM | 720,000 | 1,000đ | 720,000,000đ 💀 |
| Veo Video | 10/ngày | 10 | 8,750đ | 87,500đ |

**⛔ NGUY HIỂM CỰC KỲ! Có thể mất HÀNG TRĂM TRIỆU trong 1 ngày nếu không có bảo vệ!**

---

## 3. 🛡️ CHIẾN LƯỢC BẢO VỆ (BẮT BUỘC PHẢI LÀM)

### 3.1. Tầng 1: Google Cloud Budget Alert

**Hướng dẫn từng bước:** xem **[BUDGET_ALERT_SETUP.md](./BUDGET_ALERT_SETUP.md)**.

- Link: [https://console.cloud.google.com/billing/budgets](https://console.cloud.google.com/billing/budgets)
- Gợi ý: Budget 300K–500K VND/tháng (hoặc ~$15–20); alert ở 50%, 90%, 100%.

### 3.2. Tầng 2: Rate Limiting trong Code (ĐÃ CÓ trong hệ thống)

| Giới hạn | Giá trị trong code | Lý do |
|----------|--------------------|-------|
| Requests/user/phút | 30 (`rateLimit.ts`) | Chống spam |
| Requests/user/ngày | **100** (rolling 24h, `rateLimit.ts`) | Giới hạn chi phí |
| Image/user/ngày | Theo credit + rate limit chung | Tốn kém |
| Video/user/ngày | Theo plan (`creditCosts.ts`: free 0, pro 8, agency 40, business 83) | Rất tốn kém |

### 3.3. Tầng 3: Credit System (ĐÃ CÓ)

**User KHÔNG THỂ dùng nếu hết credit!**

| Hành động | Credit cần | Chi phí thực | Margin |
|-----------|------------|--------------|--------|
| Chat Groq | 0 | 0đ | ∞ |
| Chat Gemini Flash | 1 | 500đ | 4x |
| Chat Gemini Pro | 3 | 3,000đ | 2x |
| Tạo ảnh Nano Banana | 3 | 500đ | 12x |
| Tạo ảnh Nano Banana Pro | 5 | 1,000đ | 10x |
| Tạo video Veo | 25 | 8,750đ | 5.7x |

**1 Credit = 2,000 VND** (giá bán cho user)

### 3.4. Tầng 4: Daily Spending Cap (CẦN THÊM)

```javascript
// Thêm vào Cloud Functions
const DAILY_COST_LIMIT = 200000; // 200k VND/ngày
const currentDailyCost = await getDailySpending();

if (currentDailyCost >= DAILY_COST_LIMIT) {
  throw new Error('Daily spending limit reached. Service paused.');
}
```

---

## 4. 📈 BẢNG GIÁ ĐỀ XUẤT (Đảm bảo có lãi)

### 4.1. Gói Credit

| Gói | Credits | Giá bán | Chi phí thực (nếu dùng hết) | Lợi nhuận |
|-----|---------|---------|----------------------------|-----------|
| **Free** | 10 | 0đ | ~20,000đ | -20,000đ (marketing) |
| **Starter** | 50 | 49,000đ | ~50,000đ | ~0đ (breakeven) |
| **Pro** | 200 | 149,000đ | ~150,000đ | ~0đ |
| **Agency** | 500 | 299,000đ | ~250,000đ | +49,000đ |
| **Business** | 1500 | 699,000đ | ~500,000đ | +199,000đ |

### 4.2. Gói Subscription (Nếu làm)

| Gói | Credits/tháng | Giá/tháng | Chi phí thực max | Lợi nhuận min |
|-----|---------------|-----------|------------------|---------------|
| **Pro Studio** | 300/tháng | 199,000đ | 200,000đ | ~0đ |
| **Agency Elite** | 1000/tháng | 499,000đ | 400,000đ | +99,000đ |
| **Business** | 3000/tháng | 999,000đ | 800,000đ | +199,000đ |

---

## 5. 🎯 WORST CASE SCENARIOS & GIẢI PHÁP

### Scenario A: User mua gói Free spam hết 10 credits

| Rủi ro | Chi phí max | Giải pháp |
|--------|-------------|-----------|
| 10 credits → 10 ảnh | 10,000đ | Chấp nhận được (marketing cost) |

### Scenario B: User mua gói Starter (49k) và spam

| Rủi ro | Chi phí max | Kết quả |
|--------|-------------|---------|
| 50 credits → 50 ảnh HOẶC 10 chat Pro + 20 ảnh | ~50,000đ | Breakeven |

### Scenario C: Hacker tấn công API trực tiếp (bypass credit)

| Rủi ro | Chi phí max | Giải pháp |
|--------|-------------|-----------|
| Unlimited | 💀 Hàng trăm triệu | ⛔ PHẢI có API key rotation + Budget cap |

### Scenario D: 1000 users đăng ký free cùng lúc

| Rủi ro | Chi phí max | Giải pháp |
|--------|-------------|-----------|
| 1000 x 10 credits x 1000đ | 10,000,000đ | Giới hạn free credits = 5 thay vì 10 |

---

## 6. ✅ CHECKLIST BẢO VỆ (Làm ngay!)

- [ ] **Set Google Cloud Budget Alert**: 100k, 300k, 500k VND
- [ ] **Enable Budget Actions**: Tự động disable billing khi vượt 500k
- [ ] **Kiểm tra Credit check** trong generateContent.ts
- [ ] **Kiểm tra Rate limiting** trong Cloud Functions
- [ ] **Giảm free credits** từ 10 → 5 (nếu cần)
- [ ] **Monitor daily** qua Firebase Console trong tuần đầu

---

## 7. 📊 DỰ TOÁN NGÂN SÁCH THÁNG

| Kịch bản | Users | Chi phí ước tính | Doanh thu cần |
|----------|-------|------------------|---------------|
| Demo (hiện tại) | 1-5 | 100,000đ | 0đ (tự chịu) |
| Beta test | 10-20 | 500,000đ | 5 gói Starter |
| Launch nhỏ | 50-100 | 2,000,000đ | 15 gói Pro |
| Production | 500+ | 10,000,000đ+ | Cần business model nghiêm túc |

---

## 8. 🚨 KẾT LUẬN

**Với mức độ sử dụng hiện tại (1 user, demo):**
- Chi phí: ~100k/tháng
- Rủi ro: Thấp
- Hành động: Set budget alert 200k là đủ

**Nếu có nhiều users:**
- PHẢI có credit system hoạt động đúng
- PHẢI có budget cap ở Google Cloud
- PHẢI monitor hàng ngày

**Công thức an toàn:**
```
Max monthly cost = Số users x Free credits x Chi phí/credit
                 = 100 users x 10 credits x 2,000đ
                 = 2,000,000đ/tháng WORST CASE (nếu ai cũng dùng hết free)
```
