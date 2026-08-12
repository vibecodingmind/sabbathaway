import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  Listing, 
  SdaChurch, 
  StayRequest, 
  Message, 
  Review, 
  VerificationRequest, 
  AuditLog, 
  SupportedLanguage, 
  StayPurpose, 
  UserRole,
  FamilyProfile,
  FamilyExchangeRequest,
  FamilyExchangeReview,
  UserMembership,
  SubscriptionPlan,
  PaymentProvider,
  PaymentTransaction,
  SafetyReport,
  StayCategory
} from '../types';
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
  initialFamilyExchangeReviews,
  initialMemberships,
  initialTransactions,
  initialStayCategories
} from '../data/mockData';
import { translations } from '../i18n/translations';
import { 
  sendStayRequestSubmittedNotification, 
  sendStayRequestAcceptedNotification, 
  sendStayRequestDeclinedNotification 
} from '../utils/notificationService';
import { calculateExpirationDate, PLAN_PRICING, getEffectiveMembershipStatus } from '../lib/membershipEngine';
import { PaymentService } from '../lib/paymentAdapter';

export type ActiveTab = 
  | 'EXPLORE' 
  | 'FAMILY_EXCHANGE'
  | 'MAP' 
  | 'VERIFICATION' 
  | 'MY_STAYS' 
  | 'MESSAGES' 
  | 'HOST_MANAGE' 
  | 'ADMIN' 
  | 'DOCS_SRS' 
  | 'SAFETY'
  | 'PRICING'
  | 'MEMBERSHIP';

export interface SearchFilters {
  destination: string;
  country: string;
  purpose: StayPurpose | 'ALL';
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  vegetarianOnly: boolean;
  nearSdaUniversity: boolean;
  verifiedHostsOnly: boolean;
  selectedCategories: string[];
}

export type ExploreViewMode = 'GRID' | 'LIST' | 'MAP';

export type AuthModalMode = 'LOGIN' | 'REGISTER_GUEST' | 'REGISTER_HOST';

