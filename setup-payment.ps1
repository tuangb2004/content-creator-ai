# Payment Setup Helper Script
# Run this script to setup payment system step by step

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('check', 'config', 'deploy', 'test', 'all')]
    [string]$Action = 'check'
)

Write-Host "🔧 CreatorAI - Payment Setup Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Choose an action:" -ForegroundColor Yellow
    Write-Host "1. Check current status" -ForegroundColor White
    Write-Host "2. Configure PayOS credentials" -ForegroundColor White
    Write-Host "3. Deploy functions" -ForegroundColor White
    Write-Host "4. Test payment flow" -ForegroundColor White
    Write-Host "5. View logs" -ForegroundColor White
    Write-Host "6. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-6)"
    return $choice
}

function Check-Status {
    Write-Host "📊 Checking Payment System Status..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check Firebase CLI
    Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
    try {
        $firebaseVersion = firebase --version 2>$null
        Write-Host "  ✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Firebase CLI not installed" -ForegroundColor Red
        Write-Host "     Install: npm install -g firebase-tools" -ForegroundColor Yellow
    }
    
    # Check Firebase login
    Write-Host "`nChecking Firebase auth..." -ForegroundColor Yellow
    try {
        $user = firebase login:list 2>$null | Select-String -Pattern "Logged in as"
        if ($user) {
            Write-Host "  ✅ Logged in to Firebase" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Not logged in to Firebase" -ForegroundColor Red
            Write-Host "     Run: firebase login" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Cannot check Firebase auth" -ForegroundColor Red
    }
    
    # Check PayOS config
    Write-Host "`nChecking PayOS configuration..." -ForegroundColor Yellow
    try {
        cd functions
        $config = firebase functions:config:get payos 2>$null
        if ($config -and $config -ne "{}") {
            Write-Host "  ✅ PayOS credentials configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ PayOS credentials not configured" -ForegroundColor Red
            Write-Host "     Run this script with 'config' action" -ForegroundColor Yellow
        }
        cd ..
    } catch {
        Write-Host "  ⚠️  Cannot check PayOS config" -ForegroundColor Yellow
    }
    
    # Check functions deployment
    Write-Host "`nChecking deployed functions..." -ForegroundColor Yellow
    try {
        $functions = firebase functions:list 2>$null
        if ($functions -match "createPaymentLink" -and $functions -match "payosWebhook") {
            Write-Host "  ✅ Payment functions deployed" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Payment functions not deployed" -ForegroundColor Red
            Write-Host "     Run this script with 'deploy' action" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠️  Cannot check functions" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Configure-PayOS {
    Write-Host "⚙️  Configuring PayOS Credentials..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "You need to get credentials from PayOS Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Visit https://payos.vn/" -ForegroundColor White
    Write-Host "  2. Login to your account" -ForegroundColor White
    Write-Host "  3. Go to Settings > API Credentials" -ForegroundColor White
    Write-Host ""
    
    $clientId = Read-Host "Enter PayOS Client ID"
    $apiKey = Read-Host "Enter PayOS API Key"
    $checksumKey = Read-Host "Enter PayOS Checksum Key"
    
    if (-not $clientId -or -not $apiKey -or -not $checksumKey) {
        Write-Host "❌ All credentials are required!" -ForegroundColor Red
        return
    }
    
    Write-Host "`nSetting Firebase config..." -ForegroundColor Yellow
    cd functions
    
    try {
        firebase functions:config:set "payos.client_id=$clientId"
        firebase functions:config:set "payos.api_key=$apiKey"
        firebase functions:config:set "payos.checksum_key=$checksumKey"
        firebase functions:config:set "payos.enable_signature_verification=true"
        
        Write-Host "✅ PayOS credentials configured successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: You need to deploy functions for changes to take effect" -ForegroundColor Yellow
        Write-Host "   Run this script with 'deploy' action" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Failed to configure credentials: $_" -ForegroundColor Red
    }
    
    cd ..
    Write-Host ""
}

function Deploy-Functions {
    Write-Host "🚀 Deploying Payment Functions..." -ForegroundColor Cyan
    Write-Host ""
    
    cd functions
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    Write-Host "`nBuilding TypeScript..." -ForegroundColor Yellow
    npm run build
    
    Write-Host "`nDeploying to Firebase..." -ForegroundColor Yellow
    firebase deploy --only functions:createPaymentLinkFunction,functions:payosWebhook
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Functions deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Webhook URL:" -ForegroundColor Yellow
        $projectId = (firebase projects:list | Select-String -Pattern "│\s+(\S+)\s+│" | Select-Object -First 1).Matches.Groups[1].Value
        Write-Host "  https://us-central1-$projectId.cloudfunctions.net/payosWebhook" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Register this URL in PayOS Dashboard > Webhooks" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
    }
    
    cd ..
    Write-Host ""
}

function Test-Payment {
    Write-Host "🧪 Testing Payment Flow..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Test Mode Options:" -ForegroundColor Yellow
    Write-Host "1. Local emulator test (offline)" -ForegroundColor White
    Write-Host "2. Production test (real PayOS API)" -ForegroundColor White
    Write-Host ""
    
    $testChoice = Read-Host "Choose test mode (1-2)"
    
    if ($testChoice -eq "1") {
        Write-Host "`nStarting Firebase Emulators..." -ForegroundColor Yellow
        cd functions
        firebase emulators:start
        cd ..
    } elseif ($testChoice -eq "2") {
        Write-Host "`nProduction Test Instructions:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://content-creator-ai-wheat.vercel.app/dashboard" -ForegroundColor White
        Write-Host "2. Click 'Upgrade to Pro' button" -ForegroundColor White
        Write-Host "3. Complete payment with test amount (1,000 VND)" -ForegroundColor White
        Write-Host "4. Check Firebase Console for webhook logs" -ForegroundColor White
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
}

function View-Logs {
    Write-Host "📜 Viewing Function Logs..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Which function logs?" -ForegroundColor Yellow
    Write-Host "1. createPaymentLink" -ForegroundColor White
    Write-Host "2. payosWebhook" -ForegroundColor White
    Write-Host "3. All payment functions" -ForegroundColor White
    Write-Host ""
    
    $logChoice = Read-Host "Choose (1-3)"
    
    cd functions
    
    switch ($logChoice) {
        "1" { firebase functions:log --only createPaymentLinkFunction }
        "2" { firebase functions:log --only payosWebhook }
        "3" { firebase functions:log }
    }
    
    cd ..
}

# Main execution
switch ($Action) {
    'check' { Check-Status }
    'config' { Configure-PayOS }
    'deploy' { Deploy-Functions }
    'test' { Test-Payment }
    'all' {
        Check-Status
        Write-Host "Press any key to continue to configuration..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        Configure-PayOS
        Write-Host "Press any key to continue to deployment..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        Deploy-Functions
    }
    default {
        while ($true) {
            $choice = Show-Menu
            
            switch ($choice) {
                '1' { Check-Status }
                '2' { Configure-PayOS }
                '3' { Deploy-Functions }
                '4' { Test-Payment }
                '5' { View-Logs }
                '6' { 
                    Write-Host "Goodbye! 👋" -ForegroundColor Cyan
                    exit 
                }
                default { Write-Host "Invalid choice!" -ForegroundColor Red }
            }
            
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            Clear-Host
        }
    }
}

Write-Host "Done! ✅" -ForegroundColor Green
