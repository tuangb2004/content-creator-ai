# 🔐 Authentication Setup Guide

## 📋 Current Status

### ✅ Implemented
- **Google Sign-In**: Working
- **Facebook Sign-In**: Code ready, needs production setup
- **Email/Password**: Working with email verification
- **Password Reset**: Working

### ❌ Need to Setup
- **TikTok OAuth**: UI ready, backend needs implementation
- **Facebook Production**: Need App ID from Facebook Developers
- **Email SMTP**: Currently using Firebase default (limited)

---

## 🚀 Setup Steps

### 1️⃣ TikTok OAuth Setup

#### Step 1.1: Register TikTok Developer Account
1. Go to https://developers.tiktok.com/
2. Create developer account
3. Create new app: **CreatorAI Studio**
4. Add redirect URI: `https://creator--ai.firebaseapp.com/__/auth/tiktok/callback`
5. Request permissions: `user.info.basic`, `user.info.profile`
6. Get **Client Key** and **Client Secret**

#### Step 1.2: Set Firebase Config
```bash
# Set TikTok credentials
firebase functions:config:set \
  tiktok.client_key="YOUR_TIKTOK_CLIENT_KEY" \
  tiktok.client_secret="YOUR_TIKTOK_CLIENT_SECRET"
```

#### Step 1.3: Create TikTok Auth Functions
**File**: `functions/src/tiktokAuth.ts` (already created)
- Contains `getTikTokAuthUrl` and `handleTikTokCallback` functions

#### Step 1.4: Update Frontend
**File**: `frontend/src/contexts/AuthContext.jsx`
```javascript
// Add TikTok login method
const loginWithTikTok = async () => {
  try {
    const { httpsCallable } = await import('firebase/functions');
    const { functions } = await import('../config/firebase');
    
    // Get auth URL
    const getTikTokUrl = httpsCallable(functions, 'getTikTokAuthUrl');
    const result = await getTikTokUrl({});
    
    // Redirect to TikTok OAuth
    window.location.href = result.data.authUrl;
  } catch (error) {
    throw formatAuthError(error);
  }
};
```

**File**: `frontend/src/components/Auth/AuthModal.jsx`
```javascript
// Update TikTok button handler (line 357)
<SocialButton 
  icon="tiktok" 
  label={t?.auth?.loginWithTikTok || 'Continue with TikTok'} 
  onClick={() => handleSocialLogin('tiktok')}  // This will call loginWithTikTok
/>
```

---

### 2️⃣ Facebook Production Setup

#### Step 2.1: Create Facebook App
1. Go to https://developers.facebook.com/
2. Create new app: **CreatorAI Studio**
3. Add product: **Facebook Login**
4. Set OAuth redirect URI:
   - `https://creator--ai.firebaseapp.com/__/auth/handler`
   - `https://content-creator-ai-wheat.vercel.app`

5. Get **App ID** and **App Secret**

#### Step 2.2: Configure Firebase Console
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Facebook** provider
3. Enter:
   - **App ID**: From Facebook Developers
   - **App Secret**: From Facebook Developers
4. Copy OAuth redirect URI and add to Facebook App settings

#### Step 2.3: Test Facebook Login
```bash
# No code changes needed!
# Facebook login is already implemented in AuthContext.jsx
```

---

### 3️⃣ Email SMTP Setup (Optional but Recommended)

**Why?** Firebase default email has limitations:
- Generic sender address (`noreply@creator--ai.firebaseapp.com`)
- Rate limits
- May go to spam

**Recommended**: Use SendGrid or Resend for production emails.

#### Option A: SendGrid
1. Create account: https://sendgrid.com/
2. Verify sender: `noreply@creatorai.studio`
3. Get API Key
4. Install SendGrid extension in Firebase:
```bash
firebase ext:install sendgrid/email-delivery
```

#### Option B: Resend (Modern Alternative)
1. Create account: https://resend.com/
2. Verify domain: `creatorai.studio`
3. Get API Key
4. Create Cloud Function to send emails via Resend API

#### Option C: Keep Firebase Default
If you want to keep Firebase default (quick start):
```bash
# No action needed - already working!
# But emails will use: noreply@creator--ai.firebaseapp.com
```

---

## 🔧 Deployment Commands

### Deploy TikTok Functions
```bash
cd functions
npm install axios  # Add axios for API calls
firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback
```

### Set Environment Variables
```bash
# TikTok
firebase functions:config:set \
  tiktok.client_key="YOUR_CLIENT_KEY" \
  tiktok.client_secret="YOUR_CLIENT_SECRET"

# Force redeploy after config change
firebase deploy --only functions --force
```

---

## 🧪 Testing Checklist

