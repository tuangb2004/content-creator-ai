# Deploy Studio Pulse updates (logUserLogin function)
Write-Host "🚀 Deploying Studio Pulse updates..." -ForegroundColor Cyan

# Build functions
Write-Host "`n📦 Building functions..." -ForegroundColor Yellow
cd functions
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy logUserLogin function
Write-Host "`n☁️ Deploying logUserLogin function..." -ForegroundColor Yellow
cd ..
firebase deploy --only functions:logUserLogin

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Studio Pulse updates deployed successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Test login - you should see NEW LOGIN in Studio Pulse" -ForegroundColor White
    Write-Host "   2. Check browser console for any errors" -ForegroundColor White
    Write-Host "   3. Verify activity_logs collection in Firestore" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
