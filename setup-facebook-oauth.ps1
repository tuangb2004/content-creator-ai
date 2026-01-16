# 📘 Facebook OAuth Setup Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📘 FACEBOOK OAUTH SETUP" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Hướng dẫn setup Facebook OAuth:" -ForegroundColor Yellow
Write-Host ""
Write-Host "BƯỚC 1: Tạo Facebook App" -ForegroundColor Green
Write-Host "  1. Vào: https://developers.facebook.com/" -ForegroundColor Gray
Write-Host "  2. Click 'My Apps' → 'Create App'" -ForegroundColor Gray
Write-Host "  3. Chọn 'Consumer' hoặc 'Business'" -ForegroundColor Gray
Write-Host "  4. Điền App Name: CreatorAI" -ForegroundColor Gray
Write-Host "  5. Thêm 'Facebook Login' product" -ForegroundColor Gray
Write-Host ""

Write-Host "BƯỚC 2: Lấy App ID và App Secret" -ForegroundColor Green
Write-Host "  1. Vào 'Settings' → 'Basic'" -ForegroundColor Gray
Write-Host "  2. Copy 'App ID' và 'App Secret' (click 'Show')" -ForegroundColor Gray
Write-Host ""

Write-Host "BƯỚC 3: Cấu hình Facebook Login" -ForegroundColor Green
Write-Host "  1. Vào 'Products' → 'Facebook Login' → 'Settings'" -ForegroundColor Gray
Write-Host "  2. Thêm Valid OAuth Redirect URIs:" -ForegroundColor Gray
Write-Host "     - https://content-creator-ai-wheat.vercel.app/__/auth/action" -ForegroundColor Gray
Write-Host "     - https://creator--ai.firebaseapp.com/__/auth/action" -ForegroundColor Gray
Write-Host "     - https://creator--ai.firebaseapp.com/__/auth/handler" -ForegroundColor Gray
Write-Host "  3. Save Changes" -ForegroundColor Gray
Write-Host ""

Write-Host "BƯỚC 4: Cấu hình Firebase Console" -ForegroundColor Green
Write-Host "  1. Vào: https://console.firebase.google.com/" -ForegroundColor Gray
Write-Host "  2. Chọn project 'creator--ai'" -ForegroundColor Gray
Write-Host "  3. Vào 'Authentication' → 'Sign-in method'" -ForegroundColor Gray
Write-Host "  4. Click 'Facebook' → Enable" -ForegroundColor Gray
Write-Host "  5. Nhập App ID và App Secret" -ForegroundColor Gray
Write-Host "  6. Copy OAuth redirect URI và thêm vào Facebook" -ForegroundColor Gray
Write-Host "  7. Save" -ForegroundColor Gray
Write-Host ""

Write-Host "BƯỚC 5: Thêm Privacy Policy & Terms" -ForegroundColor Green
Write-Host "  1. Vào 'Settings' → 'Basic' trong Facebook Console" -ForegroundColor Gray
Write-Host "  2. Privacy Policy URL:" -ForegroundColor Gray
Write-Host "     https://content-creator-ai-wheat.vercel.app/privacy" -ForegroundColor Gray
Write-Host "  3. Terms of Service URL:" -ForegroundColor Gray
Write-Host "     https://content-creator-ai-wheat.vercel.app/terms" -ForegroundColor Gray
Write-Host "  4. Save Changes" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📋 CHECKLIST:" -ForegroundColor Yellow
Write-Host "  [ ] Facebook App đã được tạo" -ForegroundColor Gray
Write-Host "  [ ] App ID và App Secret đã được lưu" -ForegroundColor Gray
Write-Host "  [ ] OAuth Redirect URIs đã được thêm vào Facebook" -ForegroundColor Gray
Write-Host "  [ ] Firebase Facebook provider đã được enable" -ForegroundColor Gray
Write-Host "  [ ] Privacy Policy và Terms URLs đã được set" -ForegroundColor Gray
Write-Host "  [ ] Test Facebook login trên production" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Bạn đã hoàn thành các bước trên chưa? (y/n)"
if ($continue -eq "y") {
    Write-Host ""
    Write-Host "✅ Tuyệt vời! Bây giờ test Facebook login:" -ForegroundColor Green
    Write-Host "  1. Vào: https://content-creator-ai-wheat.vercel.app" -ForegroundColor Gray
    Write-Host "  2. Click 'Sign Up' hoặc 'Sign In'" -ForegroundColor Gray
    Write-Host "  3. Click 'Continue with Facebook'" -ForegroundColor Gray
    Write-Host "  4. Đăng nhập và authorize" -ForegroundColor Gray
    Write-Host ""
    
    $openSite = Read-Host "Mở production site để test? (y/n)"
    if ($openSite -eq "y") {
        Start-Process "https://content-creator-ai-wheat.vercel.app/"
    }
} else {
    Write-Host ""
    Write-Host "📝 Làm theo các bước trên, sau đó chạy lại script này!" -ForegroundColor Yellow
    Write-Host "📖 Xem file FACEBOOK_SETUP_GUIDE.md để biết chi tiết!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
