import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { PLAN_DEFINITIONS, PLATFORM_MEMBERSHIP_DISCLAIMER } from '../lib/membershipEngine';
import { useApp } from '../context/AppContext';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const UpgradePromptModal: React.FC = () => {
  const { isUpgradePromptOpen, upgradePromptTarget, closeUpgradePrompt, userMembership, setActiveTab } = useApp();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (isUpgradePromptOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isUpgradePromptOpen]);

  if (!isUpgradePromptOpen) return null;

  // Determine which 2 options to present based on prompt target & current membership
  let option1: SubscriptionPlan = 'SABBATH_MEMBER';
  let option2: SubscriptionPlan = 'GLOBAL_FAMILY';

  if (upgradePromptTarget === 'FAMILY_EXCHANGE' || userMembership.plan === 'SABBATH_MEMBER') {
    option1 = 'FAMILY_EXCHANGE';
    option2 = 'GLOBAL_FAMILY';
  } else if (upgradePromptTarget === 'STAY_REQUEST' || upgradePromptTarget === 'HOSTING') {
    option1 = 'SABBATH_MEMBER';
    option2 = 'GLOBAL_FAMILY';
  }

  const plan1 = PLAN_DEFINITIONS[option1];
  const plan2 = PLAN_DEFINITIONS[option2];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
  };

  const handleViewAllPlans = () => {
    closeUpgradePrompt();
    setActiveTab('PRICING');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white relative">
            <button 
              onClick={closeUpgradePrompt}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/30 text-rose-300 text-xs font-extrabold uppercase tracking-wider border border-rose-400/30">
                Membership Required
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {upgradePromptTarget === 'FAMILY_EXCHANGE' 
                ? 'Unlock Family Exchange Access' 
                : 'Unlock Sabbath Stay & Hospitality Network'}
            </h2>
            <p className="text-xs text-rose-200/90 mt-1 max-w-lg leading-relaxed">
              Your annual membership connects your household to our verified global Adventist community.
            </p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Disclaimer Banner */}
            <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-[#1B5E4A] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                {PLATFORM_MEMBERSHIP_DISCLAIMER}
              </p>
            </div>

            {/* Upgrade Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1 */}
              <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{plan1.name}</h3>
                    <p className="text-xs text-slate-500">{plan1.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">${plan1.price}</span>
                    <span className="text-xs text-slate-500 font-medium">USD / year</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {plan1.features.slice(0, 4).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(option1)}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Choose {plan1.name} (${plan1.price}/yr)
                </button>
              </div>

              {/* Option 2 - Global Family Best Value */}
              <div className="p-5 rounded-2xl border-2 border-[#1B5E4A] bg-gradient-to-b from-rose-50/40 to-white dark:from-rose-950/20 dark:to-slate-900 flex flex-col justify-between space-y-4 shadow-lg shadow-rose-500/10 relative">
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full bg-[#1B5E4A] text-white text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> BEST VALUE
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{plan2.name}</h3>
                    <p className="text-xs text-slate-500">{plan2.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#1B5E4A]">${plan2.price}</span>
                    <span className="text-xs text-slate-500 font-medium">USD / year</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {plan2.features.slice(0, 5).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#1B5E4A] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(option2)}
                  className="w-full py-2.5 rounded-xl bg-[#1B5E4A] text-white font-bold text-xs hover:bg-[#E03150] transition-colors shadow-md shadow-rose-500/20"
                >
                  Activate {plan2.name} (${plan2.price}/yr)
                </button>
              </div>

            </div>

            {/* Footer options */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={handleViewAllPlans}
                className="text-[#1B5E4A] font-bold hover:underline flex items-center gap-1"
              >
                View all pricing plans <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={closeUpgradePrompt}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              >
                Maybe Later
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Payment Checkout Modal Trigger */}
      {selectedPlanForCheckout && (
        <PaymentCheckoutModal
          isOpen={Boolean(selectedPlanForCheckout)}
          onClose={() => {
            setSelectedPlanForCheckout(null);
            closeUpgradePrompt();
          }}
          targetPlan={selectedPlanForCheckout}
          onSuccess={() => {
            setSelectedPlanForCheckout(null);
            closeUpgradePrompt();
          }}
        />
      )}
    </>
  );
};
