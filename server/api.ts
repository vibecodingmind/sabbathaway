import express, { type Response } from 'express';
import { getStore, COLLECTIONS, type CollectionName } from './db';
import {
  hashPassword,
  verifyPassword,
  signToken,
  optionalAuth,
  requireAuth,
  requireAdmin,
  type AuthedRequest
} from './auth';
import { processPayment, buildTransaction } from './payments';
import { sendEmail } from './email';
import { calculateExpirationDate, PLAN_PRICING } from '../src/lib/membershipEngine';

const router = express.Router();

const isCollection = (name: string): name is CollectionName => (COLLECTIONS as readonly string[]).includes(name);

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function currentProfile(req: AuthedRequest, res: Response) {
  const store = await getStore();
  const user = await store.getUserById(req.auth!.sub);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return null;
  }
  return { store, profile: user.data };
}

/* ------------------------------------------------------------------ AUTH */

router.post('/auth/register', async (req, res) => {
  try {
    const store = await getStore();
    const { name, email, password, phone, role, homeChurchName, householdName, plan, provider } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await store.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const userId = newId('user');
    const selectedPlan = plan || 'FREE';
    const amount = (PLAN_PRICING as any)[selectedPlan] || 0;

    const payResult = await processPayment({
      userId,
      userName: name,
      userEmail: email,
      householdName: householdName || `${name} Household`,
      plan: selectedPlan,
      amount,
      currency: 'USD',
      provider: provider || 'free'
    });
    if (!payResult.success) {
      return res.status(402).json({ error: payResult.errorMessage || 'Payment failed.' });
    }

    const now = new Date().toISOString();
    const profile = {
      id: userId,
      name,
      email,
      phone: phone || '',
      role: role === 'HOST' ? 'HOST' : 'GUEST',
      verificationTier: 'MEMBER_SUBMITTED',
      homeChurchName: homeChurchName || 'Local Seventh-day Adventist Church',
      homeChurchCity: 'SDA Network',
      conferenceName: 'SDA Conference',
      pastorName: 'Local Pastor',
      membershipYear: new Date().getFullYear(),
      bio: `Registered ${role === 'HOST' ? 'Host Family' : 'Guest Member'} on AdventistStay.`,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      languagePreference: 'en',
      accountStatus: 'ACTIVE',
      isHostApproved: role === 'HOST' ? false : undefined
    };

    await store.createUser({ id: userId, email, passwordHash: await hashPassword(password), data: profile });

    if (selectedPlan !== 'FREE') {
      const membership = {
        id: newId('mem'),
        userId,
        userName: name,
        householdName: householdName || `${name} Household`,
        coveredMembers: [name],
        plan: selectedPlan,
        price: amount,
        currency: 'USD',
        startDate: now,
        expirationDate: calculateExpirationDate(now),
        paymentReference: payResult.transactionRef,
        paymentProvider: payResult.provider,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      };
      await store.upsertDoc('memberships', membership);
      await store.upsertDoc('transactions', buildTransaction(
        { userId, userName: name, userEmail: email, householdName, plan: selectedPlan, amount, currency: 'USD', provider: provider || 'stripe' },
        payResult
      ));
    }

    const token = signToken({ sub: userId, role: profile.role, email });
    return res.json({ token, user: profile, payment: { simulated: payResult.simulated } });
  } catch (err: any) {
    console.error('register error', err);
    return res.status(500).json({ error: err?.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const store = await getStore();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await store.getUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (user.data.accountStatus === 'SUSPENDED' || user.data.accountStatus === 'DEACTIVATED') {
      return res.status(403).json({ error: 'This account is not active. Please contact support.' });
    }
    const token = signToken({ sub: user.id, role: user.data.role, email: user.email });
    return res.json({ token, user: user.data });
  } catch (err: any) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/me', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const user = await store.getUserById(req.auth!.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: user.data });
});

router.post('/auth/logout', (_req, res) => res.json({ ok: true }));

/* ----------------------------------------------------------------- STATE */

router.get('/state', optionalAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const { buildState } = await import('./state');
  const state = await buildState(store, req.auth);
  return res.json(state);
});

/* -------------------------------------------------------- OWNER MUTATIONS */

// Update own profile
router.patch('/me', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const protectedFields = ['id', 'role', 'verificationTier', 'accountStatus', 'isHostApproved', 'familyVerificationLevel'];
  const updates = { ...req.body };
  for (const f of protectedFields) delete updates[f];
  const next = { ...profile, ...updates };
  await store.updateUserData(profile.id, next);
  return res.json({ user: next });
});

