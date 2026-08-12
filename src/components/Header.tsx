import React, { useState } from 'react';
import { 
  Home, 
  Globe2, 
  Menu, 
  User, 
  MessageSquare, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Heart,
  X,
  Users,
  Sparkles,
  LogOut,
  UserPlus,
  LogIn,
  Search,
  MapPin,
  Bot,
  CreditCard,
  Settings,
  Bell,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';
import { AiSabbathAssistantModal } from './AiSabbathAssistantModal';

export const Header: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    currentUser, 
    activeTab, 
    setActiveTab, 
    stayRequests, 
    messages, 
    setIsSafetyModalOpen,
    userMembership,
    openAuthModal,
    logoutUser,
    loginAsTestUser,
    filters,
    setFilters
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const isLoggedIn = currentUser && currentUser.id !== 'guest-anon' && currentUser.id !== '' && !currentUser.id.startsWith('guest-');

  const pendingRequestsCount = (stayRequests || []).filter(
    r => (currentUser?.role === 'HOST' ? r.hostId === currentUser?.id : r.guestId === currentUser?.id) && r.status === 'PENDING'
  ).length;

  const unreadMessagesCount = (messages || []).filter(
    m => m.receiverId === currentUser?.id && !m.isRead
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('EXPLORE');
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          
          {/* Left: Brand Logo */}
          <div 
            id="brand-logo"
            className="flex items-center gap-2.5 cursor-pointer group shrink-0" 
            onClick={() => setActiveTab('EXPLORE')}
          >
            <div className="w-11 h-11 rounded-xl bg-[#1B5E4A] flex items-center justify-center text-white shadow-md shadow-[#1B5E4A]/25 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight font-display leading-none">
              <span className="text-[#1B5E4A]">Adventist</span><span className="text-slate-900 dark:text-white">Stay</span>
            </span>
          </div>

          {/* Center: Interactive Search Form Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-4xl mx-2 lg:mx-6">
            <form 
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-full p-1.5 pl-4 shadow-inner hover:shadow transition-all"
            >
              {/* 1. Destination / Where */}
              <div className="flex-[1.2] flex items-center gap-2 min-w-0 pr-3 border-r border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-[#1B5E4A] shrink-0" />
                <input
                  type="text"
                  placeholder="Where to? (City, State, Country)"
                  value={filters.destination}
                  onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none truncate"
                />
              </div>

              {/* 2. Reason to Stay / Purpose */}
              <div className="hidden lg:flex flex-1 items-center gap-1.5 px-3 border-r border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <select
                  value={filters.purpose}
                  onChange={(e) => setFilters(prev => ({ ...prev, purpose: e.target.value as any }))}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">All Stay Purposes</option>
                  <option value="SABBATH_STAY">Sabbath Stay</option>
                  <option value="MEDICAL_CARE">Medical Care Visit</option>
                  <option value="EDUCATION_STUDY">Education / Study</option>
                  <option value="CONFERENCE_EVENT">Conference / Event</option>
                  <option value="WORSHIP_VISIT">Worship / Revival Visit</option>
                  <option value="MISSION_WORK">Mission Travel</option>
                </select>
              </div>

              {/* 3. Sabbath Date Dropdown */}
              <div className="hidden xl:flex flex-[1.4] items-center gap-1.5 px-3 border-r border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <select
                  value={filters.checkInDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, checkInDate: e.target.value }))}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
                  title="Select Sabbath"
                >
                  <option value="">Select Sabbath (Fri &amp; Sat Nights)</option>
                  <option value="Fri Aug 14 – Sun Aug 16">Fri Aug 14 – Sun Aug 16 (Fri &amp; Sat Stay)</option>
                  <option value="Fri Aug 21 – Sun Aug 23">Fri Aug 21 – Sun Aug 23 (Fri &amp; Sat Stay)</option>
                  <option value="Fri Aug 28 – Sun Aug 30">Fri Aug 28 – Sun Aug 30 (Fri &amp; Sat Stay)</option>
                  <option value="Fri Sep 04 – Sun Sep 06">Fri Sep 04 – Sun Sep 06 (Fri &amp; Sat Stay)</option>
                  <option value="Fri Sep 11 – Sun Sep 13">Fri Sep 11 – Sun Sep 13 (Fri &amp; Sat Stay)</option>
                </select>
              </div>

              {/* 4. Guests */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <select
                  value={filters.guestCount}
                  onChange={(e) => setFilters(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="p-2.5 rounded-full bg-[#1B5E4A] hover:bg-[#134536] text-white shadow-md hover:scale-105 transition-all shrink-0 ml-1 flex items-center gap-1.5 px-4"
                title="Search Stays"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-extrabold hidden md:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Right: Navigation Actions & User Menu */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Family Exchange Direct Button */}
            <button
              id="nav-family-exchange"
              onClick={() => setActiveTab('FAMILY_EXCHANGE')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'FAMILY_EXCHANGE'
                  ? 'bg-[#EEF5F1] dark:bg-[#1B5E4A]/20 text-[#1B5E4A] border border-[#1B5E4A]/30 dark:border-[#1B5E4A]/50 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-[#1B5E4A]" />
              <span>Family Exchange</span>
            </button>

            {/* AI Sabbath Concierge Button */}
            <button
              id="nav-ai-assistant"
              onClick={() => setIsAiModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-all shadow-sm"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>AI Sabbath Concierge</span>
            </button>

            {/* Packages */}
            <button
              id="nav-packages"
              onClick={() => setActiveTab('PRICING')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EEF5F1] dark:bg-[#1B5E4A]/15 border border-[#1B5E4A]/25 dark:border-[#1B5E4A]/40 text-xs font-extrabold text-[#1B5E4A] hover:bg-[#EEF5F1]/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Packages
            </button>

            {/* Language & Globe Button */}
            <button
              id="btn-language-modal"
              onClick={() => setIsLangModalOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Select Language"
            >
              <Globe2 className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* User Menu Avatar Button */}
            <div className="relative">
              <button
                id="btn-user-avatar-only"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative p-0.5 rounded-full hover:ring-4 hover:ring-[#EEF5F1] dark:hover:ring-[#1B5E4A]/30 transition-all focus:outline-none shrink-0"
                title="Account Menu"
              >
                {isLoggedIn ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#1B5E4A] shadow-sm hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#1B5E4A] hover:text-[#1B5E4A] transition-all shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </button>

              {/* User Dropdown Overlay - High-Craft Modern Avatar Menu */}
              {isUserMenuOpen && (
                <div 
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 z-50 animate-fade-in text-xs font-medium text-slate-800 dark:text-slate-200 space-y-1.5"
                >
                  {isLoggedIn ? (
                    /* LOGGED IN USER MENU (ROLE-SPECIFIC PORTAL ACCESS) */
                    <>
                      {/* USER PROFILE HEADER CARD */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3">
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.name} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1B5E4A] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold capitalize truncate">
                            {currentUser.role === 'GUEST' ? 'Guest' : currentUser.role === 'HOST' ? 'Host' : 'Admin'}
                          </p>
                        </div>
                      </div>

                      {/* ROLE-SPECIFIC DEDICATED PORTAL LINK HIGHLIGHT */}
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => { setActiveTab('ADMIN'); setIsUserMenuOpen(false); }}
                          className="w-full text-left p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-extrabold flex items-center justify-between transition-colors shadow-2xs"
                        >
                          <span className="flex items-center gap-2.5 text-xs">
                            <ShieldCheck className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" /> Admin Master Portal
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 text-[10px] font-black">
                            ADMIN
                          </span>
                        </button>
                      )}

                      {currentUser.role === 'HOST' && (
                        <button
                          onClick={() => { setActiveTab('HOST_MANAGE'); setIsUserMenuOpen(false); }}
                          className="w-full text-left p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-extrabold flex items-center justify-between transition-colors shadow-2xs"
                        >
                          <span className="flex items-center gap-2.5 text-xs">
                            <Building2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" /> Host Dashboard & Listings
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-black">
                            HOST
                          </span>
                        </button>
                      )}

                      {currentUser.role === 'GUEST' && (
                        <button
                          onClick={() => { setActiveTab('MY_STAYS'); setIsUserMenuOpen(false); }}
                          className="w-full text-left p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-extrabold flex items-center justify-between transition-colors shadow-2xs"
                        >
                          <span className="flex items-center gap-2.5 text-xs">
                            <User className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> Guest Portal & My Stays
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 text-[10px] font-black">
                            GUEST
                          </span>
                        </button>
                      )}

                      {/* ROLE-SPECIFIC AVATAR MENU ITEMS ACCORDING TO DESIGN SYSTEM */}
                      <div className="py-1 space-y-0.5">
                        {currentUser.role === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => { setActiveTab('ADMIN'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <User className="w-4 h-4 text-purple-500" /> Admin Profile
                            </button>
                            <button
                              onClick={() => { setActiveTab('ADMIN'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-500" /> Platform Settings
                            </button>
                            <button
                              onClick={() => { setActiveTab('MESSAGES'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <span className="flex items-center gap-3 font-semibold">
                                <Bell className="w-4 h-4 text-amber-500" /> Notifications
                              </span>
                              {unreadMessagesCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#1B5E4A] text-white text-[10px] font-black rounded-full">
                                  {unreadMessagesCount}
                                </span>
                              )}
                            </button>
                          </>
                        )}

                        {currentUser.role === 'HOST' && (
                          <>
                            <button
                              onClick={() => { setActiveTab('HOST_MANAGE'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <User className="w-4 h-4 text-emerald-500" /> Family Profile
                            </button>
                            <button
                              onClick={() => { setActiveTab('MEMBERSHIP'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-500" /> Account Settings
                            </button>
                            <button
                              onClick={() => { setActiveTab('MESSAGES'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <span className="flex items-center gap-3 font-semibold">
                                <Bell className="w-4 h-4 text-amber-500" /> Notifications
                              </span>
                              {unreadMessagesCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#1B5E4A] text-white text-[10px] font-black rounded-full">
                                  {unreadMessagesCount}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => { setActiveTab('MEMBERSHIP'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <CreditCard className="w-4 h-4 text-indigo-500" /> Membership
                            </button>
                          </>
                        )}

                        {currentUser.role === 'GUEST' && (
                          <>
                            <button
                              onClick={() => { setActiveTab('MY_STAYS'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <User className="w-4 h-4 text-blue-500" /> My Profile
                            </button>
                            <button
                              onClick={() => { setActiveTab('MEMBERSHIP'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-500" /> Account Settings
                            </button>
                            <button
                              onClick={() => { setActiveTab('MESSAGES'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <span className="flex items-center gap-3 font-semibold">
                                <Bell className="w-4 h-4 text-amber-500" /> Notifications
                              </span>
                              {unreadMessagesCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#1B5E4A] text-white text-[10px] font-black rounded-full">
                                  {unreadMessagesCount}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => { setActiveTab('MEMBERSHIP'); setIsUserMenuOpen(false); }}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <CreditCard className="w-4 h-4 text-indigo-500" /> Membership
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => { 
                          logoutUser(); 
                          setIsUserMenuOpen(false); 
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-3 font-extrabold text-rose-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Sign out
                      </button>
                    </>
                  ) : (
                    /* LOGGED OUT MENU (SIGN IN / REGISTER ONLY) */
                    <>
                      <button
                        onClick={() => { openAuthModal('LOGIN'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-extrabold text-slate-900 dark:text-white"
                      >
                        <LogIn className="w-4.5 h-4.5 text-[#1B5E4A]" />
                        <span>Sign In / Login</span>
                      </button>

                      <button
                        onClick={() => { openAuthModal('REGISTER_GUEST'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-extrabold text-[#1B5E4A]"
                      >
                        <UserPlus className="w-4.5 h-4.5 text-[#1B5E4A]" />
                        <span>Register as Guest</span>
                      </button>

                      <button
                        onClick={() => { openAuthModal('REGISTER_HOST'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-extrabold text-emerald-600"
                      >
                        <Building2 className="w-4.5 h-4.5 text-emerald-600" />
                        <span>Register as Host</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Language Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Globe2 className="w-5 h-5 text-[#1B5E4A]" /> Global Language & Region
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Select your preferred language for AdventistStay</p>
              </div>
              <button onClick={() => setIsLangModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { code: 'en', name: 'English (US & Global)', native: 'English' },
                { code: 'es', name: 'Español (América Latina y España)', native: 'Español' },
                { code: 'pt', name: 'Português (Brasil e Portugal)', native: 'Português' },
                { code: 'fr', name: 'Français (France et Afrique)', native: 'Français' },
                { code: 'zh', name: '中文 (简体中文)', native: '中文 (Mandarin)' },
                { code: 'hi', name: 'हिन्दी (भारत)', native: 'हिन्दी (Hindi)' },
                { code: 'ar', name: 'العربية (الشرق الأوسط)', native: 'العربية (Arabic)' },
                { code: 'de', name: 'Deutsch (Deutschland)', native: 'Deutsch' },
                { code: 'ru', name: 'Русский (Евразия)', native: 'Русский' },
                { code: 'ja', name: '日本語 (日本)', native: '日本語 (Japanese)' },
                { code: 'id', name: 'Bahasa Indonesia', native: 'Indonesia' },
                { code: 'ko', name: '한국어 (대한민국)', native: '한국어 (Korean)' },
                { code: 'sw', name: 'Kiswahili (Afrika Mashariki)', native: 'Kiswahili' },
                { code: 'tl', name: 'Tagalog / Filipino (Pilipinas)', native: 'Tagalog' }
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code as SupportedLanguage);
                    setIsLangModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all flex items-center justify-between group ${
                    language === item.code 
                      ? 'bg-[#1B5E4A] text-white shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${language === item.code ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.native}
                    </p>
                    <p className={`text-[10px] truncate ${language === item.code ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.name}
                    </p>
                  </div>
                  {language === item.code ? (
                    <span className="w-5 h-5 rounded-full bg-white text-[#1B5E4A] font-black text-xs flex items-center justify-center shrink-0">✓</span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 text-xs group-hover:text-slate-500 font-bold shrink-0">→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Sabbath Assistant Modal */}
      <AiSabbathAssistantModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />

    </header>
  );
};


