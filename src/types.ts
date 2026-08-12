export type UserRole = 
  | 'ADMIN' 
  | 'HOST' 
  | 'GUEST';

export type VerificationTier = 
  | 'UNVERIFIED' 
  | 'MEMBER_SUBMITTED' 
  | 'ADMIN_VERIFIED' 
  | 'CHURCH_VERIFIED'
  | 'CONFERENCE_VERIFIED';

export type FamilyVerificationLevel = 1 | 2 | 3 | 4;

export type ExperienceType = 
  | 'SABBATH_FAMILY_EXPERIENCE'
  | 'CHURCH_VISIT_EXPERIENCE'
  | 'ADVENTIST_LIFESTYLE_EXPERIENCE'
  | 'MISSION_FELLOWSHIP_EXPERIENCE';

export type GuestCategory = 'ADVENTIST_GUEST' | 'SABBATH_EXPLORER';

export type StayPurpose = 
  | 'WORSHIP_VISIT'
  | 'MISSION_WORK'
  | 'CONFERENCE_EVENT'
  | 'EDUCATION_STUDY'
  | 'MEDICAL_CARE'
  | 'CAMP_CAMP_MEETING'
  | 'FAMILY_TOURISM';

export type RequestStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'DECLINED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  guestCategory?: GuestCategory;
  verificationTier: VerificationTier;
  familyVerificationLevel?: FamilyVerificationLevel;
  homeChurchName: string;
  homeChurchCity: string;
  conferenceName: string;
  pastorName: string;
  pastorEmail?: string;
  membershipYear: number;
  bio: string;
  verifiedAt?: string;
  phone: string;
  languagePreference: SupportedLanguage;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  isHostApproved?: boolean;
}

export interface StayCategory {
  id: string;
  name: string; // e.g. "City", "Village", "Beach", "Mountain", "Farm", "Nature", "Family", "Quiet", "Culture", "Modern"
  icon: string; // Lucide icon name
  description: string;
  enabled: boolean;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  category: 'sabbath' | 'room' | 'food' | 'family' | 'connectivity';
}

export interface AvailabilityDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  isBlocked: boolean;
}

export interface Listing {
  id: string;
  hostId: string;
  hostName: string; // e.g. "Marcus & Ellen Vance"
  familyName: string; // e.g. "The Vance Family"
  familyStory: string;
  spouseInfo?: string;
  childrenInfo?: string;
  familyInterests: string[];
  sabbathActivities: string[];
  languagesSpoken: string[];
  hostingPreferences: string;
  verificationLevel: FamilyVerificationLevel; // 1, 2, 3, or 4 (4 = Verified Adventist Family)
  hostAvatar: string;
  hostChurchName: string;
  hostVerificationTier: VerificationTier;
  title: string;
  description: string;
  propertyType: 'Family Home Stay' | 'Guest House' | 'Private Family Suite' | 'Missionary Quarters';
  city: string;
  stateProvince: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearestSdaChurch: {
    name: string;
    distanceMiles: number;
    address: string;
  };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  familyPhotos?: string[];
  amenities: string[];
  experienceTypes: ExperienceType[];
  hospitalityPerks: {
    fridayDinner: boolean;
    sabbathChurchRide: boolean;
    sabbathLunch: boolean;
    sunsetVespers: boolean;
    airportPickup: boolean;
  };
  sabbathFeatures: {
    vegetarianMealsProvided: boolean;
    sunsetSabbathFellowship: boolean;
    churchRideAvailable: boolean;
    plantBasedKitchen: boolean;
    quietEnvironment: boolean;
  };
  houseRules: string[];
  stayPurposesSupported: StayPurpose[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  categories?: string[]; // e.g. ["City", "Family", "Modern"]
  
  // Workaway-Style Host Metrics & Experience Details
  responseRate?: number; // percent
  acceptanceRate?: number; // percent
  responseTime?: string;
  lastActive?: string;
  minStayNights?: number;
  maxStayNights?: number;
  exchangeType?: string;
  whatGuestsGain?: string[];
  householdContribution?: string;
  dietaryStyle?: string;
  livingArrangements?: string;
  internetSpeed?: string;
  petsOnProperty?: string;
  gettingHereDirections?: string;
  nearbyAttractions?: string[];
  isApproved?: boolean;
  isDisabled?: boolean;
  reviews?: Review[];
}

export interface Review {
  id: string;
  listingId: string;
  stayRequestId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerChurch: string;
  rating: number; // 1-5
  cleanlinessRating: number;
  fellowshipRating: number;
  sabbathFriendlinessRating: number;
  comment: string;
  createdAt: string; // ISO date string
}

export interface SdaChurch {
  id: string;
  name: string;
  conference: string;
  union: string;
  division: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  pastorName: string;
  serviceTimes: {
    sabbathSchool: string;
    divineService: string;
    vespers?: string;
    midweekPrayer?: string;
  };
  website?: string;
  verifiedStatus: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  activeHostsCount: number;
}

export interface StayRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCity: string;
  listingImage: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  guestChurch: string;
  guestVerificationTier: VerificationTier;
  hostId: string;
  hostName: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  purpose: StayPurpose;
  purposeNote: string;
  status: RequestStatus;
  createdAt: string;
  checkInInstructions?: string;
}