### Test on Production (https://content-creator-ai-wheat.vercel.app)

#### Google Sign-In
- [ ] Click "Continue with Google"
- [ ] Select account
- [ ] Should redirect to dashboard
- [ ] Check Firestore: user document created
- [ ] Check credits: 20 credits (free plan)

#### Facebook Sign-In
- [ ] Click "Continue with Facebook"
- [ ] Login to Facebook
- [ ] Authorize app
- [ ] Should redirect to dashboard
- [ ] Check Firestore: user document created

#### TikTok Sign-In
- [ ] Click "Continue with TikTok"
- [ ] Login to TikTok
- [ ] Authorize app
- [ ] Should redirect to dashboard
- [ ] Check Firestore: user document created

#### Email/Password Registration
- [ ] Enter email + password
- [ ] Click "Create Account"
- [ ] Check email inbox for verification
- [ ] Click verification link
- [ ] Should show "Email Verified!" page
- [ ] Go back and sign in
- [ ] Should redirect to dashboard

#### Password Reset
- [ ] Click "Forgot Password?"
- [ ] Enter email
- [ ] Check email inbox
- [ ] Click reset link
- [ ] Enter new password
- [ ] Sign in with new password

---

## 📝 Current Implementation Status

### Frontend (Already Done)
- ✅ AuthModal with social buttons (Google, Facebook, TikTok)
- ✅ AuthContext with login methods
- ✅ Email verification flow
- ✅ Password reset flow

### Backend (Functions)
- ✅ Email verification (built-in Firebase)
- ✅ Google OAuth (built-in Firebase)
- ✅ Facebook OAuth (built-in Firebase, needs setup)
- ❌ TikTok OAuth (needs custom implementation)

### Firebase Console Setup
- ✅ Google Sign-In: Enabled
- ❌ Facebook Sign-In: Needs App ID/Secret
- ❌ TikTok Sign-In: Not available (custom OAuth)

---

## 🎯 Quick Start (3 Steps)

### Step 1: Facebook Production (5 minutes)
```bash
# 1. Go to https://developers.facebook.com/
# 2. Create app, get App ID + Secret
# 3. Firebase Console → Auth → Facebook → Enter credentials
# 4. Test on production
```

### Step 2: TikTok OAuth (15 minutes)
```bash
# 1. Register at https://developers.tiktok.com/
# 2. Get Client Key + Secret
# 3. Set config:
firebase functions:config:set tiktok.client_key="KEY" tiktok.client_secret="SECRET"

# 4. Deploy functions:
cd functions
npm install axios
firebase deploy --only functions:getTikTokAuthUrl,functions:handleTikTokCallback

# 5. Update frontend AuthContext.jsx (add loginWithTikTok)
# 6. Test on production
```

### Step 3: Email SMTP (Optional, 10 minutes)
```bash
# Option A: Keep Firebase default (no action)
# Option B: Install SendGrid extension
firebase ext:install sendgrid/email-delivery
```

---

## 🚨 Security Notes

### Environment Variables
- **Never commit** `.env` files
- **Always use** Firebase Functions config for production:
  ```bash
  firebase functions:config:set key.value="secret"
  ```

### OAuth Redirect URIs
- **Always use HTTPS** in production
- **Whitelist exact URLs** in provider settings:
  - TikTok: `https://creator--ai.firebaseapp.com/__/auth/tiktok/callback`
  - Facebook: `https://creator--ai.firebaseapp.com/__/auth/handler`

### Email Verification
- **Required for email/password** users
- **Not required for social** login (Google, Facebook, TikTok)
- **Check `emailVerified`** flag in AuthContext

---

## 📞 Need Help?

### Common Errors

**"Popup blocked by browser"**
```javascript
// Add to site settings → Allow popups
// Or use redirect instead of popup (Firebase Auth config)
```

**"OAuth redirect URI mismatch"**
```bash
# Ensure exact match in provider console
# https://creator--ai.firebaseapp.com/__/auth/handler
```

**"TikTok auth failed"**
```bash
# Check Firebase Functions logs:
firebase functions:log --only getTikTokAuthUrl,handleTikTokCallback
```

**"Email not verified"**
```javascript
// User must click verification link in email before signing in
// Check spam folder if email not received
```

---

## ✅ Final Checklist

Before going live:
- [ ] Google Sign-In working
- [ ] Facebook App ID configured
- [ ] TikTok OAuth functions deployed
- [ ] Email verification tested
- [ ] Password reset tested
- [ ] All OAuth redirect URIs whitelisted
- [ ] Firebase Functions config set
- [ ] Firestore security rules configured
- [ ] Test all flows on production domain

---

**Ready to start?** Begin with Facebook setup (easiest), then TikTok, then Email SMTP! 🚀
