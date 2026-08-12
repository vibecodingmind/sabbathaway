import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  StayCategory,
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
  initialStayCategories,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import {
  sendStayRequestSubmittedNotification,
  sendStayRequestAcceptedNotification,
  sendStayRequestDeclinedNotification,
} from '../utils/notificationService';
import { calculateExpirationDate, PLAN_PRICING, getEffectiveMembershipStatus } from '../lib/membershipEngine';
import { PaymentService } from '../lib/paymentAdapter';
import { api, setAuthToken, getAuthToken, ApiError } from '../lib/apiClient';

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

const ANON_GUEST: UserProfile = {
  id: 'guest-anon',
  name: 'Guest Member',
  email: 'guest@adventiststay.org',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'GUEST',
  verificationTier: 'UNVERIFIED',
  homeChurchName: 'SDA Community Church',
  homeChurchCity: 'Global',
  conferenceName: 'General Conference',
  pastorName: 'Pr. Visitor',
  membershipYear: 2026,
  bio: 'Exploring Christian hospitality worldwide.',
  phone: '+1 000 000 0000',
  languagePreference: 'en',
};

const DEFAULT_PLAN_PRICING: Record<SubscriptionPlan, number> = {
  FREE: 0,
  SABBATH_MEMBER: 39,
  FAMILY_EXCHANGE: 59,
  GLOBAL_FAMILY: 79,
};

