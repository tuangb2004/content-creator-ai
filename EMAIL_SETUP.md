# 📧 Email Setup Guide - Production

## Tổng quan

Hệ thống đã được cấu hình để sử dụng **SendGrid** để gửi email thật trong production:
- ✅ Email verification (xác thực email)
- ✅ Password reset (đặt lại mật khẩu)
- ✅ Project completed notifications
- ✅ Product updates

---

## 🚀 Cấu hình SendGrid cho Production

### Bước 1: Tạo SendGrid Account

1. Truy cập https://sendgrid.com/
2. Tạo tài khoản (free tier: 100 emails/day)
3. Verify email của bạn

### Bước 2: Tạo API Key

1. Vào **Settings** → **API Keys**
2. Click **Create API Key**
3. Đặt tên: `CreatorAI Production`
4. Chọn permissions: **Full Access** (hoặc chỉ **Mail Send**)
5. Copy API key (chỉ hiển thị 1 lần!)

### Bước 3: Verify Sender Email

**⚠️ QUAN TRỌNG**: Firebase Hosting domains (`creator--ai.web.app`, `creator--ai.firebaseapp.com`) **KHÔNG THỂ** dùng để gửi email. 

Bạn có 2 lựa chọn:

#### Cách 1: Single Sender (Quick Start - Dùng Email Cá Nhân) ⭐ **KHUYẾN NGHỊ CHO BẠN**

**Ưu điểm:**
- ✅ Không cần mua domain
- ✅ Setup nhanh (5 phút)
- ✅ Dùng được ngay email cá nhân của bạn (Gmail, Outlook, etc.)
- ✅ Đủ dùng cho production nếu volume email không quá lớn

**Các bước:**

1. Vào **SendGrid Dashboard**
   - Settings → **Sender Authentication**
   - Chọn **Verify a Single Sender**

2. Điền thông tin:
   - **From Email**: Email cá nhân của bạn (ví dụ: `tuangb2004@gmail.com`)
   - **From Name**: `CreatorAI` (hoặc tên bạn muốn hiển thị)
   - **Reply To**: Email cá nhân của bạn (hoặc để trống)
   - **Company Address**: Địa chỉ công ty (optional)
   - **Website**: `https://creator--ai.web.app` (optional)

3. **Verify Email**
   - SendGrid sẽ gửi email verification đến địa chỉ bạn vừa nhập
   - Mở email và click link verify
   - Sau khi verify, status sẽ chuyển sang "Verified" ✅

4. **Cấu hình Firebase Functions**
   ```bash
   # Dùng email đã verify
   firebase functions:config:set sendgrid.from_email="tuangb2004@gmail.com"
   firebase functions:config:set app.site_url="https://creator--ai.web.app"
   ```

**Lưu ý:**
- ⚠️ Chỉ gửi được từ 1 email address này
- ⚠️ Nếu muốn đổi email, cần verify email mới
- ⚠️ Reputation thấp hơn Domain Authentication một chút, nhưng vẫn ổn cho production
- ⚠️ Nên dùng email Gmail/Outlook có reputation tốt

#### Cách 2: Domain Authentication (Nếu muốn Professional hơn - Cần mua domain)

**Lợi ích:**
- ✅ Gửi từ bất kỳ email nào trong domain (`noreply@`, `support@`, `hello@`, etc.)
- ✅ Reputation cao hơn, ít bị spam
- ✅ Professional hơn
- ✅ Better deliverability

**Yêu cầu:**
- Bạn phải sở hữu domain (ví dụ: `creatorai.app`, `creatorai.com`)
- Có quyền truy cập DNS records của domain

**Các bước setup Domain Authentication:**

1. **Vào SendGrid Dashboard**
   - Settings → **Sender Authentication** → **Authenticate Your Domain**

2. **Chọn Domain Provider**
   - Nếu domain của bạn ở: GoDaddy, Namecheap, Cloudflare, Google Domains, etc.
   - Hoặc chọn "Other" nếu không thấy provider của bạn

3. **Nhập Domain**
   - Nhập domain của bạn (ví dụ: `creatorai.app`)
   - **KHÔNG** nhập subdomain như `www.creatorai.app`
   - Chỉ nhập: `creatorai.app`

4. **SendGrid sẽ tạo DNS Records**
   - SendGrid sẽ hiển thị các DNS records cần thêm:
     - **CNAME records** (2-3 records)
     - **TXT record** (SPF)
     - **TXT record** (DKIM - 3 records)

5. **Thêm DNS Records vào Domain Provider**

   **Ví dụ với Cloudflare:**
   ```
   Type: CNAME
   Name: em1234 (hoặc giá trị SendGrid cung cấp)
   Target: u1234567.wl123.sendgrid.net
   Proxy: OFF (quan trọng!)
   
   Type: CNAME
   Name: s1._domainkey
   Target: s1.domainkey.u1234567.wl123.sendgrid.net
   Proxy: OFF
   
   Type: CNAME
   Name: s2._domainkey
   Target: s2.domainkey.u1234567.wl123.sendgrid.net
   Proxy: OFF
   
   Type: TXT
   Name: @ (hoặc domain root)
   Content: v=spf1 include:sendgrid.net ~all
   ```

   **Ví dụ với GoDaddy:**
   - Vào Domain Manager → DNS Management
   - Thêm các records tương tự như trên

   **Ví dụ với Namecheap:**
   - Vào Domain List → Advanced DNS
   - Thêm các records tương tự

