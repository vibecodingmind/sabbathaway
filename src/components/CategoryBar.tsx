import React from 'react';
import { 
  Building2, 
  Home, 
  Waves, 
  Mountain, 
  Tractor, 
  Trees, 
  Users, 
  VolumeX, 
  Globe2, 
  Sparkles,
  LayoutGrid,
  List,
  MapPin,
  Navigation,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORY_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  Home,
  Waves,
  Mountain,
  Tractor,
  Trees,
  Users,
  VolumeX,
  Globe2,
  Sparkles
};

export const CategoryBar: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    stayCategories, 
    exploreViewMode, 
    setExploreViewMode 
  } = useApp();

  const enabledCategories = stayCategories.filter(c => c.enabled);

  const toggleCategoryFilter = (catName: string) => {
    setFilters(prev => {
      const exists = prev.selectedCategories.includes(catName);
      if (exists) {
        return {
          ...prev,
          selectedCategories: prev.selectedCategories.filter(c => c !== catName)
        };
      } else {
        return {
          ...prev,
          selectedCategories: [...prev.selectedCategories, catName]
        };
      }
    });
  };

  const isNearMeActive = filters.destination?.toLowerCase().includes('near me');

  const toggleNearMe = () => {
    setFilters(prev => ({
      ...prev,
      destination: isNearMeActive ? '' : 'Near me'
    }));
  };

  return (
    <div id="category-bar-sticky" className="sticky top-20 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 transition-colors">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Scrollable Rounded Category Chips */}
        <div className="flex items-center gap-3 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth flex-1">
          
          {/* All Stays Pill */}
          <button
            id="category-all-stays"
            onClick={() => setFilters(prev => ({ ...prev, selectedCategories: [], destination: '' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border flex-shrink-0 cursor-pointer ${
              filters.selectedCategories.length === 0 && !isNearMeActive
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white ring-2 ring-slate-900/10' 
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>All Stays</span>
          </button>

          {/* Near me Chip */}
          <button
            id="category-near-me"
            onClick={toggleNearMe}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border flex-shrink-0 cursor-pointer ${
              isNearMeActive
                ? 'bg-[#FF385C] text-white border-[#FF385C] ring-2 ring-[#FF385C]/20' 
                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Navigation className={`w-4 h-4 flex-shrink-0 ${isNearMeActive ? 'fill-white' : 'text-slate-500'}`} />
            <span>Near me</span>
          </button>

          {/* 10 Stay Category Rounded Pills */}
          {enabledCategories.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || Home;
            const isSelected = filters.selectedCategories.includes(cat.name);

            return (
              <button
                key={cat.id}
                id={`category-${cat.id}`}
                onClick={() => toggleCategoryFilter(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border flex-shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#FF385C] text-white border-[#FF385C] ring-2 ring-[#FF385C]/20' 
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* Clear Filters Quick Action if any selected */}
          {(filters.selectedCategories.length > 0 || isNearMeActive) && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, selectedCategories: [], destination: '' }))}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#FF385C] hover:bg-[#FF385C]/10 rounded-full transition-colors flex-shrink-0 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

        {/* View Mode Switcher: Grid | List | Map in the same line */}
        <div className="flex items-center flex-shrink-0 pl-2">
          <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              id="bar-view-mode-grid"
              onClick={() => setExploreViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                exploreViewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>

            <button
              id="bar-view-mode-list"
              onClick={() => setExploreViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                exploreViewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">List</span>
            </button>

            <button
              id="bar-view-mode-map"
              onClick={() => setExploreViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                exploreViewMode === 'MAP'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Map View"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
              <span className="hidden md:inline">Map</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