export interface Message {
  id: string;
  stayRequestId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  templateType?: 'WELCOME' | 'SABBATH_INVITE' | 'DIRECTIONS' | 'GENERAL';
}

export interface EmailNotificationLog {
  id: string;
  type: 'STAY_REQUEST_SUBMITTED' | 'STAY_REQUEST_ACCEPTED' | 'STAY_REQUEST_DECLINED';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyPreview: string;
  sentAt: string;
  stayRequestId: string;
  listingTitle: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  churchName: string;
  conference: string;
  pastorName: string;
  pastorEmail: string;
  pastorPhone: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentType: 'PASTOR_LETTER' | 'BAPTISM_CERTIFICATE' | 'MEMBERSHIP_LETTER';
  submittedAt: string;
  reviewedBy?: string;
  notes?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType?: 'LISTING' | 'USER' | 'MESSAGING';
  targetId?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  listingId?: string;
  reason?: string;
  issueType?: 'SAFETY' | 'CONDUCT' | 'PROPERTY_DAMAGE' | 'VERIFICATION_DISCREPANCY' | 'OTHER';
  details?: string;
  description?: string;
  status: 'OPEN' | 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'fr' | 'tl' | 'zh' | 'hi' | 'ar' | 'de' | 'ru' | 'ja' | 'id' | 'ko' | 'sw';

export type ExchangeType = 
  | 'CULTURAL_EXCHANGE'
  | 'SABBATH_EXCHANGE'
  | 'YOUTH_FAMILY_EXCHANGE'
  | 'MISSION_EXCHANGE';

export interface FamilyProfile {
  id: string;
  familyName: string;
  country: string;
  city: string;
  localChurch: string;
  conference: string;
  parentsNames: string;
  childrenAges: string[];
  adultCount: number;
  childrenCount: number;
  languages: string[];
  interests: string[];
  culturalBackground: string;
  familyStory: string;
  hostingPreferences: string;
  sabbathTraditions: string;
  availableMonths: string[];
  preferredDurations: string;
  verificationTier: VerificationTier;
  familyPhotos: string[];
  avatar: string;
  lookingForExchangeRegions: string[];
  rating: number;
  reviewCount: number;
}

export interface FamilyExchangeRequest {
  id: string;
  requesterFamilyId: string;
  requesterFamilyName: string;
  requesterAvatar: string;
  requesterCountry: string;
  requesterChurch: string;
  targetFamilyId: string;
  targetFamilyName: string;
  targetAvatar: string;
  targetCountry: string;
  targetChurch: string;
  exchangeType: ExchangeType;
  proposedMonth: string;
  preferredDuration: string;
  introNote: string;
  status: RequestStatus;
  createdAt: string;
}

export interface FamilyExchangeReview {
  id: string;
  exchangeId: string;
  reviewerFamilyId: string;
  reviewerFamilyName: string;
  reviewerAvatar: string;
  reviewerCountry: string;
  targetFamilyId: string;
  hospitalityRating: number;
  communicationRating: number;
  familyFriendlinessRating: number;
  sabbathExperienceRating: number;
  culturalExperienceRating: number;
  comment: string;
  createdAt: string;
}

// Subscription & Membership Models
export type SubscriptionPlan = 
  | 'FREE' 
  | 'SABBATH_MEMBER' 
  | 'FAMILY_EXCHANGE' 
  | 'GLOBAL_FAMILY';

export type MembershipStatus = 
  | 'FREE' 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'PENDING' 
  | 'PAYMENT_FAILED' 
  | 'SUSPENDED';

export type PaymentProvider = 'stripe' | 'paypal' | 'pesapal' | 'free';

export interface UserMembership {
  id: string;
  userId: string;
  userName: string;
  householdName?: string;
  coveredMembers?: string[]; // e.g. ["Sarah Johnson", "Caleb Johnson"]
  plan: SubscriptionPlan;
  price: number;
  currency: 'USD';
  startDate: string; // ISO String or YYYY-MM-DD
  expirationDate: string; // ISO String or YYYY-MM-DD (12 months later)
  paymentReference: string;
  paymentProvider: PaymentProvider;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  householdName?: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: 'USD';
  provider: PaymentProvider;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentReference: string;
  transactionDate: string;
  receiptNumber: string;
  description: string;
}

