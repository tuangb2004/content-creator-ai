# 📘 Facebook OAuth Setup - Complete Guide

## ✅ STATUS HIỆN TẠI

### Frontend (✅ Đã có):
- ✅ `AuthContext.jsx` có function `loginWithFacebook()`
- ✅ `AuthModal.jsx` có button "Continue with Facebook"
- ✅ Code đã sẵn sàng, chỉ cần config Firebase

### Backend (❌ Cần setup):
- ❌ Facebook App ID và Secret chưa được config trong Firebase
- ❌ Facebook Developer Console chưa được setup

---

## 🚀 BƯỚC 1: TẠO FACEBOOK APP

### 1.1. Vào Facebook Developer Console

1. **Vào:** https://developers.facebook.com/
2. **Login** với Facebook account của bạn
3. **Click "My Apps"** → **"Create App"**

### 1.2. Chọn App Type

1. Chọn **"Consumer"** hoặc **"Business"**
2. **Click "Next"**

### 1.3. Điền App Information

1. **App Display Name:** `CreatorAI` (hoặc tên bạn muốn)
2. **App Contact Email:** Email của bạn
3. **Business Account:** (Optional) Có thể bỏ qua
4. **Click "Create App"**

### 1.4. Thêm Facebook Login Product

1. Trong **"Add Products to Your App"**, tìm **"Facebook Login"**
2. **Click "Set Up"** hoặc **"Get Started"**
3. Chọn **"Web"** platform

---

## 🔧 BƯỚC 2: CẤU HÌNH FACEBOOK APP

### 2.1. Basic Settings

1. Vào **"Settings"** → **"Basic"**
2. **Lưu lại:**
   - **App ID** (sẽ cần cho Firebase)
   - **App Secret** (click "Show" để xem, sẽ cần cho Firebase)

### 2.2. Facebook Login Settings

1. Vào **"Products"** → **"Facebook Login"** → **"Settings"**
2. **Valid OAuth Redirect URIs:** Thêm các URLs sau:
   ```
   https://content-creator-ai-wheat.vercel.app/__/auth/action
   https://creator--ai.firebaseapp.com/__/auth/action
   https://content-creator-ai-wheat.vercel.app
   https://creator--ai.firebaseapp.com
   ```
3. **Save Changes**

### 2.3. App Domains

1. Vào **"Settings"** → **"Basic"**
2. **App Domains:** Thêm:
   ```
   vercel.app
   firebaseapp.com
   ```
3. **Save Changes**

### 2.4. Privacy Policy URL (Required)

1. Vào **"Settings"** → **"Basic"**
2. **Privacy Policy URL:** 
   ```
   https://content-creator-ai-wheat.vercel.app/privacy
   ```
3. **Terms of Service URL:**
   ```
   https://content-creator-ai-wheat.vercel.app/terms
   ```
4. **Save Changes**

---

## 🔥 BƯỚC 3: CẤU HÌNH FIREBASE

### 3.1. Vào Firebase Console

1. **Vào:** https://console.firebase.google.com/
2. Chọn project **"creator--ai"**
3. Vào **"Authentication"** → **"Sign-in method"**

### 3.2. Enable Facebook Provider

1. Tìm **"Facebook"** trong danh sách providers
2. **Click "Facebook"**
3. **Toggle "Enable"** để bật
4. **Nhập:**
   - **App ID:** (từ Facebook Developer Console)
   - **App Secret:** (từ Facebook Developer Console)
5. **Copy "OAuth redirect URI":**
   ```
   https://creator--ai.firebaseapp.com/__/auth/handler
   ```
6. **Click "Save"**

### 3.3. Add OAuth Redirect URI to Facebook

1. **Quay lại Facebook Developer Console**
2. Vào **"Facebook Login"** → **"Settings"**
3. **Thêm OAuth Redirect URI từ Firebase:**
   ```
   https://creator--ai.firebaseapp.com/__/auth/handler
   ```
4. **Save Changes**

---

## 🧪 BƯỚC 4: TEST FACEBOOK LOGIN

### 4.1. Test trên Production

1. **Vào:** https://content-creator-ai-wheat.vercel.app
2. **Click "Sign Up"** hoặc **"Sign In"**
3. **Click "Continue with Facebook"**
4. **Đăng nhập Facebook** và authorize app
5. **Redirect về Dashboard** ✅

### 4.2. Verify User trong Firestore

1. Vào Firebase Console → **Firestore Database**
2. Collection **"users"**
3. Tìm user với `provider: 'facebook.com'`
4. Verify: `credits: 20`, `plan: 'free'`

---

## 📋 CHECKLIST

### Facebook Developer Console:
- [ ] App đã được tạo
- [ ] Facebook Login product đã được thêm
- [ ] App ID và App Secret đã được lưu
- [ ] Valid OAuth Redirect URIs đã được thêm:
  - `https://content-creator-ai-wheat.vercel.app/__/auth/action`
  - `https://creator--ai.firebaseapp.com/__/auth/action`
  - `https://creator--ai.firebaseapp.com/__/auth/handler`
- [ ] App Domains đã được thêm
- [ ] Privacy Policy URL đã được set
- [ ] Terms of Service URL đã được set

### Firebase Console:
- [ ] Facebook provider đã được enable
- [ ] App ID đã được nhập
- [ ] App Secret đã được nhập
- [ ] OAuth redirect URI đã được copy và thêm vào Facebook

### Testing:
- [ ] Test Facebook login trên production
- [ ] Verify user được tạo trong Firestore
- [ ] Verify credits = 20 (free plan)

---

## 🐛 TROUBLESHOOTING

### "Facebook login failed"
- **Check:** App ID và App Secret trong Firebase có đúng không
- **Check:** OAuth Redirect URI đã được thêm vào Facebook chưa
- **Check:** Facebook App Status có là "Live" hoặc "In Development" không

### "Invalid OAuth redirect URI"
- **Fix:** Thêm chính xác redirect URI vào Facebook Developer Console
- **URI từ Firebase:** `https://creator--ai.firebaseapp.com/__/auth/handler`

### "App not approved"
- **Fix:** Facebook App cần được approve hoặc ở "In Development" mode
- **Development mode:** Cho phép test với developer account
- **Production mode:** Cần đợi Facebook approve (1-3 ngày)

---

## 📝 NOTES

### Development vs Production:
- **Development mode:** Test ngay, chỉ với developer account
- **Production mode:** Cần approve, dùng được cho tất cả users

### OAuth Redirect URIs:
- Firebase tự động tạo redirect URI: `https://creator--ai.firebaseapp.com/__/auth/handler`
- **Phải thêm URI này vào Facebook Developer Console**

### Privacy Policy & Terms:
- **Required** bởi Facebook
- Đã có sẵn tại:
  - Privacy: `https://content-creator-ai-wheat.vercel.app/privacy`
  - Terms: `https://content-creator-ai-wheat.vercel.app/terms`

---

## ✅ SAU KHI SETUP XONG

Facebook OAuth đã hoàn tất! User có thể:
- ✅ Đăng nhập bằng Facebook
- ✅ Tự động tạo account
- ✅ Nhận 20 credits (free plan)
- ✅ Sử dụng app ngay

---

**Ready to setup?** Làm theo từng bước trên! 🚀
