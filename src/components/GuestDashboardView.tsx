import React, { useState } from 'react';
import { 
  UserCheck, 
  Heart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  Building2, 
  Church, 
  Star, 
  Sparkles,
  Calendar,
  Key,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StayRequest, Listing } from '../types';

export const GuestDashboardView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    stayRequests, 
    listings, 
    favorites, 
    toggleFavorite, 
    setSelectedListing, 
    setActiveTab,
    userMembership,
    familyExchangeRequests,
    openUpgradePrompt,
    addReview,
    guestSubTab,
    setGuestSubTab
  } = useApp();

  type GuestTab = 'REQUESTS' | 'SAVED' | 'EXPERIENCES' | 'MEMBERSHIP' | 'SETTINGS';
  const activeGuestTab = (guestSubTab as GuestTab) || 'REQUESTS';
  const setActiveGuestTab = (tab: GuestTab) => setGuestSubTab(tab);

  // Review Modal State
  const [reviewListingId, setReviewListingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const myRequests = stayRequests.filter(r => r.guestId === currentUser.id || r.guestName === currentUser.name);
  const myFavoritesListings = listings.filter(l => favorites.includes(l.id));

  const handleOpenReviewModal = (listingId: string) => {
    setReviewListingId(listingId);
    setRating(5);
    setComment('');
    setReviewSuccess(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewListingId || !comment.trim()) return;

    addReview({
      listingId: reviewListingId,
      stayRequestId: `stay-${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatarUrl,
      reviewerChurch: currentUser.homeChurchName || 'Pioneer Memorial Church',
      rating,
      cleanlinessRating: rating,
      fellowshipRating: rating,
      sabbathFriendlinessRating: rating,
      comment: comment.trim()
    });

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewListingId(null);
      setReviewSuccess(false);
    }, 1500);
  };

  return (
    <div id="guest-dashboard-view" className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Sabbath Guest Member Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs">
              Home Church: {currentUser.homeChurchName} • {currentUser.homeChurchCity}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('EXPLORE')}
              className="px-4 py-2.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Host Homes</span>
            </button>
          </div>
        </div>

        {/* Guest Tab Navigation */}
        <div className="flex items-center gap-3 pt-6 text-xs font-bold border-t border-white/10 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveGuestTab('REQUESTS')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeGuestTab === 'REQUESTS' ? 'bg-[#FF385C] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Stay Requests ({myRequests.length})
          </button>

          <button
            onClick={() => setActiveGuestTab('SAVED')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeGuestTab === 'SAVED' ? 'bg-[#FF385C] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Host Homes ({myFavoritesListings.length})
          </button>

          <button
            onClick={() => setActiveGuestTab('EXPERIENCES')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeGuestTab === 'EXPERIENCES' ? 'bg-[#FF385C] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            My Sabbath Experiences & Reviews
          </button>

          <button
            onClick={() => setActiveGuestTab('MEMBERSHIP')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeGuestTab === 'MEMBERSHIP' ? 'bg-[#FF385C] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Membership & Plan
          </button>

          <button
            onClick={() => setActiveGuestTab('SETTINGS')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeGuestTab === 'SETTINGS' ? 'bg-[#FF385C] text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </button>
        </div>
      </div>

      {/* 1. MY STAY REQUESTS TAB */}
      {activeGuestTab === 'REQUESTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Your Stay Reservations & Inquiry History ({myRequests.length})
            </h2>

            {myRequests.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-500">You haven't requested any home stays yet.</p>
                <button onClick={() => setActiveTab('EXPLORE')} className="px-5 py-2.5 bg-[#FF385C] text-white rounded-2xl text-xs font-bold hover:bg-[#E00B41]">
                  Browse Sabbath Host Homes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => (
                  <div key={req.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{req.listingTitle}</h3>
                        <p className="text-slate-500">{req.listingCity} • Host: {req.hostName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Dates</span>
                        <span className="font-semibold">{req.checkInDate} to {req.checkOutDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Guests</span>
                        <span className="font-semibold">{req.guestCount} Guest(s)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Purpose</span>
                        <span className="font-semibold">{req.purpose.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {req.status === 'APPROVED' && req.checkInInstructions && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Key className="w-4 h-4 text-emerald-600" />
                          <span>Host Check-in & Sabbath Welcome Instructions:</span>
                        </div>
                        <p className="text-xs">{req.checkInInstructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SAVED HOST HOMES TAB */}
      {activeGuestTab === 'SAVED' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Your Saved Host Homes ({myFavoritesListings.length})
            </h2>

            {myFavoritesListings.length === 0 ? (
              <p className="text-xs text-slate-500">No saved host homes yet. Click the heart icon on any listing while browsing to save it here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFavoritesListings.map(listing => (
                  <div key={listing.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden space-y-3">
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{listing.title}</h3>
                      <p className="text-xs text-slate-500">{listing.city}, {listing.country}</p>
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setActiveTab('EXPLORE');
                        }}
                        className="w-full py-2 bg-[#FF385C] text-white font-bold rounded-xl text-xs hover:bg-[#E00B41]"
                      >
                        View Host Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. EXPERIENCES & REVIEWS TAB */}
      {activeGuestTab === 'EXPERIENCES' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Completed Stays & Sabbath Experience Reviews
            </h2>

            <div className="space-y-4">
              {listings.slice(0, 2).map(listing => (
                <div key={listing.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={listing.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{listing.title}</h3>
                      <p className="text-xs text-slate-500">{listing.city}, {listing.country} • Host: {listing.hostName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenReviewModal(listing.id)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4" />
                    <span>Write Host Review</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MEMBERSHIP & BILLING TAB */}
      {activeGuestTab === 'MEMBERSHIP' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            My AdventistStay Membership
          </h2>

          <div className="p-6 bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Current Active Plan</span>
              <span className="px-3 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full text-xs font-extrabold">
                {userMembership.plan.replace('_', ' ')}
              </span>
            </div>
            <p className="text-2xl font-black">${userMembership.price} / year</p>
            <p className="text-xs text-purple-200">Household: {userMembership.householdName}</p>
            <p className="text-xs text-purple-300">Expires on: {new Date(userMembership.expirationDate).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* 5. PROFILE SETTINGS TAB */}
      {activeGuestTab === 'SETTINGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            Guest Profile & Church Information
          </h2>

          <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white dark:border-slate-800 shadow-md">
                <img src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt("Enter new profile photo URL (or leave blank to generate a random one):");
                    if (newUrl !== null) {
                      const finalUrl = newUrl.trim() || `https://i.pravatar.cc/250?u=${Date.now()}`;
                      setCurrentUser({ ...currentUser, avatarUrl: finalUrl });
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Update Photo
                </button>
              </div>
            </div>
            <div className="flex-1 text-sm text-slate-600 dark:text-slate-400 space-y-2 pt-2">
              <p>Your profile photo helps hosts recognize you and builds trust in the AdventistStay community.</p>
              <p className="text-xs">Click "Update Photo" to enter an image URL or generate a new random avatar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input type="text" defaultValue={currentUser.name} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" defaultValue={currentUser.email} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Home Church Name</label>
              <input type="text" defaultValue={currentUser.homeChurchName} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Church City & Conference</label>
              <input type="text" defaultValue={`${currentUser.homeChurchCity}, ${currentUser.conferenceName}`} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewListingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Leave a Host Review</h3>
            {reviewSuccess ? (
              <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                Review submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Overall Star Rating</label>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience staying with this Adventist host family..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setReviewListingId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#FF385C] text-white rounded-xl font-bold hover:bg-[#E00B41]">
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
