import React, { useState } from 'react';
import { Check, X, Sparkles, ShieldCheck, HeartHandshake, Building2, HelpCircle, ArrowRight, Lock } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { PLAN_DEFINITIONS, PLATFORM_MEMBERSHIP_DISCLAIMER, calculateUpgradePrice } from '../lib/membershipEngine';
import { useApp } from '../context/AppContext';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const PricingView: React.FC = () => {
  const { userMembership, setActiveTab } = useApp();
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);

  const plans: SubscriptionPlan[] = ['FREE', 'SABBATH_MEMBER', 'FAMILY_EXCHANGE', 'GLOBAL_FAMILY'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Title & Intro Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#1B5E4A] border border-rose-200 dark:border-rose-900/50 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Annual Household Membership Plans
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Connect Your Family to Global Sabbath Hospitality
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          One simple annual membership covers your entire household. Choose the membership level that matches your family's travel, hosting, and international fellowship goals.
        </p>
      </div>

      {/* Household Coverage & Platform Disclaimer Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl space-y-4 border border-rose-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-extrabold text-white">Household & Family Coverage Included</h3>
              <p className="text-xs text-rose-200/90 max-w-2xl mt-0.5">
                A single membership covers your entire immediate family or household. No need to purchase separate subscriptions for spouse or children.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 text-xs font-bold text-rose-200 border border-white/10 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>12-Month Access</span>
          </div>
        </div>

        <div className="pt-3 border-t border-rose-900/50 flex items-start gap-2.5">
          <HeartHandshake className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-200/80 leading-relaxed italic">
            {PLATFORM_MEMBERSHIP_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* 4 Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((planKey) => {
          const plan = PLAN_DEFINITIONS[planKey];
          const isCurrentPlan = userMembership.plan === planKey && userMembership.status === 'ACTIVE';
          const isBestValue = planKey === 'GLOBAL_FAMILY';
          const upgradePrice = calculateUpgradePrice(userMembership.plan, planKey);

          return (
            <div 
              key={planKey}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all relative ${
                isBestValue
                  ? 'bg-gradient-to-b from-rose-50/60 to-white dark:from-rose-950/20 dark:to-slate-900 border-2 border-[#1B5E4A] shadow-xl shadow-rose-500/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
            >
              {isBestValue && (
                <div className="absolute -top-3.5 right-6">
                  <span className="px-3 py-1 rounded-full bg-[#1B5E4A] text-white text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> BEST VALUE
                  </span>
                </div>
              )}

              {/* Top Details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    {isCurrentPlan && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-normal">{plan.tagline}</p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {plan.price === 0 ? '/ forever' : 'USD / year'}
                    </span>
                  </div>
                  {plan.price > 0 && (
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      One-time annual payment (12 months access)
                    </span>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isBestValue ? 'text-[#1B5E4A]' : 'text-emerald-500'}`} />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.restrictedFeatures.length > 0 && (
                    <div className="pt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Not Included:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-400 dark:text-slate-500">
                        {plan.restrictedFeatures.map((rf, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                            <span className="line-through">{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrentPlan ? (
                  <button
                    onClick={() => setActiveTab('MEMBERSHIP')}
                    className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Manage Active Plan
                  </button>
                ) : planKey === 'FREE' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold text-xs"
                  >
                    Default Free Tier
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutPlan(planKey)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                      isBestValue
                        ? 'bg-[#1B5E4A] text-white hover:bg-[#E03150] shadow-rose-500/20'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {userMembership.plan !== 'FREE' ? `Upgrade for $${upgradePrice}` : `Activate ${plan.name}`}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#1B5E4A]" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Membership FAQ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="space-y-1.5 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Are guests paying for accommodation?</h4>
            <p className="leading-relaxed">
              No. Accommodation and hospitality remain 100% free and voluntary. Your annual membership supports platform verification, background checks, safety systems, communication technology, and member matching.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Does one membership cover my whole family?</h4>
            <p className="leading-relaxed">
              Yes! Your single household membership covers your spouse and dependent children under one family account.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">What payment methods are supported?</h4>
            <p className="leading-relaxed">
              We accept credit/debit cards via Stripe, PayPal, and regional international options via PesaPal.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">What happens when my subscription expires?</h4>
            <p className="leading-relaxed">
              Your profile, stay history, and messages are safely preserved. Paid privileges pause until you choose to renew.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal Trigger */}
      {checkoutPlan && (
        <PaymentCheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          targetPlan={checkoutPlan}
          onSuccess={() => {
            setCheckoutPlan(null);
            setActiveTab('MEMBERSHIP');
          }}
        />
      )}

    </div>
  );
};
