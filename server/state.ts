import type { Store } from './db';
import type { TokenPayload } from './auth';

function sanitizeUser(u: any) {
  const { email, phone, pastorEmail, ...rest } = u || {};
  return rest;
}

/**
 * Builds the bootstrap payload for the client. Public catalog data is returned to everyone;
 * private records (messages, stay requests, memberships, transactions, verifications) are
 * scoped to the caller, and admin-only collections are returned only to admins.
 */
export async function buildState(store: Store, auth?: TokenPayload) {
  const [
    listings,
    churches,
    stayRequests,
    messages,
    reviews,
    verifications,
    auditLogs,
    familyProfiles,
    familyExchangeRequests,
    familyExchangeReviews,
    memberships,
    transactions,
    safetyReports,
    stayCategories,
    allUsers,
    planPricing
  ] = await Promise.all([
    store.listCollection('listings'),
    store.listCollection('churches'),
    store.listCollection('stayRequests'),
    store.listCollection('messages'),
    store.listCollection('reviews'),
    store.listCollection('verifications'),
    store.listCollection('auditLogs'),
    store.listCollection('familyProfiles'),
    store.listCollection('familyExchangeRequests'),
    store.listCollection('familyExchangeReviews'),
    store.listCollection('memberships'),
    store.listCollection('transactions'),
    store.listCollection('safetyReports'),
    store.listCollection('stayCategories'),
    store.listUsers(),
    store.getSetting('planPricing')
  ]);

  const isAdmin = auth?.role === 'ADMIN';
  const uid = auth?.sub;

  const favorites = uid ? await store.getFavorites(uid) : [];

  return {
    // Public catalog
    listings,
    churches,
    reviews,
    familyProfiles,
    familyExchangeReviews,
    stayCategories,
    planPricing: planPricing || {},

    // User directory (PII stripped for non-admins)
    users: isAdmin ? allUsers : allUsers.map(sanitizeUser),

    // Scoped private data
    stayRequests: isAdmin ? stayRequests : stayRequests.filter((r) => r.guestId === uid || r.hostId === uid),
    messages: isAdmin ? messages : messages.filter((m) => m.senderId === uid || m.receiverId === uid),
    memberships: isAdmin ? memberships : memberships.filter((m) => m.userId === uid),
    transactions: isAdmin ? transactions : transactions.filter((t) => t.userId === uid),
    verifications: isAdmin ? verifications : verifications.filter((v) => v.userId === uid),

    // Family exchange requests visible to authed users (family-id based ownership)
    familyExchangeRequests: auth ? familyExchangeRequests : [],

    // Admin-only
    auditLogs: isAdmin ? auditLogs : [],
    safetyReports: isAdmin ? safetyReports : safetyReports.filter((s) => s.reporterId === uid),

    favorites
  };
}
