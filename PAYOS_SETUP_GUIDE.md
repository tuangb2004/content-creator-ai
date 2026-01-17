# 🚀 PayOS Production Setup - Step by Step Guide

## ✅ Current Status

### Đã sẵn sàng:
- ✅ PayOS credentials trong `.env` file (functions/.env)
  - `PAYOS_CLIENT_ID`: df6e7cdc-51a0-49af-8550-a75a7898f7fd
  - `PAYOS_API_KEY`: 7c4893b1-a25f-4299-a13c-85805d112cac
  - `PAYOS_CHECKSUM_KEY`: 6eed0098b4d38484c75ebd1b01bdb59d0b83a08b9a14c5148d6a9f5daa7984f2
  - `PAYOS_TEST_MODE`: false
- ✅ Firebase Project: `creator--ai`
- ✅ Backend functions implemented:
  - `createPaymentLink` ✅
  - `payosWebhook` ✅
- ✅ Frontend UI: BillingPlans component ✅

---

## 📋 Setup Steps

### **Step 1: Configure Firebase Functions Config** (5 phút)

Firebase Functions cần credentials từ **Firebase Config** (không chỉ .env file).

```powershell
# Mở terminal trong folder functions
cd functions

# Set PayOS credentials vào Firebase Config
firebase functions:config:set payos.client_id="df6e7cdc-51a0-49af-8550-a75a7898f7fd"
firebase functions:config:set payos.api_key="7c4893b1-a25f-4299-a13c-85805d112cac"
firebase functions:config:set payos.checksum_key="6eed0098b4d38484c75ebd1b01bdb59d0b83a08b9a14c5148d6a9f5daa7984f2"
firebase functions:config:set payos.test_mode="false"

# Verify config
firebase functions:config:get
```

**Expected output:**
```json
{
  "payos": {
    "client_id": "df6e7cdc-51a0-49af-8550-a75a7898f7fd",
    "api_key": "7c4893b1-a25f-4299-a13c-85805d112cac",
    "checksum_key": "6eed0098b4d38484c75ebd1b01bdb59d0b83a08b9a14c5148d6a9f5daa7984f2",
    "test_mode": "false"
  }
}
```

---

### **Step 2: Build & Deploy Functions** (10 phút)

```powershell
# Vẫn trong folder functions
# Install dependencies (nếu chưa)
npm install

# Build TypeScript to JavaScript
npm run build

# Deploy ONLY payment functions
firebase deploy --only functions:createPaymentLink,functions:payosWebhook

# Or deploy ALL functions
firebase deploy --only functions
```

**Expected output:**
```
✔  functions[createPaymentLink(us-central1)] Successful create operation
✔  functions[payosWebhook(us-central1)] Successful create operation

Function URL (payosWebhook):
https://us-central1-creator--ai.cloudfunctions.net/payosWebhook
```

**⚠️ IMPORTANT:** Copy the webhook URL! You'll need it in Step 3.

---

### **Step 3: Register Webhook in PayOS Dashboard** (5 phút)

1. **Login to PayOS:**
   - Go to: https://my.payos.vn/
   - Login with your account

2. **Navigate to Webhooks:**
   - Click **Cài đặt** (Settings) in sidebar
   - Click **Cấu hình Webhook** (Webhook Configuration)

3. **Add Webhook:**
   - **Webhook URL:** `https://us-central1-creator--ai.cloudfunctions.net/payosWebhook`
   - **Events to send:** Check "Thanh toán thành công" (Payment Success)
   - Click **Lưu** (Save)

4. **Test Webhook (Optional):**
   - Click "Test Webhook" button
   - Check Firebase Functions logs to see if request received

---

### **Step 4: Test Real Payment** (10 phút)

#### Option A: Small Amount Test (Recommended)
1. Go to your deployed app: `https://content-creator-ai-wheat.vercel.app/dashboard`
2. Click **"Upgrade to Pro"** 
3. **Modify amount for testing:** You can temporarily change plan prices to smaller amounts for testing:
   - In `frontend/src/components/Dashboard/BillingPlans.jsx`
   - Change `PLAN_PRICES.pro_monthly` from `690000` to `1000` (1,000 VND = ~$0.04)
