import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import {
  authRequired,
  authOptional,
  requireRole,
  type AuthedRequest,
  signToken,
  hashPassword,
  comparePassword,
  writeAuditLog,
} from './auth.js';
import {
  mapUser,
  mapListing,
  listingToDb,
  mapStayRequest,
  mapMessage,
  mapReview,
  mapChurch,
  mapVerification,
  mapMembership,
  mapTransaction,
  mapFamilyProfile,
  mapFamilyExchangeRequest,
  mapSafetyReport,
  mapAuditLog,
  mapCategory,
} from './mappers.js';
import {
  notifyStaySubmitted,
  notifyStayAccepted,
  notifyStayDeclined,
} from './notifications.js';
import {
  executePayment,
  calculateExpirationDate,
  PLAN_PRICING,
  isStripeConfigured,
  type PaymentProvider,
  type SubscriptionPlan,
} from './payments.js';
import { verificationUpload, publicUploadPath } from './uploads.js';

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  }
  return req.ip || '127.0.0.1';
}

function getEffectiveMembershipStatus(membership: {
  plan: string;
  status: string;
  expirationDate: string;
} | null | undefined): string {
  if (!membership) return 'FREE';
  if (membership.plan === 'FREE') return 'FREE';
  if (membership.status === 'EXPIRED') return 'EXPIRED';
  const now = new Date();
  const expires = new Date(membership.expirationDate);
  if (now > expires && membership.plan !== 'FREE') return 'EXPIRED';
  return membership.status;
}

function canRequestStay(
  membership: { plan: string; status: string; expirationDate: string } | null | undefined
): boolean {
  if (!membership) return false;
  if (getEffectiveMembershipStatus(membership) !== 'ACTIVE') return false;
  return membership.plan === 'SABBATH_MEMBER' || membership.plan === 'GLOBAL_FAMILY';
}

function canHostStay(
  membership: { plan: string; status: string; expirationDate: string } | null | undefined
): boolean {
  return canRequestStay(membership);
}

function canUseFamilyExchange(
  membership: { plan: string; status: string; expirationDate: string } | null | undefined
): boolean {
  if (!membership) return false;
  if (getEffectiveMembershipStatus(membership) !== 'ACTIVE') return false;
  return membership.plan === 'FAMILY_EXCHANGE' || membership.plan === 'GLOBAL_FAMILY';
}

async function getLatestMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async function loadUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

function listingPartialToDb(data: Record<string, unknown>): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  const scalarFields = [
    'hostName', 'familyName', 'familyStory', 'spouseInfo', 'childrenInfo',
    'hostingPreferences', 'verificationLevel', 'hostAvatar', 'hostChurchName',
    'hostVerificationTier', 'title', 'description', 'propertyType', 'city',
    'stateProvince', 'country', 'nearestChurchName', 'nearestChurchDistance',
    'nearestChurchAddress', 'maxGuests', 'bedrooms', 'bathrooms', 'rating',
    'reviewCount', 'featured', 'responseRate', 'acceptanceRate', 'responseTime',
    'lastActive', 'minStayNights', 'maxStayNights', 'exchangeType',
    'householdContribution', 'dietaryStyle', 'livingArrangements',
    'internetSpeed', 'petsOnProperty', 'gettingHereDirections',
    'isApproved', 'isDisabled',
  ] as const;

  for (const field of scalarFields) {
    if (field in data) update[field] = data[field];
  }

  if ('coordinates' in data && data.coordinates && typeof data.coordinates === 'object') {
    const coords = data.coordinates as { lat?: number; lng?: number };
    if (coords.lat !== undefined) update.lat = coords.lat;
    if (coords.lng !== undefined) update.lng = coords.lng;
  }

  if ('nearestSdaChurch' in data && data.nearestSdaChurch && typeof data.nearestSdaChurch === 'object') {
    const church = data.nearestSdaChurch as { name?: string; distanceMiles?: number; address?: string };
    if (church.name !== undefined) update.nearestChurchName = church.name;
    if (church.distanceMiles !== undefined) update.nearestChurchDistance = church.distanceMiles;
    if (church.address !== undefined) update.nearestChurchAddress = church.address;
  }

  const jsonArrayFields: Record<string, string> = {
    familyInterests: 'familyInterestsJson',
    sabbathActivities: 'sabbathActivitiesJson',
    languagesSpoken: 'languagesSpokenJson',
    images: 'imagesJson',
    familyPhotos: 'familyPhotosJson',
    amenities: 'amenitiesJson',
    experienceTypes: 'experienceTypesJson',
    houseRules: 'houseRulesJson',
    stayPurposesSupported: 'stayPurposesJson',
    categories: 'categoriesJson',
    whatGuestsGain: 'whatGuestsGainJson',
    nearbyAttractions: 'nearbyAttractionsJson',
  };

  for (const [key, dbKey] of Object.entries(jsonArrayFields)) {
    if (key in data) update[dbKey] = JSON.stringify(data[key] ?? []);
  }

  if ('hospitalityPerks' in data) {
    update.hospitalityPerksJson = JSON.stringify(data.hospitalityPerks ?? {});
  }
  if ('sabbathFeatures' in data) {
    update.sabbathFeaturesJson = JSON.stringify(data.sabbathFeatures ?? {});
  }

  return update;
}

