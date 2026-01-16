# 🗑️ Facebook User Data Deletion - Hướng Dẫn

## 📝 PHẦN "XÓA DỮ LIỆU NGƯỜI DÙNG"

Facebook yêu cầu app phải cung cấp cách để user xóa dữ liệu của họ.

---

## ✅ OPTION 1: URL Hướng Dẫn (KHUYẾN NGHỊ - Đơn giản nhất)

**Cách này đơn giản nhất, chỉ cần một trang hướng dẫn.**

### Bước 1: Chọn "URL hướng dẫn xóa dữ liệu"

1. Trong dropdown **"Kiểu xóa dữ liệu người dùng"**
2. **Chọn:** `URL hướng dẫn xóa dữ liệu` (Instructions URL)
3. **Nếu không thấy option này**, chọn option khác có chữ "hướng dẫn" hoặc "instructions"

### Bước 2: Điền URL

**URL hướng dẫn:**
```
https://content-creator-ai-wheat.vercel.app/privacy#data-deletion
```

**Hoặc tạo trang riêng:**
```
https://content-creator-ai-wheat.vercel.app/data-deletion
```

### Bước 3: Tạo trang hướng dẫn (Nếu cần)

Nếu chưa có trang, có thể:
- **Option A:** Thêm section vào Privacy Policy page
- **Option B:** Tạo trang riêng `/data-deletion`

---

## ✅ OPTION 2: Data Deletion Callback URL (Nâng cao)

**Cách này cần tạo API endpoint để Facebook gọi khi user yêu cầu xóa data.**

### Bước 1: Chọn "URL gọi lại xóa dữ liệu"

1. Trong dropdown **"Kiểu xóa dữ liệu người dùng"**
2. **Chọn:** `URL gọi lại xóa dữ liệu` (Data deletion callback URL) - **Đã được chọn**

### Bước 2: Tạo Firebase Function

Tạo endpoint để Facebook gọi khi user yêu cầu xóa data:

**File:** `functions/src/facebookDataDeletion.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const handleFacebookDataDeletion = functions.https.onRequest(async (req, res) => {
  // Facebook sẽ gửi POST request với signed_request
  const signedRequest = req.body.signed_request;
  
  if (!signedRequest) {
    res.status(400).json({ error: 'Missing signed_request' });
    return;
  }

  try {
    // Parse signed_request từ Facebook
    const [encodedSig, payload] = signedRequest.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Verify request từ Facebook (cần App Secret)
    // ... verification logic ...
    
    const userId = data.user_id;
    
    if (userId) {
      // Xóa user data từ Firestore
      await admin.firestore().collection('users').doc(`facebook:${userId}`).delete();
      
      // Xóa Firebase Auth user (nếu cần)
      try {
        await admin.auth().deleteUser(`facebook:${userId}`);
      } catch (error) {
        console.warn('User not found in Auth:', error);
      }
      
      // Return confirmation URL
      res.status(200).json({
        url: 'https://content-creator-ai-wheat.vercel.app/data-deleted',
        confirmation_code: `deleted_${userId}_${Date.now()}`
      });
    } else {
      res.status(200).json({ url: 'https://content-creator-ai-wheat.vercel.app/' });
    }
  } catch (error) {
    console.error('Data deletion error:', error);
    res.status(500).json({ error: 'Failed to process deletion request' });
  }
});
```

### Bước 3: Deploy Function

```powershell
firebase deploy --only functions:handleFacebookDataDeletion
```

### Bước 4: Điền Callback URL

**URL:**
```
https://us-central1-creator--ai.cloudfunctions.net/handleFacebookDataDeletion
```

**Hoặc nếu deploy ở region khác:**
```
https://[REGION]-creator--ai.cloudfunctions.net/handleFacebookDataDeletion
```

---

## 🎯 KHUYẾN NGHỊ: Dùng Option 1 (Instructions URL)

**Lý do:**
- ✅ Đơn giản, không cần code
- ✅ Đủ cho development và testing
- ✅ Có thể upgrade lên Callback URL sau

**Cách làm:**
1. Chọn **"URL hướng dẫn xóa dữ liệu"** trong dropdown
2. Điền URL: `https://content-creator-ai-wheat.vercel.app/privacy#data-deletion`
3. Save

---

## 📋 NỘI DUNG TRANG HƯỚNG DẪN

Nếu chọn Option 1, trang hướng dẫn nên có nội dung:

```
# Xóa Dữ Liệu Người Dùng

Để xóa dữ liệu của bạn khỏi CreatorAI:

1. Đăng nhập vào tài khoản của bạn
2. Vào Settings → Account
3. Click "Delete Account"
4. Xác nhận xóa tài khoản

Hoặc liên hệ: support@creatorai.com

Sau khi xóa, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
```

---

## ✅ CHECKLIST:

- [ ] Chọn "URL hướng dẫn xóa dữ liệu" (Option 1) hoặc "URL gọi lại" (Option 2)
- [ ] Điền URL hợp lệ
- [ ] Nếu dùng Option 2: Đã tạo và deploy Firebase Function
- [ ] Test URL trong browser (nếu dùng Option 1)
- [ ] Save Changes

---

## 🚀 NEXT STEPS:

1. **Chọn Option 1** (đơn giản nhất)
2. **Điền URL:** `https://content-creator-ai-wheat.vercel.app/privacy#data-deletion`
3. **Save Changes**
4. **Tiếp tục với Facebook Login Settings** (Bước 2.2 trong `FACEBOOK_SETUP_GUIDE.md`)

---

**Khuyến nghị: Dùng Option 1 (Instructions URL) để đơn giản và nhanh!** 🎯
