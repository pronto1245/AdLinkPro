import sgMail, { MailService } from '@sendgrid/mail';

// Lazy initialization for SendGrid - graceful degradation without API key
let sendGridInitialized = false;

/**
 * Initialize SendGrid with API key
 * @returns boolean indicating if SendGrid was successfully initialized
 */
function initSendGrid(): boolean {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }
  
  if (!sendGridInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendGridInitialized = true;
  }
  
  return true;
}

/**
 * Send email using SendGrid API
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @returns Promise resolving to result object with ok status and optional skipped flag
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  html: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  try {
    // Check if SendGrid is available
    if (!initSendGrid()) {
      console.warn('[EMAIL] SENDGRID_API_KEY not set — skipping send (noop)');
      return { ok: true, skipped: true };
    }

    // Validate required parameters
    if (!to || !subject || !html) {
      console.error('[EMAIL] Missing required parameters: to, subject, or html');
      return { ok: false };
    }

    // Prepare email data
    const emailData = {
      to,
      from: process.env.FROM_EMAIL || 'noreply@platform.com',
      subject,
      html,
    };

    // Send email via SendGrid
    await sgMail.send(emailData);
    
    console.log(`[EMAIL] Email sent successfully to: ${to}`);
    return { ok: true };
    
  } catch (error) {
    console.error('[EMAIL] SendGrid email error:', error);
    return { ok: false };
  }
}