import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Church, 
  Globe2, 
  Users, 
  Heart, 
  Calendar, 
  Sparkles, 
  Sun, 
  Send,
  Star,
  Compass,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { FamilyProfile, ExchangeType } from '../types';
import { useApp } from '../context/AppContext';

interface FamilyProfileModalProps {
  family: FamilyProfile;
  onClose: () => void;
  onRequestExchange: (family: FamilyProfile) => void;
}

export const FamilyProfileModal: React.FC<FamilyProfileModalProps> = ({ 
  family, 
  onClose,
  onRequestExchange 
}) => {
  const { familyExchangeReviews } = useApp();
  const [activePhoto, setActivePhoto] = useState(0);

  const reviews = (familyExchangeReviews || []).filter(r => r.targetFamilyId === family.id);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-lg"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Family Photos Header Carousel */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-950">
          <img 
            src={family.familyPhotos[activePhoto] || family.familyPhotos[0] || family.avatar} 
            alt={family.familyName} 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Photo Thumbnails */}
          {family.familyPhotos.length > 1 && (
            <div className="absolute bottom-4 left-6 right-6 flex gap-2 z-10 overflow-x-auto pb-1 scrollbar-none">
              {family.familyPhotos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activePhoto === idx ? 'border-[#1B5E4A] scale-105 shadow-md' : 'border-white/50 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verification Badge Header Overlay */}
          <div className="absolute top-4 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold border border-rose-500/30 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-[#1B5E4A]" />
            <span>Verified</span>
          </div>

          {/* Title Banner */}
          <div className="absolute bottom-4 right-6 text-right z-10 hidden sm:block">
            <div className="flex items-center justify-end gap-1 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{family.rating}</span>
              <span className="text-slate-300 text-xs font-normal">({family.reviewCount} exchange reviews)</span>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[calc(100vh-22rem)] overflow-y-auto">
          
          {/* Header Family Identity */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img 
                src={family.avatar} 
                alt={family.familyName} 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-[#1B5E4A] flex-shrink-0"
              />
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                  {family.familyName}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <Globe2 className="w-4 h-4 text-[#1B5E4A]" />
                  {family.city}, {family.country}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-emerald-600" />
                  {family.localChurch} ({family.conference})
                </p>
              </div>
            </div>

            {/* Request Button */}
            <button
              onClick={() => onRequestExchange(family)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1B5E4A] hover:bg-[#E00B41] text-white font-bold text-xs shadow-xl transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send Exchange Request</span>
            </button>
          </div>

          {/* Key Family Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">PARENTS</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{family.parentsNames}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">CHILDREN AGES</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{family.childrenAges.join(', ')}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">LANGUAGES</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{family.languages.join(' • ')}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">PREFERRED DURATION</span>
              <p className="font-bold text-[#1B5E4A]">{family.preferredDurations}</p>
            </div>
          </div>

          {/* Family Story */}
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#1B5E4A]" /> About Our Family & Fellowship Journey
            </h3>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-rose-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-rose-100 dark:border-slate-800">
              {family.familyStory}
            </p>
          </div>

          {/* Cultural Background & Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-500" /> Cultural Background
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                {family.culturalBackground}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Family Interests & Activities
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {family.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sabbath Traditions */}
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" /> Sabbath Experience & Traditions
            </h3>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900">
              {family.sabbathTraditions}
            </p>
          </div>

          {/* Hosting Availability & Regions Seeking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1B5E4A]" /> Available Hosting Months
              </span>
              <div className="flex flex-wrap gap-1.5">
                {family.availableMonths.map((m, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-[#1B5E4A] font-bold text-[11px]">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" /> Eager to Visit Regions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {family.lookingForExchangeRegions.map((r, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1B5E4A]" /> Family Exchange Fellowship Reviews
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                No exchange reviews recorded yet. Be among the first Adventist families to connect!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.reviewerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{rev.reviewerFamilyName}</span>
                          <span className="text-slate-400 text-[10px] block">{rev.reviewerCountry} · {rev.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{rev.hospitalityRating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
