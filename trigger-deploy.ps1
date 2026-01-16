# Vercel Deploy Hook Trigger Script
# Thay YOUR_DEPLOY_HOOK_URL bằng URL từ Vercel Deploy Hooks

$DEPLOY_HOOK_URL = "PASTE_YOUR_DEPLOY_HOOK_URL_HERE"

Write-Host "Triggering Vercel deployment..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri $DEPLOY_HOOK_URL -Method POST -UseBasicParsing
    Write-Host "✅ Deploy triggered successfully!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "Check deployments: https://vercel.com/tuangb2004s-projects/content-creator-ai/deployments" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Failed to trigger deploy: $_" -ForegroundColor Red
}
