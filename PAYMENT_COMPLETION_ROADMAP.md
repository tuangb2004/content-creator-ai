# 🚀 Payment System Completion Roadmap

> **Mục tiêu**: Hoàn thiện hệ thống thanh toán PayOS để sẵn sàng cho Production
> **Thời điểm**: Đã deploy lên production, cần hoàn thiện trước khi mở payment thực

---

## 📊 Hiện Trạng Hệ Thống

### ✅ Đã Có (Completed)
1. **Backend Firebase Functions**:
   - `createPaymentLink` - Tạo payment link PayOS ✅
   - `payosWebhook` - Xử lý webhook từ PayOS ✅
   - Signature verification (đã code, đang disable) ✅
   - Test mode support ✅

2. **Frontend Components**:
   - `BillingPlans` - Hiển thị plans & pricing ✅
   - `PaymentModal` - Modal thanh toán (Stripe/PayOS UI) ✅
   - Integration với Firebase Functions ✅

3. **Database Structure**:
   - `payment_links` collection ✅
   - `users` collection với plan & credits ✅

### ⚠️ Cần Hoàn Thiện (TODO)

#### 🔴 CRITICAL (Bắt buộc trước khi production)
1. **PayOS Credentials** - Chưa config
2. **Webhook Signature Verification** - Đang disable
3. **Production Webhook URL** - Chưa setup
4. **Payment Flow Testing** - Chưa test end-to-end
5. **Error Handling** - Cần improve
6. **Security** - Cần review

#### 🟡 IMPORTANT (Nên có)
1. **Stripe Integration** - Chỉ có UI, chưa có backend
2. **Payment History** - Chưa hiển thị lịch sử thanh toán
3. **Invoice Generation** - Chưa có hóa đơn
4. **Refund Flow** - Chưa có
5. **Monitoring & Alerts** - Chưa có

#### 🟢 NICE TO HAVE (Có thể làm sau)
1. **Multiple Payment Methods** - Chỉ có PayOS
2. **Subscription Management** - Auto-renewal
3. **Promo Codes** - Mã giảm giá
4. **Analytics Dashboard** - Báo cáo doanh thu

---

## 🎯 PHASE 1: Production Ready (PRIORITY)

### 1.1 Setup PayOS Credentials

#### Bước 1: Đăng ký PayOS
1. Truy cập: https://payos.vn/
2. Đăng ký tài khoản Business
3. Hoàn tất KYC verification
4. Lấy credentials:
   - Client ID
   - API Key
   - Checksum Key

#### Bước 2: Config Firebase Functions

**Option A: Firebase CLI (Recommended)**
```bash
cd functions

# Set PayOS credentials
firebase functions:config:set payos.client_id="YOUR_CLIENT_ID"
firebase functions:config:set payos.api_key="YOUR_API_KEY"
firebase functions:config:set payos.checksum_key="YOUR_CHECKSUM_KEY"

# Enable signature verification
firebase functions:config:set payos.enable_signature_verification="true"

# Deploy
firebase deploy --only functions
```

**Option B: Environment Variables (Local development)**
```bash
# functions/.env
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here
ENABLE_PAYOS_SIGNATURE_VERIFICATION=true
```

#### Bước 3: Verify Config
```bash
# Check current config
firebase functions:config:get

# Test functions locally
cd functions
npm run serve
```

---

### 1.2 Setup Webhook URL

#### Bước 1: Get Production Webhook URL
```
Production URL: https://us-central1-[YOUR_PROJECT_ID].cloudfunctions.net/payosWebhook

Example:
https://us-central1-content-creator-ai.cloudfunctions.net/payosWebhook
```

#### Bước 2: Register with PayOS
1. Login vào PayOS Dashboard
2. Vào **Settings** > **Webhooks**
3. Add webhook URL:
   - URL: `https://us-central1-[PROJECT_ID].cloudfunctions.net/payosWebhook`
   - Method: `POST`
   - Events: `Payment Success`
4. Save và test webhook

#### Bước 3: Test Webhook
```bash
# PayOS Dashboard có "Test Webhook" button
# Click để test, check Firebase Functions logs
firebase functions:log --only payosWebhook
```

---

### 1.3 Enable Signature Verification

**File: `functions/src/payosWebhook.ts`**

**Current (Line 63):**
```typescript
const ENABLE_SIGNATURE_VERIFICATION = process.env.ENABLE_PAYOS_SIGNATURE_VERIFICATION === 'true';
```

**Production Setup:**
```bash
# Enable via Firebase config
firebase functions:config:set payos.enable_signature_verification="true"

# Deploy
firebase deploy --only functions:payosWebhook
```

**Verify:**
- Check logs xem có message: `"Webhook signature verified successfully"`
- Không còn warning: `"⚠️ WARNING: Signature verification is disabled"`

---

### 1.4 Update Plan Credits

**File: `functions/src/createPaymentLink.ts` (Line 22-26)**

**Current:**
```typescript
const PLAN_CREDITS: Record<string, number> = {
  pro_monthly: 2000,
  pro_yearly: 24000,
  agency_monthly: 10000,
};
```

**Update to match frontend:**
```typescript
const PLAN_CREDITS: Record<string, number> = {
  pro_monthly: 2500,        // Match frontend: 2,500 credits
  pro_yearly: 30000,        // 2,500 * 12 months
  agency_monthly: 12000,    // Match frontend: 12,000 credits
  agency_yearly: 144000,    // 12,000 * 12 months
};
```

---

### 1.5 End-to-End Testing

#### Test Checklist:

