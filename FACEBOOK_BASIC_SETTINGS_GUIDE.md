# 📝 Facebook Basic Settings - Hướng Dẫn Điền

## ✅ CÁC TRƯỜNG CẦN ĐIỀN

### 1️⃣ **ID ứng dụng (App ID)**
- **Giá trị hiện tại:** `1370320154876040` ✅
- **Hành động:** Đã có sẵn, **KHÔNG CẦN THAY ĐỔI**
- **Lưu ý:** Copy giá trị này để dùng cho Firebase sau

---

### 2️⃣ **Khóa bí mật của ứng dụng (App Secret)**
- **Giá trị hiện tại:** `••••••••` (đang ẩn)
- **Hành động:**
  1. **Click nút "Hiển thị"** (Show) bên cạnh
  2. Facebook có thể yêu cầu nhập lại mật khẩu để bảo mật
  3. **Copy giá trị App Secret** (sẽ cần cho Firebase)
- **Lưu ý:** Giữ bí mật, không chia sẻ công khai

---

### 3️⃣ **Tên hiển thị (Display Name)**
- **Giá trị hiện tại:** `creator-ai` ✅
- **Hành động:** Đã có sẵn, **KHÔNG CẦN THAY ĐỔI**

---

### 4️⃣ **Miền ứng dụng (App Domains)**
- **Giá trị hiện tại:** Trống ❌
- **Hành động:** Thêm các domain sau (mỗi domain một dòng):
  ```
  vercel.app
  firebaseapp.com
  ```
- **Cách điền:**
  1. Click vào ô "Miền ứng dụng"
  2. Gõ `vercel.app` và nhấn Enter
  3. Gõ `firebaseapp.com` và nhấn Enter
  4. Hoặc thêm từng domain cách nhau bởi dấu phẩy

---

### 5️⃣ **Email liên hệ (App Contact Email)**
- **Giá trị hiện tại:** `tuangb2004@gmail.com` ✅
- **Hành động:** Đã có sẵn, **KHÔNG CẦN THAY ĐỔI**

---

### 6️⃣ **URL chính sách quyền riêng tư (Privacy Policy URL)**
- **Giá trị hiện tại:** Trống ❌
- **Hành động:** Điền URL sau:
  ```
  https://content-creator-ai-wheat.vercel.app/privacy
  ```
- **Lưu ý:** Đây là **BẮT BUỘC** bởi Facebook

---

### 7️⃣ **URL Điều khoản dịch vụ (Terms of Service URL)**
- **Giá trị hiện tại:** Trống ❌
- **Hành động:** Điền URL sau:
  ```
  https://content-creator-ai-wheat.vercel.app/terms
  ```
- **Lưu ý:** Đây là **BẮT BUỘC** bởi Facebook

---

## 📋 CHECKLIST SAU KHI ĐIỀN

- [ ] App ID đã được lưu: `1370320154876040`
- [ ] App Secret đã được hiển thị và copy
- [ ] App Domains đã được thêm:
  - [ ] `vercel.app`
  - [ ] `firebaseapp.com`
- [ ] Privacy Policy URL đã được điền: `https://content-creator-ai-wheat.vercel.app/privacy`
- [ ] Terms of Service URL đã được điền: `https://content-creator-ai-wheat.vercel.app/terms`
- [ ] **Đã click "Lưu thay đổi" (Save Changes)**

---

## 🔥 BƯỚC TIẾP THEO

Sau khi điền xong và save:

1. **Vào "Products" → "Facebook Login" → "Settings"**
2. **Thêm Valid OAuth Redirect URIs** (xem `FACEBOOK_SETUP_GUIDE.md`)
3. **Vào Firebase Console** để enable Facebook provider (xem `FACEBOOK_SETUP_GUIDE.md`)

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **App Secret:** Sau khi copy, lưu ở nơi an toàn (sẽ cần cho Firebase)
2. **Privacy Policy & Terms:** Phải có URL hợp lệ, không được để trống
3. **App Domains:** Phải thêm đúng domain, không có `http://` hoặc `https://`
4. **Save Changes:** Nhớ click "Lưu thay đổi" sau khi điền xong!

---

**Sau khi điền xong, báo lại để tiếp tục bước tiếp theo!** 🚀