function familyPartialToDb(data: Record<string, unknown>): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  const scalarFields = [
    'familyName', 'country', 'city', 'localChurch', 'conference', 'parentsNames',
    'adultCount', 'childrenCount', 'culturalBackground', 'familyStory',
    'hostingPreferences', 'sabbathTraditions', 'preferredDurations',
    'verificationTier', 'avatar', 'rating', 'reviewCount',
  ] as const;

  for (const field of scalarFields) {
    if (field in data) update[field] = data[field];
  }

  const jsonFields: Record<string, string> = {
    childrenAges: 'childrenAgesJson',
    languages: 'languagesJson',
    interests: 'interestsJson',
    availableMonths: 'availableMonthsJson',
    familyPhotos: 'familyPhotosJson',
    lookingForExchangeRegions: 'lookingForExchangeRegionsJson',
  };

  for (const [key, dbKey] of Object.entries(jsonFields)) {
    if (key in data) update[dbKey] = JSON.stringify(data[key] ?? []);
  }

  return update;
}

export function createApiRouter(): Router {
  const router = Router();

  // ─── Auth ───────────────────────────────────────────────────────────────────

  router.post('/auth/register', async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        role,
        homeChurchName,
        householdName,
        plan,
        provider,
      } = req.body ?? {};

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const pwd = password || 'password123';
      const passwordHash = await hashPassword(pwd);
      const subscriptionPlan = (plan || 'FREE') as SubscriptionPlan;
      const paymentProvider = (provider || 'stripe') as PaymentProvider;
      const amount = PLAN_PRICING[subscriptionPlan] ?? 0;

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: phone || '',
          role: role || 'GUEST',
          homeChurchName: homeChurchName || '',
          verificationTier: 'MEMBER_SUBMITTED',
        },
      });

      const paymentResult = await executePayment({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        householdName: householdName || `${name} Household`,
        coveredMembers: [name],
        plan: subscriptionPlan,
        amount,
        currency: 'USD',
        provider: paymentProvider,
      });

      if (paymentResult.mode === 'checkout') {
        // Create pending membership; Stripe webhook activates after payment
        const now = new Date().toISOString();
        const expirationDate = calculateExpirationDate(now);
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            userName: user.name,
            householdName: householdName || `${name} Household`,
            coveredMembersJson: JSON.stringify([name]),
            plan: subscriptionPlan,
            price: amount,
            currency: 'USD',
            startDate: now,
            expirationDate,
            paymentReference: paymentResult.sessionId,
            paymentProvider: 'stripe',
            status: 'PENDING',
          },
        });

        await writeAuditLog({
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'USER_REGISTERED_CHECKOUT_PENDING',
          details: `Registered; awaiting Stripe Checkout for ${subscriptionPlan}`,
          ipAddress: clientIp(req),
        });

        const token = signToken({ userId: user.id, role: user.role, email: user.email });
        return res.status(201).json({
          token,
          user: mapUser(user),
          membership: mapMembership(membership),
          checkoutUrl: paymentResult.checkoutUrl,
          sessionId: paymentResult.sessionId,
        });
      }

      const { verification, transaction } = paymentResult;

      if (!verification.success) {
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(402).json({
          error: verification.errorMessage || 'Registration payment failed',
        });
      }

      const now = new Date().toISOString();
      const expirationDate = calculateExpirationDate(now);

      const membership = await prisma.membership.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: householdName || `${name} Household`,
          coveredMembersJson: JSON.stringify([name]),
          plan: subscriptionPlan,
          price: amount,
          currency: 'USD',
          startDate: now,
          expirationDate,
          paymentReference: verification.transactionRef,
          paymentProvider,
          status: subscriptionPlan === 'FREE' ? 'FREE' : 'ACTIVE',
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: householdName || `${name} Household`,
          plan: subscriptionPlan,
          amount: transaction.amount,
          currency: transaction.currency,
          provider: transaction.provider,
          status: transaction.status,
          paymentReference: transaction.paymentReference,
          transactionDate: transaction.transactionDate,
          receiptNumber: transaction.receiptNumber,
          description: transaction.description,
        },
      });

      await writeAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'USER_REGISTERED',
        details: `Registered with ${subscriptionPlan} plan`,
        ipAddress: clientIp(req),
      });

      const token = signToken({ userId: user.id, role: user.role, email: user.email });
      return res.status(201).json({
        token,
        user: mapUser(user),
        membership: mapMembership(membership),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.accountStatus === 'SUSPENDED') {
        return res.status(403).json({ error: 'Account suspended' });
      }
      if (user.accountStatus === 'DEACTIVATED') {
        return res.status(403).json({ error: 'Account deactivated' });
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken({ userId: user.id, role: user.role, email: user.email });
      return res.json({ token, user: mapUser(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/auth/demo-login', async (req, res) => {
    try {
      const { role } = req.body ?? {};
      if (!role || !['ADMIN', 'HOST', 'GUEST'].includes(role)) {
        return res.status(400).json({ error: 'role must be ADMIN, HOST, or GUEST' });
      }

      const user = await prisma.user.findFirst({ where: { role } });
      if (!user) {
        return res.status(404).json({ error: `No demo user found for role ${role}` });
      }

      const token = signToken({ userId: user.id, role: user.role, email: user.email });
      return res.json({ token, user: mapUser(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
      return res.status(500).json({ error: message });
    }
  });

  router.get('/auth/me', authRequired, async (req: AuthedRequest, res) => {
    try {
      const user = await loadUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(mapUser(user));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Bootstrap ──────────────────────────────────────────────────────────────

  router.get('/bootstrap', authOptional, async (req: AuthedRequest, res) => {
    try {
      const authed = req.user;
      const isAdmin = authed?.role === 'ADMIN';

      const listingWhere = isAdmin
        ? {}
        : { isApproved: true, isDisabled: false };

      const [
        listingRows,
        userRows,
        reviewRows,
        churchRows,
        categoryRows,
        familyProfileRows,
        familyExchangeRows,
      ] = await Promise.all([
        prisma.listing.findMany({ where: listingWhere, orderBy: { createdAt: 'desc' } }),
        prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.review.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.church.findMany({ orderBy: { name: 'asc' } }),
        prisma.stayCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.familyProfile.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.familyExchangeRequest.findMany({ orderBy: { createdAt: 'desc' } }),
      ]);

      let stayRequestRows: Awaited<ReturnType<typeof prisma.stayRequest.findMany>> = [];
      let messageRows: Awaited<ReturnType<typeof prisma.message.findMany>> = [];
      let verificationRows: Awaited<ReturnType<typeof prisma.verificationRequest.findMany>> = [];
      let auditLogRows: Awaited<ReturnType<typeof prisma.auditLog.findMany>> = [];
      let membershipRows: Awaited<ReturnType<typeof prisma.membership.findMany>> = [];
      let transactionRows: Awaited<ReturnType<typeof prisma.paymentTransaction.findMany>> = [];
      let safetyReportRows: Awaited<ReturnType<typeof prisma.safetyReport.findMany>> = [];
      let favoriteListingIds: string[] = [];
      let currentUser = null;

      if (authed) {
        const userId = authed.userId;

        if (isAdmin) {
          [
            stayRequestRows,
            messageRows,
            verificationRows,
            auditLogRows,
            membershipRows,
            transactionRows,
            safetyReportRows,
          ] = await Promise.all([
            prisma.stayRequest.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.message.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.verificationRequest.findMany({ orderBy: { submittedAt: 'desc' } }),
            prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.membership.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.paymentTransaction.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.safetyReport.findMany({ orderBy: { createdAt: 'desc' } }),
          ]);
        } else {
          [
            stayRequestRows,
            messageRows,
            membershipRows,
            transactionRows,
            safetyReportRows,
          ] = await Promise.all([
            prisma.stayRequest.findMany({
              where: { OR: [{ guestId: userId }, { hostId: userId }] },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.message.findMany({
              where: { OR: [{ senderId: userId }, { receiverId: userId }] },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.membership.findMany({
              where: { userId },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.paymentTransaction.findMany({
              where: { userId },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.safetyReport.findMany({
              where: { reporterId: userId },
              orderBy: { createdAt: 'desc' },
            }),
          ]);
        }

        const favorites = await prisma.favorite.findMany({ where: { userId } });
        favoriteListingIds = favorites.map((f) => f.listingId);

        const userRecord = await loadUserById(userId);
        currentUser = userRecord ? mapUser(userRecord) : null;
      }

      return res.json({
        listings: listingRows.map(mapListing),
        users: userRows.map(mapUser),
        stayRequests: stayRequestRows.map(mapStayRequest),
        messages: messageRows.map(mapMessage),
        reviews: reviewRows.map(mapReview),
        churches: churchRows.map(mapChurch),
        verifications: verificationRows.map(mapVerification),
        auditLogs: auditLogRows.map(mapAuditLog),
        memberships: membershipRows.map(mapMembership),
        transactions: transactionRows.map(mapTransaction),
        familyProfiles: familyProfileRows.map(mapFamilyProfile),
        familyExchangeRequests: familyExchangeRows.map(mapFamilyExchangeRequest),
        familyExchangeReviews: [],
        stayCategories: categoryRows.map(mapCategory),
        favorites: favoriteListingIds,
        safetyReports: safetyReportRows.map(mapSafetyReport),
        currentUser,
        planPricing: PLAN_PRICING,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bootstrap failed';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Listings ───────────────────────────────────────────────────────────────

  router.get('/listings', authOptional, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const { city, country, guests } = req.query;

      const where: Record<string, unknown> = {};
      if (!isAdmin) {
        where.isApproved = true;
        where.isDisabled = false;
      }
      if (typeof city === 'string' && city.length > 0) {
        where.city = { contains: city };
      }
      if (typeof country === 'string' && country.length > 0 && country !== 'ALL') {
        where.country = country;
      }
      if (guests) {
        const guestCount = Number(guests);
        if (!Number.isNaN(guestCount)) {
          where.maxGuests = { gte: guestCount };
        }
      }

      const listings = await prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return res.json(listings.map(mapListing));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load listings';
      return res.status(500).json({ error: message });
    }
  });

  router.get('/listings/:id', async (req, res) => {
    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      return res.json(mapListing(listing));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load listing';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/listings', authRequired, async (req: AuthedRequest, res) => {
    try {
      const host = await loadUserById(req.user!.userId);
      if (!host) {
        return res.status(404).json({ error: 'User not found' });
      }

      const dbData = listingToDb(req.body ?? {}, host);
      const listing = await prisma.listing.create({
        data: {
          ...dbData,
          isApproved: false,
        },
      });

      await writeAuditLog({
        actorId: host.id,
        actorName: host.name,
        actorRole: host.role,
        action: 'LISTING_CREATED',
        details: `Created listing "${listing.title}"`,
        ipAddress: clientIp(req),
      });

      return res.status(201).json(mapListing(listing));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create listing';
      return res.status(500).json({ error: message });
    }
  });

  router.patch('/listings/:id', authRequired, async (req: AuthedRequest, res) => {
    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin && listing.hostId !== req.user!.userId) {
        return res.status(403).json({ error: 'Only the host owner or admin can update this listing' });
      }

      const updateData = listingPartialToDb(req.body ?? {});
      const updated = await prisma.listing.update({
        where: { id: listing.id },
        data: updateData,
      });

      return res.json(mapListing(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update listing';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/listings/:id/approve', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: { isApproved: true, isDisabled: false },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'LISTING_APPROVED',
        details: `Approved listing ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapListing(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to approve listing';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/listings/:id/reject', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: { isApproved: false },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'LISTING_REJECTED',
        details: `Rejected listing ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapListing(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reject listing';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/listings/:id/disable', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: { isDisabled: true },
      });
      return res.json(mapListing(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disable listing';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/listings/:id/enable', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.listing.update({
        where: { id: req.params.id },
        data: { isDisabled: false },
      });
      return res.json(mapListing(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to enable listing';
      return res.status(500).json({ error: message });
    }
  });

  router.delete('/listings/:id', authRequired, async (req: AuthedRequest, res) => {
    try {
      const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin && listing.hostId !== req.user!.userId) {
        return res.status(403).json({ error: 'Only the host owner or admin can delete this listing' });
      }

      await prisma.listing.delete({ where: { id: listing.id } });
      return res.json({ success: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete listing';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Stays ──────────────────────────────────────────────────────────────────

  router.get('/stays', authRequired, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const stays = await prisma.stayRequest.findMany({
        where: isAdmin
          ? undefined
          : { OR: [{ guestId: req.user!.userId }, { hostId: req.user!.userId }] },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(stays.map(mapStayRequest));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stays';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/stays', authRequired, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin) {
        const membership = await getLatestMembership(req.user!.userId);
        if (!canRequestStay(membership)) {
          return res.status(402).json({
            error: 'Active Sabbath Member or Global Family membership required to request stays.',
          });
        }
      }

      const guest = await loadUserById(req.user!.userId);
      if (!guest) {
        return res.status(404).json({ error: 'User not found' });
      }

      const {
        listingId,
        checkInDate,
        checkOutDate,
        guestCount,
        purpose,
        purposeNote,
      } = req.body ?? {};

      if (!listingId || !checkInDate || !checkOutDate || !purpose) {
        return res.status(400).json({ error: 'listingId, checkInDate, checkOutDate, and purpose are required' });
      }

      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const images = JSON.parse(listing.imagesJson || '[]') as string[];
      const stay = await prisma.stayRequest.create({
        data: {
          listingId: listing.id,
          listingTitle: listing.title,
          listingCity: listing.city,
          listingImage: images[0] || '',
          guestId: guest.id,
          guestName: guest.name,
          guestAvatar: guest.avatarUrl,
          guestChurch: guest.homeChurchName,
          guestVerificationTier: guest.verificationTier,
          hostId: listing.hostId,
          hostName: listing.hostName,
          checkInDate,
          checkOutDate,
          guestCount: guestCount ?? 1,
          purpose,
          purposeNote: purposeNote || '',
          status: 'PENDING',
        },
      });

      const host = await loadUserById(listing.hostId);
      if (host) {
        await notifyStaySubmitted(
          {
            id: stay.id,
            hostName: stay.hostName,
            guestName: stay.guestName,
            guestChurch: stay.guestChurch,
            listingTitle: stay.listingTitle,
            checkInDate: stay.checkInDate,
            checkOutDate: stay.checkOutDate,
          },
          host.email
        );
      }

      await writeAuditLog({
        actorId: guest.id,
        actorName: guest.name,
        actorRole: guest.role,
        action: 'STAY_REQUEST_CREATED',
        details: `Created stay request for ${stay.listingTitle}`,
        ipAddress: clientIp(req),
      });

      return res.status(201).json(mapStayRequest(stay));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create stay request';
      return res.status(500).json({ error: message });
    }
  });

  router.patch('/stays/:id/status', authRequired, async (req: AuthedRequest, res) => {
    try {
      const stay = await prisma.stayRequest.findUnique({ where: { id: req.params.id } });
      if (!stay) {
        return res.status(404).json({ error: 'Stay request not found' });
      }

      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin && stay.hostId !== req.user!.userId) {
        return res.status(403).json({ error: 'Only the host or admin can update stay status' });
      }

      const { status, checkInInstructions } = req.body ?? {};
      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const actor = await loadUserById(req.user!.userId);
      const updated = await prisma.stayRequest.update({
        where: { id: stay.id },
        data: {
          status,
          ...(checkInInstructions !== undefined ? { checkInInstructions } : {}),
        },
      });

      const guest = await loadUserById(stay.guestId);
      const notifyPayload = {
        id: stay.id,
        guestName: stay.guestName,
        hostName: stay.hostName,
        listingTitle: stay.listingTitle,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
      };

      if (status === 'APPROVED' && guest) {
        await notifyStayAccepted(notifyPayload, guest.email, checkInInstructions);
        await prisma.message.create({
          data: {
            stayRequestId: stay.id,
            senderId: actor!.id,
            senderName: actor!.name,
            senderAvatar: actor!.avatarUrl,
            receiverId: guest.id,
            content: `Your stay request for ${stay.listingTitle} has been approved! ${
              checkInInstructions || 'We look forward to hosting you.'
            }`,
            templateType: 'GENERAL',
          },
        });
      } else if (status === 'DECLINED' && guest) {
        await notifyStayDeclined(notifyPayload, guest.email);
      }

      return res.json(mapStayRequest(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update stay status';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Messages ───────────────────────────────────────────────────────────────

  router.get('/messages', authRequired, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const messages = await prisma.message.findMany({
        where: isAdmin
          ? undefined
          : { OR: [{ senderId: req.user!.userId }, { receiverId: req.user!.userId }] },
        orderBy: { createdAt: 'asc' },
      });
      return res.json(messages.map(mapMessage));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/messages', authRequired, async (req: AuthedRequest, res) => {
    try {
      const sender = await loadUserById(req.user!.userId);
      if (!sender) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { receiverId, content, stayRequestId } = req.body ?? {};
      if (!receiverId || !content) {
        return res.status(400).json({ error: 'receiverId and content are required' });
      }

      const message = await prisma.message.create({
        data: {
          senderId: sender.id,
          senderName: sender.name,
          senderAvatar: sender.avatarUrl,
          receiverId,
          content,
          stayRequestId: stayRequestId || null,
        },
      });

      return res.status(201).json(mapMessage(message));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Reviews ────────────────────────────────────────────────────────────────

  router.post('/reviews', authRequired, async (req: AuthedRequest, res) => {
    try {
      const reviewer = await loadUserById(req.user!.userId);
      if (!reviewer) {
        return res.status(404).json({ error: 'User not found' });
      }

      const {
        listingId,
        stayRequestId,
        rating,
        cleanlinessRating,
        fellowshipRating,
        sabbathFriendlinessRating,
        comment,
      } = req.body ?? {};

      if (!listingId || rating === undefined) {
        return res.status(400).json({ error: 'listingId and rating are required' });
      }

      const review = await prisma.review.create({
        data: {
          listingId,
          stayRequestId: stayRequestId || null,
          reviewerId: reviewer.id,
          reviewerName: reviewer.name,
          reviewerAvatar: reviewer.avatarUrl,
          reviewerChurch: reviewer.homeChurchName,
          rating,
          cleanlinessRating: cleanlinessRating ?? 5,
          fellowshipRating: fellowshipRating ?? 5,
          sabbathFriendlinessRating: sabbathFriendlinessRating ?? 5,
          comment: comment || '',
        },
      });

      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (listing) {
        const newCount = listing.reviewCount + 1;
        const newRating = Number(
          ((listing.rating * listing.reviewCount + rating) / newCount).toFixed(1)
        );
        await prisma.listing.update({
          where: { id: listingId },
          data: { reviewCount: newCount, rating: newRating },
        });
      }

      return res.status(201).json(mapReview(review));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create review';
      return res.status(500).json({ error: message });
    }
  });

  router.delete('/reviews/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
      await prisma.review.delete({ where: { id: req.params.id } });
      return res.json({ success: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete review';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Verifications ────────────────────────────────────────────────────────────

  router.get('/verifications', authRequired, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const verifications = await prisma.verificationRequest.findMany({
        where: isAdmin ? undefined : { userId: req.user!.userId },
        orderBy: { submittedAt: 'desc' },
      });
      return res.json(verifications.map(mapVerification));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load verifications';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/verifications', authRequired, verificationUpload.single('document'), async (req: AuthedRequest, res) => {
    try {
      const user = await loadUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const {
        churchName,
        conference,
        pastorName,
        pastorEmail,
        pastorPhone,
        documentType,
      } = req.body ?? {};

      if (!churchName) {
        return res.status(400).json({ error: 'churchName is required' });
      }

      const file = (req as any).file as Express.Multer.File | undefined;

      const verification = await prisma.verificationRequest.create({
        data: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          churchName,
          conference: conference || '',
          pastorName: pastorName || '',
          pastorEmail: pastorEmail || '',
          pastorPhone: pastorPhone || '',
          documentType: documentType || 'MEMBERSHIP_LETTER',
          documentUrl: file ? publicUploadPath(file.filename) : null,
          documentFileName: file?.originalname || null,
          status: 'PENDING',
        },
      });

      await writeAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'VERIFICATION_SUBMITTED',
        details: `Submitted ${documentType || 'MEMBERSHIP_LETTER'}${file ? ` with ${file.originalname}` : ''}`,
        ipAddress: clientIp(req),
      });

      return res.status(201).json(mapVerification(verification));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit verification';
      return res.status(500).json({ error: message });
    }
  });

  router.get('/payments/config', (_req, res) => {
    res.json({
      stripeEnabled: isStripeConfigured(),
      providers: {
        stripe: isStripeConfigured() ? 'live_checkout' : 'simulated',
        paypal: 'simulated',
        pesapal: 'simulated',
        free: 'instant',
      },
    });
  });

  router.patch('/verifications/:id', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const { status, notes } = req.body ?? {};
      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const actor = await loadUserById(req.user!.userId);
      const verification = await prisma.verificationRequest.update({
        where: { id: req.params.id },
        data: {
          status,
          notes: notes ?? undefined,
          reviewedBy: actor?.name || req.user!.email,
        },
      });

      if (status === 'VERIFIED') {
        await prisma.user.update({
          where: { id: verification.userId },
          data: {
            verificationTier: 'ADMIN_VERIFIED',
            verifiedAt: new Date().toISOString(),
          },
        });
      }

      return res.json(mapVerification(verification));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update verification';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Membership ─────────────────────────────────────────────────────────────

  router.post('/memberships/subscribe', authRequired, async (req: AuthedRequest, res) => {
    try {
      const user = await loadUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { plan, provider, householdName, coveredMembers } = req.body ?? {};
      if (!plan) {
        return res.status(400).json({ error: 'plan is required' });
      }

      const subscriptionPlan = plan as SubscriptionPlan;
      const paymentProvider = (provider || 'stripe') as PaymentProvider;
      const amount = PLAN_PRICING[subscriptionPlan] ?? 0;

      const paymentResult = await executePayment({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        householdName: householdName || `${user.name} Household`,
        coveredMembers:
          Array.isArray(coveredMembers) && coveredMembers.length > 0
            ? coveredMembers
            : [user.name],
        plan: subscriptionPlan,
        amount,
        currency: 'USD',
        provider: paymentProvider,
      });

      if (paymentResult.mode === 'checkout') {
        const now = new Date().toISOString();
        const expirationDate = calculateExpirationDate(now);
        const members =
          Array.isArray(coveredMembers) && coveredMembers.length > 0
            ? coveredMembers
            : [user.name];

        await prisma.membership.deleteMany({ where: { userId: user.id } });
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            userName: user.name,
            householdName: householdName || `${user.name} Household`,
            coveredMembersJson: JSON.stringify(members),
            plan: subscriptionPlan,
            price: amount,
            currency: 'USD',
            startDate: now,
            expirationDate,
            paymentReference: paymentResult.sessionId,
            paymentProvider: 'stripe',
            status: 'PENDING',
          },
        });

        await writeAuditLog({
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'MEMBERSHIP_CHECKOUT_STARTED',
          details: `Started Stripe Checkout for ${subscriptionPlan}`,
          ipAddress: clientIp(req),
        });

        return res.status(201).json({
          membership: mapMembership(membership),
          checkoutUrl: paymentResult.checkoutUrl,
          sessionId: paymentResult.sessionId,
        });
      }

      const { verification, transaction } = paymentResult;

      if (!verification.success) {
        return res.status(402).json({
          error: verification.errorMessage || 'Payment verification failed',
        });
      }

      const now = new Date().toISOString();
      const expirationDate = calculateExpirationDate(now);
      const members =
        Array.isArray(coveredMembers) && coveredMembers.length > 0
          ? coveredMembers
          : [user.name];

      await prisma.membership.deleteMany({ where: { userId: user.id } });

      const membership = await prisma.membership.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: householdName || `${user.name} Household`,
          coveredMembersJson: JSON.stringify(members),
          plan: subscriptionPlan,
          price: amount,
          currency: 'USD',
          startDate: now,
          expirationDate,
          paymentReference: verification.transactionRef,
          paymentProvider,
          status: subscriptionPlan === 'FREE' ? 'FREE' : 'ACTIVE',
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: householdName || `${user.name} Household`,
          plan: subscriptionPlan,
          amount: transaction.amount,
          currency: transaction.currency,
          provider: transaction.provider,
          status: transaction.status,
          paymentReference: transaction.paymentReference,
          transactionDate: transaction.transactionDate,
          receiptNumber: transaction.receiptNumber,
          description: transaction.description,
        },
      });

      await writeAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'MEMBERSHIP_SUBSCRIBED',
        details: `Subscribed to ${subscriptionPlan} via ${paymentProvider}`,
        ipAddress: clientIp(req),
      });

      return res.status(201).json(mapMembership(membership));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Subscription failed';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/memberships/cancel', authRequired, async (req: AuthedRequest, res) => {
    try {
      const membership = await getLatestMembership(req.user!.userId);
      if (!membership) {
        return res.status(404).json({ error: 'No active membership found' });
      }

      const updated = await prisma.membership.update({
        where: { id: membership.id },
        data: { status: 'CANCELLED' },
      });

      const user = await loadUserById(req.user!.userId);
      if (user) {
        await writeAuditLog({
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          action: 'MEMBERSHIP_CANCELLED',
          details: `Cancelled ${membership.plan} membership`,
          ipAddress: clientIp(req),
        });
      }

      return res.json(mapMembership(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Family ─────────────────────────────────────────────────────────────────

  router.get('/families', async (_req, res) => {
    try {
      const families = await prisma.familyProfile.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(families.map(mapFamilyProfile));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load families';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/families', authRequired, async (req: AuthedRequest, res) => {
    try {
      const user = await loadUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const body = req.body ?? {};
      if (!body.familyName || !body.country || !body.city) {
        return res.status(400).json({ error: 'familyName, country, and city are required' });
      }

      const existing = await prisma.familyProfile.findUnique({ where: { userId: user.id } });
      if (existing) {
        const updated = await prisma.familyProfile.update({
          where: { id: existing.id },
          data: familyPartialToDb(body),
        });
        return res.json(mapFamilyProfile(updated));
      }

      const dbData = familyPartialToDb(body);
      const family = await prisma.familyProfile.create({
        data: {
          userId: user.id,
          familyName: body.familyName,
          country: body.country,
          city: body.city,
          ...dbData,
        },
      });

      return res.status(201).json(mapFamilyProfile(family));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create family profile';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/family-exchanges', authRequired, async (req: AuthedRequest, res) => {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      if (!isAdmin) {
        const membership = await getLatestMembership(req.user!.userId);
        if (!canUseFamilyExchange(membership)) {
          return res.status(402).json({
            error: 'Active Family Exchange or Global Family membership required for family exchanges.',
          });
        }
      }

      const {
        requesterFamilyId,
        targetFamilyId,
        exchangeType,
        proposedMonth,
        preferredDuration,
        introNote,
      } = req.body ?? {};

      if (!requesterFamilyId || !targetFamilyId || !exchangeType || !proposedMonth) {
        return res.status(400).json({
          error: 'requesterFamilyId, targetFamilyId, exchangeType, and proposedMonth are required',
        });
      }

      const [requesterFamily, targetFamily] = await Promise.all([
        prisma.familyProfile.findUnique({ where: { id: requesterFamilyId } }),
        prisma.familyProfile.findUnique({ where: { id: targetFamilyId } }),
      ]);

      if (!requesterFamily || !targetFamily) {
        return res.status(404).json({ error: 'Requester or target family not found' });
      }

      const exchange = await prisma.familyExchangeRequest.create({
        data: {
          requesterFamilyId: requesterFamily.id,
          requesterFamilyName: requesterFamily.familyName,
          requesterAvatar: requesterFamily.avatar,
          requesterCountry: requesterFamily.country,
          requesterChurch: requesterFamily.localChurch,
          targetFamilyId: targetFamily.id,
          targetFamilyName: targetFamily.familyName,
          targetAvatar: targetFamily.avatar,
          targetCountry: targetFamily.country,
          targetChurch: targetFamily.localChurch,
          exchangeType,
          proposedMonth,
          preferredDuration: preferredDuration || '',
          introNote: introNote || '',
          status: 'PENDING',
        },
      });

      return res.status(201).json(mapFamilyExchangeRequest(exchange));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create family exchange request';
      return res.status(500).json({ error: message });
    }
  });

  router.patch('/family-exchanges/:id/status', authRequired, async (req: AuthedRequest, res) => {
    try {
      const exchange = await prisma.familyExchangeRequest.findUnique({
        where: { id: req.params.id },
        include: {
          requesterFamily: true,
          targetFamily: true,
        },
      });

      if (!exchange) {
        return res.status(404).json({ error: 'Family exchange request not found' });
      }

      const isAdmin = req.user!.role === 'ADMIN';
      const userFamily = await prisma.familyProfile.findUnique({
        where: { userId: req.user!.userId },
      });

      const isParticipant =
        userFamily &&
        (userFamily.id === exchange.requesterFamilyId ||
          userFamily.id === exchange.targetFamilyId);

      if (!isAdmin && !isParticipant) {
        return res.status(403).json({ error: 'Not authorized to update this exchange request' });
      }

      const { status } = req.body ?? {};
      if (!status) {
        return res.status(400).json({ error: 'status is required' });
      }

      const updated = await prisma.familyExchangeRequest.update({
        where: { id: exchange.id },
        data: { status },
      });

      return res.json(mapFamilyExchangeRequest(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update family exchange status';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Churches ─────────────────────────────────────────────────────────────────

  router.get('/churches', async (_req, res) => {
    try {
      const churches = await prisma.church.findMany({ orderBy: { name: 'asc' } });
      return res.json(churches.map(mapChurch));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load churches';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Admin Users ────────────────────────────────────────────────────────────

  router.patch('/users/:id', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const allowedFields = [
        'name', 'email', 'avatarUrl', 'role', 'guestCategory', 'verificationTier',
        'familyVerificationLevel', 'homeChurchName', 'homeChurchCity', 'conferenceName',
        'pastorName', 'pastorEmail', 'membershipYear', 'bio', 'phone',
        'languagePreference', 'accountStatus', 'isHostApproved',
      ] as const;

      const data: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (field in (req.body ?? {})) {
          data[field] = req.body[field];
        }
      }

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data,
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'USER_UPDATED',
        details: `Updated user ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapUser(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/users/:id/suspend', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { accountStatus: 'SUSPENDED' },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'USER_SUSPENDED',
        details: `Suspended user ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapUser(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to suspend user';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/users/:id/reactivate', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { accountStatus: 'ACTIVE' },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'USER_REACTIVATED',
        details: `Reactivated user ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapUser(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate user';
      return res.status(500).json({ error: message });
    }
  });

  router.delete('/users/:id', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { accountStatus: 'DEACTIVATED' },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'USER_DEACTIVATED',
        details: `Soft-deleted user ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapUser(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Safety ─────────────────────────────────────────────────────────────────

  router.post('/safety-reports', authRequired, async (req: AuthedRequest, res) => {
    try {
      const reporter = await loadUserById(req.user!.userId);
      if (!reporter) {
        return res.status(404).json({ error: 'User not found' });
      }

      const body = req.body ?? {};
      const report = await prisma.safetyReport.create({
        data: {
          reporterId: reporter.id,
          reporterName: reporter.name,
          targetType: body.targetType || null,
          targetId: body.targetId || null,
          reportedUserId: body.reportedUserId || null,
          reportedUserName: body.reportedUserName || null,
          listingId: body.listingId || null,
          reason: body.reason || null,
          issueType: body.issueType || null,
          details: body.details || null,
          description: body.description || null,
          status: 'OPEN',
        },
      });

      return res.status(201).json(mapSafetyReport(report));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create safety report';
      return res.status(500).json({ error: message });
    }
  });

  router.patch('/safety-reports/:id/resolve', authRequired, requireRole('ADMIN'), async (req: AuthedRequest, res) => {
    try {
      const updated = await prisma.safetyReport.update({
        where: { id: req.params.id },
        data: { status: 'RESOLVED' },
      });

      await writeAuditLog({
        actorId: req.user!.userId,
        actorName: req.user!.email,
        actorRole: 'ADMIN',
        action: 'SAFETY_REPORT_RESOLVED',
        details: `Resolved safety report ${updated.id}`,
        ipAddress: clientIp(req),
      });

      return res.json(mapSafetyReport(updated));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resolve safety report';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Favorites ──────────────────────────────────────────────────────────────

  router.post('/favorites/:listingId/toggle', authRequired, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { listingId } = req.params;

      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const existing = await prisma.favorite.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });

      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return res.json({ favorited: false, listingId });
      }

      await prisma.favorite.create({ data: { userId, listingId } });
      return res.json({ favorited: true, listingId });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle favorite';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Categories ─────────────────────────────────────────────────────────────

  router.get('/categories', async (_req, res) => {
    try {
      const categories = await prisma.stayCategory.findMany({ orderBy: { sortOrder: 'asc' } });
      return res.json(categories.map(mapCategory));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      return res.status(500).json({ error: message });
    }
  });

  router.post('/categories', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
      const { name, icon, description, enabled, order } = req.body ?? {};
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const category = await prisma.stayCategory.create({
        data: {
          name,
          icon: icon || 'Home',
          description: description || '',
          enabled: enabled !== false,
          sortOrder: order ?? 0,
        },
      });

      return res.status(201).json(mapCategory(category));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      return res.status(500).json({ error: message });
    }
  });

  router.patch('/categories/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
    try {
      const { name, icon, description, enabled, order } = req.body ?? {};
      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (icon !== undefined) data.icon = icon;
      if (description !== undefined) data.description = description;
      if (enabled !== undefined) data.enabled = enabled;
      if (order !== undefined) data.sortOrder = order;

      const category = await prisma.stayCategory.update({
        where: { id: req.params.id },
        data,
      });

      return res.json(mapCategory(category));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      return res.status(500).json({ error: message });
    }
  });

  // ─── Notification Logs ──────────────────────────────────────────────────────

  router.get('/notifications', authRequired, requireRole('ADMIN'), async (_req, res) => {
    try {
      const logs = await prisma.emailNotificationLog.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json(
        logs.map((log) => ({
          id: log.id,
          type: log.type,
          recipientEmail: log.recipientEmail,
          recipientName: log.recipientName,
          subject: log.subject,
          bodyPreview: log.bodyPreview,
          stayRequestId: log.stayRequestId || undefined,
          listingTitle: log.listingTitle || undefined,
          createdAt: log.createdAt.toISOString(),
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load notification logs';
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
