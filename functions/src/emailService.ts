import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { getProjectCompletedTemplate, getProductUpdatesTemplate } from './utils/emailTemplates';


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
 * NOTE: Email verification is now handled by Firebase Auth automatically
 * Frontend uses sendEmailVerification() from firebase/auth
 * This function has been removed - no longer needed
 */

/**
 * NOTE: Password reset is now handled by Firebase Auth automatically
 * Frontend uses sendPasswordResetEmail() from firebase/auth
 * This function has been removed - no longer needed
 */

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
    let siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    
    // Normalize SITE_URL: remove trailing slash to avoid double slashes in links
    siteUrl = siteUrl.replace(/\/+$/, '');
    
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
    let siteUrl = process.env.SITE_URL || functions.config().app?.site_url || 'https://creatorai.app';
    
    // Normalize SITE_URL: remove trailing slash to avoid double slashes in links
    siteUrl = siteUrl.replace(/\/+$/, '');
    
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

