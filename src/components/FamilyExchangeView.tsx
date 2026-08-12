import React, { useState } from 'react';
import { 
  Globe2, 
  Users, 
  Sparkles, 
  Search, 
  Church, 
  Heart, 
  Sun, 
  Compass, 
  ShieldCheck, 
  Star, 
  Send, 
  Plus, 
  Filter, 
  RotateCcw,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Calendar,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FamilyProfile } from '../types';
import { FamilyProfileModal } from './FamilyProfileModal';
import { ExchangeRequestModal } from './ExchangeRequestModal';
import { RegisterFamilyModal } from './RegisterFamilyModal';

export const FamilyExchangeView: React.FC = () => {
  const { 
    familyProfiles, 
    familyExchangeRequests, 
    updateFamilyExchangeRequestStatus, 
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'MATCHING' | 'ALL_FAMILIES' | 'MY_EXCHANGES'>('ALL_FAMILIES');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [viewingFamily, setViewingFamily] = useState<FamilyProfile | null>(null);
  const [requestTargetFamily, setRequestTargetFamily] = useState<FamilyProfile | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // All available countries and languages
  const countries = Array.from(new Set(familyProfiles.map(f => f.country)));
  const languages = Array.from(new Set(familyProfiles.flatMap(f => f.languages)));

  // Filtered families
  const filteredFamilies = familyProfiles.filter(f => {
    if (selectedCountry !== 'ALL' && f.country !== selectedCountry) return false;
    if (selectedLanguage !== 'ALL' && !f.languages.includes(selectedLanguage)) return false;
    if (selectedMonth !== 'ALL' && !f.availableMonths.includes(selectedMonth)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = f.familyName.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.country.toLowerCase().includes(q) ||
        f.localChurch.toLowerCase().includes(q) ||
        f.interests.some(i => i.toLowerCase().includes(q)) ||
        f.culturalBackground.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Suggested Matches algorithm
  const suggestedMatches = familyProfiles.map(family => {
    let score = 92;
    if (family.country === 'Tanzania' || family.country === 'Kenya') score += 6;
    if (family.languages.includes('English')) score += 2;
    return { family, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const resetFilters = () => {
    setSelectedCountry('ALL');
    setSelectedLanguage('ALL');
    setSelectedMonth('ALL');
    setSearchQuery('');
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#FF385C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-200 text-xs font-extrabold border border-rose-500/30">
            <Globe2 className="w-4 h-4 text-[#FF385C]" />
            <span>GLOBAL ADVENTIST FAMILY EXCHANGE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Reciprocal Adventist Family Homestays Worldwide
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-medium">
            Connect directly with verified Seventh-day Adventist host families across continents. Enjoy mutual hospitality, local Sabbath worship fellowship, cultural immersion, and Christian youth exchange — 100% free among church members.
          </p>

          {/* Key Stat Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5">
              <span className="text-2xl font-black text-white">{familyProfiles.length}</span>
              <p className="text-[11px] font-bold text-slate-300">Registered Host Families</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5">
              <span className="text-2xl font-black text-rose-400">{countries.length}</span>
              <p className="text-[11px] font-bold text-slate-300">Nations Represented</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5">
              <span className="text-2xl font-black text-amber-400">100%</span>
              <p className="text-[11px] font-bold text-slate-300">Free Fellowship Stays</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5">
              <span className="text-2xl font-black text-emerald-400">Pastor</span>
              <p className="text-[11px] font-bold text-slate-300">Verified Church Endorsement</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-extrabold text-xs shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register My Family Account</span>
            </button>

            <button
              onClick={() => setActiveSubTab('MATCHING')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md transition-all border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Smart Family Matches</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Filter & Sub Navigation Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubTab('ALL_FAMILIES')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'ALL_FAMILIES'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4 text-[#FF385C]" />
              <span>All Family Profiles ({familyProfiles.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('MATCHING')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'MATCHING'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Suggested Matches</span>
            </button>

            <button
              onClick={() => setActiveSubTab('MY_EXCHANGES')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 whitespace-nowrap relative ${
                activeSubTab === 'MY_EXCHANGES'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Exchange Requests</span>
              {familyExchangeRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#FF385C] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {familyExchangeRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by family, church, country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            />
          </div>
        </div>

        {/* Dropdown Filters Bar */}
        {activeSubTab !== 'MY_EXCHANGES' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-700 dark:text-slate-300 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#FF385C]" /> Filter By:
            </div>

            {/* Country */}
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer text-slate-900 dark:text-white"
            >
              <option value="ALL">All Countries ({countries.length})</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Language */}
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer text-slate-900 dark:text-white"
            >
              <option value="ALL">All Languages ({languages.length})</option>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            {/* Month */}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold cursor-pointer text-slate-900 dark:text-white"
            >
              <option value="ALL">All Available Months</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="December">December</option>
            </select>

            {(selectedCountry !== 'ALL' || selectedLanguage !== 'ALL' || selectedMonth !== 'ALL' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#FF385C] hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* SUB-TAB 1: ALL FAMILIES GRID */}
      {activeSubTab === 'ALL_FAMILIES' && (
        <div className="space-y-6">
          {filteredFamilies.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Globe2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No family profiles found</h3>
              <p className="text-xs text-slate-500">Try broadening your country, language or search filters.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-[#FF385C] text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFamilies.map((family) => (
                <div
                  key={family.id}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Uniform Image Layout */}
                    <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img 
                        src={family.familyPhotos[0] || family.avatar} 
                        alt={family.familyName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                      />

                      {/* Verified Badge */}
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-white/10">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FF385C]" />
                        <span>Verified</span>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{family.rating}</span>
                      </div>

                      {/* Bottom Image Overlay text */}
                      <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white">
                        <h3 className="font-black text-lg font-display truncate">{family.familyName}</h3>
                        <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-[#FF385C]" />
                          {family.city}, {family.country}
                        </p>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 space-y-3.5 text-xs">
                      
                      {/* Parents & Children */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#FF385C]" />
                            {family.parentsNames}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
                            Kids: {family.childrenAges.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Church Tag */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Church className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                          {family.localChurch}
                        </span>
                      </div>

                      {/* Story snippet */}
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 italic text-[11px] leading-relaxed">
                        "{family.familyStory}"
                      </p>

                      {/* Languages & Available Months */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center gap-1 font-semibold">
                            <Languages className="w-3.5 h-3.5 text-slate-400" />
                            {family.languages.join(' · ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-[#FF385C]">
                            <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
                            Avail: {family.availableMonths.join(', ')}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => setViewingFamily(family)}
                      className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setRequestTargetFamily(family)}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SUGGESTED MATCHES GRID */}
      {activeSubTab === 'MATCHING' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <strong className="text-sm">Family Match Engine Active:</strong> Suggested reciprocal Adventist hosts aligned with your language, target regions, and Sabbath worship fellowship.
              </div>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs whitespace-nowrap shadow-md hover:bg-amber-700 transition-colors"
            >
              Update Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suggestedMatches.map(({ family, matchScore }) => (
              <div 
                key={family.id}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                      src={family.familyPhotos[0] || family.avatar} 
                      alt={family.familyName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />

                    {/* Match Score Badge */}
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{matchScore}% Match Score</span>
                    </div>

                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FF385C]" />
                      <span>Verified</span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent text-white">
                      <h3 className="font-black text-lg font-display truncate">{family.familyName}</h3>
                      <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5 text-[#FF385C]" />
                        {family.city}, {family.country}
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#FF385C]" /> {family.parentsNames}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
                        Kids: {family.childrenAges.join(', ')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-600 flex items-center gap-1">
                        <Church className="w-3 h-3 text-emerald-600" /> {family.localChurch}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                        "{family.culturalBackground}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 font-medium">Langs: <strong>{family.languages.join(' · ')}</strong></span>
                      <span className="text-[#FF385C] font-extrabold">Avail: {family.availableMonths.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setViewingFamily(family)}
                    className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => setRequestTargetFamily(family)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MY EXCHANGES & CONNECTIONS */}
      {activeSubTab === 'MY_EXCHANGES' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Family Exchange Connections</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                Manage incoming and outgoing mutual hospitality requests with Adventist families worldwide.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('MESSAGES')}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-md hover:scale-105 transition-transform"
            >
              Open Messaging Hub
            </button>
          </div>

          <div className="space-y-4">
            {familyExchangeRequests.map((req) => (
              <div 
                key={req.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={req.requesterAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF385C]" />
                    <div>
                      <div className="font-extrabold text-base text-slate-900 dark:text-white">
                        {req.requesterFamilyName} → {req.targetFamilyName}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {req.requesterCountry} ({req.requesterChurch}) · Proposed: <strong>{req.proposedMonth}</strong> ({req.preferredDuration})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#FF385C] font-extrabold text-[10px]">
                      {req.exchangeType.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl font-medium">
                  "{req.introNote}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 font-semibold">Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                  
                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateFamilyExchangeRequestStatus(req.id, 'APPROVED')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors"
                      >
                        Accept Exchange
                      </button>

                      <button
                        onClick={() => updateFamilyExchangeRequestStatus(req.id, 'DECLINED')}
                        className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {viewingFamily && (
        <FamilyProfileModal
          family={viewingFamily}
          onClose={() => setViewingFamily(null)}
          onRequestExchange={(family) => {
            setViewingFamily(null);
            setRequestTargetFamily(family);
          }}
        />
      )}

      {requestTargetFamily && (
        <ExchangeRequestModal
          targetFamily={requestTargetFamily}
          onClose={() => setRequestTargetFamily(null)}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterFamilyModal
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}

    </div>
  );
};
