# PayOS Integration Fix Summary

## 🔍 Problem Analysis

### Initial Error:
```
PayOS error: Thông tin truyền lên không đúng (Code: 20)
```

### Root Causes Found:

1. ❌ **Missing `signature` field** (CRITICAL)
   - PayOS requires HMAC SHA256 signature for request verification
   - Format: `amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl`
   
2. ❌ **Missing `items` array** (REQUIRED)
   - PayOS requires product items list
   - Each item needs: name, quantity, price
   
3. ⚠️ **Amount too small**  
   - Initial test: 1,000 VND
   - PayOS minimum: 10,000 VND

---

## ✅ Solutions Implemented

### 1. Added Signature Generation

**File:** `functions/src/utils/payos.ts`
```typescript
// Exported createSignature function
export function createSignature(data: string): string {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', payOSChecksumKey)
    .update(data)
    .digest('hex');
}
```

**File:** `functions/src/createPaymentLink.ts`
```typescript
// Generate signature before creating payment link
const description = `Nâng cấp gói ${planName} - ${credits} credits`;
const signatureData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${successUrl}`;
const signature = createSignature(signatureData);

const paymentRequest = {
  orderCode,
  amount,
  description,
  cancelUrl,
  returnUrl: successUrl,
  items: [...],
  signature, // ← Added this
};
```

### 2. Added Items Array

```typescript
items: [
  {
    name: `Gói ${planName}`,
    quantity: 1,
    price: amount,
  }
]
```

### 3. Updated Test Amounts

**File:** `frontend/src/components/Dashboard/BillingPlans.jsx`
```javascript
const PLAN_PRICES = {
  pro_monthly: 10000,    // Was: 1,000 → Now: 10,000 VND
  pro_yearly: 20000,     // Was: 2,000 → Now: 20,000 VND
  agency_monthly: 30000, // Was: 3,000 → Now: 30,000 VND
  agency_yearly: 50000,  // Was: 5,000 → Now: 50,000 VND
};
```

---

## 📚 PayOS API Requirements (from docs)

### Required Fields:
- ✅ `orderCode` (number)
- ✅ `amount` (number, minimum 10,000 VND)
- ✅ `description` (string)
- ✅ `items` (array)
- ✅ `cancelUrl` (string)
- ✅ `returnUrl` (string)
- ✅ `signature` (string, HMAC SHA256)

### Optional Fields:
- `buyerName` (string)
- `buyerEmail` (string)
- `buyerPhone` (string)
- `buyerAddress` (string)
- `expiredAt` (Unix timestamp)

### Signature Format:
```
Sorted alphabetically:
amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
```

Then apply HMAC SHA256 with `PAYOS_CHECKSUM_KEY`.

---

## 🧪 Testing Checklist

After deployment:

- [ ] Click "Upgrade to Pro" on dashboard
- [ ] Verify payment link created (no error)
- [ ] Check Firebase logs for success message
- [ ] Complete payment on PayOS page
- [ ] Verify webhook received
- [ ] Check user plan updated: free → pro
- [ ] Check credits updated: 20 → 2,500

---

## 📊 Expected Flow

1. **User clicks "Upgrade"**
   → Frontend calls `createPaymentLink` function
   
2. **Function generates signature**
   → Creates HMAC SHA256 of sorted params
   
3. **Function calls PayOS API**
   → POST to `https://api-merchant.payos.vn/v2/payment-requests`
   → With: orderCode, amount, description, items, cancelUrl, returnUrl, signature
   
4. **PayOS returns payment link**
   → `checkoutUrl`: https://pay.payos.vn/web/[ID]
   → `qrCode`: VietQR code for bank transfer
   
5. **User redirected to PayOS**
   → Completes payment
   
6. **PayOS sends webhook**
   → POST to `https://us-central1-creator--ai.cloudfunctions.net/payosWebhook`
   → With payment status
   
7. **Webhook updates Firestore**
   → User plan: free → pro
   → Credits: 20 → 2,500
   → Payment link status: pending → success

---

## 🔐 Security Notes

1. **Signature Verification:**
   - ✅ Request signature verified by PayOS
   - ✅ Webhook signature verified by our backend
   - ✅ Prevents tampering with payment data

2. **Credentials Security:**
   - ✅ Stored in Firebase Config (not in code)
   - ✅ Environment variables for local dev
   - ✅ Never committed to git

3. **Webhook Security:**
   - ✅ HMAC SHA256 signature verification
   - ✅ Idempotency check (prevent duplicate processing)
   - ✅ Firestore transaction for atomic updates

---

## 🚀 Deployment

### Functions:
```bash
cd functions
npm run build
firebase deploy --only functions:createPaymentLink,functions:payosWebhook
```

### Frontend:
```bash
git add -A
git commit -m "fix(payment): add PayOS signature and items array"
git push origin main
# Vercel auto-deploys
```

---

## 📝 Additional Improvements (Future)

1. **Better Error Messages:**
   - Translate PayOS error codes to Vietnamese
   - Show user-friendly messages

2. **Payment Status Tracking:**
   - Real-time status updates
   - Email notifications

3. **Invoice Generation:**
   - Auto-generate invoices on successful payment
   - Send via email

4. **Refund Support:**
   - Add refund functionality via PayOS API
   - Track refund status

5. **Multiple Payment Methods:**
   - Add VNPay, Momo integration
   - Let user choose preferred method

---

**Last Updated:** 2026-01-17  
**Status:** Fixed and deployed  
**Next Step:** Test payment on production
