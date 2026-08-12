import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  Key,
  Church,
  Sparkles,
  ArrowRight,
  Heart,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Listing, StayRequest } from '../types';

export const MyStaysView: React.FC = () => {
  const { stayRequests, currentUser, setActiveTab, sendMessage, listings, setSelectedListing, setIsStayModalOpen } = useApp();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownloadBookingPdf = (req: StayRequest) => {
    setIsGeneratingPdf(req.id);
    setTimeout(() => {
      setIsGeneratingPdf(null);
      
      const docContent = `
================================================================================
             ADVENTISTSTAY - OFFICIAL SABBATH HOSPITALITY CONFIRMATION
================================================================================
Confirmation Reference : #${req.id.toUpperCase()}
Issue Date             : ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
Status                 : CONFIRMED & VERIFIED (Sabbath Hospitality)

--------------------------------------------------------------------------------
1. GUEST INFORMATION
--------------------------------------------------------------------------------
Guest Name             : ${req.guestName}
Home Church            : ${req.guestChurch}
Verification Status    : Verified Member in Good Standing
Guest Count            : ${req.guestCount} ${req.guestCount === 1 ? 'Guest' : 'Guests'}

--------------------------------------------------------------------------------
2. HOST HOUSEHOLD & STAY LOCATION
--------------------------------------------------------------------------------
Listing Title          : ${req.listingTitle}
Host Household         : ${req.hostName}
Host Worshipped Church : ${req.listingCity} Local Seventh-day Adventist Church
Location               : ${req.listingCity}

--------------------------------------------------------------------------------
3. SABBATH STAY DATES & CHECK-IN
--------------------------------------------------------------------------------
Check-In Date          : ${req.checkInDate} (Friday Sunset Vespers)
Check-Out Date         : ${req.checkOutDate} (Sunday Morning)
Check-In Instructions  : ${req.checkInInstructions || 'Welcome! Arrival time is Friday sunset vespers (6:30 PM). Parking available on driveway.'}

--------------------------------------------------------------------------------
4. CHRISTIAN HOSPITALITY PLEDGE
--------------------------------------------------------------------------------
This stay is provided at $0 cost under the Seventh-day Adventist global 
fellowship network. Guest and host commit to mutual Christian respect, 
Sabbath worship, and warm hospitality.

================================================================================
Thank you for building trust in our global Adventist Stay community!
Support & Safety Contact: support@adventiststay.org
================================================================================
`;

      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AdventistStay_Booking_Confirmation_${req.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadToast(`📄 Booking Details downloaded for ${req.listingTitle}!`);
      setTimeout(() => setDownloadToast(null), 4000);
    }, 1000);
  };

  const myRequests = (stayRequests || []).filter(r => r?.guestId === currentUser?.id);

  const filteredRequests = myRequests.filter(req => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    return true;
  });

  const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;
  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;

  const handleOpenListing = (listingId: string) => {
    const lst = listings.find(l => l.id === listingId);
    if (lst) {
      setSelectedListing(lst);
    }
  };

  return (
    <div id="my-stays-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification Banner */}
      {downloadToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>{downloadToast}</span>
          </div>
          <button onClick={() => setDownloadToast(null)} className="opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#FF385C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-bold border border-rose-500/30">
              <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>GUEST HOSPITALITY DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              My Adventist Hospitality Stays
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Manage your confirmed weekend visits, track stay request statuses, view host check-in instructions, and connect with host families.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl font-extrabold text-white block">{myRequests.length}</span>
              <span className="text-[10px] text-slate-300 uppercase font-bold">Total Stays</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl font-extrabold text-emerald-400 block">{approvedCount}</span>
              <span className="text-[10px] text-slate-300 uppercase font-bold">Confirmed Stays</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-extrabold text-[#FF385C] block">$0</span>
              <span className="text-[10px] text-slate-300 uppercase font-bold">Member Hospitality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-2 rounded-xl transition-all ${
            filterStatus === 'ALL' 
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Requests ({myRequests.length})
        </button>

        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            filterStatus === 'APPROVED' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Confirmed Stays ({approvedCount})
        </button>

        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            filterStatus === 'PENDING' 
              ? 'bg-amber-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Approval ({pendingCount})
        </button>
      </div>

      {/* Main Content Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#FF385C] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
            No Hospitality Requests Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore verified Seventh-day Adventist host homes worldwide and request zero-cost Christian hospitality for your upcoming Sabbath trips or church events.
          </p>
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className="px-6 py-3 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs shadow-lg transition-all"
          >
            Explore Active Host Listings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              id={`stay-request-card-${req.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start sm:items-center gap-4">
                  <div 
                    className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 cursor-pointer group"
                    onClick={() => handleOpenListing(req.listingId)}
                  >
                    <img 
                      src={req.listingImage} 
                      alt={req.listingTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF385C]" /> {req.listingCity}
                      </span>
                    </div>

                    <h3 
                      onClick={() => handleOpenListing(req.listingId)}
                      className="text-lg font-extrabold text-slate-900 dark:text-white font-display hover:text-[#FF385C] cursor-pointer transition-colors"
                    >
                      {req.listingTitle}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Host Household: <strong>{req.hostName}</strong> · {req.guestCount} {req.guestCount === 1 ? 'Guest' : 'Guests'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
                      <span>Sabbath Dates: {req.checkInDate} to {req.checkOutDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id={`download-booking-btn-${req.id}`}
                    onClick={() => handleDownloadBookingPdf(req)}
                    disabled={isGeneratingPdf === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isGeneratingPdf === req.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF385C]" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5 text-[#FF385C]" />
                        <span>Download Booking Details</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenListing(req.listingId)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
                  >
                    View Listing Page
                  </button>

                  <button
                    id={`contact-host-btn-${req.id}`}
                    onClick={() => {
                      sendMessage(req.hostId, `Hello ${req.hostName}, regarding my stay request #${req.id}...`, req.id);
                      setActiveTab('MESSAGES');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs shadow-md transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Host</span>
                  </button>
                </div>
              </div>

              {/* Guest Purpose Note & Check-in Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Trip Purpose Note</span>
                  <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                    "{req.purposeNote || 'Visiting for Sabbath church worship and local Adventist fellowship.'}"
                  </p>
                </div>

                {req.status === 'APPROVED' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                    <div className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-emerald-600" />
                      Host Check-In Instructions
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                      "{req.checkInInstructions || 'Welcome! Arrival time is Friday sunset vespers (6:30 PM). Parking available in driveway.'}"
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                    <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Approval Status
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      The host family is reviewing your request and pastoral background details. You will receive a notification in messages upon approval.
                    </p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
