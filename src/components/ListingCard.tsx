import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Star
} from 'lucide-react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  viewMode?: 'GRID' | 'LIST';
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect, viewMode = 'GRID' }) => {
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(listing.id);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const familyTitle = listing.familyName || listing.title;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImgIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const displayCategories = listing.categories && listing.categories.length > 0 
    ? listing.categories 
    : ['Family', 'Culture', 'Quiet'];

  if (viewMode === 'LIST') {
    return (
      <div 
        id={`listing-card-list-${listing.id}`}
        onClick={() => onSelect(listing)}
        className="group cursor-pointer flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300"
      >
        {/* Photo Container */}
        <div className="relative w-full md:w-[320px] lg:w-[360px] h-60 md:h-auto flex-shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img 
            src={listing.images[currentImgIndex] || listing.images[0]} 
            alt={familyTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Favorite Heart Button */}
          <button
            id={`fav-btn-list-${listing.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(listing.id);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-900/30 backdrop-blur-md text-white hover:scale-110 transition-transform shadow-md"
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 stroke-[2.5] ${isFav ? 'text-[#1B5E4A] fill-[#1B5E4A]' : 'text-white'}`} />
          </button>

          {/* Verified Badge & Active Status Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {listing.hostVerificationTier === 'CHURCH_VERIFIED' ? 'Church Verified' :
                 listing.hostVerificationTier === 'CONFERENCE_VERIFIED' ? 'Conference Verified' :
                 listing.hostVerificationTier === 'ADMIN_VERIFIED' ? 'Admin Verified' : 'Level 4 Verified'}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{listing.lastActive || 'Active Today'}</span>
            </div>
          </div>

          {/* Carousel Controls */}
          {listing.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                {listing.images.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${
                      currentImgIndex === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-xl leading-snug group-hover:text-[#1B5E4A] transition-colors">
                  {familyTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {listing.city}, {listing.country}
                </p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{listing.rating}</span>
                <span className="text-slate-400 font-normal">({listing.reviewCount})</span>
              </div>
            </div>

            {/* Host & Guests */}
            <div className="flex items-center gap-3 text-xs pt-1 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold">
                <Users className="w-3.5 h-3.5 text-[#1B5E4A]" />
                <span>Up to {listing.maxGuests} guests</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <img src={listing.hostAvatar} alt={listing.hostName} className="w-5 h-5 rounded-full object-cover ring-1 ring-rose-200 dark:ring-rose-900" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{listing.hostName}</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {displayCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold"
                >
                  {cat}
                </span>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {listing.hostChurchName}
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div 
      id={`listing-card-${listing.id}`}
      onClick={() => onSelect(listing)}
      className="group cursor-pointer flex flex-col space-y-2"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-sm">
        <img 
          src={listing.images[currentImgIndex] || listing.images[0]} 
          alt={familyTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Heart Favorite Button */}
        <button
          id={`fav-btn-${listing.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-slate-900/30 backdrop-blur-md text-white hover:scale-110 transition-transform shadow-md"
          title="Save to favorites"
        >
          <Heart className={`w-4 h-4 stroke-[2.5] ${isFav ? 'text-[#1B5E4A] fill-[#1B5E4A]' : 'text-white'}`} />
        </button>

          {/* Verified Badge & Active Status Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {listing.hostVerificationTier === 'CHURCH_VERIFIED' ? 'Church Verified' :
                 listing.hostVerificationTier === 'CONFERENCE_VERIFIED' ? 'Conference Verified' :
                 listing.hostVerificationTier === 'ADMIN_VERIFIED' ? 'Admin Verified' : 'Level 4 Verified'}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{listing.lastActive || 'Active Today'}</span>
            </div>
          </div>

        {/* Image Carousel Controls */}
        {listing.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
              {listing.images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${
                    currentImgIndex === idx ? 'bg-white w-3.5' : 'bg-white/50 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Metadata: Clean and Short Details */}
      <div className="space-y-1 text-xs px-0.5 pt-0.5">
        
        {/* Line 1: Name & Star Rating + Reviews */}
        <div className="flex items-center justify-between gap-2 font-black text-slate-900 dark:text-white text-base">
          <span className="truncate group-hover:text-[#1B5E4A] transition-colors">{familyTitle}</span>
          <div className="flex items-center gap-1 text-xs font-extrabold shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-slate-900 dark:text-white font-extrabold">{listing.rating}</span>
            <span className="text-slate-400 font-normal">({listing.reviewCount})</span>
          </div>
        </div>

        {/* Line 2: Address / Location */}
        <div className="text-slate-500 dark:text-slate-400 font-semibold text-xs truncate">
          <span>{listing.city}, {listing.country}</span>
        </div>

        {/* Line 3: Max Guests */}
        <div className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5 pt-0.5">
          <Users className="w-3.5 h-3.5 text-[#1B5E4A] shrink-0" />
          <span>Up to {listing.maxGuests} guests</span>
        </div>

      </div>
    </div>
  );
};

