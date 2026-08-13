import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { DashboardLayout } from './components/DashboardLayout';
import { Footer } from './components/Footer';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { StayRequestModal } from './components/StayRequestModal';
import { InteractiveMap } from './components/InteractiveMap';
import { VerificationCenter } from './components/VerificationCenter';
import { MessagingCenter } from './components/MessagingCenter';
import { MyStaysView } from './components/MyStaysView';
import { GuestDashboardView } from './components/GuestDashboardView';
import { HostManageView } from './components/HostManageView';
import { AdminDashboard } from './components/AdminDashboard';
import { SafetyEmergencyModal } from './components/SafetyEmergencyModal';
import { DocsArchitectureModal } from './components/DocsArchitectureModal';
import { FamilyExchangeView } from './components/FamilyExchangeView';
import { PricingView } from './components/PricingView';
import { MembershipDashboardView } from './components/MembershipDashboardView';
import { UpgradePromptModal } from './components/UpgradePromptModal';
import { PaymentCheckoutModal } from './components/PaymentCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { Listing } from './types';
import { filterListings } from './lib/filterUtils';
import { HeartHandshake, SlidersHorizontal, CheckCircle2, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    listings, 
    filters, 
    selectedListing, 
    setSelectedListing, 
    isStayModalOpen, 
    setIsStayModalOpen,
    isPaymentCheckoutOpen,
    setIsPaymentCheckoutOpen,
    checkoutTargetPlan,
    exploreViewMode,
    apiOnline
  } = useApp();

  const [detailListing, setDetailListing] = useState<Listing | null>(null);
  const [membershipBanner, setMembershipBanner] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const membership = params.get('membership');
    if (membership === 'success') {
      setMembershipBanner('Membership payment received. Your plan will activate once Stripe confirms the webhook.');
      setActiveTab('MEMBERSHIP');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (membership === 'cancelled') {
      setMembershipBanner('Checkout cancelled. You can resume membership anytime from Pricing.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setActiveTab]);

  // Filter listings based on user search parameters & stay categories
  const filteredListings = filterListings(listings, filters);

  const isHomeView = activeTab === 'EXPLORE' || activeTab === 'MAP';

  const globalModals = (
    <>
      {(selectedListing || detailListing) && !isStayModalOpen && (
        <ListingDetailModal
          listing={selectedListing || detailListing}
          onClose={() => {
            setSelectedListing(null);
            setDetailListing(null);
          }}
          onRequestStay={(l) => {
            setSelectedListing(l);
            setDetailListing(null);
            setIsStayModalOpen(true);
          }}
        />
      )}

      {isStayModalOpen && selectedListing && (
        <StayRequestModal
          listing={selectedListing}
          onClose={() => setIsStayModalOpen(false)}
        />
      )}

      <SafetyEmergencyModal />
      <UpgradePromptModal />
      <AuthModal />

      {isPaymentCheckoutOpen && (
        <PaymentCheckoutModal
          isOpen={isPaymentCheckoutOpen}
          onClose={() => setIsPaymentCheckoutOpen(false)}
          targetPlan={checkoutTargetPlan}
        />
      )}
    </>
  );

  // Full-width home/explore/map view without left dashboard menu
  if (isHomeView) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors font-sans antialiased">
        <Header />
        <CategoryBar />

        {membershipBanner && (
          <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="flex items-start gap-3 rounded-2xl border border-[#1B5E4A]/25 bg-[#EEF5F1] px-4 py-3 text-sm text-[#134536]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="flex-1 font-medium">{membershipBanner}</p>
              <button type="button" onClick={() => setMembershipBanner(null)} className="p-1 rounded-lg hover:bg-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!apiOnline && (
          <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
            <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              API offline — showing local demo data. Start the server to persist changes.
            </p>
          </div>
        )}

        <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'EXPLORE' && (
            <div className="space-y-6">
              
              {/* Non-profit Guarantee Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Showing {filteredListings.length} Adventist host homes worldwide
                  </span>
                  {filters.selectedCategories.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E4A]/10 text-[#1B5E4A] font-bold text-[11px]">
                      Filtered by: {filters.selectedCategories.join(', ')}
                    </span>
                  )}
                  {filters.destination && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      Location: {filters.destination}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>100% Free Member Stay</span>
                </div>
              </div>

              {/* Display Content Based on View Mode */}
              {exploreViewMode === 'MAP' ? (
                <InteractiveMap />
              ) : filteredListings.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Stays Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing category filters or selecting "All Stays" in the category bar.
                  </p>
                </div>
              ) : exploreViewMode === 'LIST' ? (
                /* Vertical List View */
                <div className="space-y-4 max-w-4xl mx-auto">
                  {filteredListings.map(list => (
                    <ListingCard
                      key={list.id}
                      listing={list}
                      viewMode="LIST"
                      onSelect={(l) => setDetailListing(l)}
                    />
                  ))}
                </div>
              ) : (
                /* Grid View (Default Full Width Responsive) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                  {filteredListings.map(list => (
                    <ListingCard
                      key={list.id}
                      listing={list}
                      viewMode="GRID"
                      onSelect={(l) => setDetailListing(l)}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

          {activeTab === 'MAP' && <InteractiveMap />}
        </main>

        <Footer />
        {globalModals}
      </div>
    );
  }

  // Dashboard / Workspace layout for dedicated portal views
  return (
    <DashboardLayout>
      {/* FAMILY EXCHANGE PROGRAM TAB */}
      {activeTab === 'FAMILY_EXCHANGE' && <FamilyExchangeView />}

      {/* VERIFICATION CENTER TAB */}
      {activeTab === 'VERIFICATION' && <VerificationCenter />}

      {/* MY STAYS / GUEST DASHBOARD TAB */}
      {activeTab === 'MY_STAYS' && <GuestDashboardView />}

      {/* MESSAGING TAB */}
      {activeTab === 'MESSAGES' && <MessagingCenter />}

      {/* HOST MANAGE TAB */}
      {activeTab === 'HOST_MANAGE' && <HostManageView />}

      {/* PRICING PLANS TAB */}
      {activeTab === 'PRICING' && <PricingView />}

      {/* MEMBERSHIP DASHBOARD TAB */}
      {activeTab === 'MEMBERSHIP' && <MembershipDashboardView />}

      {/* ADMIN DASHBOARD TAB */}
      {activeTab === 'ADMIN' && <AdminDashboard />}

      {/* SYSTEM DOCS & SRS TAB */}
      {activeTab === 'DOCS_SRS' && <DocsArchitectureModal />}

      {globalModals}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
