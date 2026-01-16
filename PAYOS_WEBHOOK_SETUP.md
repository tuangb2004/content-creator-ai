# PayOS Webhook Setup Guide

## 🎯 Mục Đích

Hướng dẫn đăng ký webhook URL để PayOS gửi thông báo thanh toán thành công về server của bạn.

---

## 📍 Webhook URL

```
https://us-central1-creator--ai.cloudfunctions.net/payosWebhook
```

**Copy URL này để dùng ở bước 5 bên dưới.**

---

## 🔧 HƯỚNG DẪN ĐĂNG KÝ WEBHOOK

### Bước 1: Truy cập PayOS Portal

Vào: **https://my.payos.vn**

### Bước 2: Đăng nhập

Sử dụng tài khoản PayOS của bạn.

### Bước 3: Vào "Kênh thanh toán" (Payment Channels)

- Trên menu bên trái, tìm **"Kênh thanh toán"** hoặc **"Payment Channels"**
- Click vào đó

### Bước 4: Chọn/Tạo Payment Channel

**Nếu đã có kênh thanh toán:**
- Click vào kênh thanh toán hiện tại (nơi có Client ID, API Key, Checksum Key)
- Click **"Chỉnh sửa"** hoặc **"Edit"**

**Nếu chưa có kênh thanh toán:**
- Click **"Tạo kênh thanh toán mới"**
- Làm theo hướng dẫn của PayOS để kết nối ngân hàng

### Bước 5: Nhập Webhook URL

Trong form edit/create payment channel:

1. Tìm field **"Webhook URL"** hoặc **"URL nhận webhook"**
2. Paste URL này vào:
   ```
   https://us-central1-creator--ai.cloudfunctions.net/payosWebhook
   ```
3. Click **"Lưu"** hoặc **"Save"**

### Bước 6: Xác Nhận Webhook

PayOS sẽ **gửi một test webhook** để verify URL của bạn hoạt động:

- Nếu thành công ✅: Bạn sẽ thấy webhook URL được lưu
- Nếu thất bại ❌: Kiểm tra lại URL và thử lại

---

## ✅ CHECKLIST SAU KHI ĐĂNG KÝ

- [ ] Webhook URL đã được lưu trong Payment Channel
- [ ] PayOS test webhook thành công (không báo lỗi)
- [ ] Bạn có Client ID, API Key, Checksum Key từ payment channel này

---

## 🧪 TEST PAYMENT THẬT

Sau khi đăng ký webhook xong, test thanh toán thật:

### 1. Vào Production Site

```
https://content-creator-ai-ochre.vercel.app
```

### 2. Login

Sử dụng tài khoản Google hoặc Email/Password.

### 3. Chọn Plan & Thanh Toán

1. Click **"Billing"** hoặc **"Upgrade"**
2. Chọn plan **Pro** hoặc **Agency**
3. Chọn payment method: **PayOS**
4. Click **"Upgrade Now"**

### 4. Quét QR Code & Thanh Toán

- **QR code THẬT** sẽ xuất hiện (không phải mock nữa)
- Mở app ngân hàng trên điện thoại
- Quét QR code
- Xác nhận thanh toán
- **Số tiền sẽ bị trừ thật!** (Đây là production payment)

### 5. Kiểm Tra Kết Quả

Sau khi thanh toán thành công:

✅ **Webhook sẽ được gọi tự động** → Server nhận thông báo  
✅ **Credits được cộng vào account** → Vào Dashboard kiểm tra  
✅ **Plan được nâng cấp** → Từ Free → Pro/Agency

---

## 🐛 TROUBLESHOOTING

### Webhook không được gọi?

**Check logs:**

```bash
cd functions
firebase functions:log --only payosWebhook
```

**Possible causes:**
- Webhook URL chưa đăng ký đúng trong Payment Channel
- PayOS test webhook failed
- Firewall/Network issue

### Thanh toán thành công nhưng credits không được cộng?

**Check Firebase Firestore:**

1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project **creator--ai**
3. Vào **Firestore Database**
4. Check collection `payment_links` → Tìm payment link ID
5. Check status: `pending` | `success` | `failed`

**Check Firebase Functions logs:**

```bash
firebase functions:log --only payosWebhook --limit 50
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [PayOS Webhook Documentation](https://payos.vn/docs/du-lieu-tra-ve/webhook)
- [PayOS Payment Channel Setup](https://payos.vn/docs/huong-dan-su-dung/tao-kenh-thanh-toan)

---

## 🎯 NEXT STEPS

Sau khi test payment thành công:

1. **Monitor webhook logs** để đảm bảo hoạt động ổn định
2. **Test edge cases**: Cancel payment, timeout, invalid signature
3. **Add monitoring/alerting** cho payment failures
4. **Consider**: Rate limiting, retry logic, idempotency improvements

---

**Lưu ý:** Đây là production payment với tiền thật. Hãy cẩn thận khi test!
