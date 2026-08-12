import { Listing } from '../types';
import { SearchFilters } from '../context/AppContext';

export const matchesDestination = (list: Listing, destination: string): boolean => {
  if (!destination || !destination.trim()) return true;
  const rawQ = destination.trim().toLowerCase();
  if (rawQ.includes('near me') || rawQ === 'anywhere' || rawQ === 'all') return true;

  // Direct substring match
  if (
    list.city.toLowerCase().includes(rawQ) ||
    list.country.toLowerCase().includes(rawQ) ||
    (list.stateProvince && list.stateProvince.toLowerCase().includes(rawQ)) ||
    list.nearestSdaChurch.name.toLowerCase().includes(rawQ) ||
    list.title.toLowerCase().includes(rawQ) ||
    list.propertyType.toLowerCase().includes(rawQ) ||
    list.description.toLowerCase().includes(rawQ)
  ) {
    return true;
  }

  // Tokenize search string
  const tokens = rawQ
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && t !== 'usa' && t !== 'the' && t !== 'and');

  if (tokens.length === 0) return true;

  const haystack = `${list.city} ${list.country} ${list.stateProvince || ''} ${list.nearestSdaChurch.name} ${list.title} ${list.propertyType}`.toLowerCase();

  return tokens.some(token => haystack.includes(token));
};

export const filterListings = (listings: Listing[], filters: SearchFilters, localQuery?: string): Listing[] => {
  return listings.filter(list => {
    // Local extra query inside map search box
    if (localQuery && localQuery.trim()) {
      const lq = localQuery.trim().toLowerCase();
      const matchLocal = 
        list.title.toLowerCase().includes(lq) ||
        list.city.toLowerCase().includes(lq) ||
        list.country.toLowerCase().includes(lq) ||
        list.nearestSdaChurch.name.toLowerCase().includes(lq);
      if (!matchLocal) return false;
    }

    // Destination filter
    if (filters.destination && !matchesDestination(list, filters.destination)) {
      return false;
    }

    // Country filter
    if (filters.country && filters.country !== 'ALL') {
      if (list.country.toLowerCase() !== filters.country.toLowerCase()) return false;
    }

    // Purpose
    if (filters.purpose && filters.purpose !== 'ALL') {
      if (!list.stayPurposesSupported.includes(filters.purpose)) return false;
    }

    // Guests
    if (filters.guestCount > list.maxGuests) return false;

    // Vegetarian
    if (filters.vegetarianOnly && !list.sabbathFeatures.vegetarianMealsProvided) return false;

    // Verified hosts
    if (filters.verifiedHostsOnly && list.hostVerificationTier === 'UNVERIFIED') return false;

    // Categories
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      const listCats = list.categories && list.categories.length > 0 ? list.categories : ['Family', 'Quiet'];
      const hasMatch = filters.selectedCategories.some(cat => listCats.includes(cat));
      if (!hasMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      const aCats = a.categories || ['Family', 'Quiet'];
      const bCats = b.categories || ['Family', 'Quiet'];
      const aMatches = filters.selectedCategories.filter(cat => aCats.includes(cat)).length;
      const bMatches = filters.selectedCategories.filter(cat => bCats.includes(cat)).length;
      if (bMatches !== aMatches) return bMatches - aMatches;
    }
    return 0;
  });
};