**Pre-deployment Testing:**
- [ ] Local emulator test with test mode
- [ ] PayOS sandbox test (if available)
- [ ] Webhook signature verification
- [ ] Credits update correctly
- [ ] Plan upgrade works
- [ ] Error handling works

**Production Testing (Small Amount):**
```bash
# Use smallest amount for testing
# VND 1,000 - 10,000 for test transactions
```

**Test Cases:**
1. **Happy Path**:
   - User clicks "Upgrade to Pro"
   - Payment link created
   - User completes payment
   - Webhook received
   - Credits updated
   - Plan upgraded
   - Toast notification shows success

2. **Cancel Flow**:
   - User clicks "Upgrade"
   - Payment link created
   - User cancels payment
   - Returns to dashboard
   - No charges

3. **Error Cases**:
   - Invalid credentials
   - Webhook signature mismatch
   - Duplicate payment (idempotency)
   - Network timeout
   - PayOS API down

---

## 🎯 PHASE 2: Enhanced Features (Post-Launch)

### 2.1 Payment History

**Backend:**
```typescript
// functions/src/paymentHistory.ts
export const getPaymentHistory = functions.https.onCall(async (data, context) => {
  const userId = validateAuth(context);
  
  const payments = await db.collection('payment_links')
    .where('userId', '==', userId)
    .where('status', '==', 'success')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  
  return payments.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }));
});
```

**Frontend:**
- Thêm tab "Billing History" trong BillingPlans
- Hiển thị table với columns: Date, Plan, Amount, Status, Invoice

---

### 2.2 Invoice Generation

**Backend:**
```typescript
// functions/src/generateInvoice.ts
export const generateInvoice = functions.https.onCall(async (data, context) => {
  const userId = validateAuth(context);
  const { paymentLinkId } = data;
  
  // Generate PDF invoice using puppeteer or PDFKit
  // Upload to Cloud Storage
  // Return download URL
});
```

**Frontend:**
- Add "Download Invoice" button trong Billing History
- Generate PDF với thông tin:
  - Company info
  - User info
  - Payment details
  - VAT (if applicable)

---

### 2.3 Stripe Integration (Alternative Payment)

**Why Stripe?**
- International payments
- Credit card support
- Better UX for some users

**Implementation:**
```typescript
// functions/src/createStripeCheckout.ts
import Stripe from 'stripe';

export const createStripeCheckout = functions.https.onCall(async (data, context) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: data.planName },
        unit_amount: data.amount * 100, // cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
  });
  
  return { sessionId: session.id, url: session.url };
});
```

---

### 2.4 Monitoring & Alerts

**Firebase Monitoring:**
```typescript
// functions/src/monitoring.ts
import * as admin from 'firebase-admin';

export const monitorPayments = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    // Check for stuck payments (pending > 15 mins)
    const stuckPayments = await db.collection('payment_links')
      .where('status', '==', 'pending')
      .where('createdAt', '<', new Date(Date.now() - 15 * 60 * 1000))
      .get();
    
    if (!stuckPayments.empty) {
      // Send alert email to admin
      console.error(`⚠️ Found ${stuckPayments.size} stuck payments`);
    }
  });
```

**Email Alerts:**
- Payment success → Send receipt to user
- Payment failed → Alert admin
- Daily revenue report → Send to admin

---

## 🎯 PHASE 3: Advanced Features (Future)

### 3.1 Subscription Auto-Renewal

**Monthly subscription:**
- Auto-charge mỗi tháng
- Grace period: 3 ngày
- Email reminder: 7 days before renewal

### 3.2 Promo Codes

**Features:**
- Percentage discount (10%, 20%)
- Fixed amount discount
- First-time user discount
- Expiry date
- Usage limit

### 3.3 Refund Management

**Refund Policy:**
- 7-day money-back guarantee
- Prorated refunds
- Refund via original payment method

---

## 📋 Implementation Checklist

### Before Launch:
- [ ] PayOS credentials configured
- [ ] Webhook URL registered
- [ ] Signature verification enabled
- [ ] Plan credits updated
- [ ] End-to-end testing passed
- [ ] Error handling tested
- [ ] Monitoring setup
- [ ] Documentation complete

### After Launch:
- [ ] Monitor payment success rate
- [ ] Check webhook logs daily
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Plan Phase 2 features

---

## 🔒 Security Checklist

- [ ] Webhook signature verification enabled
- [ ] PayOS credentials stored securely (Firebase config)
- [ ] No credentials in git repository
- [ ] HTTPS only for all endpoints
- [ ] Rate limiting on payment endpoints
- [ ] Input validation on all params
- [ ] Idempotency checks (duplicate payments)
- [ ] PCI DSS compliance (if storing card data)

---

## 📞 Support & Troubleshooting

### Common Issues:

**1. Payment link creation fails:**
- Check PayOS credentials
- Check internet connection
- Verify API limits

**2. Webhook not received:**
- Check webhook URL registered correctly
- Check Firebase Functions logs
- Test webhook manually from PayOS dashboard

**3. Credits not updated:**
- Check webhook processed successfully
- Check Firestore `payment_links` collection
- Check user document updated

**4. Signature verification fails:**
- Check CHECKSUM_KEY correct
- Check webhook data format
- Check PayOS documentation for signature algorithm

---

## 📚 Resources

- **PayOS Docs**: https://payos.vn/docs
- **Firebase Functions**: https://firebase.google.com/docs/functions
- **Stripe Docs**: https://stripe.com/docs (for Phase 2)
- **Firebase Config**: https://firebase.google.com/docs/functions/config-env

---

**Last Updated:** 2026-01-16
**Status:** Ready for Phase 1 Implementation
**Next Action:** Setup PayOS credentials
