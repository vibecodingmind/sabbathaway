import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Clock, 
  FileText, 
  Activity, 
  Users, 
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  Tags,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Eye,
  AlertTriangle,
  Lock,
  Sparkles,
  Settings,
  HeartHandshake,
  Trash2,
  Shield,
  HelpCircle,
  Megaphone,
  Layers,
  Filter,
  UserX,
  UserPlus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole, Listing, SubscriptionPlan, SafetyReport } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    users,
    suspendUser,
    reactivateUser,
    deleteUser,
    updateUser,
    changeUserRole,
    approveHost,
    rejectHost,
    verifyHost,
    approveListing,
    rejectListing,
    disableListing,
    enableListing,
    removeListing,
    updateListing,
    verifications, 
    updateVerificationStatus, 
    auditLogs, 
    listings, 
    stayRequests, 
    memberships, 
    transactions,
    stayCategories,
    addCategory,
    updateCategory,
    toggleCategoryEnabled,
    reorderCategories,
    familyExchangeRequests,
    familyProfiles,
    safetyReports,
    resolveSafetyReport,
    reviews,
    deleteReview,
    planPricing,
    updatePlanPrice,
    adminSubTab,
    setAdminSubTab
  } = useApp();

  type AdminTab = 
    | 'OVERVIEW' 
    | 'USERS' 
    | 'HOSTS' 
    | 'GUESTS' 
    | 'STAYS' 
    | 'FAMILY_EXCHANGE' 
    | 'MEMBERSHIPS' 
    | 'FEATURED' 
    | 'PAYMENTS' 
    | 'REVIEWS_REPORTS' 
    | 'CONTENT_CATEGORIES' 
    | 'SETTINGS';

  const activeTab = (adminSubTab as AdminTab) || 'OVERVIEW';
  const setActiveTab = (tab: AdminTab) => setAdminSubTab(tab);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [hostSearch, setHostSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Category Edit State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Home');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Featured Package Edit State
  const [featuredPackages, setFeaturedPackages] = useState([
    { id: 'pkg-1', name: '7-Day Home Spotlight', price: 29, durationDays: 7, enabled: true, activeCampaigns: 4, revenue: 116 },
    { id: 'pkg-2', name: '30-Day Premier Family Spotlight', price: 89, durationDays: 30, enabled: true, activeCampaigns: 9, revenue: 801 },
    { id: 'pkg-3', name: 'Seasonal Sabbath Feature Package', price: 149, durationDays: 90, enabled: true, activeCampaigns: 2, revenue: 298 }
  ]);

  // Platform Content Management State
  const [announcementText, setAnnouncementText] = useState('Welcome to AdventistStay! Over 1,200 verified Sabbath host homes worldwide.');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.homeChurchName.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const hostsList = users.filter(u => u.role === 'HOST');
  const guestsList = users.filter(u => u.role === 'GUEST');

  // Subscription metrics
  const totalMembers = memberships.length;
  const freeUsers = memberships.filter(m => m.plan === 'FREE').length;
  const sabbathMembers = memberships.filter(m => m.plan === 'SABBATH_MEMBER').length;
  const familyExchangeMembers = memberships.filter(m => m.plan === 'FAMILY_EXCHANGE').length;
  const globalFamilyMembers = memberships.filter(m => m.plan === 'GLOBAL_FAMILY').length;
  const activeMemberships = memberships.filter(m => m.status === 'ACTIVE').length;
  const totalRevenue = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      icon: newCatIcon,
      enabled: true,
      order: stayCategories.length + 1
    });
    setNewCatName('');
    setNewCatDesc('');
    setIsAddingCategory(false);
  };

  const handleSaveEditCategory = (catId: string) => {
    updateCategory(catId, {
      name: editCatName.trim(),
      description: editCatDesc.trim()
    });
    setEditingCatId(null);
  };

  return (
    <div id="admin-dashboard-view" className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/30">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            Global Platform Governance & Operations Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Admin Master Dashboard
          </h1>
          <p className="text-slate-300 text-xs leading-relaxed">
            Manage users, hosts, guests, family experiences, memberships, categories, pricing, safety reports, and platform settings.
          </p>
        </div>

        {/* ADMIN TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 text-xs font-bold scrollbar-none border-t border-white/10 mt-6">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'USERS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('HOSTS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'HOSTS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Hosts ({hostsList.length})
          </button>

          <button
            onClick={() => setActiveTab('GUESTS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'GUESTS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Guests ({guestsList.length})
          </button>

          <button
            onClick={() => setActiveTab('STAYS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'STAYS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Stays / Listings ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('FAMILY_EXCHANGE')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FAMILY_EXCHANGE' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Family Exchange ({familyExchangeRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('MEMBERSHIPS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'MEMBERSHIPS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Memberships & Pricing
          </button>

          <button
            onClick={() => setActiveTab('FEATURED')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FEATURED' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Featured Families
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PAYMENTS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Payments ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('REVIEWS_REPORTS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'REVIEWS_REPORTS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Reviews & Reports ({safetyReports.filter(r => r.status === 'OPEN').length})
          </button>

          <button
            onClick={() => setActiveTab('CONTENT_CATEGORIES')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CONTENT_CATEGORIES' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            Categories & Content
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SETTINGS' ? 'bg-[#1B5E4A] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Platform Settings
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">${totalRevenue}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Annual Memberships & Featured</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Active Users</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
              <p className="text-[11px] text-slate-500">{hostsList.length} Hosts • {guestsList.length} Guests</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Active Memberships</span>
                <CreditCard className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeMemberships}</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">{sabbathMembers} Sabbath • {familyExchangeMembers} Exchange • {globalFamilyMembers} Global</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Stay Requests</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stayRequests.length}</p>
              <p className="text-[11px] text-slate-500">{stayRequests.filter(s => s.status === 'APPROVED').length} Approved Stays</p>
            </div>
          </div>

          {/* Visual Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Growth Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1B5E4A]" /> Platform Growth & Revenue Trend
                  </h3>
                  <p className="text-[11px] text-slate-400">Monthly new members and stay reservations</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  +34% Growth
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'May', Members: 12, Stays: 8, Revenue: 450 },
                    { month: 'Jun', Members: 24, Stays: 18, Revenue: 890 },
                    { month: 'Jul', Members: 41, Stays: 32, Revenue: 1420 },
                    { month: 'Aug', Members: users.length, Stays: stayRequests.length, Revenue: totalRevenue }
                  ]}>
                    <defs>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E4A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1B5E4A" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="Members" stroke="#1B5E4A" fillOpacity={1} fill="url(#colorMembers)" />
                    <Area type="monotone" dataKey="Stays" stroke="#10B981" fillOpacity={1} fill="url(#colorStays)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stay Requests Status Donut Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" /> Stay Request Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Distribution of stay requests status</p>
              </div>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: stayRequests.filter(s => s.status === 'APPROVED').length || 3 },
                        { name: 'Pending', value: stayRequests.filter(s => s.status === 'PENDING').length || 2 },
                        { name: 'Completed', value: stayRequests.filter(s => s.status === 'COMPLETED').length || 4 },
                        { name: 'Rejected/Cancelled', value: stayRequests.filter(s => s.status === 'DECLINED' || s.status === 'CANCELLED').length || 1 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#3B82F6" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Approved
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Completed
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Cancelled
                </div>
              </div>
            </div>

          </div>

          {/* Quick Operational Actions */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Quick Platform Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setActiveTab('USERS')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-[#1B5E4A] transition-all">
                <Users className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Manage User Accounts</h4>
                <p className="text-[11px] text-slate-500">Suspend, reactivate, or edit user profiles</p>
              </button>

              <button onClick={() => setActiveTab('HOSTS')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-[#1B5E4A] transition-all">
                <Building2 className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Approve & Verify Hosts</h4>
                <p className="text-[11px] text-slate-500">Grant host verification and audit listings</p>
              </button>

              <button onClick={() => setActiveTab('MEMBERSHIPS')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:border-[#1B5E4A] transition-all">
                <CreditCard className="w-5 h-5 text-purple-500 mb-2" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Configure Plan Pricing</h4>
                <p className="text-[11px] text-slate-500">Adjust $39, $59, $79 annual plan pricing</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search users by name, email, or church..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E4A]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="HOST">HOST</option>
                <option value="GUEST">GUEST</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Church</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                          u.role === 'HOST' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{u.homeChurchName}</p>
                        <p className="text-[11px] text-slate-400">{u.homeChurchCity}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.accountStatus === 'SUSPENDED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                          u.accountStatus === 'DEACTIVATED' ? 'bg-slate-200 text-slate-600' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}>
                          {u.accountStatus || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {u.verificationTier}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.accountStatus === 'SUSPENDED' ? (
                          <button
                            onClick={() => reactivateUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] hover:bg-emerald-500/20"
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-500/20"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-200"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. HOSTS TAB */}
      {activeTab === 'HOSTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Registered Adventist Host Families ({hostsList.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostsList.map(h => (
                <div key={h.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img src={h.avatarUrl} alt={h.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{h.name}</h4>
                      <p className="text-xs text-slate-500">{h.homeChurchName} • {h.homeChurchCity}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{h.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-[10px]">
                      {h.verificationTier}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => verifyHost(h.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                        Verify Host
                      </button>
                      <button onClick={() => suspendUser(h.id)} className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-500/20">
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. GUESTS TAB */}
      {activeTab === 'GUESTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Registered Guest Members & Sabbath Explorers ({guestsList.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guestsList.map(g => (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img src={g.avatarUrl} alt={g.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{g.name}</h4>
                      <p className="text-xs text-slate-500">{g.homeChurchName} • {g.homeChurchCity}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{g.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px]">
                      {g.guestCategory || 'GUEST'}
                    </span>
                    <button onClick={() => suspendUser(g.id)} className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-500/20">
                      Suspend Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. STAYS / LISTINGS TAB */}
      {activeTab === 'STAYS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              All Family Home Listings ({listings.length})
            </h3>
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={l.images[0]} alt={l.title} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{l.title}</h4>
                      <p className="text-xs text-slate-500">{l.city}, {l.country} • Host: {l.hostName}</p>
                      <p className="text-[11px] text-slate-400">Church: {l.nearestSdaChurch.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {l.isDisabled ? (
                      <button onClick={() => enableListing(l.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                        Enable Listing
                      </button>
                    ) : (
                      <button onClick={() => disableListing(l.id)} className="px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-500/20">
                        Disable
                      </button>
                    )}
                    <button onClick={() => removeListing(l.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500/20">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. FAMILY EXCHANGE TAB */}
      {activeTab === 'FAMILY_EXCHANGE' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              Family Cultural Exchange Monitoring ({familyExchangeRequests.length})
            </h3>
            <div className="space-y-3">
              {familyExchangeRequests.map(ex => (
                <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {ex.requesterFamilyName} ↔ {ex.targetFamilyName}
                    </h4>
                    <p className="text-xs text-slate-500">Proposed: {ex.proposedMonth} • Duration: {ex.preferredDuration}</p>
                    <p className="text-[11px] text-slate-400">"{ex.introNote}"</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ex.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    ex.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {ex.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. MEMBERSHIPS & PRICING TAB */}
      {activeTab === 'MEMBERSHIPS' && (
        <div className="space-y-6">
          {/* CONFIGURABLE PLAN PRICING */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-900/30 space-y-4">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Manage Platform Annual Membership Pricing
            </h3>
            <p className="text-xs text-slate-300">
              Adjust annual pricing tiers. Changes update dynamically across the pricing page and checkout modals.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                <p className="font-bold text-xs text-slate-200">Sabbath Member Plan</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">$</span>
                  <input
                    type="number"
                    value={planPricing.SABBATH_MEMBER}
                    onChange={e => updatePlanPrice('SABBATH_MEMBER', Number(e.target.value))}
                    className="w-20 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm"
                  />
                  <span className="text-xs text-slate-300">/year</span>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                <p className="font-bold text-xs text-slate-200">Family Exchange Plan</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">$</span>
                  <input
                    type="number"
                    value={planPricing.FAMILY_EXCHANGE}
                    onChange={e => updatePlanPrice('FAMILY_EXCHANGE', Number(e.target.value))}
                    className="w-20 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm"
                  />
                  <span className="text-xs text-slate-300">/year</span>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                <p className="font-bold text-xs text-slate-200">Global Family Plan</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">$</span>
                  <input
                    type="number"
                    value={planPricing.GLOBAL_FAMILY}
                    onChange={e => updatePlanPrice('GLOBAL_FAMILY', Number(e.target.value))}
                    className="w-20 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm"
                  />
                  <span className="text-xs text-slate-300">/year</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Member Subscriptions ({memberships.length})</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {memberships.map(m => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{m.userName}</p>
                    <p className="text-slate-400 text-[11px]">Ref: {m.paymentReference} • Expires: {new Date(m.expirationDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px]">
                      {m.plan} (${m.price})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. FEATURED FAMILIES TAB */}
      {activeTab === 'FEATURED' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Featured Host Home Spotlight Packages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredPackages.map(pkg => (
                <div key={pkg.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{pkg.name}</h4>
                  <p className="text-2xl font-black text-[#1B5E4A]">${pkg.price}</p>
                  <p className="text-xs text-slate-500">{pkg.durationDays} Days Duration • {pkg.activeCampaigns} Active Campaigns</p>
                  <p className="text-xs font-bold text-emerald-600">Total Revenue Generated: ${pkg.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. PAYMENTS & TRANSACTIONS TAB */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Platform Transaction Audit Log ({transactions.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{t.userName}</td>
                      <td className="p-3">{t.plan}</td>
                      <td className="p-3 font-extrabold text-emerald-600">${t.amount}</td>
                      <td className="p-3 uppercase">{t.provider}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{t.paymentReference}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. REVIEWS & SAFETY REPORTS TAB */}
      {activeTab === 'REVIEWS_REPORTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Safety & Moderation Reports ({safetyReports.length})
            </h3>
            <div className="space-y-3">
              {safetyReports.map(rep => (
                <div key={rep.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rep.reason}</h4>
                    <p className="text-xs text-slate-500">Reported by: {rep.reporterName} • Target ID: {rep.targetId}</p>
                    <p className="text-[11px] text-slate-400 mt-1">"{rep.details}"</p>
                  </div>
                  {rep.status === 'OPEN' ? (
                    <button onClick={() => resolveSafetyReport(rep.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Resolved</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. CONTENT & CATEGORIES TAB */}
      {activeTab === 'CONTENT_CATEGORIES' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-indigo-500" />
                Stay & Living Environment Categories
              </h3>
              <button onClick={() => setIsAddingCategory(!isAddingCategory)} className="px-3.5 py-2 bg-[#1B5E4A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#E00B41]">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {isAddingCategory && (
              <form onSubmit={handleCreateCategory} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Create New Stay Category</h4>
                <input
                  type="text"
                  placeholder="Category Name (e.g., Farm, Nature, Quiet)"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Description..."
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                  Save Category
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stayCategories.map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.description}</p>
                  </div>
                  <button onClick={() => toggleCategoryEnabled(cat.id)} className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${cat.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {cat.enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. SETTINGS TAB */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            Global Platform Administration Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Host Verification Requirements</h4>
              <p className="text-slate-500">Require church membership verification prior to hosting approval.</p>
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#1B5E4A] focus:ring-[#1B5E4A]" />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Global Safety Audits</h4>
              <p className="text-slate-500">Enable automated safety reporting flag on unverified guest inquiries.</p>
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#1B5E4A] focus:ring-[#1B5E4A]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
