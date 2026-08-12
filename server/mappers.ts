function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    role: u.role,
    guestCategory: u.guestCategory || undefined,
    verificationTier: u.verificationTier,
    familyVerificationLevel: u.familyVerificationLevel || undefined,
    homeChurchName: u.homeChurchName,
    homeChurchCity: u.homeChurchCity,
    conferenceName: u.conferenceName,
    pastorName: u.pastorName,
    pastorEmail: u.pastorEmail || undefined,
    membershipYear: u.membershipYear,
    bio: u.bio,
    verifiedAt: u.verifiedAt || undefined,
    phone: u.phone,
    languagePreference: u.languagePreference,
    accountStatus: u.accountStatus,
    isHostApproved: u.isHostApproved,
  };
}

export function mapListing(l: any) {
  return {
    id: l.id,
    hostId: l.hostId,
    hostName: l.hostName,
    familyName: l.familyName,
    familyStory: l.familyStory,
    spouseInfo: l.spouseInfo || undefined,
    childrenInfo: l.childrenInfo || undefined,
    familyInterests: parseJson(l.familyInterestsJson, [] as string[]),
    sabbathActivities: parseJson(l.sabbathActivitiesJson, [] as string[]),
    languagesSpoken: parseJson(l.languagesSpokenJson, [] as string[]),
    hostingPreferences: l.hostingPreferences,
    verificationLevel: l.verificationLevel,
    hostAvatar: l.hostAvatar,
    hostChurchName: l.hostChurchName,
    hostVerificationTier: l.hostVerificationTier,
    title: l.title,
    description: l.description,
    propertyType: l.propertyType,
    city: l.city,
    stateProvince: l.stateProvince,
    country: l.country,
    coordinates: { lat: l.lat, lng: l.lng },
    nearestSdaChurch: {
      name: l.nearestChurchName,
      distanceMiles: l.nearestChurchDistance,
      address: l.nearestChurchAddress,
    },
    maxGuests: l.maxGuests,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    images: parseJson(l.imagesJson, [] as string[]),
    familyPhotos: parseJson(l.familyPhotosJson, [] as string[]),
    amenities: parseJson(l.amenitiesJson, [] as string[]),
    experienceTypes: parseJson(l.experienceTypesJson, [] as string[]),
    hospitalityPerks: parseJson(l.hospitalityPerksJson, {
      fridayDinner: false,
      sabbathChurchRide: false,
      sabbathLunch: false,
      sunsetVespers: false,
      airportPickup: false,
    }),
    sabbathFeatures: parseJson(l.sabbathFeaturesJson, {
      vegetarianMealsProvided: false,
      sunsetSabbathFellowship: false,
      churchRideAvailable: false,
      plantBasedKitchen: false,
      quietEnvironment: false,
    }),
    houseRules: parseJson(l.houseRulesJson, [] as string[]),
    stayPurposesSupported: parseJson(l.stayPurposesJson, [] as string[]),
    rating: l.rating,
    reviewCount: l.reviewCount,
    featured: l.featured || undefined,
    categories: parseJson(l.categoriesJson, [] as string[]),
    responseRate: l.responseRate ?? undefined,
    acceptanceRate: l.acceptanceRate ?? undefined,
    responseTime: l.responseTime ?? undefined,
    lastActive: l.lastActive ?? undefined,
    minStayNights: l.minStayNights ?? undefined,
    maxStayNights: l.maxStayNights ?? undefined,
    exchangeType: l.exchangeType ?? undefined,
    whatGuestsGain: parseJson(l.whatGuestsGainJson, [] as string[]),
    householdContribution: l.householdContribution ?? undefined,
    dietaryStyle: l.dietaryStyle ?? undefined,
    livingArrangements: l.livingArrangements ?? undefined,
    internetSpeed: l.internetSpeed ?? undefined,
    petsOnProperty: l.petsOnProperty ?? undefined,
    gettingHereDirections: l.gettingHereDirections ?? undefined,
    nearbyAttractions: parseJson(l.nearbyAttractionsJson, [] as string[]),
    isApproved: l.isApproved,
    isDisabled: l.isDisabled,
  };
}

