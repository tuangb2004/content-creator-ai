# 🔒 Hướng Dẫn Bảo Mật API Keys

## ✅ Tình Trạng Hiện Tại

**Tin tốt:** 
- ✅ File `frontend/.env` **KHÔNG** được track trong git (đã verify)
- ✅ Các API keys **CHƯA** bị commit vào git history
- ✅ File `.gitignore` đã được cập nhật để ignore `.env`

## 📋 Có Cần Commit/Push Gì Không?

### ✅ NÊN Commit

1. **File `.gitignore` đã được cập nhật** - Nên commit để đảm bảo `.env` không bao giờ bị commit:
   ```bash
   git add frontend/.gitignore
   git commit -m "chore: update .gitignore to ignore .env files"
   git push
   ```

2. **File `.env.example`** (nếu có) - Nên commit để làm template:
   ```bash
   git add frontend/.env.example
   git commit -m "docs: add .env.example template"
   git push
   ```

### ❌ KHÔNG NÊN Commit

- ❌ **KHÔNG commit file `.env`** - Đã được ignore, nhưng cần đảm bảo
- ❌ **KHÔNG commit các file chứa hardcoded API keys**

## 🛡️ Các Biện Pháp Bảo Mật Bổ Sung

### 1. ✅ Đã Làm (Good!)

- [x] Xóa các API keys nhạy cảm khỏi `frontend/.env`
- [x] Cập nhật `.gitignore` để ignore `.env`
- [x] Verify file `.env` không được track trong git

### 2. 🔐 Nên Làm Thêm

#### A. Tạo `.env.example` Template

Tạo file `frontend/.env.example` với các biến môi trường nhưng không có giá trị thực:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_FIREBASE_EMULATOR=false
```

**Lợi ích:**
- Team members biết cần config gì
- Không expose keys thực
- Có thể commit vào git an toàn

#### B. Sử Dụng Git Hooks (Pre-commit)

Tạo file `.git/hooks/pre-commit` để tự động check:

```bash
#!/bin/sh
# Prevent committing .env files
if git diff --cached --name-only | grep -E '\.env$'; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Please remove .env from staging area."
    exit 1
fi
```

#### C. Sử Dụng Environment Variables trong CI/CD

Khi deploy lên Vercel/Netlify/Firebase Hosting:

1. **Vercel:**
   - Settings → Environment Variables
   - Add các biến với prefix `VITE_`

2. **Firebase Hosting:**
   - Firebase Console → Project Settings → Environment Variables
   - Hoặc dùng Firebase Functions Config

3. **Netlify:**
   - Site settings → Environment variables

#### D. Rotate API Keys (Nếu Đã Từng Lộ)

Nếu bạn nghi ngờ keys đã bị lộ (dù chưa commit vào git):

1. **Firebase:**
   - Firebase Console → Project Settings → General
   - Regenerate API keys nếu cần

2. **Stripe:**
   - Dashboard → Developers → API keys
   - Regenerate secret keys

3. **Gemini/Groq/Stability:**
   - Vào dashboard của từng service
   - Tạo API key mới và xóa key cũ

#### E. Sử Dụng Secret Management Tools (Advanced)

Cho production lớn, nên dùng:
- **AWS Secrets Manager**
- **Google Secret Manager**
- **HashiCorp Vault**
- **Azure Key Vault**

## 🔍 Kiểm Tra Định Kỳ

### Checklist Hàng Tuần

- [ ] Verify `.env` không được track: `git ls-files | grep .env`
- [ ] Verify `.gitignore` có ignore `.env`
- [ ] Check git history xem có keys nào bị commit: `git log -p -S "API_KEY"`
- [ ] Review các file mới xem có hardcoded keys không

### Script Kiểm Tra Nhanh

Tạo file `check-secrets.sh`:

```bash
#!/bin/bash
echo "🔍 Checking for exposed secrets..."

# Check if .env is tracked
if git ls-files | grep -q "\.env$"; then
    echo "❌ WARNING: .env file is tracked in git!"
else
    echo "✅ .env is not tracked"
fi

# Check for common API key patterns
if git log --all -p | grep -E "(api[_-]?key|secret[_-]?key|password)" | grep -v "your-" | grep -v "example"; then
    echo "⚠️  WARNING: Possible secrets found in git history"
else
    echo "✅ No obvious secrets in git history"
fi
```

## 📚 Best Practices Tổng Kết

### ✅ DO (Nên Làm)

1. ✅ Chỉ giữ keys có prefix `VITE_` trong `frontend/.env`
2. ✅ Tất cả secret keys chỉ ở `functions/.env`
3. ✅ Commit `.env.example` vào git
4. ✅ Sử dụng environment variables trong CI/CD
5. ✅ Rotate keys định kỳ
6. ✅ Review code trước khi commit

### ❌ DON'T (Không Nên)

1. ❌ Commit file `.env` vào git
2. ❌ Hardcode API keys trong code
3. ❌ Share `.env` file qua email/chat
4. ❌ Để keys trong comments/documentation
5. ❌ Sử dụng production keys trong development

## 🚨 Nếu Phát Hiện Keys Đã Bị Lộ

### Bước 1: Rotate Keys Ngay Lập Tức
- Tạo keys mới trong tất cả services
- Xóa keys cũ

### Bước 2: Audit Access
- Check logs xem có access bất thường không
- Review permissions và access control

### Bước 3: Clean Git History (Nếu Cần)
```bash
# ⚠️ CẨN THẬN: Chỉ làm nếu thực sự cần
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch frontend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 📞 Liên Hệ

Nếu phát hiện vấn đề bảo mật, cần:
1. Rotate keys ngay
2. Review access logs
3. Update security practices

---

**Lưu ý:** Document này nên được review định kỳ và update khi có thay đổi về security practices.
