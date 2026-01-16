# 🔧 TikTok OAuth Error Fix - "client_key" không hợp lệ

## ❌ Lỗi hiện tại:
```
Đã xảy ra lỗi
Chúng tôi không thể đăng nhập bằng TikTok. 
Điều này có thể do cài đặt cụ thể của ứng dụng.
Nếu bạn là nhà phát triển, hãy khắc phục lỗi sau và thử lại: client_key
```

---

## ✅ CÁC BƯỚC KIỂM TRA VÀ SỬA:

### 1️⃣ KIỂM TRA REDIRECT URI TRONG TIKTOK DEVELOPER CONSOLE

**Redirect URI phải CHÍNH XÁC:**
```
https://creator--ai.firebaseapp.com/__/auth/tiktok/callback
```

**Cách kiểm tra:**
1. Vào: https://developers.tiktok.com/
2. Chọn app của bạn
3. Vào **"Basic Information"** hoặc **"Platform"**
4. Tìm **"Redirect URI"** hoặc **"Callback URL"**
5. **Đảm bảo có đúng URL:**
   ```
   https://creator--ai.firebaseapp.com/__/auth/tiktok/callback
   ```
6. **Lưu ý:**
   - Không có trailing slash (`/`)
   - Phải là `https://` (không phải `http://`)
   - Phải chính xác từng ký tự

---

### 2️⃣ KIỂM TRA CLIENT KEY

**Client Key hiện tại:** `awy6whhoj448dit5`

**Cách kiểm tra:**
1. Vào TikTok Developer Console
2. Vào **"Basic Information"**
3. Tìm **"Client Key"**
4. **So sánh với config Firebase:**
   ```powershell
   firebase functions:config:get
   ```
5. **Nếu khác nhau, set lại:**
   ```powershell
   firebase functions:config:set tiktok.client_key="CLIENT_KEY_MỚI" tiktok.client_secret="CLIENT_SECRET_MỚI"
   firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback
   ```

---

### 3️⃣ KIỂM TRA APP STATUS

**App phải được enable/approve:**
1. Vào TikTok Developer Console
2. Kiểm tra **"App Status"**:
   - ✅ **"Live"** hoặc **"In Development"** (cho phép test)
   - ❌ **"Pending Review"** hoặc **"Rejected"** → Cần approve

---

### 4️⃣ KIỂM TRA SCOPES

**Scopes hiện tại trong code:**
```
user.info.basic,user.info.profile
```

**Cách kiểm tra:**
1. Vào TikTok Developer Console
2. Vào **"Permissions"** hoặc **"Scopes"**
3. **Đảm bảo có:**
   - ✅ `user.info.basic`
   - ✅ `user.info.profile`

---

### 5️⃣ KIỂM TRA DOMAIN VERIFICATION

**Domain phải được verify:**
1. Vào TikTok Developer Console
2. Vào **"Platform"** → **"Web"**
3. Kiểm tra domain verification:
   - ✅ Domain `creator--ai.firebaseapp.com` đã verify
   - ❌ Nếu chưa verify, upload verification file

---

## 🔍 DEBUG STEPS

### Check Firebase Functions logs:
```powershell
firebase functions:log --only getTikTokAuthUrl --lines 20
```

### Test URL manually:
Mở URL này trong browser (thay `YOUR_CLIENT_KEY`):
```
https://www.tiktok.com/v2/auth/authorize/?client_key=YOUR_CLIENT_KEY&scope=user.info.basic,user.info.profile&response_type=code&redirect_uri=https://creator--ai.firebaseapp.com/__/auth/tiktok/callback
```

---

## ✅ CHECKLIST

- [ ] Redirect URI trong TikTok Console = `https://creator--ai.firebaseapp.com/__/auth/tiktok/callback`
- [ ] Client Key trong Firebase config = Client Key trong TikTok Console
- [ ] App Status = "Live" hoặc "In Development"
- [ ] Scopes được enable: `user.info.basic`, `user.info.profile`
- [ ] Domain đã được verify
- [ ] Functions đã được deploy: `getTikTokAuthUrl`, `handleTikTokCallback`

---

## 🚨 COMMON ISSUES

### Issue 1: Redirect URI không khớp
**Lỗi:** TikTok từ chối vì redirect URI không đúng
**Fix:** Copy chính xác URL từ TikTok Console → Firebase Function

### Issue 2: App chưa được approve
**Lỗi:** App ở trạng thái "Pending Review"
**Fix:** Đợi TikTok approve hoặc chuyển sang "In Development" mode

### Issue 3: Client Key sai
**Lỗi:** Client Key trong Firebase khác với TikTok Console
**Fix:** Set lại config và deploy functions

---

## 📞 NEXT STEPS

Sau khi kiểm tra tất cả các bước trên:
1. **Fix các vấn đề tìm thấy**
2. **Deploy lại functions** (nếu đã sửa config)
3. **Test lại TikTok login**

---

**Nếu vẫn lỗi, gửi screenshot TikTok Developer Console (Basic Information, Platform, Permissions) để debug tiếp!** 🔍
