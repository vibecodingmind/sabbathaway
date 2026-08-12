import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Home, 
  Church, 
  Compass, 
  Navigation, 
  Star, 
  Search, 
  ChevronRight, 
  Layers, 
  LocateFixed, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Listing, SdaChurch } from '../types';
import { filterListings } from '../lib/filterUtils';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const GoogleMapsView: React.FC = () => {
  const { listings, churches, setSelectedListing, setIsStayModalOpen, filters } = useApp();
  
  const [showHosts, setShowHosts] = useState(true);
  const [showChurches, setShowChurches] = useState(true);
  const [selectedHost, setSelectedHost] = useState<Listing | null>(null);
  const [selectedChurch, setSelectedChurch] = useState<SdaChurch | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = filterListings(listings, filters, searchQuery);

  const filteredChurches = (churches || []).filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.country?.toLowerCase().includes(q);
    }
    if (filters?.destination) {
      const dest = filters.destination.toLowerCase();
      if (!dest.includes('near me') && dest !== 'anywhere') {
        return c.city?.toLowerCase().includes(dest) || c.country?.toLowerCase().includes(dest) || c.name?.toLowerCase().includes(dest);
      }
    }
    return true;
  });

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission or position error:", err);
        // Fallback default center (e.g. Berrien Springs, MI - Andrews University)
        setUserLocation({ lat: 41.9472, lng: -86.3575 });
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Distance helper in KM
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  if (!hasValidKey) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 font-bold">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Google Maps Platform Integration
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Google Maps search and precise geolocation is fully configured. To activate Google Maps API key rendering on your domain:
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-left text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-6 border border-slate-200 dark:border-slate-700">
          <p><strong>Step 1:</strong> Get an API key from Google Cloud Console.</p>
          <p><strong>Step 2:</strong> Add key as secret in AI Studio:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-500 dark:text-slate-400">
            <li>Open <strong>Settings</strong> (⚙️ gear icon in top-right)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as secret name and paste key</li>
          </ul>
        </div>

        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Note: Until a key is set, AdventistStay seamlessly provides our high-resolution Interactive World Map!
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="space-y-6">
        
        {/* Map Top Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Google Maps Search & Nearby Stays
              </h2>
              <p className="text-xs text-slate-500">
                Interactive global location discovery & distance measurement
              </p>
            </div>
          </div>

          {/* Search Bar & Geolocation Button */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search destination city or country..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              <LocateFixed className="w-4 h-4" />
              {isLocating ? 'Locating...' : 'Near Me'}
            </button>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 text-xs font-bold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showHosts} 
                onChange={e => setShowHosts(e.target.checked)} 
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Home className="w-3.5 h-3.5" /> Hosts ({filteredListings.length})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showChurches} 
                onChange={e => setShowChurches(e.target.checked)} 
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Church className="w-3.5 h-3.5" /> Churches ({filteredChurches.length})
              </span>
            </label>
          </div>

        </div>

        {/* Map Container */}
        <div className="w-full h-[550px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative">
          <Map
            defaultCenter={{ lat: 30, lng: 0 }}
            center={userLocation || undefined}
            defaultZoom={3}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* User Geolocation Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your Current Location">
                <Pin background="#ea580c" glyphColor="#fff" />
              </AdvancedMarker>
            )}

            {/* Host Markers */}
            {showHosts && filteredListings.map(item => (
              <AdvancedMarker
                key={`gmap-host-${item.id}`}
                position={item.coordinates}
                onClick={() => {
                  setSelectedHost(item);
                  setSelectedChurch(null);
                }}
              >
                <Pin background="#d97706" glyphColor="#fff" />
              </AdvancedMarker>
            ))}

            {/* Church Markers */}
            {showChurches && filteredChurches.map(item => (
              <AdvancedMarker
                key={`gmap-church-${item.id}`}
                position={item.coordinates}
                onClick={() => {
                  setSelectedChurch(item);
                  setSelectedHost(null);
                }}
              >
                <Pin background="#059669" glyphColor="#fff" />
              </AdvancedMarker>
            ))}

            {/* InfoWindow for Selected Host */}
            {selectedHost && (
              <InfoWindow
                position={selectedHost.coordinates}
                onCloseClick={() => setSelectedHost(null)}
              >
                <div className="p-2 text-slate-900 space-y-2 max-w-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {selectedHost.propertyType}
                  </span>
                  <h3 className="font-bold text-xs line-clamp-1">{selectedHost.title}</h3>
                  <p className="text-[11px] text-slate-600">{selectedHost.city}, {selectedHost.country}</p>
                  
                  {userLocation && (
                    <p className="text-[10px] font-bold text-amber-700">
                      📍 Approx {calculateDistance(userLocation.lat, userLocation.lng, selectedHost.coordinates.lat, selectedHost.coordinates.lng)} km from you
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setSelectedListing(selectedHost);
                      setIsStayModalOpen(true);
                    }}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    Request Stay
                  </button>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Selected Church */}
            {selectedChurch && (
              <InfoWindow
                position={selectedChurch.coordinates}
                onCloseClick={() => setSelectedChurch(null)}
              >
                <div className="p-2 text-slate-900 space-y-1.5 max-w-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified SDA Church
                  </span>
                  <h3 className="font-bold text-xs">{selectedChurch.name}</h3>
                  <p className="text-[11px] text-slate-600">{selectedChurch.city}, {selectedChurch.country}</p>
                  <p className="text-[10px] text-slate-500">Service: {selectedChurch.serviceTimes.divineService}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

      </div>
    </APIProvider>
  );
};
