import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  HeartHandshake, 
  CheckCircle2,
  Compass
} from 'lucide-react';
import { Listing, StayPurpose, GuestCategory } from '../types';
import { useApp } from '../context/AppContext';
import { canRequestStay } from '../lib/membershipEngine';
import { InteractiveDateRangePicker } from './InteractiveDateRangePicker';

interface StayRequestModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export const StayRequestModal: React.FC<StayRequestModalProps> = ({ listing, onClose }) => {
  const { currentUser, createStayRequest, setIsStayModalOpen, setActiveTab, userMembership, openUpgradePrompt } = useApp();

  const [checkInDate, setCheckInDate] = useState('2026-08-14'); // Friday
  const [checkOutDate, setCheckOutDate] = useState('2026-08-16'); // Sunday
  const [guestCount, setGuestCount] = useState(1);
  const [guestCategory, setGuestCategory] = useState<GuestCategory>(currentUser.guestCategory || 'ADVENTIST_GUEST');
  const [purpose, setPurpose] = useState<StayPurpose>('WORSHIP_VISIT');
  const [purposeNote, setPurposeNote] = useState(
    `Greetings ${listing?.familyName || listing?.hostName || 'Host Family'}! I would love to join your family for Sabbath worship, Friday vespers dinner, and church fellowship.`
  );
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  const handleCheckInChange = (newVal: string) => {
    if (!newVal) return;
    const d = new Date(newVal + 'T00:00:00');
    const day = d.getDay(); // 5 = Friday
    let fridayDate = d;
    if (day !== 5) {
      // Adjust to the Friday of that week
      const diff = 5 - day;
      fridayDate = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
    }
    const checkInStr = fridayDate.toISOString().split('T')[0];
    
    // Set checkOut to Sunday morning (2 days after Friday)
    const sundayDate = new Date(fridayDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const checkOutStr = sundayDate.toISOString().split('T')[0];

    setCheckInDate(checkInStr);
    setCheckOutDate(checkOutStr);
  };

  useEffect(() => {
    if (listing) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [listing]);

  if (!listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeAccepted) return;

    // Check membership eligibility (Sabbath Member or Global Family)
    if (!canRequestStay(userMembership)) {
      setIsStayModalOpen(false);
      openUpgradePrompt('STAY_REQUEST');
      return;
    }

    createStayRequest({
      listingId: listing.id,
      listingTitle: listing.title,
      listingCity: listing.city,
      listingImage: listing.images[0],
      guestId: currentUser.id,
      guestName: currentUser.name,
      guestAvatar: currentUser.avatarUrl,
      guestChurch: currentUser.homeChurchName,
      guestVerificationTier: currentUser.verificationTier,
      hostId: listing.hostId,
      hostName: listing.hostName,
      checkInDate,
      checkOutDate,
      guestCount,
      purpose,
      purposeNote
    });

    setIsStayModalOpen(false);
    setActiveTab('MY_STAYS');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="stay-request-dialog"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B5E4A] text-white flex items-center justify-center font-bold shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Sabbath Hospitality
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Sabbath Family Hospitality • Non-Commercial Fellowship
              </p>
            </div>
          </div>

          <button
            id="close-stay-request-modal"
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Host Family Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <img 
            src={listing.hostAvatar} 
            alt="" 
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1B5E4A] flex-shrink-0"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {listing.familyName || `The ${listing.hostName} Family`}
            </h4>
            <p className="text-xs text-slate-500">
              Host Family at {listing.hostChurchName} ({listing.city}, {listing.country})
            </p>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-[#1B5E4A] dark:bg-rose-950 dark:text-rose-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B5E4A]" />
              Level 4 Verified Adventist Family
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 dark:text-slate-200 text-xs">
          
          {/* Guest Category Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1B5E4A]" /> Select Guest Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGuestCategory('ADVENTIST_GUEST')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  guestCategory === 'ADVENTIST_GUEST'
                    ? 'border-[#1B5E4A] bg-rose-50/60 dark:bg-rose-950/40 text-slate-900 dark:text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Adventist Guest</div>
                <div className="text-[10px] text-slate-500 font-normal">Visiting member for church, mission, or study</div>
              </button>

              <button
                type="button"
                onClick={() => setGuestCategory('SABBATH_EXPLORER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  guestCategory === 'SABBATH_EXPLORER'
                    ? 'border-[#1B5E4A] bg-rose-50/60 dark:bg-rose-950/40 text-slate-900 dark:text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">Sabbath Explorer</div>
                <div className="text-[10px] text-slate-500 font-normal">Interested in experiencing Adventist Sabbath culture</div>
              </button>
            </div>
          </div>

          {/* Mandatory Sabbath Stay Rule Banner */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#1B5E4A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white">
                Sabbath Weekend Stay Policy
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mt-0.5">
                Hospitality stays are structured to give guests a complete Sabbath fellowship experience. Dates are locked to <strong>Friday evening arrival</strong> and <strong>Saturday night stay</strong> (departing Sunday morning). Other weekdays are disabled.
              </p>
            </div>
          </div>

          {/* Interactive Date Range Picker */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1B5E4A]" /> Select Travel Dates (Interactive Calendar Picker)
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                Sabbath Weekend Friendly
              </span>
            </label>

            <InteractiveDateRangePicker 
              startDate={checkInDate}
              endDate={checkOutDate}
              onChange={(start, end) => {
                setCheckInDate(start);
                setCheckOutDate(end);
              }}
            />
          </div>

          {/* Guest Count & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#1B5E4A]" /> Number of Guests
              </label>
              <select
                id="request-guest-count"
                value={guestCount}
                onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
              >
                {Array.from({ length: listing.maxGuests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1B5E4A]" /> Primary Experience
              </label>
              <select
                id="request-purpose"
                value={purpose}
                onChange={e => setPurpose(e.target.value as StayPurpose)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
              >
                <option value="WORSHIP_VISIT">Sabbath Family Experience & Church Visit</option>
                <option value="MISSION_WORK">Mission & Fellowship Work</option>
                <option value="CONFERENCE_EVENT">Conference / Event Gathering</option>
                <option value="EDUCATION_STUDY">Adventist Education / University Visit</option>
                <option value="FAMILY_TOURISM">Adventist Lifestyle & Cultural Exchange</option>
              </select>
            </div>
          </div>

          {/* Intro Message */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#1B5E4A]" /> Introduce Yourself to the Host Family
            </label>
            <textarea
              id="request-intro-message"
              rows={3}
              required
              value={purposeNote}
              onChange={e => setPurposeNote(e.target.value)}
              placeholder="Tell the host family about yourself, your background, and what you look forward to during Sabbath fellowship..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#1B5E4A]"
            />
          </div>

          {/* Christian Hospitality Pledge */}
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="chk-hospitality-pledge"
                type="checkbox"
                checked={pledgeAccepted}
                onChange={e => setPledgeAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#1B5E4A] focus:ring-[#1B5E4A] w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug">
                <strong>Christian Hospitality Pledge:</strong> I confirm I am seeking authentic Sabbath family hospitality. I agree to respect the host family's home guidelines, observe Adventist standards of Sabbath decorum, and understand that hospitality is provided in the spirit of Christian fellowship with zero commercial rental fees.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="cancel-stay-request"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              id="submit-stay-request-btn"
              type="submit"
              disabled={!pledgeAccepted}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-bold shadow-lg disabled:opacity-50 transition-all"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Request Sabbath Hospitality</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
