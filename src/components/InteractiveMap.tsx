import React, { useState, useEffect } from 'react';
import { 
  Church, 
  Home, 
  Star, 
  Compass, 
  X,
  ChevronRight,
  Search,
  LocateFixed,
  MapPin,
  Globe,
  Layers,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Listing, SdaChurch } from '../types';
import { ListingCard } from './ListingCard';
import { GoogleMapsView } from './GoogleMapsView';
import { filterListings, matchesDestination } from '../lib/filterUtils';

const mapsKey =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasGoogleMapsKey = Boolean(mapsKey) && mapsKey !== 'YOUR_API_KEY';

export const InteractiveMap: React.FC = () => {
  const { listings, churches, setSelectedListing, filters, setFilters } = useApp();
  
  const [showHosts, setShowHosts] = useState(true);
  const [showChurches, setShowChurches] = useState(true);
  const [activePin, setActivePin] = useState<{ type: 'HOST' | 'CHURCH'; data: Listing | SdaChurch } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapEngineMode, setMapEngineMode] = useState<'VECTOR' | 'GOOGLE'>(
    hasGoogleMapsKey ? 'GOOGLE' : 'VECTOR'
  );

  useEffect(() => {
    if (hasGoogleMapsKey) setMapEngineMode('GOOGLE');
  }, []);

  // Filter listings based on global filters + local searchQuery
  const displayListings = filterListings(listings, filters, searchQuery);

  // Filter churches based on search / destination
  const displayChurches = (churches || []).filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.country?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.destination) {
      const dest = filters.destination.toLowerCase();
      if (!dest.includes('near me') && dest !== 'anywhere') {
        const matchCity = c.city?.toLowerCase().includes(dest);
        const matchCountry = c.country?.toLowerCase().includes(dest);
        const matchName = c.name?.toLowerCase().includes(dest);
        if (!matchCity && !matchCountry && !matchName) return false;
      }
    }
    return true;
  });

  // Calculate SVG canvas positioning
  const getCanvasPos = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters(prev => ({
      ...prev,
      destination: '',
      country: '',
      selectedCategories: [],
      purpose: 'ALL',
      guestCount: 1,
      vegetarianOnly: false,
      verifiedHostsOnly: false
    }));
  };

  if (mapEngineMode === 'GOOGLE') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMapEngineMode('VECTOR')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#1B5E4A]" />
              <span>Switch to Graphic World Map</span>
            </button>
          </div>
        </div>
        <GoogleMapsView />
      </div>
    );
  }

  return (
    <div id="interactive-map-view" className="w-full">
      
      {/* Split View Container: Left Listings | Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Listings Grid */}
        <div className="lg:col-span-6 xl:col-span-7">
          
          {/* Header count */}
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Home className="w-4 h-4 text-[#1B5E4A]" />
              <span>Sabbath Stays on Map ({displayListings.length})</span>
            </h3>
          </div>

          {/* Listing Cards Grid (2-Column Grid on Left) */}
          {displayListings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">No stays found for this location</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try clearing destination or category filters to explore all global Adventist host families.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-[#1B5E4A] text-white font-extrabold text-xs shadow-md"
              >
                Clear Location Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
              {displayListings.map((list) => (
                <div 
                  key={list.id} 
                  onMouseEnter={() => setActivePin({ type: 'HOST', data: list })}
                  className={`transition-all rounded-2xl p-1.5 ${
                    activePin?.data.id === list.id ? 'bg-[#EEF5F1] dark:bg-[#1B5E4A]/20 ring-2 ring-[#1B5E4A]' : ''
                  }`}
                >
                  <ListingCard
                    listing={list}
                    viewMode="GRID"
                    onSelect={(l) => setSelectedListing(l)}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Map Canvas (Sticky on scroll) */}
        <div className="lg:col-span-6 xl:col-span-5 sticky top-20 h-[calc(100vh-100px)] min-h-[500px]">
          <div className="relative w-full h-full rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Map Controls Header */}
            <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs text-white">
              
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-amber-400 flex items-center gap-1">
                  <Compass className="w-4 h-4" /> Global Stays Map
                </span>
                {filters.destination && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E4A] text-white font-extrabold text-[10px] truncate max-w-[120px]">
                    📍 {filters.destination}
                  </span>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                  <input 
                    type="checkbox" 
                    checked={showHosts} 
                    onChange={e => setShowHosts(e.target.checked)} 
                    className="rounded text-[#1B5E4A] focus:ring-[#1B5E4A]"
                  />
                  <span className="text-[#C4A35A] flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> Hosts ({displayListings.length})
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                  <input 
                    type="checkbox" 
                    checked={showChurches} 
                    onChange={e => setShowChurches(e.target.checked)} 
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Church className="w-3.5 h-3.5" /> Churches ({displayChurches.length})
                  </span>
                </label>

                <button
                  onClick={() => setMapEngineMode('GOOGLE')}
                  className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-[11px] border border-white/10 flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google</span>
                </button>
              </div>

            </div>

            {/* Map Canvas Background */}
            <div className="relative w-full h-full pt-14">
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
              
              {/* World Map SVG Canvas */}
              <svg className="absolute inset-0 w-full h-full text-slate-800/50 pointer-events-none" fill="currentColor" viewBox="0 0 1000 500">
                <path d="M150,120 Q200,80 300,100 Q350,150 280,250 Q200,300 150,220 Z" />
                <path d="M280,280 Q320,260 380,320 Q350,450 290,400 Q260,350 280,280 Z" />
                <path d="M480,100 Q550,80 620,120 Q600,180 520,200 Q460,160 480,100 Z" />
                <path d="M500,220 Q580,200 600,300 Q560,400 500,380 Q470,300 500,220 Z" />
                <path d="M680,120 Q850,100 880,220 Q820,320 720,280 Q660,200 680,120 Z" />
                <path d="M780,350 Q880,340 890,420 Q820,460 760,410 Z" />
              </svg>

              {/* Host Pins */}
              {showHosts && displayListings.map(list => {
                const pos = getCanvasPos(list.coordinates.lat, list.coordinates.lng);
                const isSelected = activePin?.data.id === list.id;

                return (
                  <button
                    key={`pin-host-${list.id}`}
                    id={`pin-host-${list.id}`}
                    onClick={() => setActivePin({ type: 'HOST', data: list })}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-8 h-8 rounded-full bg-[#1B5E4A]/40 animate-ping" />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B5E4A] to-rose-700 text-white flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-900">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
                        {list.title}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Church Pins */}
              {showChurches && displayChurches.map(ch => {
                const pos = getCanvasPos(ch.coordinates.lat, ch.coordinates.lng);
                const isSelected = activePin?.data.id === ch.id;

                return (
                  <button
                    key={`pin-church-${ch.id}`}
                    id={`pin-church-${ch.id}`}
                    onClick={() => setActivePin({ type: 'CHURCH', data: ch })}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-900">
                        <Church className="w-4 h-4" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-emerald-950 text-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
                        {ch.name}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Empty state notice inside map canvas */}
              {displayListings.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-20 bg-slate-950/60 backdrop-blur-sm">
                  <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-2xl text-white">
                    <MapPin className="w-10 h-10 text-[#1B5E4A] mx-auto" />
                    <h3 className="font-extrabold text-base">No pins to render for "{filters.destination || searchQuery}"</h3>
                    <p className="text-xs text-slate-400">
                      We didn't find host families matching this exact search query on the map.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 rounded-xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-extrabold text-xs shadow-lg transition-all"
                    >
                      Reset Search & Show All Pins
                    </button>
                  </div>
                </div>
              )}

              {/* Active Pin Detail Card Overlay */}
              {activePin && (
                <div className="absolute bottom-6 left-6 right-6 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl z-40 animate-fade-in">
                  <button
                    onClick={() => setActivePin(null)}
                    className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {activePin.type === 'HOST' ? (
                    (() => {
                      const item = activePin.data as Listing;
                      return (
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-[#1B5E4A] dark:bg-rose-950">
                              {item.propertyType}
                            </span>
                            <span className="text-slate-500 font-bold">{item.city}, {item.country}</span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
                            {item.title}
                          </h3>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-emerald-600 font-extrabold">100% Free Stay</span>
                            <button
                              onClick={() => setSelectedListing(item)}
                              className="font-extrabold text-[#1B5E4A] hover:underline flex items-center gap-1"
                            >
                              View Details <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const ch = activePin.data as SdaChurch;
                      return (
                        <div className="space-y-2 text-xs">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Verified SDA Church
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {ch.name}
                          </h3>
                          <p className="text-slate-500">{ch.city}, {ch.country}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">Divine Service: {ch.serviceTimes.divineService}</p>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