// Listings
router.post('/listings', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  if (profile.role !== 'HOST' && profile.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only hosts can create listings.' });
  }
  const listing = {
    ...req.body,
    id: newId('list'),
    hostId: profile.id,
    hostName: profile.name,
    hostAvatar: profile.avatarUrl,
    hostChurchName: profile.homeChurchName,
    hostVerificationTier: profile.verificationTier,
    rating: 5.0,
    reviewCount: 0,
    isApproved: true,
    isDisabled: false
  };
  await store.upsertDoc('listings', listing);
  return res.json(listing);
});

router.patch('/listings/:id', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const existing = await store.getDoc('listings', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  const isAdmin = profile.role === 'ADMIN';
  if (existing.hostId !== profile.id && !isAdmin) return res.status(403).json({ error: 'Not your listing.' });

  const updates = { ...req.body };
  delete updates.id;
  delete updates.hostId;
  if (!isAdmin) {
    delete updates.isApproved;
    delete updates.isDisabled;
    delete updates.rating;
    delete updates.reviewCount;
  }
  const next = { ...existing, ...updates };
  await store.upsertDoc('listings', next);
  return res.json(next);
});

router.delete('/listings/:id', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const existing = await store.getDoc('listings', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  if (existing.hostId !== profile.id && profile.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not your listing.' });
  }
  await store.deleteDoc('listings', req.params.id);
  return res.json({ ok: true });
});

// Stay requests
router.post('/stay-requests', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const listing = await store.getDoc('listings', req.body.listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const request = {
    ...req.body,
    id: newId('req'),
    guestId: profile.id,
    guestName: profile.name,
    guestAvatar: profile.avatarUrl,
    guestChurch: profile.homeChurchName,
    guestVerificationTier: profile.verificationTier,
    hostId: listing.hostId,
    hostName: listing.hostName,
    listingTitle: listing.title,
    listingCity: listing.city,
    listingImage: (listing.images && listing.images[0]) || '',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  await store.upsertDoc('stayRequests', request);

  await sendEmail({
    to: 'host@adventiststay.org',
    toName: listing.hostName,
    subject: `New Stay Request: ${profile.name} requested a Sabbath stay`,
    body: `${profile.name} (${profile.homeChurchName}) requested to stay at "${listing.title}" for ${request.checkInDate} to ${request.checkOutDate}.`
  });
  return res.json(request);
});

router.patch('/stay-requests/:id/status', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const existing = await store.getDoc('stayRequests', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Request not found' });
  const isParticipant = existing.hostId === profile.id || existing.guestId === profile.id;
  if (!isParticipant && profile.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized.' });

  const { status, checkInInstructions } = req.body;
  const next = { ...existing, status, ...(checkInInstructions ? { checkInInstructions } : {}) };
  await store.upsertDoc('stayRequests', next);

  if (status === 'APPROVED') {
    await store.upsertDoc('messages', {
      id: newId('msg'),
      stayRequestId: next.id,
      senderId: profile.id,
      senderName: profile.name,
      senderAvatar: profile.avatarUrl,
      receiverId: next.guestId,
      content: `Your stay request for ${next.listingTitle} has been approved! ${checkInInstructions || 'We look forward to hosting you.'}`,
      timestamp: new Date().toISOString(),
      isRead: false
    });
  }
  return res.json(next);
});

// Messages
router.post('/messages', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const message = {
    ...req.body,
    id: newId('msg'),
    senderId: profile.id,
    senderName: profile.name,
    senderAvatar: profile.avatarUrl,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  await store.upsertDoc('messages', message);
  return res.json(message);
});

// Reviews (recompute listing rating)
router.post('/reviews', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const review = {
    ...req.body,
    id: newId('rev'),
    reviewerId: profile.id,
    reviewerName: profile.name,
    reviewerAvatar: profile.avatarUrl,
    reviewerChurch: profile.homeChurchName,
    createdAt: new Date().toISOString()
  };
  await store.upsertDoc('reviews', review);

  const listing = await store.getDoc('listings', review.listingId);
  if (listing) {
    const newCount = (listing.reviewCount || 0) + 1;
    const newRating = Number(((listing.rating * (listing.reviewCount || 0) + review.rating) / newCount).toFixed(1));
    await store.upsertDoc('listings', { ...listing, reviewCount: newCount, rating: newRating });
  }
  return res.json(review);
});

// Verification requests
router.post('/verifications', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const v = {
    ...req.body,
    id: newId('vreq'),
    userId: profile.id,
    userName: profile.name,
    userEmail: profile.email,
    status: 'PENDING',
    submittedAt: new Date().toISOString()
  };
  await store.upsertDoc('verifications', v);
  return res.json(v);
});

// Favorites
router.post('/favorites/toggle', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ error: 'listingId required' });
  const current = await store.getFavorites(req.auth!.sub);
  const on = !current.includes(listingId);
  await store.setFavorite(req.auth!.sub, listingId, on);
  return res.json({ favorites: await store.getFavorites(req.auth!.sub) });
});

