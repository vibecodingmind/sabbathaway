import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Church, 
  ShieldCheck, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Calendar, 
  Utensils, 
  Sun, 
  Car, 
  Leaf, 
  HeartHandshake, 
  CheckCircle2, 
  Share2,
  Heart,
  Grid,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Clock,
  Send,
  Search,
  BookOpen,
  Wifi,
  Zap,
  Globe2,
  Info,
  Compass,
  Award,
  ChevronLeft
} from 'lucide-react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onRequestStay: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ 
  listing: initialListing, 
  onClose, 
  onRequestStay 
}) => {
  const { listings, reviews, addReview, sendMessage, favorites, toggleFavorite, setActiveTab, currentUser } = useApp();
  
  const listing = listings.find(l => l.id === initialListing?.id) || initialListing;
  
  // State
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'ALL' | 'EXCHANGE' | 'SPACE' | 'SABBATH' | 'HOST' | 'LOCATION' | 'REVIEWS'>('ALL');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Review Form state
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newCleanliness, setNewCleanliness] = useState(5);
  const [newFellowship, setNewFellowship] = useState(5);
  const [newSabbath, setNewSabbath] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerChurchInput, setReviewerChurchInput] = useState(currentUser.homeChurchName || 'Pioneer Memorial Church');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // Lock body scroll while modal is open to prevent double scrollbars
  useEffect(() => {
    if (listing) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [listing]);

  if (!listing) return null;

  const isFav = favorites.includes(listing.id);
  const listingReviews = (reviews || []).filter(r => r.listingId === listing.id);

  // Filtered reviews
  const filteredReviews = listingReviews.filter(r => {
    if (starFilter !== 'ALL' && Math.floor(r.rating) !== starFilter) return false;
    if (reviewSearchQuery) {
      const q = reviewSearchQuery.toLowerCase();
      return r.comment.toLowerCase().includes(q) || 
             r.reviewerName.toLowerCase().includes(q) || 
             r.reviewerChurch.toLowerCase().includes(q);
    }
    return true;
  });

  // Share handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit new review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addReview({
      listingId: listing.id,
      stayRequestId: `stay-req-${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatarUrl,
      reviewerChurch: reviewerChurchInput,
      rating: newRating,
      cleanlinessRating: newCleanliness,
      fellowshipRating: newFellowship,
      sabbathFriendlinessRating: newSabbath,
      comment: newComment
    });

    setNewComment('');
    setIsAddingReview(false);
  };

  // Workaway Metrics Fallbacks
  const responseRate = listing.responseRate ?? 100;
  const responseTime = listing.responseTime ?? 'Within 1 hour';
  const lastActive = listing.lastActive ?? 'Active today';
  const minStay = listing.minStayNights ?? 2;
  const maxStay = listing.maxStayNights ?? 14;
  const dietary = listing.dietaryStyle ?? '100% Whole Food Plant-Based / Vegetarian Kitchen';
  const wifi = listing.internetSpeed ?? 'High-Speed Fiber Wi-Fi (250+ Mbps)';
  const livingArrangement = listing.livingArrangements ?? `${listing.bedrooms} Private Bedroom(s) & ${listing.bathrooms} Bath(s)`;
  const pets = listing.petsOnProperty ?? 'No indoor pets (Allergy-friendly home)';
  const directions = listing.gettingHereDirections ?? 'Complimentary pick-up available from local station/airport upon request.';

  const whatGuestsGain = listing.whatGuestsGain ?? [
    'Friday Evening Sunset Vespers & Family Welcome Dinner',
    'Saturday Morning Church Ride & Sabbath School Fellowship',
    'Home-Cooked Plant-Based Vegetarian Sabbath Lunch',
    'Nature Walks & Adventist Christian Hospitality Exchange'
  ];

  const householdContribution = listing.householdContribution ?? 
    'We invite guests to participate in Friday evening family prayer, share a story or song, and help clear the dinner table after Sabbath fellowship meals.';

  const nearbyAttractions = listing.nearbyAttractions ?? [
    'Local Seventh-day Adventist Church',
    'Scenic Nature Hiking Trails',
    'Community Health & Wellness Center',
    'Historic Adventist Heritage Sites'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="listing-detail-dialog"
        className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto sm:my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Main Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-slate-800 dark:text-slate-200">
          
          {/* Title & Host Header */}
          <div className="space-y-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-tight">
                {listing.familyName || listing.title}
              </h1>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified Host
                </span>

                <button
                  id="close-listing-modal"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm ml-1"
                  title="Close stay details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-[#1B5E4A]" />
                  <span className="text-sm font-semibold">{listing.city}, {listing.stateProvince ? `${listing.stateProvince}, ` : ''}{listing.country}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{listing.rating}</span>
                  <span className="text-slate-500 font-normal">({listing.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1">
                  <Church className="w-3.5 h-3.5 text-[#1B5E4A]" /> Host Worshipped Church: {listing.hostChurchName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(listing.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-xs font-extrabold text-slate-800 dark:text-slate-200 transition-colors border border-rose-200 dark:border-rose-800/60 shadow-sm"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[#1B5E4A] fill-[#1B5E4A]' : 'text-slate-500'}`} />
                  <span>{isFav ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5-Photo Gallery Mosaic Grid */}
          <div className="relative rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-2.5 aspect-[16/9] md:aspect-[2.2/1] bg-slate-100 dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-800">
            {/* Primary Main Image */}
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden group bg-slate-100 dark:bg-slate-800">
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                onClick={() => { setActivePhotoIndex(0); setShowAllPhotosModal(true); }}
              />
            </div>

            {/* Sub Images */}
            {listing.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="hidden md:block relative overflow-hidden group bg-slate-100 dark:bg-slate-800">
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                  onClick={() => { setActivePhotoIndex(idx + 1); setShowAllPhotosModal(true); }}
                />
              </div>
            ))}

            <button
              onClick={() => setShowAllPhotosModal(true)}
              className="absolute bottom-4 right-4 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xl flex items-center gap-2 hover:bg-white hover:scale-105 transition-all"
            >
              <Grid className="w-4 h-4 text-[#1B5E4A]" />
              <span>Show all {listing.images.length} photos</span>
            </button>
          </div>

          {/* WORKAWAY-INSPIRED NAVIGATION SECTION TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold scrollbar-none">
            <button
              onClick={() => setActiveTabSection(prev => prev === 'EXCHANGE' ? 'ALL' : 'EXCHANGE')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'EXCHANGE' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
              Fellowship Exchange & Gain
            </button>

            <button
              onClick={() => setActiveTabSection(prev => prev === 'SPACE' ? 'ALL' : 'SPACE')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'SPACE' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bed className="w-4 h-4 text-blue-500" />
              Space & Living Setup
            </button>

            <button
              onClick={() => setActiveTabSection(prev => prev === 'SABBATH' ? 'ALL' : 'SABBATH')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'SABBATH' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Sabbath Schedule
            </button>

            <button
              onClick={() => setActiveTabSection(prev => prev === 'HOST' ? 'ALL' : 'HOST')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'HOST' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-500" />
              Host Family Profile
            </button>

            <button
              onClick={() => setActiveTabSection(prev => prev === 'LOCATION' ? 'ALL' : 'LOCATION')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'LOCATION' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-teal-500" />
              Church & Location
            </button>

            <button
              onClick={() => setActiveTabSection(prev => prev === 'REVIEWS' ? 'ALL' : 'REVIEWS')}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTabSection === 'REVIEWS' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Testimonies ({listing.reviewCount})
            </button>
          </div>

          {/* 2-COLUMN MAIN CONTENT & SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left 2/3 Main Body */}
            <div className="lg:col-span-2 space-y-10">

              {/* HOST FAMILY HEADER CARD */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                        {listing.familyName || `The ${listing.hostName} Household`}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300/50 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {listing.hostVerificationTier === 'CHURCH_VERIFIED' ? 'Church Verified Host' :
                         listing.hostVerificationTier === 'CONFERENCE_VERIFIED' ? 'Conference Verified Host' :
                         listing.hostVerificationTier === 'ADMIN_VERIFIED' ? 'Admin Verified Host' : 'Level 4 Verified Host'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {listing.lastActive || 'Active Today'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {listing.spouseInfo || listing.hostName} {listing.childrenInfo && `· 👨‍👩‍👧‍👦 ${listing.childrenInfo}`}
                    </p>

                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                      <Church className="w-4 h-4 text-emerald-600" />
                      Member in Good Standing at {listing.hostChurchName}
                    </p>
                    
                    {/* Response Metrics */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      {(listing.responseRate !== undefined || listing.acceptanceRate !== undefined) && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-blue-500" />
                          <span>Response rate: {listing.responseRate || 100}%</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span>Accepts {listing.acceptanceRate || 95}% of requests</span>
                        </div>
                      )}
                      {listing.responseTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Usually responds {listing.responseTime.toLowerCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative shrink-0 self-start sm:self-center">
                    <img 
                      src={listing.hostAvatar} 
                      alt={listing.hostName} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-[#1B5E4A] shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#1B5E4A] text-white" title="Verified Host">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
              </div>

              {/* SECTION: OVERVIEW */}
              {(activeTabSection === 'ALL' || activeTabSection === 'EXCHANGE') && (
                <div className="space-y-6">
                  
                  {/* WORKAWAY CULTURAL & FAITH EXCHANGE CARDS */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-5 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 tracking-wider uppercase">
                      <HeartHandshake className="w-4 h-4" />
                      <span>WORKAWAY-STYLE FELLOWSHIP EXCHANGE OFFERED</span>
                    </div>

                    <h3 className="text-lg font-extrabold font-display">What You Gain Staying with This Family</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {whatGuestsGain.map((gain, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-200">{gain}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Host Expectations & Guests' Household Contribution</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {householdContribution}
                      </p>
                    </div>
                  </div>

                  {/* Summary Description */}
                  <div className="space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      About the Homestay
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {listing.description}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: SPACE & LIVING CONDITIONS */}
              {(activeTabSection === 'ALL' || activeTabSection === 'SPACE') && (
                <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bed className="w-5 h-5 text-blue-500" />
                    <span>Living Space & Accommodation Details</span>
                  </h3>

                  {/* Property Details Pills Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#1B5E4A]" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">CAPACITY</span>
                        <span>Up to {listing.maxGuests} Guests</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <Bed className="w-5 h-5 text-blue-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">BEDROOMS</span>
                        <span>{listing.bedrooms} Private Room{listing.bedrooms > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <Bath className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">BATHROOMS</span>
                        <span>{listing.bathrooms} Bath</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <Leaf className="w-5 h-5 text-amber-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">DIET</span>
                        <span>Plant-Based</span>
                      </div>
                    </div>
                  </div>

                  {/* Deep Living Conditions Table */}
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">ROOM & BED ARRANGEMENTS</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{livingArrangement}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">DIETARY & KITCHEN SETUP</span>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">{dietary}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">INTERNET & WORKSPACE</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{wifi}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">PETS ON PREMISES</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{pets}</p>
                      </div>
                    </div>
                  </div>

                  {/* House Rules & Amenities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">House Guidelines</h4>
                      <ul className="space-y-2 text-xs">
                        {listing.houseRules.map((rule, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospitality Amenities</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {listing.amenities.map((amenity, idx) => (
                          <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: SABBATH SCHEDULE */}
              {(activeTabSection === 'ALL' || activeTabSection === 'SABBATH') && (
                <div id="sabbath-section" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span>Sabbath Schedule & Fellowship Itinerary</span>
                    </h3>
                    <span className="text-xs font-bold text-[#1B5E4A]">Friday Sunset – Sunday Morning</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-800/80 border border-rose-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-[#1B5E4A] font-extrabold text-xs">
                        <Clock className="w-4 h-4" />
                        <span>FRIDAY EVENING</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">Friday Sunset Welcome & Vespers</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
                        Warm welcome, sunset prayer ring, song singing, and home-cooked plant-based dinner with host family.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                        <Church className="w-4 h-4" />
                        <span>SABBATH MORNING</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">Worship at Local SDA Church</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
                        Sabbath School lesson study, choir worship, Divine Service at {listing.nearestSdaChurch.name}, followed by potluck fellowship.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-blue-500 font-extrabold text-xs">
                        <Sun className="w-4 h-4" />
                        <span>SABBATH AFTERNOON</span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">Nature Walk & Farewell Vespers</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-medium">
                        Afternoon nature trail walk, Bible discussion, sunset closing vespers, and optional Sunday breakfast before departure.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: HOST FAMILY BIO */}
              {(activeTabSection === 'ALL' || activeTabSection === 'HOST') && (
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span>Host Household Story & Family Background</span>
                  </h3>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
                    <p className="font-medium">{listing.familyStory || listing.description}</p>
                    
                    {listing.languagesSpoken && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                        <Globe2 className="w-4 h-4 text-[#1B5E4A]" />
                        <span>Spoken Languages: {listing.languagesSpoken.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: LOCATION & GETTING HERE */}
              {(activeTabSection === 'ALL' || activeTabSection === 'LOCATION') && (
                <div id="church-section" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-teal-500" />
                    <span>Location, Host Worshipped Church & Getting Here</span>
                  </h3>

                  {/* Host Worshipped Church Card */}
                  <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                    <div className="flex items-center justify-between text-emerald-950 dark:text-emerald-200">
                      <div className="flex items-center gap-2.5 font-extrabold text-base">
                        <Church className="w-5 h-5 text-emerald-600" />
                        <span>Host Worshipped Church Member</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                        SDA Church Membership
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {listing.hostChurchName || listing.nearestSdaChurch.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {listing.nearestSdaChurch.address} ({listing.nearestSdaChurch.distanceMiles} miles from home)
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">Sabbath School: <strong>9:30 AM</strong> · Divine Worship: <strong>11:00 AM</strong></span>
                      <button
                        onClick={() => {
                          setActiveTab('MAP');
                          onClose();
                        }}
                        className="text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline"
                      >
                        View in Church Directory →
                      </button>
                    </div>
                  </div>

                  {/* Getting Here Directions & Nearby */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Car className="w-4 h-4 text-[#1B5E4A]" />
                        <span>Transportation & Pickup</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {directions}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Compass className="w-4 h-4 text-teal-500" />
                        <span>Nearby Highlights</span>
                      </div>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                        {nearbyAttractions.map((attr, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-[#1B5E4A]">•</span> {attr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: GUEST TESTIMONIES & REVIEWS */}
              {(activeTabSection === 'ALL' || activeTabSection === 'REVIEWS') && (
                <div id="reviews-section" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  
                  {/* Header Rating Hero Box */}
                  <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#1B5E4A]/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                          <span className="text-4xl font-extrabold font-display text-white">{listing.rating}</span>
                          <div className="flex items-center gap-0.5 mt-1 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-extrabold font-display">Guest Fellowship Testimonies</h3>
                          <p className="text-xs text-slate-300">
                            {listing.reviewCount} verified guest testimonies & pastoral endorsements
                          </p>
                          <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Verified Member Stay Reviews
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsAddingReview(!isAddingReview)}
                        className="px-5 py-2.5 rounded-2xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isAddingReview ? 'Cancel Review' : 'Write a Testimony'}</span>
                      </button>
                    </div>

                    {/* Rating Progress Bars - Human Experience Focus */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>Family Welcome & Hospitality</span>
                          <span>5.0 / 5.0</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-[#1B5E4A] h-2 rounded-full w-[100%]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>Sabbath Experience & Fellowship</span>
                          <span>5.0 / 5.0</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full w-[100%]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>Respect & Communication</span>
                          <span>5.0 / 5.0</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-400 h-2 rounded-full w-[100%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form to Write a Testimony */}
                  {isAddingReview && (
                    <form onSubmit={handleReviewSubmit} className="p-6 rounded-3xl bg-rose-50/60 dark:bg-slate-800/80 border border-rose-200 dark:border-slate-700 space-y-4 text-xs animate-in fade-in zoom-in-95">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#1B5E4A] fill-[#1B5E4A]" />
                        Write a Fellowship Review & Testimony
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Overall Experience
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star 
                                    className={`w-5 h-5 ${star <= newRating ? 'fill-[#1B5E4A] text-[#1B5E4A]' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Sabbath Friendliness
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewSabbath(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star 
                                    className={`w-5 h-5 ${star <= newSabbath ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Christian Fellowship
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewFellowship(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star 
                                    className={`w-5 h-5 ${star <= newFellowship ? 'fill-blue-400 text-blue-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Cleanliness & Comfort
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewCleanliness(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <Star 
                                    className={`w-5 h-5 ${star <= newCleanliness ? 'fill-emerald-400 text-emerald-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Your Home Church
                            </label>
                            <input
                              type="text"
                              required
                              value={reviewerChurchInput}
                              onChange={e => setReviewerChurchInput(e.target.value)}
                              placeholder="e.g. Pioneer Memorial Church"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Testimony & Guest Experience Details
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Share details about the Sabbath fellowship, host hospitality, meal quality, and local church worship..."
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingReview(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-bold shadow-md"
                        >
                          Post Testimony
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Search & Filter Reviews Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search reviews..."
                        value={reviewSearchQuery}
                        onChange={e => setReviewSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">Filter:</span>
                      <button
                        onClick={() => setStarFilter('ALL')}
                        className={`px-3 py-1 rounded-lg font-bold ${
                          starFilter === 'ALL' 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        All ({listingReviews.length})
                      </button>
                      <button
                        onClick={() => setStarFilter(5)}
                        className={`px-3 py-1 rounded-lg font-bold ${
                          starFilter === 5 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        5 Stars
                      </button>
                    </div>
                  </div>

                  {/* Reviews Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredReviews.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-400 text-xs italic">
                        No reviews match your search filter.
                      </div>
                    ) : (
                      filteredReviews.map((rev) => (
                        <div 
                          key={rev.id} 
                          className="p-5 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img src={rev.reviewerAvatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30" />
                                <div>
                                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{rev.reviewerName}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{rev.reviewerChurch}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{rev.rating}.0</span>
                              </div>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              "{rev.comment}"
                            </p>

                            <div className="flex gap-3 text-[10px] font-bold">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Cleanliness: {rev.cleanlinessRating}
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Sabbath: {rev.sabbathFriendlinessRating}
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                Fellowship: {rev.fellowshipRating}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Verified Member Stay
                            </span>
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right 1/3 Sticky Booking / Direct Contact Card */}
            <div>
              <div className="sticky top-20 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
                
                {/* Header Title & Rating */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                    Reserve
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg text-amber-900 dark:text-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{listing.rating} ({listing.reviewCount})</span>
                  </div>
                </div>

                {/* Sabbath Weekend Note */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-1 text-xs">
                  <div className="font-extrabold flex items-center gap-1.5 text-[#1B5E4A]">
                    <Sun className="w-4 h-4" /> Sabbath Weekend Stay
                  </div>
                  <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 font-medium">
                    Friday evening sunset vespers, Sabbath divine worship, and shared family fellowship.
                  </p>
                </div>

                {/* Booking Picker Box */}
                <div className="rounded-2xl border border-slate-300 dark:border-slate-700 divide-y divide-slate-300 dark:divide-slate-700 text-xs overflow-hidden">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80">
                    <label className="block text-[9px] font-extrabold uppercase text-[#1B5E4A] mb-1">
                      SELECT SABBATH WEEKEND
                    </label>
                    <select className="w-full bg-transparent font-bold cursor-pointer text-xs text-slate-900 dark:text-white focus:outline-none">
                      <option value="2026-08-14">Fri Aug 14 – Sun Aug 16 (Sabbath Stay)</option>
                      <option value="2026-08-21">Fri Aug 21 – Sun Aug 23 (Sabbath Stay)</option>
                      <option value="2026-08-28">Fri Aug 28 – Sun Aug 30 (Sabbath Stay)</option>
                      <option value="2026-09-04">Fri Sep 04 – Sun Sep 06 (Sabbath Stay)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-slate-300 dark:divide-slate-700 bg-slate-100/50 dark:bg-slate-900/50">
                    <div className="p-2.5">
                      <span className="block text-[9px] font-extrabold uppercase text-slate-400">ARRIVE</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Friday Sunset</span>
                    </div>
                    <div className="p-2.5">
                      <span className="block text-[9px] font-extrabold uppercase text-slate-400">DEPART</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Sunday Morning</span>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">GUESTS</label>
                    <select className="w-full bg-transparent font-bold cursor-pointer text-slate-900 dark:text-white focus:outline-none">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4 Guests</option>
                    </select>
                  </div>
                </div>

                {/* Primary Trigger Button */}
                <button
                  id="btn-trigger-stay-request"
                  onClick={() => onRequestStay(listing)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1B5E4A] to-[#E00B41] hover:opacity-95 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Stay</span>
                </button>

                {/* Direct Message Host */}
                <button
                  onClick={() => {
                    sendMessage(listing.hostId, `Hello ${listing.hostName}, I am inquiring about your stay listing: ${listing.title}.`);
                    setActiveTab('MESSAGES');
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#1B5E4A]" />
                  <span>Message Host First</span>
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Photo Lightbox Overlay Modal */}
      {showAllPhotosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white max-w-5xl mx-auto w-full">
            <div>
              <h3 className="font-extrabold text-lg">{listing.title} Photos</h3>
              <p className="text-xs text-slate-400">{activePhotoIndex + 1} of {listing.images.length}</p>
            </div>
            <button 
              onClick={() => setShowAllPhotosModal(false)} 
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full flex items-center justify-center relative">
            <button
              onClick={() => setActivePhotoIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)}
              className="absolute left-2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img 
              src={listing.images[activePhotoIndex]} 
              alt="" 
              className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" 
            />

            <button
              onClick={() => setActivePhotoIndex((prev) => (prev + 1) % listing.images.length)}
              className="absolute right-2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-3xl mx-auto w-full flex items-center justify-center gap-3 overflow-x-auto p-2 scrollbar-none">
            {listing.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt="" 
                onClick={() => setActivePhotoIndex(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover cursor-pointer transition-all border-2 ${
                  activePhotoIndex === idx ? 'border-[#1B5E4A] scale-105 ring-2 ring-[#1B5E4A]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
