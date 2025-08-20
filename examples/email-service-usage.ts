/**
 * Example of how to use the new email service in your application
 * This demonstrates the simple API compared to the existing server/services/email.ts
 */

// Import the new simple email service
import { sendEmail } from '../src/services/email';

// Example usage patterns:

// 1. Simple welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const result = await sendEmail(
    userEmail,
    'Welcome to AdLinkPro!',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome ${userName}!</h1>
        <p>Thank you for joining AdLinkPro. Your account has been successfully created.</p>
        <p>You can now start managing your affiliate campaigns and tracking your performance.</p>
        <hr>
        <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    `
  );

  if (result.skipped) {
    console.log(`Email skipped for ${userEmail} - SendGrid not configured`);
  } else if (!result.ok) {
    console.error(`Failed to send welcome email to ${userEmail}`);
  } else {
    console.log(`Welcome email sent successfully to ${userEmail}`);
  }

  return result;
}

// 2. Password reset notification
export async function sendPasswordResetEmail(userEmail: string, resetLink: string) {
  return await sendEmail(
    userEmail,
    'Password Reset Request',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280;">This link will expire in 1 hour for security reasons.</p>
        <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  );
}

// 3. Notification email
export async function sendNotificationEmail(userEmail: string, subject: string, message: string) {
  return await sendEmail(
    userEmail,
    subject,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #374151;">${subject}</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
          ${message}
        </div>
        <hr>
        <p style="color: #6b7280; font-size: 12px;">AdLinkPro Notification System</p>
      </div>
    `
  );
}

// Compare with existing service usage:
// 
// OLD (server/services/email.ts):
// import { sendEmail, EmailParams } from '../server/services/email';
// await sendEmail({
//   to: 'user@example.com',
//   from: 'noreply@platform.com', 
//   subject: 'Welcome!',
//   html: '<h1>Welcome</h1>'
// });
//
// NEW (src/services/email.ts):
// import { sendEmail } from '../src/services/email';
// await sendEmail('user@example.com', 'Welcome!', '<h1>Welcome</h1>');