4. Complete payment via PayOS
5. Check:
   - User credits updated
   - Plan upgraded to "pro"
   - Payment recorded in Firestore `payment_links` collection

#### Option B: Use PayOS Test Environment
PayOS provides a sandbox for testing without real money:
1. Ask PayOS support for sandbox credentials
2. Update `.env` with sandbox credentials
3. Set `PAYOS_TEST_MODE=true`
4. Redeploy functions

---

### **Step 5: Verify Everything Works** (5 phút)

#### Check Firebase Functions Logs:
```powershell
# View recent logs
firebase functions:log

# Filter by function
firebase functions:log --only payosWebhook
firebase functions:log --only createPaymentLink
```

#### Expected Log Flow:
```
[createPaymentLink] Creating PayOS payment link...
[createPaymentLink] Payment link created: pl_abc123
[payosWebhook] Received webhook request
[payosWebhook] Webhook signature verified successfully
[payosWebhook] Payment processed successfully for user xyz
```

#### Check Firestore:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `creator--ai`
3. Navigate to **Firestore Database**
4. Check collections:
   - `payment_links` - Should have payment record
   - `users` - User should have updated plan & credits
   - `activity_logs` - Should log payment activity

---

## 🔍 Troubleshooting

### Issue 1: "PayOS credentials not configured"
**Solution:**
```powershell
firebase functions:config:get payos
# Should show all 4 values
# If empty, go back to Step 1
```

### Issue 2: "Webhook signature verification failed"
**Solutions:**
1. Check checksum key is correct:
   ```powershell
   firebase functions:config:get payos.checksum_key
   ```
2. Temporarily disable for testing:
   ```powershell
   firebase functions:config:set payos.enable_signature_verification="false"
   firebase deploy --only functions:payosWebhook
   ```
3. Check PayOS Dashboard webhook settings

### Issue 3: Payment link created but webhook not received
**Solutions:**
1. Verify webhook URL is registered in PayOS Dashboard
2. Check Firebase Functions logs for errors
3. Test webhook manually from PayOS Dashboard
4. Ensure function is deployed and running:
   ```powershell
   firebase functions:list
   ```

### Issue 4: "Cannot connect to PayOS API"
**Solutions:**
1. Check internet connection
2. Disable VPN if using
3. Verify PayOS service status
4. Check credentials are valid

---

## 🎯 Production Checklist

Before going live:
- [ ] PayOS credentials configured in Firebase Config
- [ ] Functions deployed successfully
- [ ] Webhook URL registered in PayOS Dashboard
- [ ] Test payment completed successfully
- [ ] User credits & plan updated correctly
- [ ] Webhook signature verification ENABLED
- [ ] Remove test/debug code
- [ ] Set `PAYOS_TEST_MODE=false`
- [ ] Monitor logs for first few real transactions

---

## 📊 Monitoring Production

### View Real-time Logs:
```powershell
# Stream live logs
firebase functions:log --lines 100

# Or use Firebase Console
# https://console.firebase.google.com/project/creator--ai/functions/logs
```

### Check Payment Status:
- Firebase Console > Firestore > `payment_links` collection
- Status values: `pending`, `success`, `failed`

### Monitor Errors:
- Firebase Console > Functions > Logs tab
- Filter by "Error" level
- Set up email alerts for errors

---

## 🔐 Security Notes

1. **Never commit credentials to git:**
   - ✅ `.env` is in `.gitignore`
   - ✅ Firebase config is separate

2. **Webhook security:**
   - ✅ Signature verification enabled by default
   - ✅ Only accept POST requests
   - ✅ Validate all webhook data

3. **Rate limiting:**
   - Consider adding rate limits to prevent abuse
   - Firebase Functions has built-in quotas

---

## 📞 Support Contacts

- **PayOS Support:** https://payos.vn/lien-he
- **PayOS Docs:** https://payos.vn/docs
- **Firebase Support:** https://firebase.google.com/support

---

**Last Updated:** 2026-01-17  
**Status:** Ready to deploy  
**Estimated Total Time:** ~30 minutes
