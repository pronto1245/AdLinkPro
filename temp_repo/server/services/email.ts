import sgMail, { MailService } from '@sendgrid/mail';

// Ленивая инициализация SendGrid - не падаем без ключа
let sendGridInitialized = false;

function initSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }
  if (!sendGridInitialized) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendGridInitialized = true;
  }
  return true;
}

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<{ ok: boolean; skipped?: boolean }> {
  try {
    if (!initSendGrid()) {
      console.warn('[EMAIL] SENDGRID_API_KEY not set — skipping send (noop)');
      return { ok: true, skipped: true };
    }

    const sendData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) sendData.text = params.text;
    if (params.html) sendData.html = params.html;
    
    // Ensure at least text or html is provided
    if (!sendData.text && !sendData.html) {
      sendData.text = params.subject; // Fallback to subject as text
    }

    await sgMail.send(sendData);
    
    console.log('Email sent successfully to:', params.to);
    return { ok: true };
  } catch (error) {
    console.error('SendGrid email error:', error);
    return { ok: false };
  }
}