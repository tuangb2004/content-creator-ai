# Vercel Auto-Deploy Setup

## ✅ Kiểm Tra Auto-Deploy Đang Hoạt Động

### Bước 1: Verify Git Integration
1. Truy cập: https://vercel.com/tuangb2004s-projects/content-creator-ai/settings/git
2. Kiểm tra:
   - ✅ **Git Repository**: Connected to `tuangb2004/content-creator-ai`
   - ✅ **Production Branch**: `main`
   - ✅ **Auto Deploy**: Enabled

### Bước 2: Check Deployment Settings
1. Truy cập: https://vercel.com/tuangb2004s-projects/content-creator-ai/settings/deployment-protection
2. Đảm bảo:
   - ✅ **Deploy Hooks**: Enabled
   - ✅ **Ignored Build Step**: Disabled (để build mọi commit)

---

## 🔧 Fix Auto-Deploy Không Hoạt Động

### Nguyên Nhân 1: Git Integration Chưa Được Bật
**Giải pháp:**
1. Vào **Settings** > **Git** 
2. Click **Connect Git Repository**
3. Chọn repo: `tuangb2004/content-creator-ai`
4. Set **Production Branch**: `main`

### Nguyên Nhân 2: Vercel Đang Deploy Branch Khác
**Giải pháp:**
1. Vào **Settings** > **Git**
2. Tại **Production Branch**, chọn `main`
3. Save changes

### Nguyên Nhân 3: Build Cache Issues
**Giải pháp:**
1. Vào **Deployments**
2. Click vào deployment mới nhất
3. Click **Redeploy** > **Redeploy with new build**

---

## 🚀 Force Deploy Manually (Backup Method)

### Option 1: Empty Commit (Đã Setup)
```bash
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

### Option 2: Deploy Hook (Recommended)
1. Vào **Settings** > **Git** > **Deploy Hooks**
2. Create new Deploy Hook với name: `manual-deploy`
3. Copy URL: `https://api.vercel.com/v1/integrations/deploy/...`
4. Trigger deploy:
```bash
curl -X POST "YOUR_DEPLOY_HOOK_URL"
```

### Option 3: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## 📝 Current Setup

- **Repository**: https://github.com/tuangb2004/content-creator-ai
- **Branch**: `main`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Framework**: Vite

---

## ✅ Test Auto-Deploy

Sau khi setup xong, test bằng cách:

```bash
# Tạo test commit
echo "# Test auto-deploy" >> README.md
git add README.md
git commit -m "test: trigger auto-deploy"
git push origin main
```

Sau 2-3 phút, check tại:
- Deployments page: https://vercel.com/tuangb2004s-projects/content-creator-ai/deployments
- Production URL: https://content-creator-ai-wheat.vercel.app/

---

## 🔍 Debug Checklist

- [ ] Git Integration connected
- [ ] Production branch = `main`
- [ ] Auto-deploy enabled
- [ ] No ignored build steps
- [ ] Latest commit pushed to GitHub
- [ ] Vercel deployment shows correct commit hash
- [ ] No build errors in Vercel logs

---

**Last Updated:** 2026-01-16
**Commit:** 647fa0d - Trigger Vercel auto-deploy
