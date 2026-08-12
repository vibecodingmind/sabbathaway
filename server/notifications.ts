import { prisma } from './db.js';

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

  // SMTP not configured yet — persist + console for ops visibility
  console.log(
    `[EMAIL] ${params.type} → ${params.recipientName} <${params.recipientEmail}> | ${params.subject}`
  );

  return entry;
}

export async function notifyStaySubmitted(req: {
  id: string;
  hostName: string;
  guestName: string;
  guestChurch: string;
  listingTitle: string;
  checkInDate: string;
  checkOutDate: string;
}, hostEmail: string) {
  return logEmailNotification({
    type: 'STAY_REQUEST_SUBMITTED',
    recipientEmail: hostEmail,
    recipientName: req.hostName,
    subject: `New Stay Request: ${req.guestName} requested a Sabbath stay`,
    bodyPreview: `${req.guestName} (${req.guestChurch}) requested "${req.listingTitle}" for ${req.checkInDate} to ${req.checkOutDate}.`,
    stayRequestId: req.id,
    listingTitle: req.listingTitle,
  });
}

export async function notifyStayAccepted(req: {
  id: string;
  guestName: string;
  hostName: string;
  listingTitle: string;
  checkInDate: string;
  checkOutDate: string;
}, guestEmail: string, checkInInstructions?: string) {
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

export async function notifyStayDeclined(req: {
  id: string;
  guestName: string;
  hostName: string;
  listingTitle: string;
  checkInDate: string;
  checkOutDate: string;
}, guestEmail: string) {
  return logEmailNotification({
    type: 'STAY_REQUEST_DECLINED',
    recipientEmail: guestEmail,
    recipientName: req.guestName,
    subject: `Update regarding your stay request for ${req.listingTitle}`,
    bodyPreview: `${req.hostName} was unable to accept your request for ${req.checkInDate} to ${req.checkOutDate}.`,
    stayRequestId: req.id,
    listingTitle: req.listingTitle,
  });
}
