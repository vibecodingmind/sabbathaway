import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { PLAN_DEFINITIONS, PLATFORM_MEMBERSHIP_DISCLAIMER } from '../lib/membershipEngine';
import { useApp } from '../context/AppContext';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { PaymentTransaction } from '../types';

export const MembershipDashboardView: React.FC = () => {
  const { userMembership, transactions, currentUser, renewMembership, setActiveTab } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [isRenewingModalOpen, setIsRenewingModalOpen] = useState(false);

  const planInfo = PLAN_DEFINITIONS[userMembership.plan];
  
  // Calculate days remaining
  const expDate = new Date(userMembership.expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const userTransactions = (transactions || []).filter(t => t.userId === currentUser?.id || t.userName === currentUser?.name);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#FF385C] border border-rose-200/80 text-xs font-bold">
              Household Account
            </span>
            <span className="text-xs text-slate-500 font-medium">Ref: {userMembership.id}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Membership & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your annual AdventistStay plan, household coverage, payment history, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('PRICING')}
            className="px-4 py-2.5 rounded-2xl bg-[#FF385C] text-white text-xs font-bold hover:bg-[#E03150] transition-colors shadow-md shadow-rose-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Explore All Plans
          </button>
        </div>
      </div>

      {/* Main Membership Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white shadow-2xl relative overflow-hidden space-y-6 border border-rose-900/30">
        
        {/* Top bar in card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-800/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{planInfo.name} Membership</h2>
              {planInfo.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF385C] text-white text-[10px] font-black uppercase">
                  {planInfo.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-rose-200/80 font-medium">{planInfo.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              userMembership.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : userMembership.status === 'EXPIRED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                : 'bg-slate-700 text-slate-300'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              {userMembership.status}
            </span>
          </div>
        </div>

        {/* Stats Grid inside Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <span className="text-rose-200/80 text-[11px] font-medium flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Annual Plan Fee
            </span>
            <span className="text-2xl font-black text-white">${userMembership.price} USD</span>
            <span className="text-[10px] text-rose-200/70 block">Billed annually</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <span className="text-rose-200/80 text-[11px] font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Start Date
            </span>
            <span className="text-base font-bold text-white">
              {new Date(userMembership.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-rose-200/70 block">Activated via {userMembership.paymentProvider}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <span className="text-rose-200/80 text-[11px] font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Expiration Date
            </span>
            <span className="text-base font-bold text-white">
              {new Date(userMembership.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold block">
              {userMembership.plan === 'FREE' ? 'Infinite Free Access' : `${daysRemaining} days remaining`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
            <span className="text-rose-200/80 text-[11px] font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Household Covered
            </span>
            <span className="text-sm font-bold text-white truncate block">
              {userMembership.householdName || `${currentUser.name} Household`}
            </span>
            <span className="text-[10px] text-rose-200/70 block">
              {userMembership.coveredMembers?.length || 1} family members
            </span>
          </div>

        </div>

        {/* Covered Household Members detail */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-rose-200">Covered Members:</span>
          {userMembership.coveredMembers && userMembership.coveredMembers.length > 0 ? (
            userMembership.coveredMembers.map((member, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                {member}
              </span>
            ))
          ) : (
            <span className="text-xs text-rose-200/80">{currentUser.name}</span>
          )}
        </div>

        {/* Renewal Actions */}
        <div className="pt-4 border-t border-rose-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
          <p className="text-xs text-rose-200/80 italic max-w-xl">
            {PLATFORM_MEMBERSHIP_DISCLAIMER}
          </p>

          <div className="flex items-center gap-3">
            {userMembership.plan !== 'FREE' && (
              <button
                onClick={() => setIsRenewingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center gap-1.5 border border-white/15"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Renew Subscription
              </button>
            )}

            <button
              onClick={() => setActiveTab('PRICING')}
              className="px-5 py-2 rounded-xl bg-[#FF385C] text-white font-bold hover:bg-[#E03150] transition-colors shadow-lg shadow-rose-500/20"
            >
              Upgrade Membership
            </button>
          </div>
        </div>

      </div>

      {/* Feature Access Matrix & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Included Capabilities */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Features Unlocked with {planInfo.name}
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {planInfo.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Opportunities */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF385C]" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Available Upgrades
            </h3>
          </div>

          {userMembership.plan === 'GLOBAL_FAMILY' ? (
            <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-[#FF385C] mx-auto" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Top Tier Membership Active!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your family enjoys complete access to both Sabbath Hospitality Stays and International Family Exchange.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Upgrade to <span className="font-bold text-slate-900 dark:text-white">Global Family ($79/yr)</span> for complete combined access:
              </p>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-slate-800 border border-rose-200/80 dark:border-rose-900/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white text-sm">GLOBAL FAMILY</span>
                  <span className="text-base font-black text-[#FF385C]">$79 / yr</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Complete Sabbath Stay Hosting & Guest privileges</li>
                  <li>• Complete Family-to-Family Exchange access</li>
                  <li>• Priority support & advanced verification</li>
                </ul>
                <button
                  onClick={() => setActiveTab('PRICING')}
                  className="w-full py-2.5 rounded-xl bg-[#FF385C] text-white font-bold text-xs hover:bg-[#E03150] transition-colors shadow-md shadow-rose-500/20 flex items-center justify-center gap-1"
                >
                  Upgrade Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Payment History & Receipts */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF385C]" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Payment History & Receipts
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {userTransactions.length} transaction records
          </span>
        </div>

        {userTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Description / Plan</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Provider</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-300">
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-2 font-black text-slate-900 dark:text-white">
                      ${tx.amount} USD
                    </td>
                    <td className="py-3.5 px-2 capitalize font-semibold text-slate-600 dark:text-slate-400">
                      {tx.provider}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#FF385C]" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No payment transaction history recorded yet.
          </div>
        )}
      </div>

      {/* Receipt Modal Popup */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Official Receipt</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Receipt #</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">{new Date(selectedReceipt.transactionDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Member Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedReceipt.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Plan Purchased</span>
                <span className="font-bold text-[#FF385C]">{selectedReceipt.plan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold capitalize text-slate-900 dark:text-white">{selectedReceipt.provider}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-sm text-slate-900 dark:text-white">
                <span>Total Paid</span>
                <span>${selectedReceipt.amount} USD</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic text-center">
              This receipt validates 12 months of active household membership access to the AdventistStay network.
            </p>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Renewal Modal Trigger */}
      {isRenewingModalOpen && (
        <PaymentCheckoutModal
          isOpen={isRenewingModalOpen}
          onClose={() => setIsRenewingModalOpen(false)}
          targetPlan={userMembership.plan}
          onSuccess={() => setIsRenewingModalOpen(false)}
        />
      )}

    </div>
  );
};
