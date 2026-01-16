# Payment System Setup - Quick Guide

## 📦 Đã Chuẩn Bị

✅ **Backend Functions:**
- `createPaymentLink` - Tạo payment link PayOS
- `payosWebhook` - Nhận webhook từ PayOS
- Plan credits đã update:
  - Free (Starter): 20 credits
  - Pro Monthly: 2,500 credits
  - Pro Yearly: 30,000 credits (2,500 x 12)
  - Agency Monthly: 12,000 credits
  - Agency Yearly: 144,000 credits (12,000 x 12)

## 🚀 Setup Nhanh (30 phút)

### 1. Get PayOS Credentials (10 phút)

1. Vào: https://payos.vn/
2. Đăng ký/Login
3. Hoàn tất KYC
4. Vào **Settings** > **API Credentials**
5. Copy 3 values:
   - Client ID
   - API Key
   - Checksum Key

### 2. Configure Firebase (5 phút)

```bash
cd functions

# Set credentials
firebase functions:config:set payos.client_id="YOUR_CLIENT_ID"
firebase functions:config:set payos.api_key="YOUR_API_KEY"
firebase functions:config:set payos.checksum_key="YOUR_CHECKSUM_KEY"

# Enable signature verification
firebase functions:config:set payos.enable_signature_verification="true"

# Verify
firebase functions:config:get
```

### 3. Deploy Functions (10 phút)

```bash
# Build
npm install
npm run build

# Deploy
firebase deploy --only functions:createPaymentLinkFunction,functions:payosWebhook

# Get webhook URL (xuất hiện sau deploy)
# Example: https://us-central1-content-creator-ai.cloudfunctions.net/payosWebhook
```

### 4. Register Webhook (5 phút)

1. Vào **PayOS Dashboard** > **Webhooks**
2. Add webhook:
   - URL: `https://us-central1-[PROJECT_ID].cloudfunctions.net/payosWebhook`
   - Method: POST
   - Events: Payment Success
3. Save

## ✅ Test Payment

### Local Test (Test Mode)
```bash
cd functions
firebase emulators:start
```

Frontend sẽ detect emulator và dùng test mode.

### Production Test
1. Go to: https://content-creator-ai-wheat.vercel.app/dashboard
2. Click "Upgrade to Pro"
3. Complete payment (dùng số tiền nhỏ: 1,000 VND)
4. Check Firebase Console logs

## 🔍 Verify

```bash
# Check logs
firebase functions:log --only payosWebhook

# Check config
firebase functions:config:get
```

Expected logs:
- `[createPaymentLink] Creating PayOS payment link...`
- `[payosWebhook] Received webhook request`
- `[payosWebhook] Webhook signature verified successfully`
- `[payosWebhook] Payment processed successfully`

## 🐛 Troubleshooting

### Error: "PayOS credentials not configured"
```bash
firebase functions:config:get payos
# Should return client_id, api_key, checksum_key
```

### Error: "Webhook signature verification failed"
```bash
# Check checksum_key correct
firebase functions:config:get payos.checksum_key

# Temporarily disable for testing
firebase functions:config:set payos.enable_signature_verification="false"
firebase deploy --only functions:payosWebhook
```

### Payment link created but webhook not received
1. Check webhook registered in PayOS Dashboard
2. Test webhook manually from PayOS Dashboard
3. Check Firebase Functions logs

## 📚 Full Documentation

- Complete roadmap: `../PAYMENT_COMPLETION_ROADMAP.md`
- Quick start: `../PAYMENT_QUICKSTART.md`
- Setup script: `../setup-payment.ps1`

## 🔒 Security Checklist

Before production:
- [ ] PayOS credentials configured
- [ ] Signature verification enabled
- [ ] Webhook URL registered
- [ ] Test payment completed
- [ ] No test/debug code in production
- [ ] Environment variables secured

## 📞 Support

- PayOS Docs: https://payos.vn/docs
- Firebase Functions: https://firebase.google.com/docs/functions
- Project Issues: GitHub Issues

---

**Last Updated:** 2026-01-16  
**Status:** Ready for setup  
**Estimated Time:** 30 minutes
