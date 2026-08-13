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
import { calculateExpirationDate, PLAN_PRICING, getEffectiveMembershipStatus } from '../lib/membershipEngine';
import { api, getToken, setToken } from '../lib/api';

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

/** Password assigned to the seeded sample accounts (demo login). */
export const DEMO_PASSWORD = 'sabbath2026';

const ANONYMOUS_USER: UserProfile = {
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
};

interface AppContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setCurrentUserRole: (role: UserRole) => void;

  // Auth session
  isAuthenticated: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  demoLogin: (profileId: string) => Promise<{ success: boolean; message: string }>;

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
  registerUserWithSubscription: (params: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    homeChurchName: string;
    householdName: string;
    plan: SubscriptionPlan;
    provider: PaymentProvider;
    password?: string;
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

  listings: Listing[];
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
  const [currentUser, setCurrentUser] = useState<UserProfile>(ANONYMOUS_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTabState] = useState<ActiveTab>('EXPLORE');
  const [adminSubTab, setAdminSubTab] = useState<string>('OVERVIEW');
  const [hostSubTab, setHostSubTab] = useState<string>('DASHBOARD');
  const [guestSubTab, setGuestSubTab] = useState<string>('REQUESTS');
  const [exploreViewMode, setExploreViewMode] = useState<ExploreViewMode>('GRID');

  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [churches, setChurches] = useState<SdaChurch[]>(initialChurches);
  const [stayRequests, setStayRequests] = useState<StayRequest[]>(initialStayRequests);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [memberships, setMemberships] = useState<UserMembership[]>(initialMemberships);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(initialVerificationRequests);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [stayCategories, setStayCategories] = useState<StayCategory[]>(initialStayCategories);
  const [planPricing, setPlanPricing] = useState<Record<SubscriptionPlan, number>>(PLAN_PRICING);

  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>(initialFamilyProfiles);
  const [familyExchangeRequests, setFamilyExchangeRequests] = useState<FamilyExchangeRequest[]>(initialFamilyExchangeRequests);
  const [familyExchangeReviews, setFamilyExchangeReviews] = useState<FamilyExchangeReview[]>(initialFamilyExchangeReviews);
  const [selectedFamilyProfile, setSelectedFamilyProfile] = useState<FamilyProfile | null>(null);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);
  const [upgradePromptTarget, setUpgradePromptTarget] = useState<'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL'>('GENERAL');
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // ---- Server hydration ----------------------------------------------------
  const applyState = useCallback((state: any) => {
    if (!state) return;
    if (state.listings) setListings(state.listings);
    if (state.churches) setChurches(state.churches);
    if (state.stayRequests) setStayRequests(state.stayRequests);
    if (state.messages) setMessages(state.messages);
    if (state.memberships) setMemberships(state.memberships);
    if (state.transactions) setTransactions(state.transactions);
    if (state.reviews) setReviews(state.reviews);
    if (state.verifications) setVerifications(state.verifications);
    if (state.auditLogs) setAuditLogs(state.auditLogs);
    if (state.safetyReports) setSafetyReports(state.safetyReports);
    if (state.stayCategories) setStayCategories(state.stayCategories);
    if (state.familyProfiles) setFamilyProfiles(state.familyProfiles);
    if (state.familyExchangeRequests) setFamilyExchangeRequests(state.familyExchangeRequests);
    if (state.familyExchangeReviews) setFamilyExchangeReviews(state.familyExchangeReviews);
    if (state.users) setUsers(state.users);
    if (Array.isArray(state.favorites)) setFavorites(state.favorites);
    if (state.planPricing && Object.keys(state.planPricing).length) setPlanPricing(state.planPricing);
  }, []);

  const silentRefresh = useCallback(async () => {
    try {
      const state = await api.getState();
      applyState(state);
    } catch (err) {
      console.error('State refresh failed', err);
    }
  }, [applyState]);

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (token) {
          try {
            const { user } = await api.me();
            setCurrentUser(user);
            setIsAuthenticated(true);
          } catch {
            setToken(null);
          }
        }
        const state = await api.getState();
        applyState(state);
      } catch (err) {
        console.error('Initial load failed', err);
      } finally {
        setAuthReady(true);
      }
    })();
  }, [applyState]);

  // ---- Navigation ----------------------------------------------------------
  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'ADMIN' && currentUser.role !== 'ADMIN') {
      if (currentUser.role === 'HOST') setActiveTabState('HOST_MANAGE');
      else setActiveTabState('MY_STAYS');
      return;
    }
    if (tab === 'HOST_MANAGE' && currentUser.role === 'GUEST') {
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
  }, [currentUser.role]);

  const setCurrentUserRole = (role: UserRole) => setCurrentUser((prev) => ({ ...prev, role }));

  // ---- Auth ----------------------------------------------------------------
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await silentRefresh();
      if (user.role === 'ADMIN') setActiveTabState('ADMIN');
      else if (user.role === 'HOST') setActiveTabState('HOST_MANAGE');
      return { success: true, message: `Welcome back, ${user.name}!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Login failed.' };
    }
  };

  const demoLogin = async (profileId: string): Promise<{ success: boolean; message: string }> => {
    const profile = initialProfiles.find((p) => p.id === profileId) || initialProfiles[0];
    return login(profile.email, DEMO_PASSWORD);
  };

  const loginAsTestUser = (role: 'ADMIN' | 'HOST' | 'GUEST') => {
    const target = initialProfiles.find((u) => u.role === role) || initialProfiles[0];
    void demoLogin(target.id);
  };

  const logoutUser = () => {
    setToken(null);
    setCurrentUser(ANONYMOUS_USER);
    setIsAuthenticated(false);
    setActiveTab('EXPLORE');
    void silentRefresh();
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
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const { token, user } = await api.register({
        ...params,
        password: params.password || DEMO_PASSWORD
      });
      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await silentRefresh();
      return { success: true, message: `Welcome to AdventistStay, ${user.name}! Your ${params.plan.replace('_', ' ')} membership is active.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Registration failed.' };
    }
  };

  const requireAuthOr = (action: () => void): boolean => {
    if (!isAuthenticated) {
      setAuthModalMode('LOGIN');
      setIsAuthModalOpen(true);
      return false;
    }
    action();
    return true;
  };

  // ---- Auth modal / upgrade prompt ----------------------------------------
  const openAuthModal = (mode: AuthModalMode = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openUpgradePrompt = (target: 'STAY_REQUEST' | 'FAMILY_EXCHANGE' | 'HOSTING' | 'MESSAGING' | 'GENERAL') => {
    setUpgradePromptTarget(target);
    setIsUpgradePromptOpen(true);
  };
  const closeUpgradePrompt = () => setIsUpgradePromptOpen(false);

  // ---- Admin: users --------------------------------------------------------
  const adminPatchUser = (userId: string, updatedFields: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u)));
    if (currentUser.id === userId) setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
    api.adminUpdateUser(userId, updatedFields).catch((e) => console.error('adminUpdateUser', e));
  };

  const suspendUser = (userId: string) => adminPatchUser(userId, { accountStatus: 'SUSPENDED' });
  const reactivateUser = (userId: string) => adminPatchUser(userId, { accountStatus: 'ACTIVE' });
  const deleteUser = (userId: string) => adminPatchUser(userId, { accountStatus: 'DEACTIVATED' });
  const updateUser = (userId: string, updatedFields: Partial<UserProfile>) => {
    if (currentUser.id === userId && !isAuthenticated) return;
    if (currentUser.id === userId && currentUser.role !== 'ADMIN') {
      // self-service profile update
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u)));
      setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
      api.updateProfile(updatedFields).catch((e) => console.error('updateProfile', e));
      return;
    }
    adminPatchUser(userId, updatedFields);
  };
  const changeUserRole = (userId: string, newRole: UserRole) => adminPatchUser(userId, { role: newRole });

  const approveHost = (hostId: string) =>
    adminPatchUser(hostId, { role: 'HOST', isHostApproved: true, verificationTier: 'ADMIN_VERIFIED' });
  const rejectHost = (hostId: string) => adminPatchUser(hostId, { isHostApproved: false });
  const verifyHost = (hostId: string) => adminPatchUser(hostId, { verificationTier: 'ADMIN_VERIFIED' });

  // ---- Admin: listings moderation -----------------------------------------
  const adminPatchListing = (listingId: string, fields: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, ...fields } : l)));
    api.adminUpdateDoc('listings', listingId, fields).catch((e) => console.error('moderate listing', e));
  };
  const approveListing = (listingId: string) => adminPatchListing(listingId, { isApproved: true, isDisabled: false });
  const rejectListing = (listingId: string) => adminPatchListing(listingId, { isApproved: false, isDisabled: true });
  const disableListing = (listingId: string) => adminPatchListing(listingId, { isDisabled: true });
  const enableListing = (listingId: string) => adminPatchListing(listingId, { isDisabled: false });

  const updateListing = (listingId: string, updatedFields: Partial<Listing>) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, ...updatedFields } : l)));
    const isOwner = listings.find((l) => l.id === listingId)?.hostId === currentUser.id;
    if (currentUser.role === 'ADMIN') {
      api.adminUpdateDoc('listings', listingId, updatedFields).catch((e) => console.error('updateListing', e));
    } else if (isOwner) {
      api.updateListing(listingId, updatedFields).catch((e) => console.error('updateListing', e));
    }
  };

  const removeListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    if (currentUser.role === 'ADMIN') {
      api.adminDeleteDoc('listings', listingId).catch((e) => console.error('removeListing', e));
    } else {
      api.deleteListing(listingId).catch((e) => console.error('removeListing', e));
    }
  };

  // ---- Safety & moderation -------------------------------------------------
  const createSafetyReport = (reportData: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>) => {
    requireAuthOr(async () => {
      try {
        const report = await api.createSafetyReport(reportData);
        setSafetyReports((prev) => [report, ...prev]);
      } catch (e) {
        console.error('createSafetyReport', e);
      }
    });
  };
  const resolveSafetyReport = (reportId: string) => {
    setSafetyReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r)));
    api.adminUpdateDoc('safetyReports', reportId, { status: 'RESOLVED' }).catch((e) => console.error('resolveSafetyReport', e));
  };
  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    api.adminDeleteDoc('reviews', reviewId).catch((e) => console.error('deleteReview', e));
  };

  // ---- Plan pricing --------------------------------------------------------
  const updatePlanPrice = (plan: SubscriptionPlan, newPrice: number) => {
    setPlanPricing((prev) => ({ ...prev, [plan]: newPrice }));
    api.adminUpdatePlanPricing({ [plan]: newPrice }).catch((e) => console.error('updatePlanPrice', e));
  };

  // ---- Categories (admin) --------------------------------------------------
  const addCategory = (catData: Omit<StayCategory, 'id'>) => {
    const tempId = `cat-${Date.now()}`;
    const newCat: StayCategory = { ...catData, id: tempId };
    setStayCategories((prev) => [...prev, newCat].sort((a, b) => a.order - b.order));
    api.adminCreateDoc('stayCategories', newCat).catch((e) => console.error('addCategory', e));
  };
  const updateCategory = (id: string, updatedFields: Partial<StayCategory>) => {
    setStayCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat)));
    api.adminUpdateDoc('stayCategories', id, updatedFields).catch((e) => console.error('updateCategory', e));
  };
  const toggleCategoryEnabled = (id: string) => {
    const cat = stayCategories.find((c) => c.id === id);
    const enabled = !(cat?.enabled ?? true);
    setStayCategories((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
    api.adminUpdateDoc('stayCategories', id, { enabled }).catch((e) => console.error('toggleCategory', e));
  };
  const reorderCategories = (newOrder: StayCategory[]) => {
    setStayCategories(newOrder);
    Promise.all(newOrder.map((c) => api.adminUpdateDoc('stayCategories', c.id, { order: c.order }))).catch((e) =>
      console.error('reorderCategories', e)
    );
  };

  // ---- Memberships ---------------------------------------------------------
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
        updatedAt: new Date().toISOString()
      };

  const subscribeToPlan = async (params: {
    plan: SubscriptionPlan;
    provider: PaymentProvider;
    householdName?: string;
    coveredMembers?: string[];
  }): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated) {
      openAuthModal('LOGIN');
      return { success: false, message: 'Please sign in to manage your membership.' };
    }
    try {
      const { membership, transaction } = await api.subscribe(params);
      setMemberships((prev) => [membership, ...prev.filter((m) => m.userId !== currentUser.id)]);
      setTransactions((prev) => [transaction, ...prev]);
      return { success: true, message: `Successfully subscribed to ${params.plan.replace('_', ' ')} membership!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Subscription failed.' };
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
    setMemberships((prev) =>
      prev.map((m) => (m.userId === currentUser.id ? { ...m, status: 'CANCELLED', updatedAt: new Date().toISOString() } : m))
    );
    api.cancelMembership().catch((e) => console.error('cancelMembership', e));
  };

  // ---- Theme / i18n --------------------------------------------------------
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
  const t = (key: string): string => translations[language]?.[key] || translations['en']?.[key] || key;
  const resetFilters = () => setFilters(defaultFilters);

  // ---- Favorites -----------------------------------------------------------
  const toggleFavorite = (listingId: string) => {
    if (!isAuthenticated) {
      openAuthModal('LOGIN');
      return;
    }
    setFavorites((prev) => (prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]));
    api.toggleFavorite(listingId).then((r) => setFavorites(r.favorites)).catch((e) => console.error('toggleFavorite', e));
  };

  // ---- Stay requests -------------------------------------------------------
  const createStayRequest = (req: Omit<StayRequest, 'id' | 'createdAt' | 'status'>) => {
    requireAuthOr(async () => {
      try {
        const created = await api.createStayRequest(req);
        setStayRequests((prev) => [created, ...prev]);
      } catch (e) {
        console.error('createStayRequest', e);
      }
    });
  };

  const updateStayRequestStatus = (requestId: string, status: StayRequest['status'], checkInInstructions?: string) => {
    setStayRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status, ...(checkInInstructions ? { checkInInstructions } : {}) } : r))
    );
    api
      .updateStayRequestStatus(requestId, status, checkInInstructions)
      .then(() => silentRefresh())
      .catch((e) => console.error('updateStayRequestStatus', e));
  };

  // ---- Messages ------------------------------------------------------------
  const sendMessage = (receiverId: string, content: string, stayRequestId?: string) => {
    requireAuthOr(async () => {
      try {
        const msg = await api.sendMessage({ receiverId, content, stayRequestId });
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.error('sendMessage', e);
      }
    });
  };

  // ---- Verifications -------------------------------------------------------
  const submitVerificationRequest = (req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => {
    requireAuthOr(async () => {
      try {
        const v = await api.createVerification(req);
        setVerifications((prev) => [v, ...prev]);
      } catch (e) {
        console.error('submitVerificationRequest', e);
      }
    });
  };

  const updateVerificationStatus = (reqId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === reqId ? { ...v, status, reviewedBy: currentUser.name, notes } : v))
    );
    api
      .adminUpdateDoc('verifications', reqId, { status, reviewedBy: currentUser.name, notes })
      .catch((e) => console.error('updateVerificationStatus', e));
  };

  // ---- Listings (host) -----------------------------------------------------
  const addListing = (
    newListingData: Omit<Listing, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostChurchName' | 'hostVerificationTier' | 'rating' | 'reviewCount'>
  ) => {
    requireAuthOr(async () => {
      try {
        const listing = await api.createListing(newListingData);
        setListings((prev) => [listing, ...prev]);
      } catch (e) {
        console.error('addListing', e);
      }
    });
  };

  // ---- Reviews -------------------------------------------------------------
  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    requireAuthOr(async () => {
      try {
        const review = await api.createReview(reviewData);
        setReviews((prev) => [review, ...prev]);
        setListings((prevListings) =>
          prevListings.map((lst) => {
            if (lst.id === reviewData.listingId) {
              const newCount = lst.reviewCount + 1;
              const newRating = Number(((lst.rating * lst.reviewCount + reviewData.rating) / newCount).toFixed(1));
              return { ...lst, reviewCount: newCount, rating: newRating };
            }
            return lst;
          })
        );
      } catch (e) {
        console.error('addReview', e);
      }
    });
  };

  // ---- Family exchange -----------------------------------------------------
  const createFamilyExchangeRequest = (req: Omit<FamilyExchangeRequest, 'id' | 'createdAt' | 'status'>) => {
    requireAuthOr(async () => {
      try {
        const created = await api.createFamilyExchangeRequest(req);
        setFamilyExchangeRequests((prev) => [created, ...prev]);
      } catch (e) {
        console.error('createFamilyExchangeRequest', e);
      }
    });
  };

  const updateFamilyExchangeRequestStatus = (reqId: string, status: FamilyExchangeRequest['status']) => {
    setFamilyExchangeRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status } : r)));
    api.updateFamilyExchangeRequestStatus(reqId, status).catch((e) => console.error('updateFamilyExchangeRequestStatus', e));
  };

  const addFamilyProfile = (familyData: Omit<FamilyProfile, 'id' | 'rating' | 'reviewCount'>) => {
    requireAuthOr(async () => {
      try {
        const fp = await api.createFamilyProfile(familyData);
        setFamilyProfiles((prev) => [fp, ...prev]);
      } catch (e) {
        console.error('addFamilyProfile', e);
      }
    });
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
        isAuthenticated,
        authReady,
        login,
        demoLogin,
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