export function listingToDb(data: any, host: any) {
  return {
    hostId: host.id,
    hostName: data.hostName || host.name,
    familyName: data.familyName || '',
    familyStory: data.familyStory || '',
    spouseInfo: data.spouseInfo || null,
    childrenInfo: data.childrenInfo || null,
    familyInterestsJson: JSON.stringify(data.familyInterests || []),
    sabbathActivitiesJson: JSON.stringify(data.sabbathActivities || []),
    languagesSpokenJson: JSON.stringify(data.languagesSpoken || []),
    hostingPreferences: data.hostingPreferences || '',
    verificationLevel: data.verificationLevel || host.familyVerificationLevel || 1,
    hostAvatar: data.hostAvatar || host.avatarUrl,
    hostChurchName: data.hostChurchName || host.homeChurchName,
    hostVerificationTier: data.hostVerificationTier || host.verificationTier,
    title: data.title,
    description: data.description || '',
    propertyType: data.propertyType || 'Family Home Stay',
    city: data.city,
    stateProvince: data.stateProvince || '',
    country: data.country,
    lat: data.coordinates?.lat || 0,
    lng: data.coordinates?.lng || 0,
    nearestChurchName: data.nearestSdaChurch?.name || '',
    nearestChurchDistance: data.nearestSdaChurch?.distanceMiles || 0,
    nearestChurchAddress: data.nearestSdaChurch?.address || '',
    maxGuests: data.maxGuests || 2,
    bedrooms: data.bedrooms || 1,
    bathrooms: data.bathrooms || 1,
    imagesJson: JSON.stringify(data.images || []),
    familyPhotosJson: JSON.stringify(data.familyPhotos || []),
    amenitiesJson: JSON.stringify(data.amenities || []),
    experienceTypesJson: JSON.stringify(data.experienceTypes || []),
    hospitalityPerksJson: JSON.stringify(data.hospitalityPerks || {}),
    sabbathFeaturesJson: JSON.stringify(data.sabbathFeatures || {}),
    houseRulesJson: JSON.stringify(data.houseRules || []),
    stayPurposesJson: JSON.stringify(data.stayPurposesSupported || []),
    rating: data.rating ?? 5,
    reviewCount: data.reviewCount ?? 0,
    featured: Boolean(data.featured),
    categoriesJson: JSON.stringify(data.categories || []),
    responseRate: data.responseRate ?? null,
    acceptanceRate: data.acceptanceRate ?? null,
    responseTime: data.responseTime ?? null,
    lastActive: data.lastActive ?? null,
    minStayNights: data.minStayNights ?? null,
    maxStayNights: data.maxStayNights ?? null,
    exchangeType: data.exchangeType ?? null,
    whatGuestsGainJson: JSON.stringify(data.whatGuestsGain || []),
    householdContribution: data.householdContribution ?? null,
    dietaryStyle: data.dietaryStyle ?? null,
    livingArrangements: data.livingArrangements ?? null,
    internetSpeed: data.internetSpeed ?? null,
    petsOnProperty: data.petsOnProperty ?? null,
    gettingHereDirections: data.gettingHereDirections ?? null,
    nearbyAttractionsJson: JSON.stringify(data.nearbyAttractions || []),
    isApproved: data.isApproved ?? false,
    isDisabled: data.isDisabled ?? false,
  };
}

export function mapStayRequest(r: any) {
  return {
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
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    checkInInstructions: r.checkInInstructions || undefined,
  };
}

export function mapMessage(m: any) {
  return {
    id: m.id,
    stayRequestId: m.stayRequestId || undefined,
    senderId: m.senderId,
    senderName: m.senderName,
    senderAvatar: m.senderAvatar,
    receiverId: m.receiverId,
    content: m.content,
    timestamp: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    isRead: m.isRead,
    templateType: m.templateType || undefined,
  };
}