interface AppContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setCurrentUserRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  adminSubTab: string;
  setAdminSubTab: (subTab: string) => void;
  hostSubTab: string;
  setHostSubTab: (subTab: string) => void;
  guestSubTab: string;
  setGuestSubTab: (subTab: string) => void;

  // View Mode (Grid / List / Map)
  exploreViewMode: ExploreViewMode;
  setExploreViewMode: (mode: ExploreViewMode) => void;

  // Categories & Admin Management
  stayCategories: StayCategory[];
  addCategory: (cat: Omit<StayCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<StayCategory>) => void;
  toggleCategoryEnabled: (id: string) => void;
  reorderCategories: (categories: StayCategory[]) => void;
  
  // Auth Modal State & Actions
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: AuthModalMode;
  setAuthModalMode: (mode: AuthModalMode) => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  logoutUser: () => void;
  registerUserWithSubscription: (params: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    homeChurchName: string;
    householdName: string;
    plan: SubscriptionPlan;
    provider: PaymentProvider;
  }) => Promise<{ success: boolean; message: string }>;

  // Membership & Subscriptions
  userMembership: UserMembership;
  memberships: UserMembership[];
  transactions: PaymentTransaction[];
  subscribeToPlan: (params: {
    plan: SubscriptionPlan;
    provider: PaymentProvider;
    householdName?: string;
    coveredMembers?: string[];
  }) => Promise<{ success: boolean; message: string }>;
  renewMembership: () => Promise<{ success: boolean; message: string }>;
  cancelMembership: () => void;
  
  // User & Role Management
  users: UserProfile[];
  suspendUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updatedFields: Partial<UserProfile>) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;
  loginAsTestUser: (role: 'ADMIN' | 'HOST' | 'GUEST') => void;

  // Host Management
  approveHost: (hostId: string) => void;
  rejectHost: (hostId: string, reason?: string) => void;
  verifyHost: (hostId: string) => void;

  // Listing Moderation
  approveListing: (listingId: string) => void;
  rejectListing: (listingId: string) => void;
  disableListing: (listingId: string) => void;
  enableListing: (listingId: string) => void;
  updateListing: (listingId: string, updatedFields: Partial<Listing>) => void;
  removeListing: (listingId: string) => void;

  // Safety & Moderation
  safetyReports: SafetyReport[];
  createSafetyReport: (report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => void;
  resolveSafetyReport: (reportId: string, notes?: string) => void;
  deleteReview: (reviewId: string) => void;

  // Pricing Configuration
  planPricing: Record<SubscriptionPlan, number>;
  updatePlanPrice: (plan: SubscriptionPlan, newPrice: number) => void;

  // Upgrade Modal Trigger State
  isUpgradePromptOpen: boolean;
  upgradePromptTarget: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL';
  openUpgradePrompt: (target: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL') => void;
  closeUpgradePrompt: () => void;

  // Data
  listings: Listing[];
  stayRequests: StayRequest[];
  messages: Message[];
  reviews: Review[];
  verifications: VerificationRequest[];
  auditLogs: AuditLog[];
  favorites: string[];

  // Family Exchange Data
  familyProfiles: FamilyProfile[];
  familyExchangeRequests: FamilyExchangeRequest[];
  familyExchangeReviews: FamilyExchangeReview[];
  selectedFamilyProfile: FamilyProfile | null;
  setSelectedFamilyProfile: (family: FamilyProfile | null) => void;
  
  // Selected detail
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  
  // Filters
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;
  
  // Actions
  toggleFavorite: (listingId: string) => void;
  createStayRequest: (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateStayRequestStatus: (requestId: string, status: StayRequest['status'], checkInInstructions?: string) => void;
  sendMessage: (receiverId: string, content: string, stayRequestId?: string) => void;
  submitVerificationRequest: (req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  updateVerificationStatus: (reqId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => void;
  addListing: (listing: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  
  // Family Exchange Actions
  createFamilyExchangeRequest: (req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateFamilyExchangeRequestStatus: (reqId: string, status: FamilyExchangeRequest['status']) => void;
  addFamilyProfile: (family: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>) => void;
  
  // Modals
  isStayModalOpen: boolean;
  setIsStayModalOpen: (open: boolean) => void;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
}

const defaultFilters: SearchFilters = {
  destination: '',
  country: 'ALL',
  purpose: 'ALL',
  checkInDate: '',
  checkOutDate: '',
  guestCount: 1,
  vegetarianOnly: false,
  nearSdaUniversity: false,
  verifiedHostsOnly: false,
  selectedCategories: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('adventiststay_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });
  const [users, setUsers] = useState<UserProfile[]>(initialProfiles);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles[0]); // Default guest
  const [activeTab, setActiveTabState] = useState<ActiveTab>('EXPLORE');
  const [adminSubTab, setAdminSubTab] = useState<string>('OVERVIEW');
  const [hostSubTab, setHostSubTab] = useState<string>('DASHBOARD');
  const [guestSubTab, setGuestSubTab] = useState<string>('REQUESTS');
  const [exploreViewMode, setExploreViewMode] = useState<ExploreViewMode>('GRID');

  // Role-Protected Tab Navigation Handler
  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'ADMIN' && currentUser.role !== 'ADMIN') {
      console.warn('Access Denied: Admin privileges required.');
      if (currentUser.role === 'HOST') {
        setActiveTabState('HOST_MANAGE');
      } else {
        setActiveTabState('MY_STAYS');
      }
      return;
    }
    if (tab === 'HOST_MANAGE' && currentUser.role === 'GUEST') {
      console.warn('Access Denied: Host privileges required.');
      setActiveTabState('MY_STAYS');
      return;
    }
    setActiveTabState(tab);
  };

  // Enforce tab security on currentUser role change
  useEffect(() => {
    if (currentUser.role === 'GUEST' && (activeTab === 'ADMIN' || activeTab === 'HOST_MANAGE')) {
      setActiveTabState('MY_STAYS');
    } else if (currentUser.role === 'HOST' && activeTab === 'ADMIN') {
      setActiveTabState('HOST_MANAGE');
    }
  }, [currentUser.role]);

  // Switch role directly or login as test account
  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const loginAsTestUser = (role: 'ADMIN' | 'HOST' | 'GUEST') => {
    const target = users.find(u => u.role === role) || users[0];
    setCurrentUser(target);
    if (role === 'ADMIN') {
      setActiveTabState('ADMIN');
    } else if (role === 'HOST') {
      setActiveTabState('HOST_MANAGE');
    } else {
      setActiveTabState('MY_STAYS');
    }
  };

  // User Management Handlers
  const suspendUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'SUSPENDED' } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, accountStatus: 'SUSPENDED' }));
    }
  };

  const reactivateUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'ACTIVE' } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, accountStatus: 'ACTIVE' }));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'DEACTIVATED' } : u));
  };

  const updateUser = (userId: string, updatedFields: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
  };

  // Host Management Handlers
  const approveHost = (hostId: string) => {
    setUsers(prev => prev.map(u => u.id === hostId ? { ...u, role: 'HOST', isHostApproved: true, verificationTier: 'ADMIN_VERIFIED' } : u));
  };

  const rejectHost = (hostId: string, _reason?: string) => {
    setUsers(prev => prev.map(u => u.id === hostId ? { ...u, isHostApproved: false } : u));
  };

  const verifyHost = (hostId: string) => {
    setUsers(prev => prev.map(u => u.id === hostId ? { ...u, verificationTier: 'ADMIN_VERIFIED' } : u));
  };

  // Listing Moderation Handlers
  const approveListing = (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, isApproved: true, isDisabled: false } : l));
  };

  const rejectListing = (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, isApproved: false, isDisabled: true } : l));
  };

  const disableListing = (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, isDisabled: true } : l));
  };

  const enableListing = (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, isDisabled: false } : l));
  };

  const updateListing = (listingId: string, updatedFields: Partial<Listing>) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updatedFields } : l));
  };

  const removeListing = (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  // Safety & Moderation Handlers
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([
    {
      id: 'rep-101',
      reporterId: 'user-guest-1',
      reporterName: 'David & Sarah Miller',
      targetType: 'LISTING',
      targetId: 'list-1',
      reason: 'Inaccurate Sabbath information',
      details: 'Check-in time listing conflicted with Friday sunset hours.',
      status: 'OPEN',
      createdAt: new Date().toISOString()
    }
  ]);

  const createSafetyReport = (reportData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => {
    const newRep: SafetyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    setSafetyReports(prev => [newRep, ...prev]);
  };

  const resolveSafetyReport = (reportId: string, _notes?: string) => {
    setSafetyReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'RESOLVED' } : r));
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Plan Pricing Configuration
  const [planPricing, setPlanPricing] = useState<Record<SubscriptionPlan, number>>({
    FREE: 0,
    SABBATH_MEMBER: 39,
    FAMILY_EXCHANGE: 59,
    GLOBAL_FAMILY: 79
  });

  const updatePlanPrice = (plan: SubscriptionPlan, newPrice: number) => {
    setPlanPricing(prev => ({ ...prev, [plan]: newPrice }));
  };

  // Categories State
  const [stayCategories, setStayCategories] = useState<StayCategory[]>(initialStayCategories);

  const addCategory = (catData: Omit<StayCategory, 'id'>) => {
    const newCat: StayCategory = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setStayCategories(prev => [...prev, newCat].sort((a, b) => a.order - b.order));
  };

  const updateCategory = (id: string, updatedFields: Partial<StayCategory>) => {
    setStayCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updatedFields } : cat));
  };

  const toggleCategoryEnabled = (id: string) => {
    setStayCategories(prev => prev.map(cat => cat.id === id ? { ...cat, enabled: !cat.enabled } : cat));
  };

  const reorderCategories = (newOrder: StayCategory[]) => {
    setStayCategories(newOrder);
  };

  
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [churches] = useState<SdaChurch[]>(initialChurches);
  const [stayRequests, setStayRequests] = useState<StayRequest[]>(initialStayRequests);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [memberships, setMemberships] = useState<UserMembership[]>(initialMemberships);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);

  const openAuthModal = (mode: AuthModalMode = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logoutUser = () => {
    // Reset to generic unverified guest mode
    setCurrentUser({
      id: 'guest-anon',
      name: 'Guest Member',
      email: 'guest@adventiststay.org',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'GUEST',
      verificationTier: 'UNVERIFIED',
      homeChurchName: 'SDA Community Church',
      homeChurchCity: 'Global',
      conferenceName: 'General Conference',
      pastorName: 'Pr. Visitor',
      membershipYear: 2026,
      bio: 'Exploring Christian hospitality worldwide.',
      phone: '+1 000 000 0000',
      languagePreference: 'en'
    });
    setActiveTab('EXPLORE');
  };

  const registerUserWithSubscription = async (params: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    homeChurchName: string;
    householdName: string;
    plan: SubscriptionPlan;
    provider: PaymentProvider;
  }): Promise<{ success: boolean; message: string }> => {
    const amount = PLAN_PRICING[params.plan] || 0;

    // First process subscription payment
    const newUserId = `user-${Date.now()}`;
    const { verification, transaction } = await PaymentService.executePayment({
      userId: newUserId,
      userName: params.name,
      userEmail: params.email,
      householdName: params.householdName || `${params.name} Household`,
      plan: params.plan,
      amount,
      currency: 'USD',
      provider: params.provider
    });

    if (!verification.success) {
      return { success: false, message: verification.errorMessage || 'Registration payment failed. Subscription required to register.' };
    }

    const now = new Date().toISOString();
    const expirationDate = calculateExpirationDate(now);

    const newProfile: UserProfile = {
      id: newUserId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      role: params.role,
      verificationTier: 'MEMBER_SUBMITTED',
      homeChurchName: params.homeChurchName || 'Local Seventh-day Adventist Church',
      homeChurchCity: 'SDA Network',
      conferenceName: 'SDA Conference',
      pastorName: 'Local Pastor',
      membershipYear: new Date().getFullYear(),
      bio: `Registered ${params.role === 'HOST' ? 'Host Family' : 'Guest Member'} on AdventistStay.`,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      languagePreference: 'en'
    };

    const newMembership: UserMembership = {
      id: `mem-${Date.now()}`,
      userId: newUserId,
      userName: params.name,
      householdName: params.householdName || `${params.name} Household`,
      coveredMembers: [params.name],
      plan: params.plan,
      price: amount,
      currency: 'USD',
      startDate: now,
      expirationDate,
      paymentReference: verification.transactionRef,
      paymentProvider: params.provider,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };

    setMemberships(prev => [newMembership, ...prev]);
    setTransactions(prev => [transaction, ...prev]);
    setCurrentUser(newProfile);
    setIsAuthModalOpen(false);

    return { success: true, message: `Welcome to AdventistStay! Registration and ${params.plan.replace('_', ' ')} subscription active.` };
  };
  const [upgradePromptTarget, setUpgradePromptTarget] = useState<'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL'>('GENERAL');

  const openUpgradePrompt = (target: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL') => {
    setUpgradePromptTarget(target);
    setIsUpgradePromptOpen(true);
  };

  const closeUpgradePrompt = () => {
    setIsUpgradePromptOpen(false);
  };

  // Derive active user's current membership or default to FREE
  const activeUserMem = memberships.find(m => m.userId === currentUser.id);
  const userMembership: UserMembership = activeUserMem ? {
    ...activeUserMem,
    status: getEffectiveMembershipStatus(activeUserMem)
  } : {
    id: `mem-free-${currentUser.id}`,
    userId: currentUser.id,
    userName: currentUser.name,
    householdName: `${currentUser.name} Household`,
    coveredMembers: [currentUser.name],
    plan: 'FREE',
    price: 0,
    currency: 'USD',
    startDate: new Date().toISOString(),
    expirationDate: calculateExpirationDate(),
    paymentReference: `FREE_REG_${currentUser.id}`,
    paymentProvider: 'free',
    status: 'FREE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const subscribeToPlan = async (params: {
    plan: SubscriptionPlan;
    provider: PaymentProvider;
    householdName?: string;
    coveredMembers?: string[];
  }): Promise<{ success: boolean; message: string }> => {
    const amount = PLAN_PRICING[params.plan] || 0;
    
    try {
      const { verification, transaction } = await PaymentService.executePayment({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        householdName: params.householdName || `${currentUser.name} Household`,
        plan: params.plan,
        amount,
        currency: 'USD',
        provider: params.provider
      });

      if (!verification.success) {
        return { success: false, message: verification.errorMessage || 'Payment verification failed.' };
      }

      const now = new Date().toISOString();
      const expirationDate = calculateExpirationDate(now);

      const newMembership: UserMembership = {
        id: `mem-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        householdName: params.householdName || `${currentUser.name} Household`,
        coveredMembers: params.coveredMembers && params.coveredMembers.length > 0 ? params.coveredMembers : [currentUser.name],
        plan: params.plan,
        price: amount,
        currency: 'USD',
        startDate: now,
        expirationDate,
        paymentReference: verification.transactionRef,
        paymentProvider: params.provider,
        status: params.plan === 'FREE' ? 'FREE' : 'ACTIVE',
        createdAt: now,
        updatedAt: now
      };

      setMemberships(prev => [newMembership, ...prev.filter(m => m.userId !== currentUser.id)]);
      setTransactions(prev => [transaction, ...prev]);

      // Add audit log entry
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'MEMBERSHIP_SUBSCRIBED',
        details: `Subscribed to ${params.plan} plan via ${params.provider} ($${amount}/yr)`,
        timestamp: now,
        ipAddress: '127.0.0.1'
      };
      setAuditLogs(prev => [log, ...prev]);

      return { success: true, message: `Successfully subscribed to ${params.plan.replace('_', ' ')} membership!` };
    } catch (err) {
      return { success: false, message: (err as Error).message || 'An error occurred during subscription.' };
    }
  };

  const renewMembership = async (): Promise<{ success: boolean; message: string }> => {
    if (userMembership.plan === 'FREE') {
      return { success: false, message: 'Free memberships do not require renewal.' };
    }

    return subscribeToPlan({
      plan: userMembership.plan,
      provider: userMembership.paymentProvider === 'free' ? 'stripe' : userMembership.paymentProvider,
      householdName: userMembership.householdName,
      coveredMembers: userMembership.coveredMembers
    });
  };

  const cancelMembership = () => {
    setMemberships(prev => prev.map(m => m.userId === currentUser.id ? { ...m, status: 'CANCELLED', updatedAt: new Date().toISOString() } : m));
  };

  const [reviews, setReviews] = useState<Review[]>(initialReviews);


  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);

    // Update listing rating and count
    setListings(prevListings => prevListings.map(lst => {
      if (lst.id === reviewData.listingId) {
        const newCount = lst.reviewCount + 1;
        const newRating = Number(((lst.rating * lst.reviewCount + reviewData.rating) / newCount).toFixed(1));
        return {
          ...lst,
          reviewCount: newCount,
          rating: newRating
        };
      }
      return lst;
    }));
  };
  const [verifications, setVerifications] = useState<VerificationRequest[]>(initialVerificationRequests);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [favorites, setFavorites] = useState<string[]>(['list-1']);
  
  // Family Exchange State
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>(initialFamilyProfiles);
  const [familyExchangeRequests, setFamilyExchangeRequests] = useState<FamilyExchangeRequest[]>(initialFamilyExchangeRequests);
  const [familyExchangeReviews, setFamilyExchangeReviews] = useState<FamilyExchangeReview[]>(initialFamilyExchangeReviews);
  const [selectedFamilyProfile, setSelectedFamilyProfile] = useState<FamilyProfile | null>(null);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('adventiststay_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => 
      prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );
  };

  const createStayRequest = (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: StayRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setStayRequests(prev => [newReq, ...prev]);

    // Send mock email notification to host
    sendStayRequestSubmittedNotification(newReq);

    // System audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'STAY_REQUEST_CREATED',
      details: `Created stay request for ${req.listingTitle} (${req.checkInDate} to ${req.checkOutDate})`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const updateStayRequestStatus = (requestId: string, status: StayRequest['status'], checkInInstructions?: string) => {
    setStayRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          ...(checkInInstructions ? { checkInInstructions } : {})
        };
      }
      return r;
    }));

    const req = stayRequests.find(r => r.id === requestId);
    if (req) {
      if (status === 'APPROVED') {
        // Send email notification to guest
        sendStayRequestAcceptedNotification(req, 'guest@adventiststay.org', checkInInstructions);

        const autoMsg: Message = {
          id: `msg-${Date.now()}`,
          stayRequestId: requestId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatarUrl,
          receiverId: req.guestId,
          content: `Your stay request for ${req.listingTitle} has been approved! ${checkInInstructions || 'We look forward to hosting you.'}`,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        setMessages(prev => [...prev, autoMsg]);
      } else if (status === 'DECLINED') {
        sendStayRequestDeclinedNotification(req);
      }
    }
  };

  const sendMessage = (receiverId: string, content: string, stayRequestId?: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      stayRequestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const submitVerificationRequest = (req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newV: VerificationRequest = {
      ...req,
      id: `vreq-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString()
    };
    setVerifications(prev => [newV, ...prev]);
  };

  const updateVerificationStatus = (reqId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    setVerifications(prev => prev.map(v => {
      if (v.id === reqId) {
        return {
          ...v,
          status,
          reviewedBy: currentUser.name,
          notes
        };
      }
      return v;
    }));
  };

  const addListing = (newListingData: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'>) => {
    const newListing: Listing = {
      ...newListingData,
      id: `list-${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatarUrl,
      hostChurchName: currentUser.homeChurchName,
      hostVerificationTier: currentUser.verificationTier,
      rating: 5.0,
      reviewCount: 0
    };
    setListings(prev => [newListing, ...prev]);
  };

  const createFamilyExchangeRequest = (req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: FamilyExchangeRequest = {
      ...req,
      id: `exreq-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setFamilyExchangeRequests(prev => [newReq, ...prev]);

    // Send notification message
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: req.requesterFamilyName,
      senderAvatar: req.requesterAvatar,
      receiverId: req.targetFamilyId,
      content: `Greetings! ${req.requesterFamilyName} from ${req.requesterCountry} sent a Family Exchange request (${req.exchangeType.replace('_', ' ')}) for ${req.proposedMonth}.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, msg]);
  };

  const updateFamilyExchangeRequestStatus = (reqId: string, status: FamilyExchangeRequest['status']) => {
    setFamilyExchangeRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const addFamilyProfile = (familyData: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>) => {
    const newFamily: FamilyProfile = {
      ...familyData,
      id: `family-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0
    };
    setFamilyProfiles(prev => [newFamily, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      theme,
      toggleTheme,
      currentUser,
      setCurrentUser,
      setCurrentUserRole,
      activeTab,
      setActiveTab,
      adminSubTab,
      setAdminSubTab,
      hostSubTab,
      setHostSubTab,
      guestSubTab,
      setGuestSubTab,
      exploreViewMode,
      setExploreViewMode,
      stayCategories,
      addCategory,
      updateCategory,
      toggleCategoryEnabled,
      reorderCategories,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      openAuthModal,
      closeAuthModal,
      logoutUser,
      registerUserWithSubscription,
      userMembership,
      memberships,
      transactions,
      subscribeToPlan,
      renewMembership,
      cancelMembership,
      users,
      suspendUser,
      reactivateUser,
      deleteUser,
      updateUser,
      changeUserRole,
      loginAsTestUser,
      approveHost,
      rejectHost,
      verifyHost,
      approveListing,
      rejectListing,
      disableListing,
      enableListing,
      updateListing,
      removeListing,
      safetyReports,
      createSafetyReport,
      resolveSafetyReport,
      deleteReview,
      planPricing,
      updatePlanPrice,
      isUpgradePromptOpen,
      upgradePromptTarget,
      openUpgradePrompt,
      closeUpgradePrompt,
      listings,
      stayRequests,
      messages,
      reviews,
      verifications,
      auditLogs,
      favorites,
      familyProfiles,
      familyExchangeRequests,
      familyExchangeReviews,
      selectedFamilyProfile,
      setSelectedFamilyProfile,
      selectedListing,
      setSelectedListing,
      filters,
      setFilters,
      resetFilters,
      toggleFavorite,
      createStayRequest,
      updateStayRequestStatus,
      sendMessage,
      submitVerificationRequest,
      updateVerificationStatus,
      addListing,
      addReview,
      createFamilyExchangeRequest,
      updateFamilyExchangeRequestStatus,
      addFamilyProfile,
      isStayModalOpen,
      setIsStayModalOpen,
      isSafetyModalOpen,
      setIsSafetyModalOpen
    }}>

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
