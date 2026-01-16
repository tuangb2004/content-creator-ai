# Manual Deploy to Vercel via CLI
# Run this script when auto-deploy is not working

Write-Host "📦 Installing Vercel CLI (if not installed)..." -ForegroundColor Cyan
npm list -g vercel > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    npm install -g vercel
}

Write-Host "`n🔐 Login to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host "`n🚀 Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Visit: https://content-creator-ai-wheat.vercel.app/" -ForegroundColor Yellow
