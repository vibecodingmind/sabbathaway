import React from 'react';
import { Search, MapPin, Calendar, Users, Heart, Sparkles, Globe, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StayPurpose } from '../types';

export const HeroSearch: React.FC = () => {
  const { filters, setFilters, resetFilters, listings } = useApp();

  // Extract unique countries from listings for the dropdown
  const availableCountries = Array.from(
    new Set(listings.map(l => l.country).filter(Boolean))
  ).sort();

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      purpose: e.target.value as StayPurpose | 'ALL'
    }));
  };

  return (
    <div id="hero-search-container" className="relative bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-3xl mb-10 shadow-2xl border border-rose-900/30">
      {/* Background Decorative Graphic Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF385C_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto text-center space-y-6">
        
        {/* Sabbath Family Hospitality Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs sm:text-sm font-semibold backdrop-blur-md">
          <Heart className="w-4 h-4 text-[#FF385C] fill-[#FF385C]" />
          <span>Sabbath Family Hospitality Platform • Non-Commercial Fellowship</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
          Find Your Next <span className="text-[#FF385C]">Sabbath Stay</span> with an Adventist Family
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-rose-100/80 leading-relaxed font-normal">
          Connect with verified Seventh-day Adventist host families worldwide for Friday sunset vespers, Sabbath church fellowship, plant-based meals, and cultural family exchange.
        </p>

        {/* Unified Main Search Bar */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/20 text-left mt-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* 1. Where (Destination) */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
                Where
              </label>
              <input
                id="search-destination"
                type="text"
                placeholder="City, State, Church..."
                value={filters.destination}
                onChange={e => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>

            {/* 2. Countries Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#FF385C]" />
                Country
              </label>
              <select
                id="search-country"
                value={filters.country || 'ALL'}
                onChange={e => setFilters(prev => ({ ...prev, country: e.target.value === 'ALL' ? undefined : e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] cursor-pointer"
              >
                <option value="ALL">All Countries Worldwide</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Kenya">Kenya</option>
                <option value="Brazil">Brazil</option>
                <option value="Philippines">Philippines</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Australia">Australia</option>
                <option value="South Africa">South Africa</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="South Korea">South Korea</option>
                {availableCountries
                  .filter((c): c is string => typeof c === 'string' && !['United States','United Kingdom','Kenya','Brazil','Philippines','Jamaica','Australia','South Africa','Canada','Germany','South Korea'].includes(c))
                  .map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))
                }
              </select>
            </div>

            {/* 3. Reason to Stay */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
                Reason to Stay
              </label>
              <select
                id="search-purpose"
                value={filters.purpose}
                onChange={handlePurposeChange}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] cursor-pointer"
              >
                <option value="ALL">All Purpose Stays</option>
                <option value="WORSHIP_VISIT">Sabbath Worship & Church Visit</option>
                <option value="MISSION_WORK">Mission Work & Evangelism</option>
                <option value="CONFERENCE_EVENT">Conference / GC Event</option>
                <option value="EDUCATION_STUDY">University & School Visit</option>
                <option value="MEDICAL_CARE">Medical & Healthcare Stay</option>
                <option value="CAMP_CAMP_MEETING">Camp Meeting</option>
                <option value="FAMILY_TOURISM">Family & Cultural Exchange</option>
              </select>
            </div>

            {/* 4. Sabbath Dates */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
                Select Sabbath
              </label>
              <input
                id="search-dates"
                type="date"
                value={filters.checkInDate}
                onChange={e => setFilters(prev => ({ ...prev, checkInDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] cursor-pointer"
              />
            </div>

            {/* 5. Guests Numbers */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#FF385C]" />
                Guest Numbers
              </label>
              <select
                id="search-guests"
                value={filters.guestCount}
                onChange={e => setFilters(prev => ({ ...prev, guestCount: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF385C] cursor-pointer"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5+ Guests / Family</option>
              </select>
            </div>

          </div>

          {/* Secondary Quick Toggles & Reset */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="toggle-vegetarian"
                onClick={() => setFilters(prev => ({ ...prev, vegetarianOnly: !prev.vegetarianOnly }))}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  filters.vegetarianOnly 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                🌱 Plant-based / Vegetarian Household
              </button>

              <button
                id="toggle-sda-verified"
                onClick={() => setFilters(prev => ({ ...prev, verifiedHostsOnly: !prev.verifiedHostsOnly }))}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  filters.verifiedHostsOnly 
                    ? 'bg-rose-100 dark:bg-rose-950 text-[#FF385C] border-rose-400 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                🛡️ Verified Host Families Only
              </button>
            </div>

            <button
              id="btn-reset-filters"
              onClick={resetFilters}
              className="text-slate-500 dark:text-slate-400 hover:text-[#FF385C] font-bold underline"
            >
              Reset Filters
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

