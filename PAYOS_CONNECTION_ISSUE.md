# PayOS Connection Issue - Firebase Functions

## 🚨 VẤN ĐỀ

Firebase Functions (deployed ở US-Central1) **không thể kết nối** đến PayOS API (`api.payos.vn`).

### Lỗi:
```
Error: Cannot connect to PayOS API. Please check your internet connection and VPN settings.
hostname: 'api.payos.vn'
```

### Nguyên nhân có thể:
1. **Geo-restriction**: PayOS API có thể chỉ cho phép truy cập từ Việt Nam
2. **Firewall**: PayOS có thể block requests từ Firebase Functions (US region)
3. **Network routing**: Firebase Functions không thể resolve DNS hoặc route đến api.payos.vn

---

## ✅ GIẢI PHÁP TẠM THỜI (Đang áp dụng)

Đã enable **TEST MODE** để test payment flow mà không cần gọi PayOS API thật.

### Config hiện tại:
```bash
payos.test_mode = "true"
```

### Kết quả:
- ✅ Frontend có thể tạo payment link (mock data)
- ✅ Hiển thị mock QR code (VietQR)
- ✅ Test được toàn bộ flow (UI, validation, credits update)
- ❌ KHÔNG gọi PayOS API thật
- ❌ KHÔNG tạo thanh toán thật

---

## 🔧 GIẢI PHÁP LÂU DÀI

### Option 1: Deploy Functions sang Asia Region (Khuyến nghị)

Firebase Functions có thể deploy ở **Asia-Southeast1** (Singapore) hoặc **Asia-East1** (Taiwan) để gần Việt Nam hơn.

**Cách làm:**

1. Update `firebase.json`:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "region": "asia-southeast1"
  }
}
```

2. Deploy lại:

```bash
firebase deploy --only functions
```

3. Update webhook URL trong PayOS:

```
https://asia-southeast1-creator--ai.cloudfunctions.net/payosWebhook
```

**Pros:**
- Gần Việt Nam hơn → ít bị block
- Latency thấp hơn
- Không cần proxy

**Cons:**
- Phải deploy lại toàn bộ functions
- Webhook URL thay đổi → Phải update trong PayOS portal

---

### Option 2: Sử dụng Proxy/VPN

Setup một proxy server ở Việt Nam để forward requests đến PayOS API.

**Cách làm:**

1. Thuê VPS ở Việt Nam (VietnamWorks, DigitalOcean Singapore, etc.)
2. Setup proxy (Nginx, Squid)
3. Update code để route PayOS requests qua proxy
4. Cấu hình proxy credentials trong Firebase config

**Pros:**
- Không cần thay đổi region
- Kiểm soát tốt hơn

**Cons:**
- Chi phí thêm VPS
- Phức tạp hơn
- Latency cao hơn

---

### Option 3: Liên hệ PayOS Support

Hỏi PayOS về whitelist IP hoặc có giải pháp nào cho Firebase Functions.

**Contact:**
- Email: support@payos.vn
- Website: https://payos.vn/support

**Hỏi về:**
- IP whitelist cho Firebase Functions
- Có endpoint nào cho international requests không?
- Có hỗ trợ CORS/proxy không?

---

### Option 4: Chuyển sang Payment Gateway khác

Nếu PayOS không support international requests, cân nhắc:
- **VNPay**: Có hỗ trợ tốt cho Firebase/international
- **ZaloPay**: API friendly
- **Momo**: Có sandbox mode tốt
- **Stripe**: International (nếu có business entity nước ngoài)

---

## 🧪 TEST NGAY BÂY GIỜ (Test Mode)

1. Vào: https://content-creator-ai-ochre.vercel.app
2. Login
3. Click "Upgrade" → Chọn plan Pro/Agency
4. Chọn PayOS
5. Sẽ thấy:
   - ✅ Mock QR code xuất hiện
   - ✅ Mock payment link
   - ⚠️ Không thanh toán thật

**Để test flow hoàn chỉnh:**
- Test UI/UX
- Test validation
- Test error handling
- Test webhook (sẽ không nhận webhook thật do test mode)

---

## 📊 SO SÁNH CÁC GIẢI PHÁP

| Giải pháp | Độ khó | Chi phí | Thời gian | Khuyến nghị |
|-----------|--------|---------|-----------|-------------|
| **Asia Region** | Trung bình | $0 | 30 phút | ⭐⭐⭐⭐⭐ |
| **Proxy/VPN** | Khó | ~$5-10/tháng | 2-4 giờ | ⭐⭐⭐ |
| **PayOS Support** | Dễ | $0 | 1-3 ngày | ⭐⭐⭐⭐ |
| **Gateway khác** | Khó | Depends | 1-2 ngày | ⭐⭐ |

---

## 🎯 KHUYẾN NGHỊ

1. **Ngay:** Tiếp tục dùng test mode để dev/test UI
2. **Trong 1-2 ngày:** Liên hệ PayOS support để hỏi về whitelist
3. **Backup plan:** Deploy sang Asia region nếu PayOS không hỗ trợ

---

## 📝 LƯU Ý

- Test mode chỉ để test flow, KHÔNG tạo thanh toán thật
- Webhook sẽ KHÔNG nhận được notification thật ở test mode
- Cần disable test mode khi giải quyết xong connection issue

---

## 🔄 DISABLE TEST MODE (Sau khi fix)

```bash
firebase functions:config:set payos.test_mode="false"
firebase deploy --only functions
```

---

**Status:** TEST MODE ENABLED (Tạm thời)  
**Next Step:** Liên hệ PayOS Support hoặc deploy sang Asia region
