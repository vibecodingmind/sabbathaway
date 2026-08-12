import { EmailNotificationLog, StayRequest } from '../types';

// In-memory notification log store
let emailLogs: EmailNotificationLog[] = [
  {
    id: 'email-init-1',
    type: 'STAY_REQUEST_SUBMITTED',
    recipientEmail: 'host.vance@adventiststay.org',
    recipientName: 'The Vance Family',
    subject: '📬 New Sabbath Stay Request from Sarah Jenkins',
    bodyPreview: 'Hello Vance Family, Sarah Jenkins from Pioneer Memorial Church has requested Sabbath hospitality for Aug 14 - Aug 16, 2026.',
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    stayRequestId: 'req-1',
    listingTitle: 'The Vance Family - Modern City Suite'
  }
];

type LogListener = (logs: EmailNotificationLog[]) => void;
const listeners: Set<LogListener> = new Set();

export const subscribeNotificationLogs = (listener: LogListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l([...emailLogs]));
};

export const getNotificationLogs = (): EmailNotificationLog[] => {
  return [...emailLogs];
};

export const logEmailNotification = (
  type: EmailNotificationLog['type'],
  recipientEmail: string,
  recipientName: string,
  subject: string,
  bodyPreview: string,
  stayRequestId: string,
  listingTitle: string
): EmailNotificationLog => {
  const newLog: EmailNotificationLog = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    recipientEmail,
    recipientName,
    subject,
    bodyPreview,
    sentAt: new Date().toISOString(),
    stayRequestId,
    listingTitle
  };

  emailLogs = [newLog, ...emailLogs];
  notifyListeners();

  // Log to browser console as simulated SMTP server execution
  console.log(
    `%c[EMAIL NOTIFICATION SERVICE]%c Sent '${type}' email to ${recipientName} <${recipientEmail}>\nSubject: ${subject}\nPreview: ${bodyPreview}`,
    'color: #FF385C; font-weight: bold;',
    'color: inherit;'
  );

  return newLog;
};

export const sendStayRequestSubmittedNotification = (
  req: StayRequest,
  hostEmail = 'host@adventiststay.org'
) => {
  return logEmailNotification(
    'STAY_REQUEST_SUBMITTED',
    hostEmail,
    req.hostName,
    `📬 New Stay Request: ${req.guestName} requested a Sabbath stay`,
    `Hi ${req.hostName}, ${req.guestName} (${req.guestChurch}) submitted a request to stay at "${req.listingTitle}" for ${req.checkInDate} to ${req.checkOutDate}. Log in to review their pastoral verification and accept the stay.`,
    req.id,
    req.listingTitle
  );
};

export const sendStayRequestAcceptedNotification = (
  req: StayRequest,
  guestEmail = 'guest@adventiststay.org',
  checkInInstructions?: string
) => {
  return logEmailNotification(
    'STAY_REQUEST_ACCEPTED',
    guestEmail,
    req.guestName,
    `🎉 Stay Confirmed! ${req.hostName} accepted your stay request`,
    `Praise God! Your stay request for "${req.listingTitle}" (${req.checkInDate} - ${req.checkOutDate}) has been accepted. ${
      checkInInstructions ? `Check-in details: ${checkInInstructions}` : 'Contact your host in messages to prepare for Friday arrival.'
    }`,
    req.id,
    req.listingTitle
  );
};

export const sendStayRequestDeclinedNotification = (
  req: StayRequest,
  guestEmail = 'guest@adventiststay.org'
) => {
  return logEmailNotification(
    'STAY_REQUEST_DECLINED',
    guestEmail,
    req.guestName,
    `Update regarding your stay request for ${req.listingTitle}`,
    `Hi ${req.guestName}, your host family ${req.hostName} was unable to accept your stay request for ${req.checkInDate} to ${req.checkOutDate} due to availability. You can explore other verified host homes nearby.`,
    req.id,
    req.listingTitle
  );
};