6. **Verify Domain trong SendGrid**
   - Sau khi thêm DNS records, quay lại SendGrid
   - Click **Verify**
   - SendGrid sẽ kiểm tra DNS records (có thể mất 5-30 phút)
   - Khi verify thành công, status sẽ chuyển sang "Verified" ✅

7. **Setup Branded Link (Optional nhưng Recommended)**
   - SendGrid sẽ hỏi về Branded Link
   - Chọn "Set up branded link" để dùng domain của bạn cho tracking links
   - Thêm thêm 2 CNAME records nữa

**Lưu ý quan trọng:**
- ⚠️ DNS propagation có thể mất 5-30 phút (đôi khi lên đến 48 giờ)
- ⚠️ Đảm bảo CNAME records có **Proxy OFF** (nếu dùng Cloudflare)
- ⚠️ Không thêm `www.` vào domain name
- ⚠️ Đợi DNS propagate trước khi verify

### Bước 4: Mua Domain (Chỉ cần nếu chọn Cách 2 - Domain Authentication)

Nếu bạn chưa có custom domain, có thể mua từ:

**Recommended Providers:**
- **Cloudflare** (rẻ nhất, $8-10/năm cho .com, DNS miễn phí, nhanh nhất)
- **Namecheap** ($10-15/năm, dễ sử dụng, có nhiều TLD)
- **Google Domains** ($12/năm, tích hợp tốt với Firebase)
- **GoDaddy** ($12-15/năm, phổ biến nhưng đắt hơn)

**Lưu ý:**
- Domain `.app` thường đắt hơn ($15-20/năm) và có thể có hạn chế
- Domain `.com` là standard và rẻ nhất ($8-12/năm)
- Domain `.io` phổ biến cho tech startups ($30-40/năm)
- Sau khi mua domain, bạn có thể:
  - Giữ nguyên DNS provider của domain
  - Hoặc chuyển DNS sang Cloudflare (miễn phí, nhanh hơn, có CDN)

**Sau khi mua domain:**
1. Thêm domain vào Firebase Hosting (optional - để có custom domain cho website)
   - Firebase Console → Hosting → Add custom domain
   - Thêm DNS records như Firebase hướng dẫn
2. Setup Domain Authentication trong SendGrid (bắt buộc - để gửi email)
   - Làm theo Bước 3 ở trên

### Bước 5: Cấu hình Firebase Functions

Có 2 cách cấu hình:

#### Cách 1: Sử dụng Firebase Functions Config (Recommended)

```bash
# Set SendGrid API key
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"

# Set sender email (dùng email đã verify trong SendGrid)
# Nếu dùng Single Sender: dùng email cá nhân (ví dụ: tuangb2004@gmail.com)
# Nếu dùng Domain Authentication: dùng email từ domain đã verify (ví dụ: noreply@yourdomain.com)
firebase functions:config:set sendgrid.from_email="tuangb2004@gmail.com"

# Set production site URL (có thể dùng Firebase hosting domain hoặc custom domain)
firebase functions:config:set app.site_url="https://creator--ai.web.app"

# Verify config
firebase functions:config:get
```

#### Cách 2: Sử dụng Environment Variables trong Firebase Console

1. Vào Firebase Console → Functions → Config
2. Thêm environment variables:
   - `SENDGRID_API_KEY`: `YOUR_SENDGRID_API_KEY`
   - `FROM_EMAIL`: `noreply@yourdomain.com` (domain đã verify trong SendGrid)
   - `SITE_URL`: `https://creator--ai.web.app` (hoặc custom domain nếu có)

### Bước 6: Deploy Functions

```bash
cd functions
npm install  # Đảm bảo @sendgrid/mail đã được install
cd ..
firebase deploy --only functions
```

---

## ✅ Kiểm tra Cấu hình

### 1. Kiểm tra Logs

Sau khi deploy, test gửi email và kiểm tra logs:

```bash
firebase functions:log
```

Tìm các log:
- `✅ SendGrid API key found`
- `✅ Verification email sent to ... via SendGrid`
- `✅ Email accepted by SendGrid (status 202)`

### 2. Test Email Verification

1. Đăng ký user mới với email thật
2. Kiểm tra inbox (có thể ở spam)
3. Click link verification
4. Xem logs để đảm bảo email được gửi thành công

### 3. Test Password Reset

1. Click "Forgot Password" trên login page
2. Nhập email
3. Kiểm tra inbox
4. Click link reset password

---

## 🔧 Troubleshooting

