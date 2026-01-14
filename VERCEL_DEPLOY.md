# Hướng dẫn Deploy lên Vercel

## 📋 Yêu cầu

1. Tài khoản Vercel (đăng ký tại https://vercel.com)
2. GitHub repository đã push code
3. Firebase project đã setup

## 🚀 Các bước deploy

### Cách 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. **Đăng nhập Vercel**
   - Truy cập https://vercel.com
   - Đăng nhập bằng GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Chọn repository `content-creator-ai` từ GitHub
   - Vercel sẽ tự động detect Vite project

3. **Cấu hình Project Settings**
   - **Root Directory**: `frontend` (hoặc để trống nếu dùng vercel.json)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (hoặc để auto-detect)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Thiết lập Environment Variables**
   
   Vào **Settings** → **Environment Variables**, thêm các biến sau:
   
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```
   
   Lấy các giá trị này từ:
   - Firebase Console → Project Settings → General → Your apps → Web app

5. **Deploy**
   - Click "Deploy"
   - Chờ build hoàn tất (thường 2-5 phút)
   - Nhận URL: `https://your-project.vercel.app`

### Cách 2: Deploy qua Vercel CLI

1. **Cài đặt Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```
   
   Hoặc từ root:
   ```bash
   vercel --cwd frontend
   ```

4. **Thiết lập Environment Variables**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. **Deploy production**
   ```bash
   vercel --prod
   ```

## ⚙️ Cấu hình bổ sung

### Custom Domain
1. Vào Project Settings → Domains
2. Thêm domain của bạn
3. Follow DNS instructions

### Environment Variables cho từng môi trường
- **Production**: Dùng cho production deployments
- **Preview**: Dùng cho preview deployments (PR)
- **Development**: Dùng cho local development

## 🔄 Auto Deploy

Vercel tự động deploy khi:
- Push code lên branch `main` → Deploy production
- Push code lên branch khác → Deploy preview
- Tạo Pull Request → Deploy preview URL

## 📝 Lưu ý

1. **Backend (Firebase Functions)** vẫn chạy trên Firebase, không deploy lên Vercel
2. **Firebase Hosting** có thể bỏ qua nếu dùng Vercel
3. **Environment Variables** phải được set trên Vercel dashboard
4. **Build time**: Thường 2-5 phút cho lần đầu, sau đó nhanh hơn nhờ cache

## 🐛 Troubleshooting

### Build failed
- Kiểm tra logs trong Vercel dashboard
- Đảm bảo tất cả dependencies đã được install
- Kiểm tra Node.js version (Vercel dùng Node 18.x mặc định)

### Environment variables không hoạt động
- Đảm bảo tên biến bắt đầu bằng `VITE_`
- Redeploy sau khi thêm/sửa environment variables
- Kiểm tra trong Vercel dashboard → Settings → Environment Variables

### Routing không hoạt động
- Đảm bảo `vercel.json` có rewrite rules
- Kiểm tra React Router config

## 📚 Tài liệu tham khảo

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html#vercel

