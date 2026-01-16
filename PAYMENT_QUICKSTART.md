# 💳 Payment System - Quick Start Guide

> **Mục tiêu**: Setup payment trong 30 phút

---

## 🚀 Bắt Đầu Nhanh

### Bước 1: Chạy Setup Script (5 phút)

```powershell
cd "c:\Users\Luong Gia Tuan\workspace\content-creator-ai"
.\setup-payment.ps1
```

Chọn `1` để check status hiện tại.

---

### Bước 2: Lấy PayOS Credentials (10 phút)

1. Truy cập: **https://payos.vn/**
2. Đăng ký/Đăng nhập tài khoản
3. Hoàn tất KYC (nếu chưa)
4. Vào **Settings** > **API Credentials**
5. Copy 3 giá trị:
   - Client ID
   - API Key  
   - Checksum Key

---

### Bước 3: Configure Credentials (2 phút)

Chạy lại script và chọn `2`:

```powershell
.\setup-payment.ps1
# Chọn: 2. Configure PayOS credentials
```

Paste 3 credentials vừa copy.

---

### Bước 4: Deploy Functions (10 phút)

```powershell
.\setup-payment.ps1
# Chọn: 3. Deploy functions
```

**Quan trọng**: Copy Webhook URL hiển thị sau khi deploy.

---

### Bước 5: Register Webhook (3 phút)

1. Vào **PayOS Dashboard** > **Webhooks**
2. Click **Add Webhook**
3. Paste URL: `https://us-central1-[PROJECT_ID].cloudfunctions.net/payosWebhook`
4. Method: `POST`
5. Events: `Payment Success`
6. Save

---

### Bước 6: Test Payment (5 phút)

**Option A: Test Mode (Offline)**
```powershell
.\setup-payment.ps1
# Chọn: 4. Test payment flow
# Chọn: 1. Local emulator test
```

**Option B: Production Test (Online)**
1. Vào: https://content-creator-ai-wheat.vercel.app/dashboard
2. Click "Upgrade to Pro"
3. Dùng số tiền nhỏ test: 1,000 - 10,000 VND
4. Complete payment
5. Check credits updated

---

## ✅ Verification Checklist

Sau khi setup xong, verify:

```powershell
.\setup-payment.ps1
# Chọn: 1. Check current status
```

Phải thấy tất cả ✅:
- [x] Firebase CLI installed
- [x] Logged in to Firebase
- [x] PayOS credentials configured
- [x] Payment functions deployed

---

## 🔍 Quick Troubleshooting

### Issue 1: "Firebase CLI not installed"
```powershell
npm install -g firebase-tools
firebase login
```

### Issue 2: "PayOS credentials not configured"
```powershell
.\setup-payment.ps1
# Chọn: 2. Configure PayOS credentials
```

### Issue 3: "Functions deployment failed"
```powershell
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Issue 4: "Webhook not received"
- Check webhook URL registered correctly in PayOS Dashboard
- Test webhook manually from PayOS Dashboard
- Check Firebase Functions logs:
```powershell
.\setup-payment.ps1
# Chọn: 5. View logs
```

---

## 📞 Need Help?

### View Logs
```powershell
.\setup-payment.ps1
# Chọn: 5. View logs
```

### Full Documentation
Đọc file: `PAYMENT_COMPLETION_ROADMAP.md`

### Firebase Console
https://console.firebase.google.com/

### PayOS Dashboard
https://payos.vn/dashboard

---

## 🎯 Next Steps

Sau khi payment hoạt động:

1. **Phase 1**: Test với real payments (small amounts)
2. **Phase 2**: Add payment history UI
3. **Phase 3**: Add invoice generation
4. **Phase 4**: Add Stripe integration (optional)

Xem roadmap chi tiết trong `PAYMENT_COMPLETION_ROADMAP.md`

---

**Quick Commands**:
```powershell
# Check status
.\setup-payment.ps1 check

# Configure
.\setup-payment.ps1 config

# Deploy
.\setup-payment.ps1 deploy

# Test
.\setup-payment.ps1 test

# All in one
.\setup-payment.ps1 all
```

---

**Last Updated:** 2026-01-16  
**Status:** Ready to use  
**Estimated Setup Time:** 30 minutes
