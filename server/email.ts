/**
 * Transactional email. When no provider is configured (SMTP/Resend/SendGrid), emails are
 * logged to the server console instead of being sent — wire a provider before launch.
 */
export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  body: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.SMTP_URL);
}

export async function sendEmail(msg: EmailMessage): Promise<{ sent: boolean; simulated: boolean }> {
  if (!isEmailConfigured()) {
    console.log(
      `[email:simulated] To: ${msg.toName || ''} <${msg.to}>\n  Subject: ${msg.subject}\n  ${msg.body.slice(0, 200)}`
    );
    return { sent: true, simulated: true };
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'AdventistStay <noreply@adventiststay.org>',
          to: [msg.to],
          subject: msg.subject,
          text: msg.body
        })
      });
      return { sent: res.ok, simulated: false };
    }
    // Other providers (SendGrid/SMTP) can be added here.
    console.warn('[email] Provider partially configured but not implemented; logging instead.');
    console.log(`[email:fallback] ${msg.subject} -> ${msg.to}`);
    return { sent: true, simulated: true };
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return { sent: false, simulated: false };
  }
}
