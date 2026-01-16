# ⚡ Facebook OAuth - Quick Setup (Tối Thiểu)

## 🎯 MỤC TIÊU

Chỉ cần **App ID** và **App Secret** để enable Facebook login trong Firebase.

**Bỏ qua tất cả các trường khác** (Privacy Policy, Terms, Data Deletion, v.v.)

---

## ✅ BƯỚC 1: LẤY APP ID VÀ APP SECRET

1. Vào Facebook Developer Console: https://developers.facebook.com/
2. Chọn app của bạn
3. Vào **"Settings"** → **"Basic"**
4. **Copy:**
   - **App ID:** `1370320154876040` (đã có)
   - **App Secret:** Click "Hiển thị" để xem và copy

**Lưu lại 2 giá trị này!**

---

## ✅ BƯỚC 2: ENABLE FACEBOOK TRONG FIREBASE

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project **"creator--ai"**
3. Vào **"Authentication"** → **"Sign-in method"**
4. Click **"Facebook"**
5. **Toggle "Enable"** để bật
6. **Nhập:**
   - **App ID:** `1370320154876040` (hoặc App ID của bạn)
   - **App Secret:** (Paste App Secret đã copy)
7. **Click "Save"**

**XONG!** Facebook login đã được enable.

---

## 🧪 BƯỚC 3: TEST FACEBOOK LOGIN

1. Vào: https://content-creator-ai-wheat.vercel.app
2. Click "Sign Up" hoặc "Sign In"
3. Click "Continue with Facebook"
4. Đăng nhập Facebook và authorize
5. Redirect về Dashboard ✅

---

## ⚠️ LƯU Ý

### Các trường có thể bỏ qua (cho Development):
- ❌ Privacy Policy URL → **Bỏ qua**
- ❌ Terms of Service URL → **Bỏ qua**
- ❌ Data Deletion URL → **Bỏ qua**
- ❌ App Domains → **Bỏ qua**
- ❌ OAuth Redirect URIs → **Bỏ qua** (Firebase tự động handle)

### Khi nào cần điền đầy đủ?
- Khi app chuyển sang **Production mode**
- Khi submit app để **Facebook review**
- Khi cần access **advanced permissions**

### Development mode:
- ✅ Chỉ cần App ID + App Secret
- ✅ Có thể test ngay
- ✅ Không cần điền các trường khác

---

## 🚨 NẾU FACEBOOK BÁO LỖI

### "App not configured"
- **Fix:** Đảm bảo App ID và App Secret đúng
- **Fix:** Đảm bảo Facebook Login product đã được thêm

### "Invalid OAuth redirect URI"
- **Fix:** Firebase tự động handle redirect URI
- **Fix:** Không cần thêm redirect URI vào Facebook Console (cho development)

### "Privacy Policy required"
- **Fix:** Chỉ cần khi app ở Production mode
- **Fix:** Development mode có thể bỏ qua

---

## 📋 CHECKLIST TỐI THIỂU

- [ ] App ID đã được copy: `1370320154876040`
- [ ] App Secret đã được copy
- [ ] Firebase Facebook provider đã được enable
- [ ] App ID đã được nhập vào Firebase
- [ ] App Secret đã được nhập vào Firebase
- [ ] Test Facebook login trên production

---

## 🎯 KẾT LUẬN

**Chỉ cần 2 bước:**
1. Lấy App ID + App Secret từ Facebook Console
2. Enable Facebook provider trong Firebase với 2 giá trị trên

**Không cần điền gì thêm!** 🚀

---

**Ready?** Làm theo 2 bước trên và test ngay! ⚡
