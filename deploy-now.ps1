# Quick deploy script - no prompts
Write-Host "🚀 Deploying to Vercel production..." -ForegroundColor Green

# Run vercel deploy to production
vercel --prod --yes

Write-Host "`n✅ Deployment triggered!" -ForegroundColor Green
Write-Host "Visit: https://content-creator-ai-wheat.vercel.app/" -ForegroundColor Yellow
Write-Host "Deployments: https://vercel.com/tuangb2004s-projects/content-creator-ai/deployments" -ForegroundColor Cyan
