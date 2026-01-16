# 🎵 TikTok OAuth Setup Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎵 TIKTOK OAUTH SETUP" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if user is in the correct directory
if (-not (Test-Path ".\functions")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Bạn đã có TikTok Client Key và Client Secret từ TikTok Developer Console" -ForegroundColor Yellow
Write-Host ""

$clientKey = Read-Host "Enter TikTok Client Key"
$clientSecret = Read-Host "Enter TikTok Client Secret" -AsSecureString
$clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))

Write-Host ""
Write-Host "🔧 Setting Firebase config..." -ForegroundColor Yellow

# Set Firebase config
firebase functions:config:set "tiktok.client_key=$clientKey" "tiktok.client_secret=$clientSecretPlain"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Firebase config set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Deploying TikTok functions..." -ForegroundColor Yellow
    Write-Host ""
    
    # Deploy TikTok functions
    firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ TikTok OAuth setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧪 Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Test TikTok login on production: https://content-creator-ai-wheat.vercel.app" -ForegroundColor Gray
        Write-Host "  2. Click 'Continue with TikTok' button" -ForegroundColor Gray
        Write-Host "  3. Authorize the app" -ForegroundColor Gray
        Write-Host "  4. Should redirect back to dashboard" -ForegroundColor Gray
        Write-Host ""
        
        $openSite = Read-Host "Open production site to test? (y/n)"
        if ($openSite -eq "y") {
            Start-Process "https://content-creator-ai-wheat.vercel.app/"
        }
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Failed to set Firebase config" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
