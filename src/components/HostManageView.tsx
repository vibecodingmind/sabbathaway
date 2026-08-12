import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Users, 
  MapPin, 
  Church, 
  ShieldCheck, 
  Utensils, 
  Sun, 
  MessageSquare,
  Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { canBecomeHost } from '../lib/membershipEngine';
import { StayRequest, Listing } from '../types';

export const HostManageView: React.FC = () => {
  const { stayRequests, currentUser, updateStayRequestStatus, addListing, listings, userMembership, openUpgradePrompt, stayCategories } = useApp();
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [approvalModalReq, setApprovalModalReq] = useState<StayRequest | null>(null);
  const [checkInInstructions, setCheckInInstructions] = useState('Welcome! Key code is #7721. Friday sunset supper is served at 6:30 PM.');

  const handleOpenAddListing = () => {
    if (!canBecomeHost(userMembership)) {
      openUpgradePrompt('HOSTING');
      return;
    }
    setShowAddListingModal(true);
  };

  // Form state for new listing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Berrien Springs');
  const [country, setCountry] = useState('United States');
  const [churchName, setChurchName] = useState(currentUser.homeChurchName);
  const [maxGuests, setMaxGuests] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Family', 'Quiet']);

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const hostRequests = (stayRequests || []).filter(r => r?.hostId === currentUser?.id);
  const myHostListings = (listings || []).filter(l => l?.hostId === currentUser?.id);

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalReq) return;
    updateStayRequestStatus(approvalModalReq.id, 'APPROVED', checkInInstructions);
    setApprovalModalReq(null);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    addListing({
      title,
      description,
      familyName: `${currentUser.name} Family`,
      familyStory: 'We welcome Sabbath keepers into our home for fellowship and rest.',
      familyInterests: ['Fellowship', 'Church', 'Nature'],
      sabbathActivities: ['Friday vespers', 'Sabbath School', 'Potluck lunch'],
      languagesSpoken: ['English'],
      hostingPreferences: 'Friday arrival preferred for Sabbath weekend stays.',
      verificationLevel: currentUser.familyVerificationLevel || 2,
      propertyType: 'Private Family Suite',
      city,
      stateProvince: 'Region',
      country,
      coordinates: { lat: 41.9, lng: -86.3 },
      nearestSdaChurch: {
        name: churchName,
        distanceMiles: 0.5,
        address: 'Church Road'
      },
      maxGuests,
      bedrooms: 1,
      bathrooms: 1,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      amenities: ['Wi-Fi', 'Private Bath', 'Breakfast'],
      experienceTypes: ['SABBATH_FAMILY_EXPERIENCE'],
      hospitalityPerks: {
        fridayDinner: true,
        sabbathChurchRide: true,
        sabbathLunch: true,
        sunsetVespers: true,
        airportPickup: false
      },
      sabbathFeatures: {
        vegetarianMealsProvided: true,
        sunsetSabbathFellowship: true,
        churchRideAvailable: true,
        plantBasedKitchen: true,
        quietEnvironment: true
      },
      houseRules: ['No alcohol/tobacco', 'Plant-based diet', 'Quiet Sabbath hours'],
      stayPurposesSupported: ['WORSHIP_VISIT', 'MISSION_WORK', 'EDUCATION_STUDY'],
      categories: selectedCategories
    });
    setShowAddListingModal(false);
  };

  return (
    <div id="host-manage-view" className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#134536] via-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#1B5E4A]/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B5E4A]/20 text-amber-200 text-xs font-bold border border-[#1B5E4A]/30 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#1B5E4A]" />
            Host Family Hospitality Portal
          </div>
          <h1 className="text-2xl font-bold font-display">Manage Sabbath Family Hospitality</h1>
          <p className="text-rose-100/80 text-xs mt-1">
            Welcome Seventh-day Adventist brethren and Sabbath explorers into your verified family home
          </p>
        </div>

        <button
          id="btn-open-create-listing"
          onClick={handleOpenAddListing}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Host Family Profile</span>
        </button>
      </div>

      {/* Incoming Stay Requests Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          Incoming Stay Requests ({hostRequests.length})
        </h2>

        {hostRequests.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">
            No active stay requests for your listings at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {hostRequests.map(req => (
              <div
                key={req.id}
                id={`host-request-${req.id}`}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-4">
                  <img src={req.guestAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{req.guestName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {req.guestVerificationTier.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-500">Church: {req.guestChurch}</p>
                    <p className="text-amber-700 dark:text-amber-400 font-semibold">
                      Dates: {req.checkInDate} to {req.checkOutDate} ({req.guestCount} Guests)
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 italic pt-1">"{req.purposeNote}"</p>
                  </div>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`decline-request-btn-${req.id}`}
                      onClick={() => updateStayRequestStatus(req.id, 'DECLINED')}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Decline
                    </button>
                    <button
                      id={`approve-request-btn-${req.id}`}
                      onClick={() => setApprovalModalReq(req)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Stay
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full font-bold ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status}
                  </span>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Instructions Modal */}
      {approvalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Approve Stay for {approvalModalReq.guestName}
            </h3>

            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Check-in Directions & Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={checkInInstructions}
                  onChange={e => setCheckInInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalReq(null)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Confirm & Send Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              Publish Host Home Listing
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="font-bold">Listing Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Quiet Guest Suite near Andrews Seminary" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold">City & Country</label>
                <input 
                  type="text" 
                  required 
                  value={city} 
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold">Nearest SDA Church Name</label>
                <input 
                  type="text" 
                  required 
                  value={churchName} 
                  onChange={e => setChurchName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold">Description & Fellowship Details</label>
                <textarea 
                  rows={3} 
                  required 
                  placeholder="Describe your guest suite and Sabbath hospitality..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              {/* Stay Categories Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold block">Stay Environment Categories</label>
                <p className="text-[11px] text-slate-500">Select categories that describe your home & area</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {(stayCategories || []).filter(c => c?.enabled).map(cat => {
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.name)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-bold flex items-center justify-between transition-all ${
                          isChecked 
                            ? 'bg-[#1B5E4A] text-white border-[#1B5E4A]' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isChecked && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddListingModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
