import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as path from 'path';
import { getEmailVerificationTemplate, getPasswordResetTemplate, getProjectCompletedTemplate, getProductUpdatesTemplate } from './utils/emailTemplates';

// Load .env file for local development/emulator
// Always try to load .env in development (emulator sets FUNCTIONS_EMULATOR)
if (!process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR) {
  try {
    // Specify the exact path to .env file in functions directory
    const dotenv = require('dotenv');
    
    // Try multiple paths: compiled location (lib/../.env) and source location (src/../.env)
    const pathsToTry = [
      path.resolve(__dirname, '../.env'),  // From compiled lib/ directory
      path.resolve(__dirname, '../../.env'), // From source src/ directory
      path.resolve(process.cwd(), '.env'), // Current working directory
    ];
    
    let loaded = false;
    for (const envPath of pathsToTry) {
      const result = dotenv.config({ path: envPath });
      if (!result.error) {
        const hasApiKey = !!process.env.SENDGRID_API_KEY;
        console.log(`📝 Loaded .env file from ${envPath}. SENDGRID_API_KEY: ${hasApiKey ? '✅ Found' : '❌ Missing'}`);
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      console.warn(`⚠️ Could not load .env from any of these paths: ${pathsToTry.join(', ')}`);
    }
  } catch (e) {
    // dotenv not available, continue without it
    console.warn('⚠️ Could not load dotenv:', e);
  }
}

/**
 * Email Service Interface
 * 
 * Để sử dụng, bạn cần:
 * 1. Chọn email service (SendGrid, Mailgun, AWS SES, etc.)
 * 2. Install SDK: npm install @sendgrid/mail
 * 3. Setup API key trong Firebase Functions config
 * 4. Uncomment code tương ứng
 */

/**
 * Send email verification với custom template
 */
export async function sendVerificationEmail(
  userEmail: string,
  displayName?: string,
  uid?: string,
  sessionId?: string
): Promise<void> {
  console.log(`📧 sendVerificationEmail called for: ${userEmail}${uid ? ` (UID: ${uid})` : ''}${sessionId ? ` (Session: ${sessionId})` : ''}`);
  
  try {
    // Get site URL from config or environment
    // In emulator, use localhost for development, but in production use actual domain
    let siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    
    // In emulator, if SITE_URL is not set, use localhost (for testing)
    // But note: this won't work on mobile devices - user needs to set SITE_URL to their public URL
    if (process.env.FUNCTIONS_EMULATOR && !process.env.SITE_URL) {
      siteUrl = 'http://localhost:5173'; // Default Vite dev server
      console.log(`⚠️ Running in emulator without SITE_URL. Using ${siteUrl}. This won't work on mobile devices.`);
      console.log(`   To test on mobile, set SITE_URL to your public URL (e.g., ngrok tunnel or public IP).`);
    }
    
    console.log(`🌐 Site URL: ${siteUrl}`);
    
    // Build verification URL with session_id if provided
    // Firebase will add oobCode and mode automatically
    let verifyUrl = `${siteUrl}/verify-email`;
    if (sessionId) {
      verifyUrl += `?session_id=${sessionId}`;
    }
    
    // Generate email verification link
    const actionCodeSettings = {
      url: verifyUrl,
      handleCodeInApp: false, // Set to false so link opens in browser, not in-app
    };

    console.log(`🔗 Generating verification link...`);
    
    // Strategy: Try to generate link first, if fails then create/update user in emulator
    let verifiedEmail = userEmail;
    let actionLink: string;
    
    // First, try to generate link directly (user might already exist)
    try {
      actionLink = await admin.auth().generateEmailVerificationLink(
        verifiedEmail,
        actionCodeSettings
      );
      console.log(`✅ Verification link generated successfully: ${actionLink.substring(0, 50)}...`);
    } catch (linkError: any) {
      // If fails and we're in emulator with UID, try to create/update user first
      if (linkError.code === 'auth/user-not-found' && process.env.FUNCTIONS_EMULATOR && uid) {
        console.log(`⚠️ User not found when generating link. Creating/updating user in emulator...`);
        
        try {
          // Try to create user first
          await admin.auth().createUser({
            uid: uid,
            email: verifiedEmail,
            emailVerified: false,
            displayName: displayName || undefined
          });
          console.log(`✅ Created user in Auth emulator: ${uid} (${verifiedEmail})`);
          
          // Set custom claim to skip verification email in onUserCreate
          // This must be done after creating user
          try {
            await admin.auth().setCustomUserClaims(uid, {
              skipVerificationEmail: true // Flag to prevent duplicate email in onUserCreate
            });
            console.log(`   Added skipVerificationEmail flag to prevent duplicate email`);
          } catch (claimError: any) {
            console.log(`⚠️ Could not set skipVerificationEmail flag: ${claimError.message}`);
            // Continue anyway - might still work
          }
        } catch (createError: any) {
          // User might already exist but Admin SDK hasn't synced
          if (createError.code === 'auth/uid-already-exists' || createError.code === 'auth/email-already-exists') {
            console.log(`ℹ️ User already exists (${createError.code}), updating to ensure sync...`);
            try {
              // Update user to ensure it's in sync and add flag to skip verification email
              const user = await admin.auth().getUser(uid);
              await admin.auth().setCustomUserClaims(uid, {
                ...(user.customClaims || {}),
                skipVerificationEmail: true // Flag to prevent duplicate email in onUserCreate
              });
              await admin.auth().updateUser(uid, {
                email: verifiedEmail,
                emailVerified: false,
                displayName: displayName || undefined
              });
              console.log(`✅ Updated user in Auth emulator: ${uid} (${verifiedEmail})`);
              console.log(`   Added skipVerificationEmail flag to prevent duplicate email`);
            } catch (updateError: any) {
              console.log(`⚠️ Could not update user: ${updateError.message}`);
              // Continue anyway - might work
            }
          } else {
            console.log(`⚠️ Could not create user: ${createError.message}`);
            throw new Error(`Cannot create user in Auth emulator: ${createError.message}`);
          }
        }
        
        // Wait a bit for emulator to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to generate link again
        try {
          actionLink = await admin.auth().generateEmailVerificationLink(
            verifiedEmail,
            actionCodeSettings
          );
          console.log(`✅ Verification link generated after creating user: ${actionLink.substring(0, 50)}...`);
        } catch (retryError: any) {
          console.error(`❌ Still could not generate verification link: ${retryError.message}`);
          throw new Error(`Cannot generate verification link even after creating user: ${retryError.message}`);
        }
      } else {
        // Not in emulator or no UID - throw original error
        throw linkError;
      }
    }
    console.log(`✅ Verification link generated: ${actionLink.substring(0, 50)}...`);

    // Get HTML template
    const htmlContent = getEmailVerificationTemplate(
      actionLink,
      siteUrl
    );

    // SendGrid Email Service
    const sgMail = require('@sendgrid/mail');
    const sendgridApiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.api_key;
    
    console.log(`🔑 Checking SendGrid API key...`);
    console.log(`   - process.env.SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Found' : '❌ Missing'}`);
    console.log(`   - functions.config().sendgrid?.api_key: ${functions.config().sendgrid?.api_key ? '✅ Found' : '❌ Missing'}`);
    
    if (!sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured. Email will not be sent.');
      console.log(`📧 Verification link for ${userEmail}: ${actionLink.substring(0, 50)}...`);
      return;
    }
    
    console.log(`✅ SendGrid API key found, setting up...`);
    
    sgMail.setApiKey(sendgridApiKey);
    
    const fromEmail = process.env.FROM_EMAIL || functions.config().sendgrid?.from_email || 'noreply@creatorai.app';
    console.log(`📮 From email: ${fromEmail}`);
    console.log(`📮 To email: ${userEmail}`);
    
    console.log(`📤 Sending email via SendGrid...`);
    
    try {
      const result = await sgMail.send({
        to: userEmail,
        from: {
          email: fromEmail,
          name: 'CreatorAI'
        },
        subject: 'Verify your email address - CreatorAI',
        html: htmlContent,
        text: `Please verify your email by clicking this link: ${actionLink}\n\nIf you're on a mobile device, tap the link to open it in your browser.`
      });
      
      // Log detailed SendGrid response
      console.log(`✅ Verification email sent to ${userEmail} via SendGrid`);
      console.log(`📧 SendGrid response status: ${result[0]?.statusCode || 'N/A'}`);
      console.log(`📧 SendGrid response headers:`, JSON.stringify(result[0]?.headers || {}, null, 2));
      console.log(`📧 SendGrid response body:`, JSON.stringify(result[0]?.body || {}, null, 2));
      
      // Check if email was actually accepted by SendGrid
      if (result[0]?.statusCode === 202) {
        console.log(`✅ Email accepted by SendGrid (status 202). Email should arrive shortly.`);
      } else {
        console.warn(`⚠️ Unexpected SendGrid status code: ${result[0]?.statusCode}. Email may not be sent.`);
      }
      
    } catch (sendError: any) {
      // Log detailed error information
      console.error(`❌ SendGrid API Error:`, sendError);
      if (sendError.response) {
        console.error(`❌ Status Code: ${sendError.response.statusCode || sendError.code}`);
        console.error(`❌ Response Body:`, JSON.stringify(sendError.response.body, null, 2));
        console.error(`❌ Response Headers:`, sendError.response.headers);
        
        // Common SendGrid 403 errors
        if (sendError.code === 403 || sendError.response?.statusCode === 403) {
          const errors = sendError.response?.body?.errors || [];
          errors.forEach((err: any) => {
            console.error(`❌ SendGrid Error: ${err.message} (field: ${err.field})`);
          });
          
          // Provide helpful error messages
          if (errors.some((e: any) => e.message?.includes('sender'))) {
            console.error(`❌ SOLUTION: Verify sender email "${fromEmail}" in SendGrid: https://app.sendgrid.com/settings/sender_auth`);
          }
          if (errors.some((e: any) => e.message?.includes('permission') || e.message?.includes('authorized'))) {
            console.error(`❌ SOLUTION: Check API key permissions. Ensure it has "Mail Send" permission: https://app.sendgrid.com/settings/api_keys`);
          }
        }
      }
      throw sendError;
    }
    
  } catch (error: any) {
    console.error(`❌ Error sending verification email:`, error);
    throw error;
  }
}

/**
 * Send password reset email với custom template
 */
export async function sendPasswordResetEmail(userEmail: string): Promise<void> {
  try {
    // Get site URL from config or environment
    const siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    
    // Generate password reset link
    const actionCodeSettings = {
      url: `${siteUrl}/login`,
      handleCodeInApp: false,
    };

    const actionLink = await admin.auth().generatePasswordResetLink(
      userEmail,
      actionCodeSettings
    );

    // Get HTML template
    const htmlContent = getPasswordResetTemplate(
      actionLink,
      siteUrl
    );

    // SendGrid Email Service
    const sgMail = require('@sendgrid/mail');
    const sendgridApiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.api_key;
    
    if (!sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured. Email will not be sent.');
      console.log(`📧 Password reset link for ${userEmail}: ${actionLink.substring(0, 50)}...`);
      return;
    }
    
    sgMail.setApiKey(sendgridApiKey);
    
    const fromEmail = process.env.FROM_EMAIL || functions.config().sendgrid?.from_email || 'noreply@creatorai.app';
    
    await sgMail.send({
      to: userEmail,
      from: {
        email: fromEmail,
        name: 'CreatorAI'
      },
      subject: 'Reset your password - CreatorAI',
      html: htmlContent,
      text: `Reset your password by clicking this link: ${actionLink}`
    });
    
    console.log(`✅ Password reset email sent to ${userEmail} via SendGrid`);
    
  } catch (error: any) {
    console.error(`❌ Error sending password reset email:`, error);
    throw error;
  }
}

/**
 * Send project completed notification email
 */
export async function sendProjectCompletedEmail(
  userEmail: string,
  projectTitle: string,
  projectType: string,
  displayName?: string
): Promise<void> {
  try {
    const siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    const dashboardUrl = `${siteUrl}/dashboard`;
    
    const htmlContent = getProjectCompletedTemplate(projectTitle, projectType, dashboardUrl, siteUrl);
    
    const sgMail = require('@sendgrid/mail');
    const sendgridApiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.api_key;
    
    if (!sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured. Email will not be sent.');
      console.log(`📧 Project completed notification for ${userEmail}: ${projectTitle}`);
      return;
    }
    
    sgMail.setApiKey(sendgridApiKey);
    
    const fromEmail = process.env.FROM_EMAIL || functions.config().sendgrid?.from_email || 'noreply@creatorai.app';
    
    await sgMail.send({
      to: userEmail,
      from: {
        email: fromEmail,
        name: 'CreatorAI'
      },
      subject: `🎉 Your project "${projectTitle}" is ready!`,
      html: htmlContent,
      text: `Your project "${projectTitle}" (${projectType}) has been completed successfully! View it at: ${dashboardUrl}`
    });
    
    console.log(`✅ Project completed email sent to ${userEmail} via SendGrid`);
    
  } catch (error: any) {
    console.error(`❌ Error sending project completed email:`, error);
    // Don't throw - this is a notification, not critical
  }
}

/**
 * Send product updates email
 */
export async function sendProductUpdatesEmail(
  userEmail: string,
  updates: string[],
  displayName?: string
): Promise<void> {
  try {
    const siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    const dashboardUrl = `${siteUrl}/dashboard`;
    
    const htmlContent = getProductUpdatesTemplate(updates, dashboardUrl, siteUrl);
    
    const sgMail = require('@sendgrid/mail');
    const sendgridApiKey = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.api_key;
    
    if (!sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured. Email will not be sent.');
      console.log(`📧 Product updates notification for ${userEmail}: ${updates.join(', ')}`);
      return;
    }
    
    sgMail.setApiKey(sendgridApiKey);
    
    const fromEmail = process.env.FROM_EMAIL || functions.config().sendgrid?.from_email || 'noreply@creatorai.app';
    
    await sgMail.send({
      to: userEmail,
      from: {
        email: fromEmail,
        name: 'CreatorAI'
      },
      subject: '✨ New Product Updates - CreatorAI',
      html: htmlContent,
      text: `We have exciting updates for you:\n\n${updates.map(u => `- ${u}`).join('\n')}\n\nView at: ${dashboardUrl}`
    });
    
    console.log(`✅ Product updates email sent to ${userEmail} via SendGrid`);
    
  } catch (error: any) {
    console.error(`❌ Error sending product updates email:`, error);
    // Don't throw - this is a notification, not critical
  }
}

/**
 * Check if user wants to receive notifications and send email if enabled
 */
export async function sendNotificationIfEnabled(
  userId: string,
  notificationType: 'projectCompleted' | 'productUpdates',
  data: {
    projectTitle?: string;
    projectType?: string;
    updates?: string[];
  }
): Promise<void> {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`User ${userId} not found, skipping notification`);
      return;
    }
    
    const userData = userDoc.data();
    const notifications = userData?.notifications || {};
    const userEmail = userData?.email;
    
    if (!userEmail) {
      console.log(`User ${userId} has no email, skipping notification`);
      return;
    }
    
    // Check if notification is enabled
    const isEnabled = notificationType === 'projectCompleted' 
      ? notifications.projectCompleted === true
      : notifications.productUpdates !== false; // Default to true if not set
    
    if (!isEnabled) {
      console.log(`Notification ${notificationType} is disabled for user ${userId}`);
      return;
    }
    
    // Send appropriate email
    if (notificationType === 'projectCompleted' && data.projectTitle && data.projectType) {
      await sendProjectCompletedEmail(
        userEmail,
        data.projectTitle,
        data.projectType,
        userData?.displayName || userData?.firstName
      );
    } else if (notificationType === 'productUpdates' && data.updates && data.updates.length > 0) {
      await sendProductUpdatesEmail(
        userEmail,
        data.updates,
        userData?.displayName || userData?.firstName
      );
    }
    
  } catch (error: any) {
    console.error(`❌ Error checking and sending notification:`, error);
    // Don't throw - notifications are not critical
  }
}