const INITIAL_SAFETY_REPORTS: SafetyReport[] = [
  {
    id: 'rep-101',
    reporterId: 'user-guest-1',
    reporterName: 'David & Sarah Miller',
    targetType: 'LISTING',
    targetId: 'list-1',
    reason: 'Inaccurate Sabbath information',
    details: 'Check-in time listing conflicted with Friday sunset hours.',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
];

interface BootstrapPayload {
  listings?: Listing[];
  churches?: SdaChurch[];
  users?: UserProfile[];
  stayRequests?: StayRequest[];
  messages?: Message[];
  reviews?: Review[];
  verifications?: VerificationRequest[];
  auditLogs?: AuditLog[];
  memberships?: UserMembership[];
  transactions?: PaymentTransaction[];
  familyProfiles?: FamilyProfile[];
  familyExchangeRequests?: FamilyExchangeRequest[];
  familyExchangeReviews?: FamilyExchangeReview[];
  stayCategories?: StayCategory[];
  favorites?: string[];
  safetyReports?: SafetyReport[];
  currentUser?: UserProfile | null;
  planPricing?: Record<SubscriptionPlan, number>;
}

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

  exploreViewMode: ExploreViewMode;
  setExploreViewMode: (mode: ExploreViewMode) => void;

  isBootstrapping?: boolean;
  apiOnline?: boolean;

  stayCategories: StayCategory[];
  addCategory: (cat: Omit<StayCategory, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<StayCategory>) => void;
  toggleCategoryEnabled: (id: string) => void;
  reorderCategories: (categories: StayCategory[]) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: AuthModalMode;
  setAuthModalMode: (mode: AuthModalMode) => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  logoutUser: () => void;
  loginWithPassword?: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
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

  users: UserProfile[];
  suspendUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updatedFields: Partial<UserProfile>) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;
  loginAsTestUser: (role: 'ADMIN' | 'HOST' | 'GUEST') => void;

  approveHost: (hostId: string) => void;
  rejectHost: (hostId: string, reason?: string) => void;
  verifyHost: (hostId: string) => void;

  approveListing: (listingId: string) => void;
  rejectListing: (listingId: string) => void;
  disableListing: (listingId: string) => void;
  enableListing: (listingId: string) => void;
  updateListing: (listingId: string, updatedFields: Partial<Listing>) => void;
  removeListing: (listingId: string) => void;

  safetyReports: SafetyReport[];
  createSafetyReport: (report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => void;
  resolveSafetyReport: (reportId: string, notes?: string) => void;
  deleteReview: (reviewId: string) => void;

  planPricing: Record<SubscriptionPlan, number>;
  updatePlanPrice: (plan: SubscriptionPlan, newPrice: number) => void;

  isUpgradePromptOpen: boolean;
  upgradePromptTarget: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL';
  openUpgradePrompt: (target: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL') => void;
  closeUpgradePrompt: () => void;

  isPaymentCheckoutOpen: boolean;
  setIsPaymentCheckoutOpen: (open: boolean) => void;
  checkoutTargetPlan: SubscriptionPlan;
  setCheckoutTargetPlan: (plan: SubscriptionPlan) => void;

  listings: Listing[];
  churches: SdaChurch[];
  stayRequests: StayRequest[];
  messages: Message[];
  reviews: Review[];
  verifications: VerificationRequest[];
  auditLogs: AuditLog[];
  favorites: string[];

  familyProfiles: FamilyProfile[];
  familyExchangeRequests: FamilyExchangeRequest[];
  familyExchangeReviews: FamilyExchangeReview[];
  selectedFamilyProfile: FamilyProfile | null;
  setSelectedFamilyProfile: (family: FamilyProfile | null) => void;

  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;

  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;

  toggleFavorite: (listingId: string) => void;
  createStayRequest: (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateStayRequestStatus: (requestId: string, status: StayRequest['status'], checkInInstructions?: string) => void;
  sendMessage: (receiverId: string, content: string, stayRequestId?: string) => void;
  submitVerificationRequest: (req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  updateVerificationStatus: (reqId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => void;
  addListing: (listing: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

  createFamilyExchangeRequest: (req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateFamilyExchangeRequestStatus: (reqId: string, status: FamilyExchangeRequest['status']) => void;
  addFamilyProfile: (family: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>) => void;

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
  selectedCategories: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('adventiststay_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>(initialProfiles);
  const [currentUser, setCurrentUser] = useState<UserProfile>(ANON_GUEST);
  const [activeTab, setActiveTabState] = useState<ActiveTab>('EXPLORE');
  const [adminSubTab, setAdminSubTab] = useState<string>('OVERVIEW');
  const [hostSubTab, setHostSubTab] = useState<string>('DASHBOARD');
  const [guestSubTab, setGuestSubTab] = useState<string>('REQUESTS');
  const [exploreViewMode, setExploreViewMode] = useState<ExploreViewMode>('GRID');

  const [stayCategories, setStayCategories] = useState<StayCategory[]>(initialStayCategories);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [churches, setChurches] = useState<SdaChurch[]>(initialChurches);
  const [stayRequests, setStayRequests] = useState<StayRequest[]>(initialStayRequests);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [memberships, setMemberships] = useState<UserMembership[]>(initialMemberships);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(initialVerificationRequests);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [favorites, setFavorites] = useState<string[]>(['list-1']);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>(initialFamilyProfiles);
  const [familyExchangeRequests, setFamilyExchangeRequests] = useState<FamilyExchangeRequest[]>(initialFamilyExchangeRequests);
  const [familyExchangeReviews, setFamilyExchangeReviews] = useState<FamilyExchangeReview[]>(initialFamilyExchangeReviews);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>(INITIAL_SAFETY_REPORTS);
  const [planPricing, setPlanPricing] = useState<Record<SubscriptionPlan, number>>(DEFAULT_PLAN_PRICING);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);
  const [isPaymentCheckoutOpen, setIsPaymentCheckoutOpen] = useState(false);
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<SubscriptionPlan>('SABBATH_MEMBER');
  const [upgradePromptTarget, setUpgradePromptTarget] = useState<
    'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL'
  >('GENERAL');
  const [selectedFamilyProfile, setSelectedFamilyProfile] = useState<FamilyProfile | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const applyBootstrapData = useCallback((data: BootstrapPayload) => {
    if (data.listings) setListings(data.listings);
    if (data.churches) setChurches(data.churches);
    if (data.users) setUsers(data.users);
    if (data.stayRequests) setStayRequests(data.stayRequests);
    if (data.messages) setMessages(data.messages);
    if (data.reviews) setReviews(data.reviews);
    if (data.verifications) setVerifications(data.verifications);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    if (data.memberships) setMemberships(data.memberships);
    if (data.transactions) setTransactions(data.transactions);
    if (data.familyProfiles) setFamilyProfiles(data.familyProfiles);
    if (data.familyExchangeRequests) setFamilyExchangeRequests(data.familyExchangeRequests);
    if (data.familyExchangeReviews) setFamilyExchangeReviews(data.familyExchangeReviews);
    if (data.stayCategories) setStayCategories(data.stayCategories);
    if (data.favorites) setFavorites(data.favorites);
    if (data.safetyReports) setSafetyReports(data.safetyReports);
    if (data.planPricing) setPlanPricing(data.planPricing);
    if (data.currentUser) {
      setCurrentUser(data.currentUser);
    } else if (!getAuthToken()) {
      setCurrentUser(ANON_GUEST);
    }
  }, []);

  const refreshFromApi = useCallback(async (): Promise<boolean> => {
    try {
      const data = (await api.bootstrap()) as BootstrapPayload;
      applyBootstrapData(data);
      return true;
    } catch (err) {
      console.error('refreshFromApi failed:', err);
      return false;
    }
  }, [applyBootstrapData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await api.bootstrap()) as BootstrapPayload;
        if (!cancelled) {
          applyBootstrapData(data);
          setApiOnline(true);
        }
      } catch (err) {
        console.error('Bootstrap failed, using mock data fallback:', err);
        if (!cancelled) setApiOnline(false);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyBootstrapData]);

  const navigateByRole = (role: 'ADMIN' | 'HOST' | 'GUEST') => {
    if (role === 'ADMIN') setActiveTabState('ADMIN');
    else if (role === 'HOST') setActiveTabState('HOST_MANAGE');
    else setActiveTabState('MY_STAYS');
  };

  const syncUser = (user: UserProfile) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) return prev.map((u) => (u.id === user.id ? user : u));
      return [user, ...prev];
    });
    setCurrentUser((prev) => (prev.id === user.id ? user : prev));
  };

  const patchListing = (listing: Listing) => {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      if (exists) return prev.map((l) => (l.id === listing.id ? listing : l));
      return [listing, ...prev];
    });
  };

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'ADMIN' && currentUser.role !== 'ADMIN') {
      console.warn('Access Denied: Admin privileges required.');
      if (currentUser.role === 'HOST') setActiveTabState('HOST_MANAGE');
      else setActiveTabState('MY_STAYS');
      return;
    }
    if (tab === 'HOST_MANAGE' && currentUser.role === 'GUEST') {
      console.warn('Access Denied: Host privileges required.');
      setActiveTabState('MY_STAYS');
      return;
    }
    setActiveTabState(tab);
  };

  useEffect(() => {
    if (currentUser.role === 'GUEST' && (activeTab === 'ADMIN' || activeTab === 'HOST_MANAGE')) {
      setActiveTabState('MY_STAYS');
    } else if (currentUser.role === 'HOST' && activeTab === 'ADMIN') {
      setActiveTabState('HOST_MANAGE');
    }
  }, [currentUser.role, activeTab]);

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

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const t = (key: string): string =>
    translations[language]?.[key] || translations['en']?.[key] || key;

  const resetFilters = () => setFilters(defaultFilters);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const loginAsTestUser = (role: 'ADMIN' | 'HOST' | 'GUEST') => {
    if (apiOnline) {
      api
        .demoLogin(role)
        .then(async ({ token, user }) => {
          setAuthToken(token);
          setCurrentUser(user as UserProfile);
          await refreshFromApi();
          navigateByRole(role);
        })
        .catch((err) => console.error('demoLogin failed:', err));
      return;
    }
    const target = users.find((u) => u.role === role) || users[0];
    setCurrentUser(target);
    navigateByRole(role);
  };

  const loginWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!apiOnline) {
      const match = users.find((u) => u.email === email);
      if (!match) return { success: false, message: 'Invalid email or password.' };
      setCurrentUser(match);
      navigateByRole(match.role === 'ADMIN' ? 'ADMIN' : match.role === 'HOST' ? 'HOST' : 'GUEST');
      return { success: true, message: 'Signed in (offline mode).' };
    }
    try {
      const { token, user } = await api.login(email, password);
      setAuthToken(token);
      setCurrentUser(user as UserProfile);
      await refreshFromApi();
      const role = (user as UserProfile).role;
      navigateByRole(role === 'ADMIN' ? 'ADMIN' : role === 'HOST' ? 'HOST' : 'GUEST');
      return { success: true, message: 'Signed in successfully.' };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed.';
      console.error('loginWithPassword failed:', err);
      return { success: false, message };
    }
  };

  const logoutUser = () => {
    setAuthToken(null);
    setCurrentUser(ANON_GUEST);
    setActiveTab('EXPLORE');
    if (apiOnline) {
      api
        .bootstrap()
        .then((data) => applyBootstrapData(data as BootstrapPayload))
        .catch((err) => console.error('Post-logout bootstrap failed:', err));
    }
  };

  const suspendUserLocal = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: 'SUSPENDED' } : u)));
    setCurrentUser((prev) =>
      prev.id === userId ? { ...prev, accountStatus: 'SUSPENDED' } : prev
    );
  };

  const suspendUser = (userId: string) => {
    if (apiOnline) {
      api
        .suspendUser(userId)
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('suspendUser failed:', err));
      return;
    }
    suspendUserLocal(userId);
  };

  const reactivateUserLocal = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: 'ACTIVE' } : u)));
    setCurrentUser((prev) =>
      prev.id === userId ? { ...prev, accountStatus: 'ACTIVE' } : prev
    );
  };

  const reactivateUser = (userId: string) => {
    if (apiOnline) {
      api
        .reactivateUser(userId)
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('reactivateUser failed:', err));
      return;
    }
    reactivateUserLocal(userId);
  };

  const deleteUserLocal = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: 'DEACTIVATED' } : u))
    );
  };

  const deleteUser = (userId: string) => {
    if (apiOnline) {
      api
        .deleteUser(userId)
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('deleteUser failed:', err));
      return;
    }
    deleteUserLocal(userId);
  };

  const updateUserLocal = (userId: string, updatedFields: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u)));
    setCurrentUser((prev) => (prev.id === userId ? { ...prev, ...updatedFields } : prev));
  };

  const updateUser = (userId: string, updatedFields: Partial<UserProfile>) => {
    if (apiOnline) {
      api
        .updateUser(userId, updatedFields as Record<string, unknown>)
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('updateUser failed:', err));
      return;
    }
    updateUserLocal(userId, updatedFields);
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    if (apiOnline) {
      api
        .updateUser(userId, { role: newRole })
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('changeUserRole failed:', err));
      return;
    }
    updateUserLocal(userId, { role: newRole });
  };

  const approveHost = (hostId: string) => {
    const fields = { role: 'HOST' as UserRole, isHostApproved: true, verificationTier: 'ADMIN_VERIFIED' as const };
    if (apiOnline) {
      api
        .updateUser(hostId, fields)
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('approveHost failed:', err));
      return;
    }
    updateUserLocal(hostId, fields);
  };

  const rejectHost = (hostId: string, _reason?: string) => {
    if (apiOnline) {
      api
        .updateUser(hostId, { isHostApproved: false })
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('rejectHost failed:', err));
      return;
    }
    updateUserLocal(hostId, { isHostApproved: false });
  };

  const verifyHost = (hostId: string) => {
    if (apiOnline) {
      api
        .updateUser(hostId, { verificationTier: 'ADMIN_VERIFIED' })
        .then((user) => syncUser(user as UserProfile))
        .catch((err) => console.error('verifyHost failed:', err));
      return;
    }
    updateUserLocal(hostId, { verificationTier: 'ADMIN_VERIFIED' });
  };

  const approveListingLocal = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, isApproved: true, isDisabled: false } : l
      )
    );
  };

  const approveListing = (listingId: string) => {
    if (apiOnline) {
      api
        .approveListing(listingId)
        .then((listing) => patchListing(listing as Listing))
        .catch((err) => console.error('approveListing failed:', err));
      return;
    }
    approveListingLocal(listingId);
  };

  const rejectListingLocal = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, isApproved: false, isDisabled: true } : l
      )
    );
  };

  const rejectListing = (listingId: string) => {
    if (apiOnline) {
      api
        .rejectListing(listingId)
        .then((listing) => patchListing(listing as Listing))
        .catch((err) => console.error('rejectListing failed:', err));
      return;
    }
    rejectListingLocal(listingId);
  };

  const disableListingLocal = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, isDisabled: true } : l)));
  };

  const disableListing = (listingId: string) => {
    if (apiOnline) {
      api
        .disableListing(listingId)
        .then((listing) => patchListing(listing as Listing))
        .catch((err) => console.error('disableListing failed:', err));
      return;
    }
    disableListingLocal(listingId);
  };

  const enableListingLocal = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, isDisabled: false } : l)));
  };

  const enableListing = (listingId: string) => {
    if (apiOnline) {
      api
        .enableListing(listingId)
        .then((listing) => patchListing(listing as Listing))
        .catch((err) => console.error('enableListing failed:', err));
      return;
    }
    enableListingLocal(listingId);
  };

  const updateListingLocal = (listingId: string, updatedFields: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, ...updatedFields } : l)));
  };

  const updateListing = (listingId: string, updatedFields: Partial<Listing>) => {
    if (apiOnline) {
      api
        .updateListing(listingId, updatedFields as Record<string, unknown>)
        .then((listing) => patchListing(listing as Listing))
        .catch((err) => console.error('updateListing failed:', err));
      return;
    }
    updateListingLocal(listingId, updatedFields);
  };

  const removeListingLocal = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  const removeListing = (listingId: string) => {
    if (apiOnline) {
      api
        .removeListing(listingId)
        .then(() => removeListingLocal(listingId))
        .catch((err) => console.error('removeListing failed:', err));
      return;
    }
    removeListingLocal(listingId);
  };

  const createSafetyReportLocal = (
    reportData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>
  ) => {
    const newRep: SafetyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    setSafetyReports((prev) => [newRep, ...prev]);
  };

  const createSafetyReport = (
    reportData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>
  ) => {
    if (apiOnline) {
      api
        .createSafetyReport(reportData as Record<string, unknown>)
        .then((report) =>
          setSafetyReports((prev) => [report as SafetyReport, ...prev])
        )
        .catch((err) => console.error('createSafetyReport failed:', err));
      return;
    }
    createSafetyReportLocal(reportData);
  };

  const resolveSafetyReportLocal = (reportId: string) => {
    setSafetyReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r))
    );
  };

  const resolveSafetyReport = (reportId: string, _notes?: string) => {
    if (apiOnline) {
      api
        .resolveSafetyReport(reportId)
        .then((report) =>
          setSafetyReports((prev) =>
            prev.map((r) => (r.id === reportId ? (report as SafetyReport) : r))
          )
        )
        .catch((err) => console.error('resolveSafetyReport failed:', err));
      return;
    }
    resolveSafetyReportLocal(reportId);
  };

  const deleteReviewLocal = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const deleteReview = (reviewId: string) => {
    if (apiOnline) {
      api
        .deleteReview(reviewId)
        .then(() => deleteReviewLocal(reviewId))
        .catch((err) => console.error('deleteReview failed:', err));
      return;
    }
    deleteReviewLocal(reviewId);
  };

  const updatePlanPrice = (plan: SubscriptionPlan, newPrice: number) => {
    setPlanPricing((prev) => ({ ...prev, [plan]: newPrice }));
  };

  const addCategoryLocal = (catData: Omit<StayCategory, 'id'>) => {
    const newCat: StayCategory = { ...catData, id: `cat-${Date.now()}` };
    setStayCategories((prev) => [...prev, newCat].sort((a, b) => a.order - b.order));
  };

  const addCategory = (catData: Omit<StayCategory, 'id'>) => {
    if (apiOnline) {
      api
        .addCategory(catData as Record<string, unknown>)
        .then((cat) =>
          setStayCategories((prev) =>
            [...prev, cat as StayCategory].sort((a, b) => a.order - b.order)
          )
        )
        .catch((err) => console.error('addCategory failed:', err));
      return;
    }
    addCategoryLocal(catData);
  };

  const updateCategoryLocal = (id: string, updatedFields: Partial<StayCategory>) => {
    setStayCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat))
    );
  };

  const updateCategory = (id: string, updatedFields: Partial<StayCategory>) => {
    if (apiOnline) {
      api
        .updateCategory(id, updatedFields as Record<string, unknown>)
        .then((cat) =>
          setStayCategories((prev) =>
            prev.map((c) => (c.id === id ? (cat as StayCategory) : c))
          )
        )
        .catch((err) => console.error('updateCategory failed:', err));
      return;
    }
    updateCategoryLocal(id, updatedFields);
  };

  const toggleCategoryEnabled = (id: string) => {
    const cat = stayCategories.find((c) => c.id === id);
    if (!cat) return;
    updateCategory(id, { enabled: !cat.enabled });
  };

  const reorderCategories = (newOrder: StayCategory[]) => {
    setStayCategories(newOrder);
    if (apiOnline) {
      newOrder.forEach((cat, index) => {
        api.updateCategory(cat.id, { order: index }).catch((err) =>
          console.error('reorderCategories failed:', err)
        );
      });
    }
  };

  const openAuthModal = (mode: AuthModalMode = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openUpgradePrompt = (
    target: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL'
  ) => {
    setUpgradePromptTarget(target);
    setIsUpgradePromptOpen(true);
  };

  const closeUpgradePrompt = () => setIsUpgradePromptOpen(false);

  const activeUserMem = memberships.find((m) => m.userId === currentUser.id);
  const userMembership: UserMembership = activeUserMem
    ? { ...activeUserMem, status: getEffectiveMembershipStatus(activeUserMem) }
    : {
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
        updatedAt: new Date().toISOString(),
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
    if (apiOnline) {
      try {
        const result = await api.register({
          name: params.name,
          email: params.email,
          phone: params.phone,
          role: params.role,
          homeChurchName: params.homeChurchName,
          householdName: params.householdName,
          plan: params.plan,
          provider: params.provider,
          password: 'password123',
        });
        setAuthToken(result.token);
        setCurrentUser(result.user as UserProfile);
        await refreshFromApi();
        setIsAuthModalOpen(false);
        return {
          success: true,
          message: `Welcome to AdventistStay! Registration and ${params.plan.replace('_', ' ')} subscription active.`,
        };
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Registration failed.';
        console.error('registerUserWithSubscription failed:', err);
        return { success: false, message };
      }
    }

    const amount = PLAN_PRICING[params.plan] || 0;
    const newUserId = `user-${Date.now()}`;
    const { verification, transaction } = await PaymentService.executePayment({
      userId: newUserId,
      userName: params.name,
      userEmail: params.email,
      householdName: params.householdName || `${params.name} Household`,
      plan: params.plan,
      amount,
      currency: 'USD',
      provider: params.provider,
    });

    if (!verification.success) {
      return {
        success: false,
        message:
          verification.errorMessage ||
          'Registration payment failed. Subscription required to register.',
      };
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
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      languagePreference: 'en',
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
      updatedAt: now,
    };

    setMemberships((prev) => [newMembership, ...prev]);
    setTransactions((prev) => [transaction, ...prev]);
    setCurrentUser(newProfile);
    setIsAuthModalOpen(false);

    return {
      success: true,
      message: `Welcome to AdventistStay! Registration and ${params.plan.replace('_', ' ')} subscription active.`,
    };
  };

  const subscribeToPlan = async (params: {
    plan: SubscriptionPlan;
    provider: PaymentProvider;
    householdName?: string;
    coveredMembers?: string[];
  }): Promise<{ success: boolean; message: string }> => {
    if (apiOnline) {
      try {
        await api.subscribe({
          plan: params.plan,
          provider: params.provider,
          householdName: params.householdName,
          coveredMembers: params.coveredMembers,
        });
        await refreshFromApi();
        return {
          success: true,
          message: `Successfully subscribed to ${params.plan.replace('_', ' ')} membership!`,
        };
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Subscription failed.';
        console.error('subscribeToPlan failed:', err);
        return { success: false, message };
      }
    }

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
        provider: params.provider,
      });

      if (!verification.success) {
        return {
          success: false,
          message: verification.errorMessage || 'Payment verification failed.',
        };
      }

      const now = new Date().toISOString();
      const expirationDate = calculateExpirationDate(now);

      const newMembership: UserMembership = {
        id: `mem-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        householdName: params.householdName || `${currentUser.name} Household`,
        coveredMembers:
          params.coveredMembers && params.coveredMembers.length > 0
            ? params.coveredMembers
            : [currentUser.name],
        plan: params.plan,
        price: amount,
        currency: 'USD',
        startDate: now,
        expirationDate,
        paymentReference: verification.transactionRef,
        paymentProvider: params.provider,
        status: params.plan === 'FREE' ? 'FREE' : 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };

      setMemberships((prev) => [
        newMembership,
        ...prev.filter((m) => m.userId !== currentUser.id),
      ]);
      setTransactions((prev) => [transaction, ...prev]);

      const log: AuditLog = {
        id: `log-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'MEMBERSHIP_SUBSCRIBED',
        details: `Subscribed to ${params.plan} plan via ${params.provider} ($${amount}/yr)`,
        timestamp: now,
        ipAddress: '127.0.0.1',
      };
      setAuditLogs((prev) => [log, ...prev]);

      return {
        success: true,
        message: `Successfully subscribed to ${params.plan.replace('_', ' ')} membership!`,
      };
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
      provider:
        userMembership.paymentProvider === 'free' ? 'stripe' : userMembership.paymentProvider,
      householdName: userMembership.householdName,
      coveredMembers: userMembership.coveredMembers,
    });
  };

  const cancelMembershipLocal = () => {
    setMemberships((prev) =>
      prev.map((m) =>
        m.userId === currentUser.id
          ? { ...m, status: 'CANCELLED', updatedAt: new Date().toISOString() }
          : m
      )
    );
  };

  const cancelMembership = () => {
    if (apiOnline) {
      api
        .cancelMembership()
        .then((membership) => {
          setMemberships((prev) => {
            const exists = prev.some((m) => m.id === (membership as UserMembership).id);
            if (exists) {
              return prev.map((m) =>
                m.id === (membership as UserMembership).id ? (membership as UserMembership) : m
              );
            }
            return [(membership as UserMembership), ...prev];
          });
        })
        .catch((err) => console.error('cancelMembership failed:', err));
      return;
    }
    cancelMembershipLocal();
  };

  const addReviewLocal = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);
    setListings((prevListings) =>
      prevListings.map((lst) => {
        if (lst.id === reviewData.listingId) {
          const newCount = lst.reviewCount + 1;
          const newRating = Number(
            ((lst.rating * lst.reviewCount + reviewData.rating) / newCount).toFixed(1)
          );
          return { ...lst, reviewCount: newCount, rating: newRating };
        }
        return lst;
      })
    );
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    if (apiOnline) {
      api
        .addReview(reviewData as Record<string, unknown>)
        .then(async (review) => {
          setReviews((prev) => [review as Review, ...prev]);
          await refreshFromApi();
        })
        .catch((err) => console.error('addReview failed:', err));
      return;
    }
    addReviewLocal(reviewData);
  };

  const toggleFavoriteLocal = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const toggleFavorite = (listingId: string) => {
    if (apiOnline) {
      api
        .toggleFavorite(listingId)
        .then((result) => {
          if (Array.isArray(result.favorites)) {
            setFavorites(result.favorites);
            return;
          }
          setFavorites((prev) =>
            result.favorited
              ? prev.includes(listingId)
                ? prev
                : [...prev, listingId]
              : prev.filter((id) => id !== listingId)
          );
        })
        .catch((err) => console.error('toggleFavorite failed:', err));
      return;
    }
    toggleFavoriteLocal(listingId);
  };

  const createStayRequestLocal = (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: StayRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setStayRequests((prev) => [newReq, ...prev]);
    sendStayRequestSubmittedNotification(newReq);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'STAY_REQUEST_CREATED',
      details: `Created stay request for ${req.listingTitle} (${req.checkInDate} to ${req.checkOutDate})`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const createStayRequest = (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => {
    if (apiOnline) {
      api
        .createStay({
          listingId: req.listingId,
          checkInDate: req.checkInDate,
          checkOutDate: req.checkOutDate,
          guestCount: req.guestCount,
          purpose: req.purpose,
          purposeNote: req.purposeNote,
        })
        .then((stay) => setStayRequests((prev) => [stay as StayRequest, ...prev]))
        .catch((err) => console.error('createStayRequest failed:', err));
      return;
    }
    createStayRequestLocal(req);
  };

  const updateStayRequestStatusLocal = (
    requestId: string,
    status: StayRequest['status'],
    checkInInstructions?: string
  ) => {
    setStayRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            ...(checkInInstructions ? { checkInInstructions } : {}),
          };
        }
        return r;
      })
    );

    const req = stayRequests.find((r) => r.id === requestId);
    if (req) {
      if (status === 'APPROVED') {
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
          isRead: false,
        };
        setMessages((prev) => [...prev, autoMsg]);
      } else if (status === 'DECLINED') {
        sendStayRequestDeclinedNotification(req);
      }
    }
  };

  const updateStayRequestStatus = (
    requestId: string,
    status: StayRequest['status'],
    checkInInstructions?: string
  ) => {
    if (apiOnline) {
      api
        .updateStayStatus(requestId, { status, checkInInstructions })
        .then(async (updated) => {
          setStayRequests((prev) =>
            prev.map((r) => (r.id === requestId ? (updated as StayRequest) : r))
          );
          await refreshFromApi();
        })
        .catch((err) => console.error('updateStayRequestStatus failed:', err));
      return;
    }
    updateStayRequestStatusLocal(requestId, status, checkInInstructions);
  };

  const sendMessageLocal = (receiverId: string, content: string, stayRequestId?: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      stayRequestId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const sendMessage = (receiverId: string, content: string, stayRequestId?: string) => {
    if (apiOnline) {
      api
        .sendMessage({ receiverId, content, stayRequestId })
        .then((msg) => setMessages((prev) => [...prev, msg as Message]))
        .catch((err) => console.error('sendMessage failed:', err));
      return;
    }
    sendMessageLocal(receiverId, content, stayRequestId);
  };

  const submitVerificationRequestLocal = (
    req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newV: VerificationRequest = {
      ...req,
      id: `vreq-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };
    setVerifications((prev) => [newV, ...prev]);
  };

  const submitVerificationRequest = (
    req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    if (apiOnline) {
      api
        .submitVerification({
          churchName: req.churchName,
          conference: req.conference,
          pastorName: req.pastorName,
          pastorEmail: req.pastorEmail,
          pastorPhone: req.pastorPhone,
          documentType: req.documentType,
        })
        .then((verification) =>
          setVerifications((prev) => [verification as VerificationRequest, ...prev])
        )
        .catch((err) => console.error('submitVerificationRequest failed:', err));
      return;
    }
    submitVerificationRequestLocal(req);
  };

  const updateVerificationStatusLocal = (
    reqId: string,
    status: 'VERIFIED' | 'REJECTED',
    notes?: string
  ) => {
    setVerifications((prev) =>
      prev.map((v) => {
        if (v.id === reqId) {
          return { ...v, status, reviewedBy: currentUser.name, notes };
        }
        return v;
      })
    );
  };

  const updateVerificationStatus = (
    reqId: string,
    status: 'VERIFIED' | 'REJECTED',
    notes?: string
  ) => {
    if (apiOnline) {
      api
        .updateVerification(reqId, { status, notes })
        .then((verification) =>
          setVerifications((prev) =>
            prev.map((v) => (v.id === reqId ? (verification as VerificationRequest) : v))
          )
        )
        .catch((err) => console.error('updateVerificationStatus failed:', err));
      return;
    }
    updateVerificationStatusLocal(reqId, status, notes);
  };

  const addListingLocal = (
    newListingData: Omit<
      Listing,
      'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'
    >
  ) => {
    const newListing: Listing = {
      ...newListingData,
      id: `list-${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatarUrl,
      hostChurchName: currentUser.homeChurchName,
      hostVerificationTier: currentUser.verificationTier,
      rating: 5.0,
      reviewCount: 0,
    };
    setListings((prev) => [newListing, ...prev]);
  };

  const addListing = (
    newListingData: Omit<
      Listing,
      'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'
    >
  ) => {
    if (apiOnline) {
      api
        .createListing(newListingData as Record<string, unknown>)
        .then((listing) => setListings((prev) => [listing as Listing, ...prev]))
        .catch((err) => console.error('addListing failed:', err));
      return;
    }
    addListingLocal(newListingData);
  };

  const createFamilyExchangeRequestLocal = (
    req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReq: FamilyExchangeRequest = {
      ...req,
      id: `exreq-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setFamilyExchangeRequests((prev) => [newReq, ...prev]);
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: req.requesterFamilyName,
      senderAvatar: req.requesterAvatar,
      receiverId: req.targetFamilyId,
      content: `Greetings! ${req.requesterFamilyName} from ${req.requesterCountry} sent a Family Exchange request (${req.exchangeType.replace('_', ' ')}) for ${req.proposedMonth}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const createFamilyExchangeRequest = (
    req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    if (apiOnline) {
      api
        .createFamilyExchange({
          targetFamilyId: req.targetFamilyId,
          exchangeType: req.exchangeType,
          proposedMonth: req.proposedMonth,
          preferredDuration: req.preferredDuration,
          introNote: req.introNote,
        })
        .then((exchange) =>
          setFamilyExchangeRequests((prev) => [exchange as FamilyExchangeRequest, ...prev])
        )
        .catch((err) => console.error('createFamilyExchangeRequest failed:', err));
      return;
    }
    createFamilyExchangeRequestLocal(req);
  };

  const updateFamilyExchangeRequestStatusLocal = (
    reqId: string,
    status: FamilyExchangeRequest['status']
  ) => {
    setFamilyExchangeRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status } : r))
    );
  };

  const updateFamilyExchangeRequestStatus = (
    reqId: string,
    status: FamilyExchangeRequest['status']
  ) => {
    if (apiOnline) {
      api
        .updateFamilyExchangeStatus(reqId, status)
        .then((exchange) =>
          setFamilyExchangeRequests((prev) =>
            prev.map((r) => (r.id === reqId ? (exchange as FamilyExchangeRequest) : r))
          )
        )
        .catch((err) => console.error('updateFamilyExchangeRequestStatus failed:', err));
      return;
    }
    updateFamilyExchangeRequestStatusLocal(reqId, status);
  };

  const addFamilyProfileLocal = (
    familyData: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>
  ) => {
    const newFamily: FamilyProfile = {
      ...familyData,
      id: `family-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };
    setFamilyProfiles((prev) => [newFamily, ...prev]);
  };

  const addFamilyProfile = (familyData: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>) => {
    if (apiOnline) {
      api
        .addFamilyProfile(familyData as Record<string, unknown>)
        .then((family) => {
          setFamilyProfiles((prev) => {
            const exists = prev.some((f) => f.id === (family as FamilyProfile).id);
            if (exists) {
              return prev.map((f) =>
                f.id === (family as FamilyProfile).id ? (family as FamilyProfile) : f
              );
            }
            return [(family as FamilyProfile), ...prev];
          });
        })
        .catch((err) => console.error('addFamilyProfile failed:', err));
      return;
    }
    addFamilyProfileLocal(familyData);
  };

  return (
    <AppContext.Provider
      value={{
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
        isBootstrapping,
        apiOnline,
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
        loginWithPassword,
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
        isPaymentCheckoutOpen,
        setIsPaymentCheckoutOpen,
        checkoutTargetPlan,
        setCheckoutTargetPlan,
        listings,
        churches,
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
        setIsSafetyModalOpen,
      }}
    >
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