// Memberships
router.post('/memberships/subscribe', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const { plan, provider, householdName, coveredMembers } = req.body;
  const amount = (PLAN_PRICING as any)[plan] || 0;

  const payResult = await processPayment({
    userId: profile.id,
    userName: profile.name,
    userEmail: profile.email,
    householdName: householdName || `${profile.name} Household`,
    plan,
    amount,
    currency: 'USD',
    provider: provider || 'free'
  });
  if (!payResult.success) return res.status(402).json({ error: payResult.errorMessage || 'Payment failed.' });

  const now = new Date().toISOString();
  const membership = {
    id: newId('mem'),
    userId: profile.id,
    userName: profile.name,
    householdName: householdName || `${profile.name} Household`,
    coveredMembers: coveredMembers?.length ? coveredMembers : [profile.name],
    plan,
    price: amount,
    currency: 'USD',
    startDate: now,
    expirationDate: calculateExpirationDate(now),
    paymentReference: payResult.transactionRef,
    paymentProvider: payResult.provider,
    status: plan === 'FREE' ? 'FREE' : 'ACTIVE',
    createdAt: now,
    updatedAt: now
  };
  await store.upsertDoc('memberships', membership);
  const transaction = buildTransaction(
    { userId: profile.id, userName: profile.name, userEmail: profile.email, householdName, plan, amount, currency: 'USD', provider: provider || 'stripe' },
    payResult
  );
  await store.upsertDoc('transactions', transaction);
  return res.json({ membership, transaction, payment: { simulated: payResult.simulated } });
});

router.post('/memberships/cancel', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const all = await store.listCollection('memberships');
  const mine = all.filter((m) => m.userId === req.auth!.sub);
  for (const m of mine) {
    await store.upsertDoc('memberships', { ...m, status: 'CANCELLED', updatedAt: new Date().toISOString() });
  }
  return res.json({ ok: true });
});

// Family exchange
router.post('/family-profiles', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const fp = { ...req.body, id: newId('family'), rating: 5.0, reviewCount: 0 };
  await store.upsertDoc('familyProfiles', fp);
  return res.json(fp);
});

router.post('/family-exchange-requests', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const fr = { ...req.body, id: newId('exreq'), status: 'PENDING', createdAt: new Date().toISOString() };
  await store.upsertDoc('familyExchangeRequests', fr);
  return res.json(fr);
});

router.patch('/family-exchange-requests/:id/status', requireAuth, async (req: AuthedRequest, res) => {
  const store = await getStore();
  const existing = await store.getDoc('familyExchangeRequests', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const next = { ...existing, status: req.body.status };
  await store.upsertDoc('familyExchangeRequests', next);
  return res.json(next);
});

// Safety reports
router.post('/safety-reports', requireAuth, async (req: AuthedRequest, res) => {
  const ctx = await currentProfile(req, res);
  if (!ctx) return;
  const { store, profile } = ctx;
  const report = {
    ...req.body,
    id: newId('rep'),
    reporterId: profile.id,
    reporterName: profile.name,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };
  await store.upsertDoc('safetyReports', report);
  return res.json(report);
});

/* ---------------------------------------------------------- ADMIN ACTIONS */

router.patch('/admin/users/:id', requireAdmin, async (req, res) => {
  const store = await getStore();
  const user = await store.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updates = { ...req.body };
  delete updates.id;
  const next = { ...user.data, ...updates };
  await store.updateUserData(user.id, next);
  return res.json({ user: next });
});

router.patch('/admin/collections/:name/:id', requireAdmin, async (req, res) => {
  const store = await getStore();
  if (!isCollection(req.params.name)) return res.status(400).json({ error: 'Unknown collection' });
  const existing = await store.getDoc(req.params.name, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updates = { ...req.body };
  delete updates.id;
  const next = { ...existing, ...updates };
  await store.upsertDoc(req.params.name, next);
  return res.json(next);
});

router.post('/admin/collections/:name', requireAdmin, async (req, res) => {
  const store = await getStore();
  if (!isCollection(req.params.name)) return res.status(400).json({ error: 'Unknown collection' });
  const doc = { ...req.body, id: req.body.id || newId(req.params.name.slice(0, 3)) };
  await store.upsertDoc(req.params.name, doc);
  return res.json(doc);
});

router.delete('/admin/collections/:name/:id', requireAdmin, async (req, res) => {
  const store = await getStore();
  if (!isCollection(req.params.name)) return res.status(400).json({ error: 'Unknown collection' });
  await store.deleteDoc(req.params.name, req.params.id);
  return res.json({ ok: true });
});

router.patch('/admin/settings/plan-pricing', requireAdmin, async (req, res) => {
  const store = await getStore();
  const current = (await store.getSetting('planPricing')) || {};
  const next = { ...current, ...req.body };
  await store.setSetting('planPricing', next);
  return res.json(next);
});

export default router;
