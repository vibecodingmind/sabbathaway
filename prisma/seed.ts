import 'dotenv/config';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import {
  initialProfiles,
  initialListings,
  initialChurches,
  initialStayRequests,
  initialMessages,
  initialReviews,
  initialVerificationRequests,
  initialAuditLogs,
  initialFamilyProfiles,
  initialFamilyExchangeRequests,
  initialMemberships,
  initialTransactions,
  initialStayCategories,
} from '../src/data/mockData.ts';
import { additionalListings } from '../src/data/additionalListings.ts';
import { additionalFamilyProfiles } from '../src/data/additionalFamilyProfiles.ts';
import type { Listing } from '../src/types.ts';

const raw = process.env.DATABASE_URL || 'file:./dev.db';
const url =
  raw.startsWith('file:') && !path.isAbsolute(raw.slice(5))
    ? `file:${path.resolve(process.cwd(), raw.slice(5))}`
    : raw;

async function createPrisma() {
  if (/^postgres(ql)?:\/\//i.test(url)) {
    const [{ PrismaPg }, { default: pg }] = await Promise.all([
      import('@prisma/adapter-pg'),
      import('pg'),
    ]);
    const pool = new pg.Pool({ connectionString: url });
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

const prisma = await createPrisma();

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

function mapListingToDb(l: Listing, hostId: string) {
  return {
    id: l.id,
    hostId,
    hostName: l.hostName,
    familyName: l.familyName,
    familyStory: l.familyStory,
    spouseInfo: l.spouseInfo ?? null,
    childrenInfo: l.childrenInfo ?? null,
    familyInterestsJson: JSON.stringify(l.familyInterests || []),
    sabbathActivitiesJson: JSON.stringify(l.sabbathActivities || []),
    languagesSpokenJson: JSON.stringify(l.languagesSpoken || []),
    hostingPreferences: l.hostingPreferences || '',
    verificationLevel: l.verificationLevel,
    hostAvatar: l.hostAvatar,
    hostChurchName: l.hostChurchName,
    hostVerificationTier: l.hostVerificationTier,
    title: l.title,
    description: l.description || '',
    propertyType: l.propertyType,
    city: l.city,
    stateProvince: l.stateProvince || '',
    country: l.country,
    lat: l.coordinates?.lat || 0,
    lng: l.coordinates?.lng || 0,
    nearestChurchName: l.nearestSdaChurch?.name || '',
    nearestChurchDistance: l.nearestSdaChurch?.distanceMiles || 0,
    nearestChurchAddress: l.nearestSdaChurch?.address || '',
    maxGuests: l.maxGuests,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    imagesJson: JSON.stringify(l.images || []),
    familyPhotosJson: JSON.stringify(l.familyPhotos || []),
    amenitiesJson: JSON.stringify(l.amenities || []),
    experienceTypesJson: JSON.stringify(l.experienceTypes || []),
    hospitalityPerksJson: JSON.stringify(l.hospitalityPerks || {}),
    sabbathFeaturesJson: JSON.stringify(l.sabbathFeatures || {}),
    houseRulesJson: JSON.stringify(l.houseRules || []),
    stayPurposesJson: JSON.stringify(l.stayPurposesSupported || []),
    rating: l.rating,
    reviewCount: l.reviewCount,
    featured: !!l.featured,
    categoriesJson: JSON.stringify(l.categories || []),
    responseRate: l.responseRate ?? null,
    acceptanceRate: l.acceptanceRate ?? null,
    responseTime: l.responseTime ?? null,
    lastActive: l.lastActive ?? null,
    minStayNights: l.minStayNights ?? null,
    maxStayNights: l.maxStayNights ?? null,
    exchangeType: l.exchangeType ?? null,
    whatGuestsGainJson: JSON.stringify(l.whatGuestsGain || []),
    householdContribution: l.householdContribution ?? null,
    dietaryStyle: l.dietaryStyle ?? null,
    livingArrangements: l.livingArrangements ?? null,
    internetSpeed: l.internetSpeed ?? null,
    petsOnProperty: l.petsOnProperty ?? null,
    gettingHereDirections: l.gettingHereDirections ?? null,
    nearbyAttractionsJson: JSON.stringify(l.nearbyAttractions || []),
    isApproved: l.isApproved !== false,
    isDisabled: !!l.isDisabled,
  };
}

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.emailNotificationLog.deleteMany();
  await prisma.familyExchangeRequest.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.stayRequest.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.stayCategory.deleteMany();
  await prisma.church.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformConfig.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all(
    initialProfiles.map((p) =>
      prisma.user.create({
        data: {
          id: p.id,
          email: p.email,
          passwordHash,
          name: p.name,
          avatarUrl: p.avatarUrl,
          role: p.role,
          guestCategory: p.guestCategory ?? null,
          verificationTier: p.verificationTier,
          familyVerificationLevel: p.familyVerificationLevel ?? null,
          homeChurchName: p.homeChurchName,
          homeChurchCity: p.homeChurchCity,
          conferenceName: p.conferenceName,
          pastorName: p.pastorName,
          pastorEmail: p.pastorEmail ?? null,
          membershipYear: p.membershipYear,
          bio: p.bio,
          verifiedAt: p.verifiedAt ?? null,
          phone: p.phone,
          languagePreference: p.languagePreference,
          accountStatus: p.accountStatus ?? 'ACTIVE',
          isHostApproved: p.isHostApproved ?? false,
        },
      }),
    ),
  );

  const userIds = new Set(users.map((u) => u.id));
  const fallbackHostId = 'user-host-1';

  const allListings = dedupeById([...initialListings, ...additionalListings]);
  const listingRows = allListings.map((l) => {
    const hostId = userIds.has(l.hostId) ? l.hostId : fallbackHostId;
    return mapListingToDb(l, hostId);
  });

  const listings = await Promise.all(
    listingRows.map((data) => prisma.listing.create({ data })),
  );
  const listingIds = new Set(listings.map((l) => l.id));

  const churches = await Promise.all(
    initialChurches.map((c) =>
      prisma.church.create({
        data: {
          id: c.id,
          name: c.name,
          conference: c.conference,
          union: c.union,
          division: c.division,
          address: c.address,
          city: c.city,
          country: c.country,
          postalCode: c.postalCode,
          phone: c.phone,
          email: c.email,
          pastorName: c.pastorName,
          sabbathSchool: c.serviceTimes.sabbathSchool,
          divineService: c.serviceTimes.divineService,
          vespers: c.serviceTimes.vespers ?? null,
          midweekPrayer: c.serviceTimes.midweekPrayer ?? null,
          website: c.website ?? null,
          verifiedStatus: c.verifiedStatus,
          lat: c.coordinates.lat,
          lng: c.coordinates.lng,
          activeHostsCount: c.activeHostsCount,
        },
      }),
    ),
  );

  const stayRequestIds = new Set<string>();
  for (const r of initialStayRequests) {
    if (
      !listingIds.has(r.listingId) ||
      !userIds.has(r.guestId) ||
      !userIds.has(r.hostId)
    ) {
      continue;
    }
    await prisma.stayRequest.create({
      data: {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listingTitle,
        listingCity: r.listingCity,
        listingImage: r.listingImage,
        guestId: r.guestId,
        guestName: r.guestName,
        guestAvatar: r.guestAvatar,
        guestChurch: r.guestChurch,
        guestVerificationTier: r.guestVerificationTier,
        hostId: r.hostId,
        hostName: r.hostName,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        guestCount: r.guestCount,
        purpose: r.purpose,
        purposeNote: r.purposeNote,
        status: r.status,
        checkInInstructions: r.checkInInstructions ?? null,
        createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
      },
    });
    stayRequestIds.add(r.id);
  }

  for (const m of initialMessages) {
    if (!userIds.has(m.senderId) || !userIds.has(m.receiverId)) continue;
    if (m.stayRequestId && !stayRequestIds.has(m.stayRequestId)) continue;
    await prisma.message.create({
      data: {
        id: m.id,
        stayRequestId: m.stayRequestId ?? null,
        senderId: m.senderId,
        senderName: m.senderName,
        senderAvatar: m.senderAvatar,
        receiverId: m.receiverId,
        content: m.content,
        isRead: m.isRead,
        templateType: m.templateType ?? null,
        createdAt: m.timestamp ? new Date(m.timestamp) : undefined,
      },
    });
  }

  for (const r of initialReviews) {
    if (!listingIds.has(r.listingId) || !userIds.has(r.reviewerId)) continue;
    if (r.stayRequestId && !stayRequestIds.has(r.stayRequestId)) continue;
    await prisma.review.create({
      data: {
        id: r.id,
        listingId: r.listingId,
        stayRequestId: r.stayRequestId ?? null,
        reviewerId: r.reviewerId,
        reviewerName: r.reviewerName,
        reviewerAvatar: r.reviewerAvatar,
        reviewerChurch: r.reviewerChurch,
        rating: r.rating,
        cleanlinessRating: r.cleanlinessRating,
        fellowshipRating: r.fellowshipRating,
        sabbathFriendlinessRating: r.sabbathFriendlinessRating,
        comment: r.comment,
        createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
      },
    });
  }

  for (const v of initialVerificationRequests) {
    if (!userIds.has(v.userId)) continue;
    await prisma.verificationRequest.create({
      data: {
        id: v.id,
        userId: v.userId,
        userName: v.userName,
        userEmail: v.userEmail,
        userPhone: v.userPhone,
        churchName: v.churchName,
        conference: v.conference,
        pastorName: v.pastorName,
        pastorEmail: v.pastorEmail,
        pastorPhone: v.pastorPhone,
        status: v.status,
        documentType: v.documentType,
        reviewedBy: v.reviewedBy ?? null,
        notes: v.notes ?? null,
        submittedAt: v.submittedAt ? new Date(v.submittedAt) : undefined,
      },
    });
  }

  let membershipCount = 0;
  for (const m of initialMemberships) {
    if (!userIds.has(m.userId)) continue;
    await prisma.membership.create({
      data: {
        id: m.id,
        userId: m.userId,
        userName: m.userName,
        householdName: m.householdName ?? null,
        coveredMembersJson: JSON.stringify(m.coveredMembers || []),
        plan: m.plan,
        price: m.price,
        currency: m.currency,
        startDate: m.startDate,
        expirationDate: m.expirationDate,
        paymentReference: m.paymentReference,
        paymentProvider: m.paymentProvider,
        status: m.status,
        createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
      },
    });
    membershipCount++;
  }

  let transactionCount = 0;
  for (const t of initialTransactions) {
    if (!userIds.has(t.userId)) continue;
    await prisma.paymentTransaction.create({
      data: {
        id: t.id,
        userId: t.userId,
        userName: t.userName,
        householdName: t.householdName ?? null,
        plan: t.plan,
        amount: t.amount,
        currency: t.currency,
        provider: t.provider,
        status: t.status,
        paymentReference: t.paymentReference,
        transactionDate: t.transactionDate,
        receiptNumber: t.receiptNumber,
        description: t.description,
      },
    });
    transactionCount++;
  }

  const allFamilyProfiles = dedupeById([
    ...initialFamilyProfiles,
    ...additionalFamilyProfiles,
  ]);
  const familyProfiles = await Promise.all(
    allFamilyProfiles.map((f) =>
      prisma.familyProfile.create({
        data: {
          id: f.id,
          userId: null,
          familyName: f.familyName,
          country: f.country,
          city: f.city,
          localChurch: f.localChurch,
          conference: f.conference,
          parentsNames: f.parentsNames,
          childrenAgesJson: JSON.stringify(f.childrenAges || []),
          adultCount: f.adultCount,
          childrenCount: f.childrenCount,
          languagesJson: JSON.stringify(f.languages || []),
          interestsJson: JSON.stringify(f.interests || []),
          culturalBackground: f.culturalBackground,
          familyStory: f.familyStory,
          hostingPreferences: f.hostingPreferences,
          sabbathTraditions: f.sabbathTraditions,
          availableMonthsJson: JSON.stringify(f.availableMonths || []),
          preferredDurations: f.preferredDurations,
          verificationTier: f.verificationTier,
          familyPhotosJson: JSON.stringify(f.familyPhotos || []),
          avatar: f.avatar,
          lookingForExchangeRegionsJson: JSON.stringify(
            f.lookingForExchangeRegions || [],
          ),
          rating: f.rating,
          reviewCount: f.reviewCount,
        },
      }),
    ),
  );
  const familyIds = new Set(familyProfiles.map((f) => f.id));

  let exchangeCount = 0;
  for (const e of initialFamilyExchangeRequests) {
    if (
      !familyIds.has(e.requesterFamilyId) ||
      !familyIds.has(e.targetFamilyId)
    ) {
      continue;
    }
    await prisma.familyExchangeRequest.create({
      data: {
        id: e.id,
        requesterFamilyId: e.requesterFamilyId,
        requesterFamilyName: e.requesterFamilyName,
        requesterAvatar: e.requesterAvatar,
        requesterCountry: e.requesterCountry,
        requesterChurch: e.requesterChurch,
        targetFamilyId: e.targetFamilyId,
        targetFamilyName: e.targetFamilyName,
        targetAvatar: e.targetAvatar,
        targetCountry: e.targetCountry,
        targetChurch: e.targetChurch,
        exchangeType: e.exchangeType,
        proposedMonth: e.proposedMonth,
        preferredDuration: e.preferredDuration,
        introNote: e.introNote,
        status: e.status,
        createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
      },
    });
    exchangeCount++;
  }

  const categories = await Promise.all(
    initialStayCategories.map((c) =>
      prisma.stayCategory.create({
        data: {
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description,
          enabled: c.enabled,
          sortOrder: c.order,
        },
      }),
    ),
  );

  const auditLogs = await Promise.all(
    initialAuditLogs.map((l) =>
      prisma.auditLog.create({
        data: {
          id: l.id,
          actorId: userIds.has(l.actorId) ? l.actorId : null,
          actorName: l.actorName,
          actorRole: l.actorRole,
          action: l.action,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.timestamp ? new Date(l.timestamp) : undefined,
        },
      }),
    ),
  );

  await prisma.platformConfig.create({
    data: {
      id: 'plan-pricing',
      key: 'planPricing',
      value: JSON.stringify({
        FREE: 0,
        SABBATH_MEMBER: 39,
        FAMILY_EXCHANGE: 59,
        GLOBAL_FAMILY: 79,
      }),
    },
  });

  let favoriteCount = 0;
  if (userIds.has('user-guest-1') && listingIds.has('list-1')) {
    await prisma.favorite.create({
      data: {
        id: 'fav-guest1-list1',
        userId: 'user-guest-1',
        listingId: 'list-1',
      },
    });
    favoriteCount = 1;
  }

  console.log('Seed complete:');
  console.log(`  Users: ${users.length}`);
  console.log(`  Listings: ${listings.length}`);
  console.log(`  Churches: ${churches.length}`);
  console.log(`  Stay requests: ${stayRequestIds.size}`);
  console.log(`  Messages: ${initialMessages.filter((m) => userIds.has(m.senderId) && userIds.has(m.receiverId) && (!m.stayRequestId || stayRequestIds.has(m.stayRequestId))).length}`);
  console.log(`  Reviews: ${initialReviews.filter((r) => listingIds.has(r.listingId) && userIds.has(r.reviewerId) && (!r.stayRequestId || stayRequestIds.has(r.stayRequestId))).length}`);
  console.log(`  Verifications: ${initialVerificationRequests.filter((v) => userIds.has(v.userId)).length}`);
  console.log(`  Memberships: ${membershipCount}`);
  console.log(`  Transactions: ${transactionCount}`);
  console.log(`  Family profiles: ${familyProfiles.length}`);
  console.log(`  Family exchange requests: ${exchangeCount}`);
  console.log(`  Stay categories: ${categories.length}`);
  console.log(`  Audit logs: ${auditLogs.length}`);
  console.log(`  Favorites: ${favoriteCount}`);
  console.log('');
  console.log('Demo credentials:');
  console.log('  guest@test.local / password123');
  console.log('  host@test.local / password123');
  console.log('  admin@test.local / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
