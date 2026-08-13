import nodemailer from 'nodemailer';
import { prisma } from './db.js';

export type EmailDeliveryStatus = 'SENT' | 'LOGGED_ONLY' | 'FAILED';

function getAppUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

async function deliverEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ status: EmailDeliveryStatus; detail: string }> {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    'AdventistStay <noreply@adventiststay.org>';

  // Prefer Resend HTTP API when RESEND_API_KEY is set
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [params.to],
          subject: params.subject,
          text: params.text,
          html: params.html || `<pre style="font-family:sans-serif">${params.text}</pre>`,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('[EMAIL] Resend failed:', body);
        return { status: 'FAILED', detail: body };
      }
      return { status: 'SENT', detail: 'resend' };
    } catch (err) {
      console.error('[EMAIL] Resend error:', err);
      return { status: 'FAILED', detail: (err as Error).message };
    }
  }

  // SMTP via nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html || undefined,
      });
      return { status: 'SENT', detail: 'smtp' };
    } catch (err) {
      console.error('[EMAIL] SMTP error:', err);
      return { status: 'FAILED', detail: (err as Error).message };
    }
  }

  // Dev fallback — persist + console
  console.log(
    `[EMAIL:LOGGED_ONLY] → ${params.to}\nSubject: ${params.subject}\n${params.text}\n---`
  );
  return { status: 'LOGGED_ONLY', detail: 'console' };
}

export async function logEmailNotification(params: {
  type: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyPreview: string;
  stayRequestId?: string;
  listingTitle?: string;
}) {
  const entry = await prisma.emailNotificationLog.create({
    data: {
      type: params.type,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      subject: params.subject,
      bodyPreview: params.bodyPreview,
      stayRequestId: params.stayRequestId || null,
      listingTitle: params.listingTitle || '',
    },
  });

  const delivery = await deliverEmail({
    to: params.recipientEmail,
    subject: params.subject,
    text: `Hello ${params.recipientName},\n\n${params.bodyPreview}\n\nOpen AdventistStay: ${getAppUrl()}\n\nBlessings,\nAdventistStay Team`,
  });

  console.log(
    `[EMAIL] ${params.type} → ${params.recipientName} <${params.recipientEmail}> | ${delivery.status}`
  );

  return { entry, delivery };
}

export async function notifyStaySubmitted(
  req: {
    id: string;
    hostName: string;
    guestName: string;
    guestChurch: string;
    listingTitle: string;
    checkInDate: string;
    checkOutDate: string;
  },
  hostEmail: string
) {
  return logEmailNotification({
    type: 'STAY_REQUEST_SUBMITTED',
    recipientEmail: hostEmail,
    recipientName: req.hostName,
    subject: `New Stay Request: ${req.guestName} requested a Sabbath stay`,
    bodyPreview: `${req.guestName} (${req.guestChurch}) requested "${req.listingTitle}" for ${req.checkInDate} to ${req.checkOutDate}. Log in to review and respond.`,
    stayRequestId: req.id,
    listingTitle: req.listingTitle,
  });
}

export async function notifyStayAccepted(
  req: {
    id: string;
    guestName: string;
    hostName: string;
    listingTitle: string;
    checkInDate: string;
    checkOutDate: string;
  },
  guestEmail: string,
  checkInInstructions?: string
) {
  return logEmailNotification({
    type: 'STAY_REQUEST_ACCEPTED',
    recipientEmail: guestEmail,
    recipientName: req.guestName,
    subject: `Stay Confirmed! ${req.hostName} accepted your stay request`,
    bodyPreview: `Your stay for "${req.listingTitle}" (${req.checkInDate} - ${req.checkOutDate}) was accepted.${
      checkInInstructions ? ` Check-in: ${checkInInstructions}` : ''
    }`,
    stayRequestId: req.id,
    listingTitle: req.listingTitle,
  });
}

export async function notifyStayDeclined(
  req: {
    id: string;
    guestName: string;
    hostName: string;
    listingTitle: string;
    checkInDate: string;
    checkOutDate: string;
  },
  guestEmail: string
) {
  return logEmailNotification({
    type: 'STAY_REQUEST_DECLINED',
    recipientEmail: guestEmail,
    recipientName: req.guestName,
    subject: `Update regarding your stay request for ${req.listingTitle}`,
    bodyPreview: `${req.hostName} was unable to accept your request for ${req.checkInDate} to ${req.checkOutDate}. Explore other verified host homes nearby.`,
    stayRequestId: req.id,
    listingTitle: req.listingTitle,
  });
}

export async function notifyMembershipActivated(params: {
  email: string;
  name: string;
  plan: string;
  expirationDate: string;
}) {
  return logEmailNotification({
    type: 'MEMBERSHIP_ACTIVATED',
    recipientEmail: params.email,
    recipientName: params.name,
    subject: `Welcome — ${params.plan.replace(/_/g, ' ')} membership is active`,
    bodyPreview: `Your AdventistStay membership is active through ${params.expirationDate}. Hospitality stays between members remain free.`,
  });
}
