# 🎵 TikTok OAuth Setup - Complete Guide

## ✅ BƯỚC 1: SET FIREBASE CONFIG

Bạn đã có **Client Key** và **Client Secret** từ TikTok Developer Console.

### Chạy lệnh này:

```powershell
firebase functions:config:set tiktok.client_key="YOUR_CLIENT_KEY" tiktok.client_secret="YOUR_CLIENT_SECRET"
```

**Hoặc chạy script tự động:**
```powershell
.\setup-tiktok-oauth.ps1
```

---

## ✅ BƯỚC 2: DEPLOY TIKTOK FUNCTIONS

Sau khi set config, deploy functions:

```powershell
firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback
```

**Hoặc deploy tất cả functions:**
```powershell
firebase deploy --only functions
```

---

## ✅ BƯỚC 3: DEPLOY FRONTEND (Nếu chưa deploy)

Frontend đã có code xử lý TikTok callback. Deploy lên Vercel:

```powershell
git add .
git commit -m "Add TikTok OAuth callback handler"
git push
```

Vercel sẽ tự động deploy.

---

## 🧪 BƯỚC 4: TEST TIKTOK LOGIN

### Test trên Production:

1. **Vào**: https://content-creator-ai-wheat.vercel.app
2. **Click**: "Sign Up" hoặc "Sign In"
3. **Click**: "Continue with TikTok"
4. **Đăng nhập TikTok** và authorize app
5. **Redirect về**: Dashboard (tự động đăng nhập)

---

## 📋 CHECKLIST

- [ ] Set Firebase config với Client Key + Secret
- [ ] Deploy TikTok functions (`getTikTokAuthUrl`, `handleTikTokCallback`)
- [ ] Deploy frontend (nếu có thay đổi)
- [ ] Test TikTok login trên production
- [ ] Verify user được tạo trong Firestore
- [ ] Verify credits = 20 (free plan)

---

## 🔍 VERIFY SETUP

### Check Firebase Functions logs:
```powershell
firebase functions:log --only getTikTokAuthUrl,handleTikTokCallback --lines 50
```

### Check Firestore:
1. Vào Firebase Console
2. Firestore Database
3. Collection `users`
4. Tìm user với `provider: 'tiktok'`

---

## 🐛 TROUBLESHOOTING

### "Failed to create TikTok auth URL"
- Check Firebase config: `firebase functions:config:get`
- Verify Client Key và Secret đúng

### "TikTok auth error"
- Check redirect URI trong TikTok Developer Console:
  - `https://creator--ai.firebaseapp.com/__/auth/tiktok/callback`
- Check Firebase Functions logs

### "Custom token sign-in failed"
- Check Firebase Functions logs
- Verify `handleTikTokCallback` function được deploy

---

## ✅ SAU KHI TEST THÀNH CÔNG

TikTok OAuth đã hoàn tất! User có thể:
- ✅ Đăng nhập bằng TikTok
- ✅ Tự động tạo account
- ✅ Nhận 20 credits (free plan)
- ✅ Sử dụng app ngay

---

**Ready to test?** Chạy script `.\setup-tiktok-oauth.ps1` hoặc làm theo từng bước trên! 🚀
