import { SubscriptionPlan, MembershipStatus, UserMembership } from '../types';

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  billingCycle: string;
  badge?: string;
  tagline: string;
  description: string;
  features: string[];
  restrictedFeatures: string[];
}

export const PLAN_PRICING: Record<SubscriptionPlan, number> = {
  FREE: 0,
  SABBATH_MEMBER: 39,
  FAMILY_EXCHANGE: 59,
  GLOBAL_FAMILY: 79,
};

export const PLATFORM_MEMBERSHIP_DISCLAIMER = 
  "Your annual membership gives you access to the AdventistStay hospitality network. Hospitality itself remains 100% free and voluntary. Membership supports platform infrastructure, verification, safety, communication, matching, and community technology.";

export const PLAN_DEFINITIONS: Record<SubscriptionPlan, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    billingCycle: '$0/year',
    tagline: 'Explore the AdventistStay community',
    description: 'Perfect for learning about the network and searching available homes and Adventist families.',
    features: [
      'Create account & basic profile',
      'Browse available host families',
      'Discover Sabbath experiences',
      'View public family profiles',
      'Search global destinations',
      'Save favorite listings'
    ],
    restrictedFeatures: [
      'Request Sabbath stays',
      'Become an active host',
      'Participate in Family Exchange',
      'Member-only messaging'
    ]
  },
  SABBATH_MEMBER: {
    id: 'SABBATH_MEMBER',
    name: 'Sabbath Member',
    price: 39,
    billingCycle: '$39 USD/year',
    tagline: 'Host & request Sabbath hospitality',
    description: 'For users and families who want to participate in the main Sabbath hospitality network.',
    features: [
      'Request Sabbath stays',
      'Become a host family',
      'Host verification badge',
      'Verified member profile',
      'Member messaging system',
      'Sabbath experiences & fellowship',
      'Manage guest requests & calendar',
      'Guest & host review system',
      'Household/family coverage'
    ],
    restrictedFeatures: [
      'Family Exchange matching',
      'International family swap requests'
    ]
  },
  FAMILY_EXCHANGE: {
    id: 'FAMILY_EXCHANGE',
    name: 'Family Exchange',
    price: 59,
    billingCycle: '$59 USD/year',
    tagline: 'International family-to-family exchange',
    description: 'For families who want to connect for cultural, youth, and mission family exchanges worldwide.',
    features: [
      'Full Family Exchange access',
      'Family-to-family matching engine',
      'Search compatible exchange families',
      'Send & receive exchange requests',
      'Direct family messaging',
      'Cultural & youth exchange profiles',
      'Hosting & travel availability calendar',
      'Exchange history & reviews',
      'Household/family verification'
    ],
    restrictedFeatures: [
      'Sabbath Stay hosting / requests'
    ]
  },
  GLOBAL_FAMILY: {
    id: 'GLOBAL_FAMILY',
    name: 'Global Family',
    price: 79,
    billingCycle: '$79 USD/year',
    badge: 'BEST VALUE',
    tagline: 'Complete access to Sabbath stays & Family Exchange',
    description: 'The ultimate combined membership giving your family complete access to the global AdventistStay ecosystem.',
    features: [
      'Everything in Sabbath Member ($39 value)',
      'Everything in Family Exchange ($59 value)',
      'Advanced family profile & matching',
      'Priority support & verification',
      'Full access to global family ecosystem',
      'Covers entire household/family'
    ],
    restrictedFeatures: []
  }
};

/**
 * Calculates the expiration date 12 months (1 year) from the start date.
 */
export function calculateExpirationDate(startDateISO?: string): string {
  const start = startDateISO ? new Date(startDateISO) : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return end.toISOString();
}

/**
 * Checks if a user's membership has expired based on current date.
 */
export function isMembershipExpired(membership?: UserMembership | null): boolean {
  if (!membership) return false;
  if (membership.plan === 'FREE') return false;
  if (membership.status === 'EXPIRED') return true;
  
  const now = new Date();
  const expires = new Date(membership.expirationDate);
  return now > expires;
}

/**
 * Determines current active status considering expiration time.
 */
export function getEffectiveMembershipStatus(membership?: UserMembership | null): MembershipStatus {
  if (!membership) return 'FREE';
  if (membership.plan === 'FREE') return 'FREE';
  if (isMembershipExpired(membership)) return 'EXPIRED';
  return membership.status;
}

/**
 * Check if user can request a Sabbath stay.
 */
export function canRequestStay(membership?: UserMembership | null): boolean {
  if (!membership) return false;
  const status = getEffectiveMembershipStatus(membership);
  if (status !== 'ACTIVE') return false;
  return membership.plan === 'SABBATH_MEMBER' || membership.plan === 'GLOBAL_FAMILY';
}

/**
 * Check if user can host Sabbath stay.
 */
export function canHostStay(membership?: UserMembership | null): boolean {
  if (!membership) return false;
  const status = getEffectiveMembershipStatus(membership);
  if (status !== 'ACTIVE') return false;
  return membership.plan === 'SABBATH_MEMBER' || membership.plan === 'GLOBAL_FAMILY';
}

/**
 * Alias for canHostStay
 */
export function canBecomeHost(membership?: UserMembership | null): boolean {
  return canHostStay(membership);
}

/**
 * Check if user can use Family Exchange.
 */
export function canUseFamilyExchange(membership?: UserMembership | null): boolean {
  if (!membership) return false;
  const status = getEffectiveMembershipStatus(membership);
  if (status !== 'ACTIVE') return false;
  return membership.plan === 'FAMILY_EXCHANGE' || membership.plan === 'GLOBAL_FAMILY';
}

/**
 * Check if user can send direct messages.
 */
export function canSendMessages(membership?: UserMembership | null): boolean {
  if (!membership) return false;
  const status = getEffectiveMembershipStatus(membership);
  if (status !== 'ACTIVE') return false;
  return membership.plan !== 'FREE';
}

/**
 * Calculates upgrade cost considering current plan.
 * Prevents double charging or invalid combined prices.
 */
export function calculateUpgradePrice(currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): number {
  const currentPrice = PLAN_PRICING[currentPlan] || 0;
  const targetPrice = PLAN_PRICING[targetPlan] || 0;

  if (targetPlan === 'FREE') return 0;
  if (currentPlan === targetPlan) return targetPrice; // Renewal

  // Upgrading from Sabbath Member ($39) or Family Exchange ($59) to Global Family ($79)
  if (targetPlan === 'GLOBAL_FAMILY') {
    if (currentPlan === 'SABBATH_MEMBER') return 40; // $79 - $39 = $40
    if (currentPlan === 'FAMILY_EXCHANGE') return 20; // $79 - $59 = $20
  }

  return targetPrice;
}
