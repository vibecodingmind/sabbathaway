import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Globe2, 
  Users, 
  Calendar, 
  Church, 
  Sparkles, 
  Heart, 
  ShieldCheck,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { FamilyProfile, ExchangeType } from '../types';
import { useApp } from '../context/AppContext';
import { canUseFamilyExchange } from '../lib/membershipEngine';

interface ExchangeRequestModalProps {
  targetFamily: FamilyProfile;
  onClose: () => void;
}

export const ExchangeRequestModal: React.FC<ExchangeRequestModalProps> = ({ targetFamily, onClose }) => {
  const { currentUser, createFamilyExchangeRequest, userMembership, openUpgradePrompt } = useApp();
  
  const [exchangeType, setExchangeType] = useState<ExchangeType>('CULTURAL_EXCHANGE');
  const [proposedMonth, setProposedMonth] = useState('August 2026');
  const [preferredDuration, setPreferredDuration] = useState('1 Week');
  const [introNote, setIntroNote] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeAccepted) return;

    // Check membership eligibility (Family Exchange or Global Family)
    if (!canUseFamilyExchange(userMembership)) {
      onClose();
      openUpgradePrompt('FAMILY_EXCHANGE');
      return;
    }

    createFamilyExchangeRequest({
      requesterFamilyId: `family-${currentUser.id}`,
      requesterFamilyName: currentUser.name,
      requesterAvatar: currentUser.avatarUrl,
      requesterCountry: 'United States',
      requesterChurch: currentUser.homeChurchName || 'Pioneer Memorial Church',
      targetFamilyId: targetFamily.id,
      targetFamilyName: targetFamily.familyName,
      targetAvatar: targetFamily.avatar,
      targetCountry: targetFamily.country,
      targetChurch: targetFamily.localChurch,
      exchangeType,
      proposedMonth,
      preferredDuration,
      introNote
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-display">Family Exchange Request</h2>
              <p className="text-xs text-rose-100 font-medium">
                Mutual Christian Hospitality & Cultural Fellowship
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner overlay */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              Exchange Request Sent!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your message and mutual exchange proposal have been sent to <strong>{targetFamily.familyName}</strong>. You can communicate further in the platform messaging section.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
            
            {/* Target Family Summary Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/60 border border-rose-200 dark:border-slate-700 flex items-center gap-4 text-xs">
              <img src={targetFamily.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1B5E4A]" />
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#1B5E4A] block">HOST FAMILY DESTINATION</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{targetFamily.familyName}</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {targetFamily.city}, {targetFamily.country} · {targetFamily.localChurch}
                </p>
              </div>
            </div>

            {/* Exchange Type Selector */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1B5E4A]" /> Select Exchange Focus
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'CULTURAL_EXCHANGE', label: 'Cultural Exchange', desc: 'Experience another country lifestyle & family heritage' },
                  { id: 'SABBATH_EXCHANGE', label: 'Sabbath Exchange', desc: 'Attend local church fellowship & vespers traditions' },
                  { id: 'YOUTH_FAMILY_EXCHANGE', label: 'Youth Family Exchange', desc: 'Children and youth connect across nations' },
                  { id: 'MISSION_EXCHANGE', label: 'Mission Exchange', desc: 'Participate in local community & ADRA service' },
                ].map((type) => {
                  const isSelected = exchangeType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setExchangeType(type.id as ExchangeType)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#1B5E4A] bg-rose-50 dark:bg-rose-950/60 text-slate-900 dark:text-white ring-2 ring-[#1B5E4A]/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#1B5E4A]">{type.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proposed Month & Duration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1B5E4A]" /> Proposed Travel Month
                </label>
                <select
                  value={proposedMonth}
                  onChange={e => setProposedMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="August 2026">August 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="December 2026">December 2026</option>
                  <option value="April 2027">April 2027</option>
                  <option value="July 2027">July 2027</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#1B5E4A]" /> Preferred Duration
                </label>
                <select
                  value={preferredDuration}
                  onChange={e => setPreferredDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="1 Week">1 Week</option>
                  <option value="10 Days">10 Days</option>
                  <option value="2 Weeks">2 Weeks</option>
                </select>
              </div>
            </div>

            {/* Introductory Message */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#1B5E4A]" /> Family Introduction & Exchange Proposal
              </label>
              <textarea
                required
                rows={4}
                value={introNote}
                onChange={e => setIntroNote(e.target.value)}
                placeholder="Introduce your family, share your home church background, and describe your hopes for this Christian fellowship & cultural exchange..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E4A]/30"
              />
            </div>

            {/* Non-Commercial Fellowship Pledge */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <input
                  id="pledge-checkbox"
                  type="checkbox"
                  required
                  checked={pledgeAccepted}
                  onChange={e => setPledgeAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-amber-400 text-[#1B5E4A] focus:ring-[#1B5E4A] cursor-pointer"
                />
                <label htmlFor="pledge-checkbox" className="text-[11px] text-amber-950 dark:text-amber-200 font-medium cursor-pointer leading-relaxed">
                  <strong>Christian Fellowship Pledge:</strong> I confirm this exchange is strictly for Christian fellowship, Sabbath experiences, and cultural relationship building. It is non-commercial with mutual hospitality in mind.
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pledgeAccepted || !introNote.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B5E4A] hover:bg-[#E00B41] disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Exchange Request</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
