import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  Building2, 
  ClipboardList, 
  MessageSquare, 
  HeartHandshake, 
  Star, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  MapPin, 
  UserCheck, 
  AlertTriangle, 
  Shield, 
  HelpCircle, 
  Tags,
  Compass,
  User,
  Heart,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  DollarSign,
  ShieldAlert,
  MoreVertical,
  ArrowLeftRight,
  Calendar,
  Home,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../context/AppContext';
import { CategoryBar } from './CategoryBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    loginAsTestUser, 
    logoutUser,
    userMembership,
    stayRequests,
    verifications,
    messages,
    safetyReports,
    language,
    setLanguage,
    adminSubTab,
    setAdminSubTab,
    hostSubTab,
    setHostSubTab,
    guestSubTab,
    setGuestSubTab
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sabbathIn_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sabbathIn_sidebar_collapsed', String(next));
  };

  // Close mobile drawer on tab click
  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  // Notification counts
  const pendingRequestsCount = stayRequests.filter(r => 
    currentUser.role === 'ADMIN' ? r.status === 'PENDING' :
    currentUser.role === 'HOST' ? r.hostId === currentUser.id && r.status === 'PENDING' :
    r.guestId === currentUser.id && r.status === 'PENDING'
  ).length;

  const pendingVerificationsCount = verifications.filter(v => v.status === 'PENDING').length;
  const unreadMessagesCount = messages.filter(m => !m.read && m.receiverId === currentUser.id).length;
  const openSafetyReportsCount = safetyReports.filter(r => r.status === 'OPEN').length;

  const totalNotifications = pendingRequestsCount + (currentUser.role === 'ADMIN' ? pendingVerificationsCount + openSafetyReportsCount : 0) + unreadMessagesCount;

  // Derive Page Header Titles & Breadcrumbs
  const getPageInfo = () => {
    switch (activeTab) {
      case 'ADMIN':
        return { title: 'Admin Governance & Operations', category: 'Administration' };
      case 'HOST_MANAGE':
        return { title: `Welcome, ${currentUser.name}`, category: 'Host Family Dashboard' };
      case 'MY_STAYS':
        return { title: `Good day, ${currentUser.name}`, category: 'Sabbath Guest Portal' };
      case 'MESSAGES':
        return { title: 'Messaging & Family Fellowship', category: 'Communications' };
      case 'VERIFICATION':
        return { title: 'Trust & Pastoral Verification Center', category: 'Community Trust' };
      case 'MEMBERSHIP':
        return { title: 'Membership & Stewardship Plans', category: 'Account & Billing' };
      case 'FAMILY_EXCHANGE':
        return { title: 'Sabbath Family Exchange Program', category: 'Global Exchange' };
      case 'EXPLORE':
        return { title: 'Discover Adventist Host Homes', category: 'Stays Search' };
      case 'MAP':
        return { title: 'Interactive Worldwide Stays Map', category: 'Location View' };
      case 'PRICING':
        return { title: 'Membership Tier Plans', category: 'Pricing' };
      default:
        return { title: 'Dashboard', category: 'SabbathIn' };
    }
  };

  const pageInfo = getPageInfo();

  // Navigation Item Definition
  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    targetTab: ActiveTab;
    subTab?: string;
    badge?: number;
  }

  interface NavSection {
    sectionTitle: string;
    items: NavItem[];
  }

  // Role-Specific Navigation Item Definition matching Design System
  const getNavSections = (): NavSection[] => {
    if (currentUser.role === 'ADMIN') {
      return [
        {
          sectionTitle: 'OVERVIEW',
          items: [
            { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, targetTab: 'ADMIN', subTab: 'OVERVIEW' }
          ]
        },
        {
          sectionTitle: 'PLATFORM',
          items: [
            { id: 'admin-users', label: 'Users', icon: Users, targetTab: 'ADMIN', subTab: 'USERS' },
            { id: 'admin-hosts', label: 'Hosts', icon: Home, targetTab: 'ADMIN', subTab: 'HOSTS' },
            { id: 'admin-guests', label: 'Guests', icon: User, targetTab: 'ADMIN', subTab: 'GUESTS' },
            { id: 'admin-experiences', label: 'Family Experiences', icon: Sparkles, targetTab: 'ADMIN', subTab: 'STAYS' },
            { id: 'admin-requests', label: 'Stay Requests', icon: ClipboardList, targetTab: 'ADMIN', subTab: 'STAYS', badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
            { id: 'admin-exchange', label: 'Family Exchange', icon: ArrowLeftRight, targetTab: 'ADMIN', subTab: 'FAMILY_EXCHANGE' }
          ]
        },
        {
          sectionTitle: 'FINANCE',
          items: [
            { id: 'admin-memberships', label: 'Memberships', icon: CreditCard, targetTab: 'ADMIN', subTab: 'MEMBERSHIPS' },
            { id: 'admin-payments', label: 'Payments', icon: DollarSign, targetTab: 'ADMIN', subTab: 'PAYMENTS' },
            { id: 'admin-featured', label: 'Featured Families', icon: Star, targetTab: 'ADMIN', subTab: 'FEATURED' }
          ]
        },
        {
          sectionTitle: 'MANAGEMENT',
          items: [
            { id: 'admin-reviews', label: 'Reviews', icon: Star, targetTab: 'ADMIN', subTab: 'REVIEWS_REPORTS' },
            { id: 'admin-reports', label: 'Reports', icon: AlertTriangle, targetTab: 'ADMIN', subTab: 'REVIEWS_REPORTS', badge: openSafetyReportsCount > 0 ? openSafetyReportsCount : undefined },
            { id: 'admin-content', label: 'Content', icon: FileText, targetTab: 'ADMIN', subTab: 'CONTENT_CATEGORIES' },
            { id: 'admin-categories', label: 'Categories', icon: Tags, targetTab: 'ADMIN', subTab: 'CONTENT_CATEGORIES' }
          ]
        },
        {
          sectionTitle: 'SYSTEM',
          items: [
            { id: 'admin-settings', label: 'Settings', icon: Settings, targetTab: 'ADMIN', subTab: 'SETTINGS' }
          ]
        }
      ];
    } else if (currentUser.role === 'HOST') {
      return [
        {
          sectionTitle: 'MAIN',
          items: [
            { id: 'host-dashboard', label: 'Dashboard', icon: LayoutDashboard, targetTab: 'HOST_MANAGE', subTab: 'DASHBOARD' },
            { id: 'host-family', label: 'My Family', icon: Users, targetTab: 'HOST_MANAGE', subTab: 'FAMILY' },
            { id: 'host-experience', label: 'My Experience', icon: Sparkles, targetTab: 'HOST_MANAGE', subTab: 'EXPERIENCE' },
            { id: 'host-availability', label: 'Availability', icon: Calendar, targetTab: 'HOST_MANAGE', subTab: 'AVAILABILITY' }
          ]
        },
        {
          sectionTitle: 'HOSTING',
          items: [
            { id: 'host-requests', label: 'Stay Requests', icon: ClipboardList, targetTab: 'HOST_MANAGE', subTab: 'REQUESTS', badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
            { id: 'host-upcoming', label: 'Upcoming Experiences', icon: Clock, targetTab: 'HOST_MANAGE', subTab: 'UPCOMING' },
            { id: 'host-messages', label: 'Messages', icon: MessageSquare, targetTab: 'MESSAGES', badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
            { id: 'host-reviews', label: 'Reviews', icon: Star, targetTab: 'HOST_MANAGE', subTab: 'REVIEWS' }
          ]
        },
        {
          sectionTitle: 'COMMUNITY',
          items: [
            { id: 'host-exchange', label: 'Family Exchange', icon: ArrowLeftRight, targetTab: 'FAMILY_EXCHANGE' }
          ]
        },
        {
          sectionTitle: 'PROMOTION',
          items: [
            { id: 'host-featured', label: 'Featured Family', icon: Star, targetTab: 'HOST_MANAGE', subTab: 'FEATURED' }
          ]
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { id: 'host-membership', label: 'Membership', icon: CreditCard, targetTab: 'MEMBERSHIP' },
            { id: 'host-settings', label: 'Settings', icon: Settings, targetTab: 'MEMBERSHIP' }
          ]
        }
      ];
    } else {
      // GUEST ROLE
      return [
        {
          sectionTitle: 'MAIN',
          items: [
            { id: 'guest-dashboard', label: 'Dashboard', icon: LayoutDashboard, targetTab: 'MY_STAYS', subTab: 'REQUESTS' },
            { id: 'guest-discover', label: 'Discover Families', icon: Search, targetTab: 'EXPLORE' },
            { id: 'guest-saved', label: 'Saved Families', icon: Heart, targetTab: 'MY_STAYS', subTab: 'SAVED' }
          ]
        },
        {
          sectionTitle: 'MY EXPERIENCE',
          items: [
            { id: 'guest-requests', label: 'My Requests', icon: ClipboardList, targetTab: 'MY_STAYS', subTab: 'REQUESTS', badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
            { id: 'guest-experiences', label: 'My Experiences', icon: Clock, targetTab: 'MY_STAYS', subTab: 'EXPERIENCES' },
            { id: 'guest-messages', label: 'Messages', icon: MessageSquare, targetTab: 'MESSAGES', badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined }
          ]
        },
        {
          sectionTitle: 'COMMUNITY',
          items: [
            { id: 'guest-exchange', label: 'Family Exchange', icon: ArrowLeftRight, targetTab: 'FAMILY_EXCHANGE' },
            { id: 'guest-reviews', label: 'Reviews', icon: Star, targetTab: 'MY_STAYS', subTab: 'EXPERIENCES' }
          ]
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { id: 'guest-membership', label: 'Membership', icon: CreditCard, targetTab: 'MEMBERSHIP' },
            { id: 'guest-settings', label: 'Settings', icon: Settings, targetTab: 'MEMBERSHIP' }
          ]
        }
      ];
    }
  };

  const navSections = getNavSections();

  const isItemActive = (item: NavItem) => {
    if (activeTab !== item.targetTab) return false;
    if (!item.subTab) return true;
    if (currentUser.role === 'ADMIN') return adminSubTab === item.subTab;
    if (currentUser.role === 'HOST') return hostSubTab === item.subTab;
    return guestSubTab === item.subTab;
  };

  const handleNavClickItem = (item: NavItem) => {
    setActiveTab(item.targetTab);
    if (item.subTab) {
      if (currentUser.role === 'ADMIN') {
        setAdminSubTab(item.subTab);
      } else if (currentUser.role === 'HOST') {
        setHostSubTab(item.subTab);
      } else {
        setGuestSubTab(item.subTab);
      }
    }
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      
      {/* ==================== MOBILE DRAWER BACKDROP ==================== */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* ==================== MAIN SHELL WRAPPER ==================== */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* ==================== SIDEBAR (DESKTOP & MOBILE DRAWER) ==================== */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-50
            flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80
            transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
            ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          `}
        >
          {/* SIDEBAR HEADER / BRANDING */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div 
              onClick={() => handleNavClick('EXPLORE')}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF385C] to-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-[#FF385C]/20 group-hover:scale-105 transition-transform shrink-0">
                S
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                    SabbathIn
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                    {currentUser.role === 'ADMIN' ? 'Platform Admin' : 'Family Hospitality'}
                  </span>
                </div>
              )}
            </div>

            {/* Collapse Button (Desktop) / Close Button (Mobile) */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {(!isCollapsed || isMobileOpen) && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {section.sectionTitle}
                  </p>
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClickItem(item)}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all relative group
                        ${isActive 
                          ? 'bg-[#FF385C] text-white shadow-md shadow-[#FF385C]/25' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        }
                        ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {/* Badge indicator */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`
                          px-1.5 py-0.5 text-[10px] font-extrabold rounded-full shrink-0
                          ${isActive 
                            ? 'bg-white text-[#FF385C]' 
                            : 'bg-[#FF385C] text-white'
                          }
                          ${isCollapsed && !isMobileOpen ? 'absolute -top-1 -right-1 px-1 py-0.2 text-[9px]' : ''}
                        `}>
                          {item.badge}
                        </span>
                      )}

                      {/* Hover Tooltip when Collapsed */}
                      {isCollapsed && !isMobileOpen && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* SIDEBAR FOOTER: USER CARD & LOGOUT */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  currentUser.role === 'ADMIN' ? 'bg-purple-500' :
                  currentUser.role === 'HOST' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate capitalize">
                    {currentUser.role === 'GUEST' ? 'Guest' : currentUser.role === 'HOST' ? 'Host' : 'Admin'}
                  </p>
                </div>
              )}

              {(!isCollapsed || isMobileOpen) && (
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  title="Menu options"
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">

          {/* ==================== TOP DASHBOARD HEADER ==================== */}
          <header className="h-16 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-2xs">
            
            {/* LEFT: MOBILE MENU TOGGLE + PAGE BREADCRUMB */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <span>{pageInfo.category}</span>
                  <span>/</span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{pageInfo.title}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: SEARCH, NOTIFICATIONS, ROLE BADGE, USER DROPDOWN */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* AUTHENTICATED ROLE BADGE */}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                currentUser.role === 'HOST' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}>
                {currentUser.role}
              </span>

              {/* NOTIFICATION BELL WITH DROPDOWN POPOVER */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {totalNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF385C] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {totalNotifications}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS POPOVER */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 text-xs animate-fade-in">
                    <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Bell className="w-4 h-4 text-[#FF385C]" />
                        <span>Platform Notifications</span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#FF385C]/10 text-[#FF385C] rounded-full text-[10px] font-extrabold">
                        {totalNotifications} Active
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                      {pendingRequestsCount > 0 && (
                        <div 
                          onClick={() => { handleNavClick(currentUser.role === 'HOST' ? 'HOST_MANAGE' : 'MY_STAYS'); setIsNotificationsOpen(false); }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingRequestsCount} Pending Stay Request{pendingRequestsCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Action required for Sabbath guest reservations.
                            </p>
                          </div>
                        </div>
                      )}

                      {currentUser.role === 'ADMIN' && pendingVerificationsCount > 0 && (
                        <div 
                          onClick={() => { handleNavClick('VERIFICATION'); setIsNotificationsOpen(false); }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {pendingVerificationsCount} Verification Audit{pendingVerificationsCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Pastoral & member verifications waiting for approval.
                            </p>
                          </div>
                        </div>
                      )}

                      {unreadMessagesCount > 0 && (
                        <div 
                          onClick={() => { handleNavClick('MESSAGES'); setIsNotificationsOpen(false); }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {unreadMessagesCount} Unread Message{unreadMessagesCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              New fellowship inquiries from host families or guests.
                            </p>
                          </div>
                        </div>
                      )}

                      {totalNotifications === 0 && (
                        <div className="py-8 text-center text-slate-400 space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                          <p className="font-bold text-xs text-slate-700 dark:text-slate-300">All Caught Up!</p>
                          <p className="text-[11px]">No pending alerts or notifications right now.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* USER PROFILE AVATAR & DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all"
                >
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentUser.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* PROFILE DROPDOWN MENU */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold truncate">
                          {currentUser.role === 'GUEST' ? 'Guest' : currentUser.role === 'HOST' ? 'Host' : 'Administrator'}
                        </p>
                      </div>
                    </div>

                    {/* ROLE-SPECIFIC AVATAR MENU ITEMS ACCORDING TO SPEC */}
                    <div className="py-1">
                      {currentUser.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => { handleNavClick('ADMIN'); setAdminSubTab('OVERVIEW'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <User className="w-4 h-4 text-purple-500" /> Admin Profile
                          </button>
                          <button
                            onClick={() => { handleNavClick('ADMIN'); setAdminSubTab('SETTINGS'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" /> Platform Settings
                          </button>
                          <button
                            onClick={() => { handleNavClick('MESSAGES'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <span className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-amber-500" /> Notifications
                            </span>
                            {unreadMessagesCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#FF385C] text-white text-[10px] font-black rounded-full">
                                {unreadMessagesCount}
                              </span>
                            )}
                          </button>
                        </>
                      )}

                      {currentUser.role === 'HOST' && (
                        <>
                          <button
                            onClick={() => { handleNavClick('HOST_MANAGE'); setHostSubTab('FAMILY'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <User className="w-4 h-4 text-emerald-500" /> Family Profile
                          </button>
                          <button
                            onClick={() => { handleNavClick('MEMBERSHIP'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" /> Account Settings
                          </button>
                          <button
                            onClick={() => { handleNavClick('MESSAGES'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <span className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-amber-500" /> Notifications
                            </span>
                            {unreadMessagesCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#FF385C] text-white text-[10px] font-black rounded-full">
                                {unreadMessagesCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => { handleNavClick('MEMBERSHIP'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-indigo-500" /> Membership
                          </button>
                        </>
                      )}

                      {currentUser.role === 'GUEST' && (
                        <>
                          <button
                            onClick={() => { handleNavClick('MY_STAYS'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <User className="w-4 h-4 text-blue-500" /> My Profile
                          </button>
                          <button
                            onClick={() => { handleNavClick('MEMBERSHIP'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" /> Account Settings
                          </button>
                          <button
                            onClick={() => { handleNavClick('MESSAGES'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <span className="flex items-center gap-3">
                              <Bell className="w-4 h-4 text-amber-500" /> Notifications
                            </span>
                            {unreadMessagesCount > 0 && (
                              <span className="px-2 py-0.5 bg-[#FF385C] text-white text-[10px] font-black rounded-full">
                                {unreadMessagesCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => { handleNavClick('MEMBERSHIP'); setIsProfileDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-indigo-500" /> Membership
                          </button>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        logoutUser();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-3 font-extrabold text-rose-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <div className="px-4 py-2 text-[10px] text-slate-400 font-bold">SWITCH ROLE DEMO</div>
                    <div className="px-4 pb-2 flex gap-1 font-bold text-[10px]">
                      <button
                        onClick={() => loginAsTestUser('GUEST')}
                        className={`flex-1 py-1 rounded transition-all ${currentUser.role === 'GUEST' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50'}`}
                      >
                        Guest
                      </button>
                      <button
                        onClick={() => loginAsTestUser('HOST')}
                        className={`flex-1 py-1 rounded transition-all ${currentUser.role === 'HOST' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'}`}
                      >
                        Host
                      </button>
                      <button
                        onClick={() => loginAsTestUser('ADMIN')}
                        className={`flex-1 py-1 rounded transition-all ${currentUser.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50'}`}
                      >
                        Admin
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </header>

          {/* ==================== CATEGORY BAR (FOR EXPLORE OR MAP) ==================== */}
          {(activeTab === 'EXPLORE' || activeTab === 'MAP') && <CategoryBar />}

          {/* ==================== PAGE CONTENT CONTAINER ==================== */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
};
