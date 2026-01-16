# 🔐 Authentication Setup Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔐 CREATORAI AUTHENTICATION SETUP" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if user is in the correct directory
if (-not (Test-Path ".\functions")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "  ✅ Google Sign-In: Working" -ForegroundColor Green
Write-Host "  ✅ Email/Password: Working" -ForegroundColor Green
Write-Host "  ⚠️  Facebook: Needs production setup" -ForegroundColor Yellow
Write-Host "  ⚠️  TikTok: Needs OAuth setup" -ForegroundColor Yellow
Write-Host ""

# Main menu
Write-Host "SETUP OPTIONS:" -ForegroundColor Cyan
Write-Host "  [1] Setup TikTok OAuth"
Write-Host "  [2] Setup Facebook (Guide)"
Write-Host "  [3] Deploy TikTok Functions"
Write-Host "  [4] Test Authentication (Open Production)"
Write-Host "  [5] View Setup Guide"
Write-Host "  [0] Exit"
Write-Host ""

$choice = Read-Host "Select option"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "=== TIKTOK OAUTH SETUP ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Get TikTok credentials
        Write-Host "📝 Step 1: Get TikTok Developer Credentials" -ForegroundColor Yellow
        Write-Host "  1. Go to: https://developers.tiktok.com/" -ForegroundColor Gray
        Write-Host "  2. Create a new app: CreatorAI Studio" -ForegroundColor Gray
        Write-Host "  3. Add redirect URI: https://creator--ai.firebaseapp.com/__/auth/tiktok/callback" -ForegroundColor Gray
        Write-Host "  4. Request scopes: user.info.basic, user.info.profile" -ForegroundColor Gray
        Write-Host "  5. Copy Client Key and Client Secret" -ForegroundColor Gray
        Write-Host ""
        
        $continueSetup = Read-Host "Have you completed these steps? (y/n)"
        
        if ($continueSetup -eq "y") {
            $clientKey = Read-Host "Enter TikTok Client Key"
            $clientSecret = Read-Host "Enter TikTok Client Secret (input hidden)" -AsSecureString
            $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))
            
            Write-Host ""
            Write-Host "🔧 Setting Firebase config..." -ForegroundColor Yellow
            
            # Set Firebase config
            firebase functions:config:set "tiktok.client_key=$clientKey" "tiktok.client_secret=$clientSecretPlain"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Firebase config set successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📦 Next step: Deploy TikTok functions (Option 3)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Failed to set Firebase config" -ForegroundColor Red
            }
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "=== FACEBOOK SETUP GUIDE ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Steps to setup Facebook Login:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. CREATE FACEBOOK APP" -ForegroundColor Cyan
        Write-Host "   Go to: https://developers.facebook.com/" -ForegroundColor Gray
        Write-Host "   Create new app → CreatorAI Studio" -ForegroundColor Gray
        Write-Host "   Add product: Facebook Login" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. CONFIGURE OAUTH REDIRECT" -ForegroundColor Cyan
        Write-Host "   Add redirect URI:" -ForegroundColor Gray
        Write-Host "   - https://creator--ai.firebaseapp.com/__/auth/handler" -ForegroundColor White
        Write-Host "   - https://content-creator-ai-wheat.vercel.app" -ForegroundColor White
        Write-Host ""
        Write-Host "3. GET APP CREDENTIALS" -ForegroundColor Cyan
        Write-Host "   Copy: App ID and App Secret" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. CONFIGURE FIREBASE" -ForegroundColor Cyan
        Write-Host "   Go to: Firebase Console → Authentication → Sign-in method" -ForegroundColor Gray
        Write-Host "   Enable: Facebook" -ForegroundColor Gray
        Write-Host "   Enter: App ID and App Secret" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ Done! Facebook login will work immediately" -ForegroundColor Green
        Write-Host ""
        
        $openFacebook = Read-Host "Open Facebook Developers Console? (y/n)"
        if ($openFacebook -eq "y") {
            Start-Process "https://developers.facebook.com/"
        }
        
        $openFirebase = Read-Host "Open Firebase Console? (y/n)"
        if ($openFirebase -eq "y") {
            Start-Process "https://console.firebase.google.com/project/creator--ai/authentication/providers"
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "=== DEPLOY TIKTOK FUNCTIONS ===" -ForegroundColor Cyan
        Write-Host ""
        
        # Install axios if needed
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        Set-Location functions
        npm install axios --save
        Set-Location ..
        
        Write-Host ""
        Write-Host "🚀 Deploying TikTok functions..." -ForegroundColor Yellow
        firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ TikTok functions deployed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📝 Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Test TikTok login on production" -ForegroundColor Gray
            Write-Host "  2. Ensure redirect URI is whitelisted in TikTok Developer Console" -ForegroundColor Gray
        } else {
            Write-Host ""
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "🧪 Opening production site for testing..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Test checklist:" -ForegroundColor Cyan
        Write-Host "  [ ] Google Sign-In" -ForegroundColor Gray
        Write-Host "  [ ] Facebook Sign-In" -ForegroundColor Gray
        Write-Host "  [ ] TikTok Sign-In" -ForegroundColor Gray
        Write-Host "  [ ] Email Registration + Verification" -ForegroundColor Gray
        Write-Host "  [ ] Password Reset" -ForegroundColor Gray
        Write-Host ""
        
        Start-Process "https://content-creator-ai-wheat.vercel.app/"
    }
    
    "5" {
        Write-Host ""
        Write-Host "📖 Opening setup guide..." -ForegroundColor Yellow
        
        if (Test-Path ".\AUTHENTICATION_SETUP.md") {
            code ".\AUTHENTICATION_SETUP.md"
        } else {
            Write-Host "❌ Setup guide not found" -ForegroundColor Red
        }
    }
    
    "0" {
        Write-Host ""
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Keep window open
Read-Host "Press Enter to exit"