export function mapReview(r: any) {
  return {
    id: r.id,
    listingId: r.listingId,
    stayRequestId: r.stayRequestId || '',
    reviewerId: r.reviewerId,
    reviewerName: r.reviewerName,
    reviewerAvatar: r.reviewerAvatar,
    reviewerChurch: r.reviewerChurch,
    rating: r.rating,
    cleanlinessRating: r.cleanlinessRating,
    fellowshipRating: r.fellowshipRating,
    sabbathFriendlinessRating: r.sabbathFriendlinessRating,
    comment: r.comment,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

export function mapChurch(c: any) {
  return {
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
    serviceTimes: {
      sabbathSchool: c.sabbathSchool,
      divineService: c.divineService,
      vespers: c.vespers || undefined,
      midweekPrayer: c.midweekPrayer || undefined,
    },
    website: c.website || undefined,
    verifiedStatus: c.verifiedStatus,
    coordinates: { lat: c.lat, lng: c.lng },
    activeHostsCount: c.activeHostsCount,
  };
}

export function mapVerification(v: any) {
  return {
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
    submittedAt: v.submittedAt instanceof Date ? v.submittedAt.toISOString() : v.submittedAt,
    reviewedBy: v.reviewedBy || undefined,
    notes: v.notes || undefined,
  };
}

export function mapMembership(m: any) {
  return {
    id: m.id,
    userId: m.userId,
    userName: m.userName,
    householdName: m.householdName || undefined,
    coveredMembers: parseJson(m.coveredMembersJson, [] as string[]),
    plan: m.plan,
    price: m.price,
    currency: m.currency,
    startDate: m.startDate,
    expirationDate: m.expirationDate,
    paymentReference: m.paymentReference,
    paymentProvider: m.paymentProvider,
    status: m.status,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
  };
}

export function mapTransaction(t: any) {
  return {
    id: t.id,
    userId: t.userId,
    userName: t.userName,
    householdName: t.householdName || undefined,
    plan: t.plan,
    amount: t.amount,
    currency: t.currency,
    provider: t.provider,
    status: t.status,
    paymentReference: t.paymentReference,
    transactionDate: t.transactionDate,
    receiptNumber: t.receiptNumber,
    description: t.description,
  };
}

export function mapFamilyProfile(f: any) {
  return {
    id: f.id,
    familyName: f.familyName,
    country: f.country,
    city: f.city,
    localChurch: f.localChurch,
    conference: f.conference,
    parentsNames: f.parentsNames,
    childrenAges: parseJson(f.childrenAgesJson, [] as string[]),
    adultCount: f.adultCount,
    childrenCount: f.childrenCount,
    languages: parseJson(f.languagesJson, [] as string[]),
    interests: parseJson(f.interestsJson, [] as string[]),
    culturalBackground: f.culturalBackground,
    familyStory: f.familyStory,
    hostingPreferences: f.hostingPreferences,
    sabbathTraditions: f.sabbathTraditions,
    availableMonths: parseJson(f.availableMonthsJson, [] as string[]),
    preferredDurations: f.preferredDurations,
    verificationTier: f.verificationTier,
    familyPhotos: parseJson(f.familyPhotosJson, [] as string[]),
    avatar: f.avatar,
    lookingForExchangeRegions: parseJson(f.lookingForExchangeRegionsJson, [] as string[]),
    rating: f.rating,
    reviewCount: f.reviewCount,
  };
}

export function mapFamilyExchangeRequest(r: any) {
  return {
    id: r.id,
    requesterFamilyId: r.requesterFamilyId,
    requesterFamilyName: r.requesterFamilyName,
    requesterAvatar: r.requesterAvatar,
    requesterCountry: r.requesterCountry,
    requesterChurch: r.requesterChurch,
    targetFamilyId: r.targetFamilyId,
    targetFamilyName: r.targetFamilyName,
    targetAvatar: r.targetAvatar,
    targetCountry: r.targetCountry,
    targetChurch: r.targetChurch,
    exchangeType: r.exchangeType,
    proposedMonth: r.proposedMonth,
    preferredDuration: r.preferredDuration,
    introNote: r.introNote,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

export function mapSafetyReport(r: any) {
  return {
    id: r.id,
    reporterId: r.reporterId,
    reporterName: r.reporterName,
    targetType: r.targetType || undefined,
    targetId: r.targetId || undefined,
    reportedUserId: r.reportedUserId || undefined,
    reportedUserName: r.reportedUserName || undefined,
    listingId: r.listingId || undefined,
    reason: r.reason || undefined,
    issueType: r.issueType || undefined,
    details: r.details || undefined,
    description: r.description || undefined,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

export function mapAuditLog(l: any) {
  return {
    id: l.id,
    actorId: l.actorId || '',
    actorName: l.actorName,
    actorRole: l.actorRole,
    action: l.action,
    details: l.details,
    timestamp: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    ipAddress: l.ipAddress,
  };
}

export function mapCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon,
    description: c.description,
    enabled: c.enabled,
    order: c.sortOrder,
  };
}