### Vấn đề: Email không được gửi

**Kiểm tra:**
1. SendGrid API key có đúng không?
   ```bash
   firebase functions:config:get
   ```

2. Sender email đã được verify chưa?
   - Vào SendGrid → Settings → Sender Authentication
   - Đảm bảo status là "Verified"

3. API key có permission "Mail Send"?
   - Vào SendGrid → Settings → API Keys
   - Kiểm tra permissions

4. Xem logs để tìm lỗi cụ thể:
   ```bash
   firebase functions:log --only sendCustomPasswordReset,resendCustomVerification
   ```

### Lỗi: 403 Forbidden

**Nguyên nhân:**
- Sender email chưa được verify
- API key không có permission

**Giải pháp:**
- Verify sender email trong SendGrid
- Tạo lại API key với Full Access permission

### Lỗi: Email vào Spam

**Nguyên nhân:**
- Single Sender không được trust cao
- Domain chưa được authenticate

**Giải pháp:**
- Setup Domain Authentication (recommended)
- Thêm SPF, DKIM records
- Warm up domain với lượng email nhỏ

### Lỗi: Link không hoạt động

**Kiểm tra:**
1. `SITE_URL` có đúng không?
   ```bash
   firebase functions:config:get app.site_url
   ```
   
2. Link trong email có format:
   ```
   https://creatorai.app/verify-email?oobCode=...&mode=verifyEmail
   ```

---

## 📝 Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SENDGRID_API_KEY` | SendGrid API Key | `SG.xxx...` | ✅ Yes |
| `FROM_EMAIL` | Sender email address (phải là email đã verify trong SendGrid - có thể là email cá nhân hoặc email từ domain) | `tuangb2004@gmail.com` (Single Sender) hoặc `noreply@yourdomain.com` (Domain Auth) | ✅ Yes |
| `SITE_URL` | Production site URL (có thể dùng Firebase hosting hoặc custom domain) | `https://creator--ai.web.app` | ✅ Yes |

**Priority Order:**
1. `process.env.SENDGRID_API_KEY` (nếu set trong Firebase Console)
2. `functions.config().sendgrid?.api_key` (nếu set qua CLI)
3. Fallback: email sẽ không được gửi (log warning)

---

## 🎯 Next Steps (Với Single Sender - Dùng Email Cá Nhân) ⭐

1. ✅ Setup SendGrid account
2. ✅ Create API key
3. ✅ Verify Single Sender với email cá nhân của bạn (ví dụ: `tuangb2004@gmail.com`)
4. ✅ Configure Firebase Functions với email đã verify
5. ✅ Deploy functions
6. ✅ Test email verification
7. ✅ Test password reset

**Hoặc nếu muốn dùng Domain Authentication (Professional hơn):**

1. ✅ Mua domain (nếu chưa có)
2. ✅ Setup SendGrid account
3. ✅ Create API key
4. ✅ Setup Domain Authentication trong SendGrid
5. ✅ Thêm DNS records vào domain provider
6. ✅ Verify domain trong SendGrid
7. ✅ Configure Firebase Functions
8. ✅ Deploy functions
9. ✅ Test email verification
10. ✅ Test password reset

## 📋 Checklist Single Sender (Dùng Email Cá Nhân) ⭐ **KHUYẾN NGHỊ**

- [ ] Đã tạo SendGrid account
- [ ] Đã tạo API key với permission "Mail Send"
- [ ] Đã vào SendGrid → Settings → Sender Authentication → Verify a Single Sender
- [ ] Đã nhập email cá nhân (ví dụ: `tuangb2004@gmail.com`)
- [ ] Đã verify email qua link trong inbox (status: Verified ✅)
- [ ] Đã set `SENDGRID_API_KEY` trong Firebase Functions config
- [ ] Đã set `FROM_EMAIL` = email đã verify trong Firebase Functions config
- [ ] Đã set `SITE_URL` = `https://creator--ai.web.app` trong Firebase Functions config
- [ ] Đã deploy functions: `firebase deploy --only functions`
- [ ] Đã test gửi email verification thành công
- [ ] Đã test gửi password reset thành công

## 📋 Checklist Domain Authentication (Nếu muốn Professional hơn)

- [ ] Đã mua domain (ví dụ: `creatorai.com`)
- [ ] Đã vào SendGrid → Settings → Sender Authentication → Authenticate Your Domain
- [ ] Đã copy các DNS records từ SendGrid
- [ ] Đã thêm CNAME records vào domain provider (Proxy OFF nếu dùng Cloudflare)
- [ ] Đã thêm TXT records (SPF, DKIM) vào domain provider
- [ ] Đã đợi DNS propagate (5-30 phút)
- [ ] Đã verify domain trong SendGrid (status: Verified ✅)
- [ ] Đã set `FROM_EMAIL` trong Firebase Functions config
- [ ] Đã test gửi email thành công

---

## 📚 Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Firebase Functions Config](https://firebase.google.com/docs/functions/config-env)
- [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
- [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
