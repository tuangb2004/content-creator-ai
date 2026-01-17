# Email Verification Flow - Chi Tiết

## FLOW HIỆN TẠI (Theo Code):

### BƯỚC 1: User nhấn "Create Account"
- **File**: `frontend/src/components/Auth/AuthModal.jsx` (dòng 165-191)
- User điền form → nhấn "Create Account"
- Gọi `register(fullName, email, password)` từ AuthContext

### BƯỚC 2: Register Function
- **File**: `frontend/src/contexts/AuthContext.jsx` (dòng 180-254)
- Tạo user với `createUserWithEmailAndPassword()`
- Update profile với displayName
- **Lưu vào localStorage:**
  - `pendingVerificationPassword` (base64 encoded)
  - `pendingVerificationEmail`
- **Đợi token sẵn sàng** (retry 5 lần, mỗi lần 200ms)
- **Gọi `createVerificationSession`** Cloud Function:
  - Tạo session trong Firestore
  - Gửi email verification với session_id trong URL
  - Return `session_id`
- **Nếu `createVerificationSession` fail:**
  - Fallback: gọi `resendCustomVerification` (không có session_id)
- **Sign out user** ngay lập tức
- **Return:** `{ user: null, emailSent: true, email: string, sessionId: string | null }`

### BƯỚC 3: AuthModal hiển thị VerificationWaitingScreen
- **File**: `frontend/src/components/Auth/AuthModal.jsx` (dòng 169-191)
- Nếu có `email` → set `showWaitingScreen = true`
- Nếu có `sessionId` → lưu vào localStorage và state
- Modal hiển thị `VerificationWaitingScreen` component
- **Modal KHÔNG đóng** (backdrop và close button bị disable)

### BƯỚC 4: VerificationWaitingScreen polling
- **File**: `frontend/src/components/Auth/VerificationWaitingScreen.jsx` (dòng 21-111)
- **CHỈ POLL NẾU CÓ `sessionId`** (dòng 22-24)
- Poll mỗi 1.5 giây bằng `getSessionStatusCallable`
- Khi `sessionStatus === 'verified'`:
  - Auto-login với password từ localStorage
  - Reload user để check emailVerified
  - Nếu verified → cleanup localStorage, mark session completed
  - Call `onComplete()` → đóng modal → redirect to `/dashboard`

### BƯỚC 5: User nhấn verify trong email
- **Email link**: `{SITE_URL}/verify-email?oobCode=...&session_id=...` (nếu có session)
- **File**: `functions/src/emailService.ts` (dòng 85-99)
- Link được generate bởi Firebase `generateEmailVerificationLink()`
- `actionCodeSettings.url` = `${siteUrl}/verify-email?session_id=${sessionId}`
- Firebase tự động thêm `oobCode` và `mode` vào URL

### BƯỚC 6: VerifyEmailPage xử lý verification
- **File**: `frontend/src/pages/VerifyEmailPage.jsx` (dòng 21-87)
- Parse `oobCode`, `session_id`, `mode` từ URL
- **Gọi `applyActionCode(auth, oobCode)`** → Verify email trong Firebase Auth
- **Nếu có `session_id`:**
  - Gọi `markSessionVerifiedCallable` để mark session = 'verified' trong Firestore
- Hiện "Email Verified!" message
- **Redirect về `/` sau 2 giây** (dòng 61-69)

---

## VẤN ĐỀ HIỆN TẠI:

### ❌ VẤN ĐỀ 1: Nếu `createVerificationSession` fail
- `sessionId = null`
- VerificationWaitingScreen **KHÔNG POLL** (vì check `if (!sessionId) return`)
- User nhấn verify → VerifyEmailPage không có `session_id` → không mark session verified
- **→ Không có auto-login, user phải login manually**

### ❌ VẤN ĐỀ 2: Email link có thể không có `session_id`
- Nếu `createVerificationSession` fail nhưng fallback `resendCustomVerification` success
- `resendCustomVerification` KHÔNG tạo session → email link không có `session_id`
- VerifyEmailPage không mark session → VerificationWaitingScreen không detect

### ❌ VẤN ĐỀ 3: VerifyEmailPage redirect về `/` nhưng modal đang mở
- VerifyEmailPage redirect về `/` (landing page)
- Nhưng modal VerificationWaitingScreen vẫn đang mở
- Có thể gây confusion cho user

### ❌ VẤN ĐỀ 4: SITE_URL có thể sai
- Nếu Firebase Functions không đọc được `SITE_URL` từ config
- Email link sẽ có URL sai → redirect về localhost hoặc domain sai

---

## FLOW ĐÚNG MONG MUỐN:

1. ✅ User nhấn Create Account → Modal hiển thị VerificationWaitingScreen
2. ✅ Email được gửi với link verify
3. ✅ User nhấn verify trong email → **CHỈ verify email, không redirect đi đâu**
4. ✅ VerificationWaitingScreen polling detect verified → Auto-login → Redirect to dashboard
5. ✅ **Cross-device support:** Verify trên device khác → Device đang chờ tự động detect và login

---

## CẦN SỬA:

1. **VerificationWaitingScreen phải poll ngay cả khi không có `sessionId`**
   - Poll Firebase Auth trực tiếp để check `emailVerified` status
   - Hoặc tìm cách khác để detect verification

2. **VerifyEmailPage không redirect**
   - Chỉ hiện "Email Verified!" và tự đóng tab (nếu có thể)
   - Hoặc hiện message đơn giản

3. **Đảm bảo `createVerificationSession` luôn success**
   - Hoặc có fallback tốt hơn khi fail

4. **Đảm bảo SITE_URL đúng trong production**
   - Set qua Firebase config hoặc environment variable
