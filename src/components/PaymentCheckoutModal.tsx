import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle2, Lock, Sparkles, Building2 } from 'lucide-react';
import { SubscriptionPlan, PaymentProvider } from '../types';
import { PLAN_DEFINITIONS, PLATFORM_MEMBERSHIP_DISCLAIMER, calculateUpgradePrice } from '../lib/membershipEngine';
import { useApp } from '../context/AppContext';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: SubscriptionPlan;
  onSuccess?: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  targetPlan,
  onSuccess
}) => {
  const { currentUser, userMembership, subscribeToPlan } = useApp();
  
  const [provider, setProvider] = useState<PaymentProvider>('stripe');
  const [householdName, setHouseholdName] = useState(
    userMembership?.householdName || `${currentUser.name.replace(/[^a-zA-Z\s]/g, '')} Household`
  );
  const [coveredMembersInput, setCoveredMembersInput] = useState(
    userMembership?.coveredMembers?.join(', ') || currentUser.name
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<{
    receiptNumber: string;
    amount: number;
    plan: string;
    expirationDate: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const planInfo = PLAN_DEFINITIONS[targetPlan];
  const payableAmount = calculateUpgradePrice(userMembership.plan, targetPlan);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    const membersList = coveredMembersInput
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const res = await subscribeToPlan({
      plan: targetPlan,
      provider,
      householdName,
      coveredMembers: membersList.length > 0 ? membersList : [currentUser.name]
    });

    setIsProcessing(false);

    if (res.success) {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 1);

      setSuccessReceipt({
        receiptNumber: `REC-${provider.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        amount: payableAmount,
        plan: planInfo.name,
        expirationDate: expDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });

      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#134536] to-slate-900 text-white relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="text-xl font-black tracking-tight">Complete Membership Activation</h2>
            </div>
            <p className="text-xs text-rose-200/90 font-medium">
              12-Month Annual Membership • AdventistStay Network
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successReceipt ? (
          /* Receipt / Confirmation Screen */
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Membership Activated!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Welcome to the <span className="font-bold text-[#1B5E4A]">{successReceipt.plan}</span> network. Your 12-month membership is active until <span className="font-semibold text-slate-900 dark:text-white">{successReceipt.expirationDate}</span>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span>Receipt Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{successReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Household Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{householdName}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Payment Amount</span>
                <span className="font-bold text-slate-900 dark:text-white">${successReceipt.amount} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Payment Provider</span>
                <span className="font-semibold capitalize text-slate-900 dark:text-white">{provider}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              A copy of your receipt has been generated and saved to your Membership Dashboard.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-[#1B5E4A] text-white font-bold hover:bg-[#E03150] transition-all shadow-lg shadow-rose-500/20"
            >
              Continue to AdventistStay
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitPayment} className="p-6 space-y-6">
            
            {/* Plan Summary Box */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{planInfo.name} Plan</span>
                  {planInfo.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#1B5E4A] text-white text-[10px] font-bold">
                      {planInfo.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{planInfo.tagline}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#1B5E4A]">${payableAmount}</span>
                <span className="text-xs text-slate-500 block font-medium">/ year</span>
              </div>
            </div>

            {/* Household / Family Coverage Input */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1B5E4A]" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Household / Family Membership Details
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                One annual membership covers your whole household according to AdventistStay family rules.
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Family or Household Name
                  </label>
                  <input
                    type="text"
                    required
                    value={householdName}
                    onChange={e => setHouseholdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E4A]"
                    placeholder="e.g. The Johnson Family"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Covered Family Members (comma separated)
                  </label>
                  <input
                    type="text"
                    value={coveredMembersInput}
                    onChange={e => setCoveredMembersInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E4A]"
                    placeholder="e.g. John Johnson, Mary Johnson, Caleb Johnson"
                  />
                </div>
              </div>
            </div>

            {/* Payment Provider Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('stripe')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    provider === 'stripe'
                      ? 'border-[#1B5E4A] bg-rose-50/50 dark:bg-rose-950/30 text-[#1B5E4A] ring-2 ring-[#1B5E4A]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Stripe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('paypal')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    provider === 'paypal'
                      ? 'border-[#1B5E4A] bg-rose-50/50 dark:bg-rose-950/30 text-[#1B5E4A] ring-2 ring-[#1B5E4A]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-black tracking-wider text-blue-600">PayPal</span>
                  <span className="text-[10px] text-slate-500 font-medium">Express</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('pesapal')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    provider === 'pesapal'
                      ? 'border-[#1B5E4A] bg-rose-50/50 dark:bg-rose-950/30 text-[#1B5E4A] ring-2 ring-[#1B5E4A]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-black tracking-wider text-emerald-600">PesaPal</span>
                  <span className="text-[10px] text-slate-500 font-medium">Global / Africa</span>
                </button>
              </div>
            </div>

            {/* Tokenized Payment Input Simulation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Secure Tokenized Payment ({provider.toUpperCase()})
                </span>
                <span className="text-[10px] text-slate-500">256-Bit SSL Encrypted</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={e => setCardExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-100 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Product Rule Disclaimer (Section 11) */}
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-normal">
                {PLATFORM_MEMBERSHIP_DISCLAIMER}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-2xl bg-[#1B5E4A] text-white text-xs font-bold hover:bg-[#E03150] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-rose-500/20"
              >
                {isProcessing ? (
                  <>Processing Webhook Verification...</>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Pay ${payableAmount} USD & Activate
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
