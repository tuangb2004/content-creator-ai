import * as fs from 'fs';
import * as path from 'path';

/**
 * Get email verification template
 */
export function getEmailVerificationTemplate(actionUrl: string, siteUrl: string = 'https://creatorai.app'): string {
  try {
    // Try to read from compiled location first (production)
    let templatePath = path.join(__dirname, '../templates/emailVerification.html');
    if (!fs.existsSync(templatePath)) {
      // Fallback to source location (development)
      templatePath = path.join(__dirname, '../../src/templates/emailVerification.html');
    }
    
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    template = template.replace(/\{\{ACTION_URL\}\}/g, actionUrl);
    template = template.replace(/\{\{SITE_URL\}\}/g, siteUrl);
    
    return template;
  } catch (error) {
    console.error('Error loading email verification template:', error);
    // Return a simple fallback template
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email Address</h2>
          <p>Please click the link below to verify your email:</p>
          <p><a href="${actionUrl}">${actionUrl}</a></p>
        </body>
      </html>
    `;
  }
}

/**
 * Get password reset template
 */
export function getPasswordResetTemplate(actionUrl: string, siteUrl: string = 'https://creatorai.app'): string {
  try {
    // Try to read from compiled location first (production)
    let templatePath = path.join(__dirname, '../templates/passwordReset.html');
    if (!fs.existsSync(templatePath)) {
      // Fallback to source location (development)
      templatePath = path.join(__dirname, '../../src/templates/passwordReset.html');
    }
    
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    template = template.replace(/\{\{ACTION_URL\}\}/g, actionUrl);
    template = template.replace(/\{\{SITE_URL\}\}/g, siteUrl);
    
    return template;
  } catch (error) {
    console.error('Error loading password reset template:', error);
    // Return a simple fallback template
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>Please click the link below to reset your password:</p>
          <p><a href="${actionUrl}">${actionUrl}</a></p>
        </body>
      </html>
    `;
  }
}

/**
 * Get project completed email template
 */
export function getProjectCompletedTemplate(
  projectTitle: string,
  projectType: string,
  dashboardUrl: string,
  siteUrl: string = 'https://creatorai.app'
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Completed - CreatorAI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Project Completed!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Your project has been completed successfully!</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Project:</strong> ${projectTitle}</p>
            <p style="margin: 0;"><strong>Type:</strong> ${projectType}</p>
          </div>
          <a href="${dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Project</a>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            You're receiving this email because you enabled "Project Completed" notifications in your profile settings.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CreatorAI. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Get product updates email template
 */
export function getProductUpdatesTemplate(
  updates: string[],
  dashboardUrl: string,
  siteUrl: string = 'https://creatorai.app'
): string {
  const updatesList = updates.map(update => `<li style="margin: 10px 0;">${update}</li>`).join('');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Updates - CreatorAI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✨ Product Updates</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">We have exciting updates for you!</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <ul style="margin: 0; padding-left: 20px;">
              ${updatesList}
            </ul>
          </div>
          <a href="${dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to Dashboard</a>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            You're receiving this email because you enabled "Product Updates" notifications in your profile settings.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CreatorAI. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

