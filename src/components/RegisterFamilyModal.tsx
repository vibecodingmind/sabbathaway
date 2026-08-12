import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Globe2, 
  Church, 
  Calendar, 
  Heart, 
  Sun, 
  Plus, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RegisterFamilyModalProps {
  onClose: () => void;
}

export const RegisterFamilyModal: React.FC<RegisterFamilyModalProps> = ({ onClose }) => {
  const { currentUser, addFamilyProfile } = useApp();

  const [familyName, setFamilyName] = useState(currentUser.name.includes('Family') ? currentUser.name : `The ${currentUser.name.split(' ')[0]} Family`);
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState(currentUser.homeChurchCity || 'Berrien Springs, MI');
  const [localChurch, setLocalChurch] = useState(currentUser.homeChurchName || 'Pioneer Memorial Church');
  const [conference, setConference] = useState(currentUser.conferenceName || 'Michigan Conference');
  const [parentsNames, setParentsNames] = useState(currentUser.name);
  const [childrenAgesInput, setChildrenAgesInput] = useState('8 yrs, 12 yrs');
  const [languagesInput, setLanguagesInput] = useState('English, Spanish');
  const [interestsInput, setInterestsInput] = useState('Pathfinders, Choir, Health Ministry, Nature Walks');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [familyStory, setFamilyStory] = useState('');
  const [hostingPreferences, setHostingPreferences] = useState('');
  const [sabbathTraditions, setSabbathTraditions] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['June', 'July', 'August']);
  const [preferredDurations, setPreferredDurations] = useState('1 to 2 Weeks');
  const [isSuccess, setIsSuccess] = useState(false);

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const childrenAges = childrenAgesInput.split(',').map(s => s.trim()).filter(Boolean);
    const languages = languagesInput.split(',').map(s => s.trim()).filter(Boolean);
    const interests = interestsInput.split(',').map(s => s.trim()).filter(Boolean);

    addFamilyProfile({
      familyName,
      country,
      city,
      localChurch,
      conference,
      parentsNames,
      childrenAges,
      adultCount: 2,
      childrenCount: childrenAges.length,
      languages,
      interests,
      culturalBackground: culturalBackground || 'Dedicated Adventist Christian household active in local church fellowship and global mission outreach.',
      familyStory: familyStory || 'We love making new lifelong Adventist family friendships, hosting brethren from around the world, and sharing Christian hospitality.',
      hostingPreferences: hostingPreferences || 'Guest room suite with private bath and wholesome plant-based family meals.',
      sabbathTraditions: sabbathTraditions || 'Friday sunset vespers, Sabbath morning worship at local SDA church, and Sabbath afternoon nature fellowship.',
      availableMonths: selectedMonths,
      preferredDurations,
      verificationTier: currentUser.verificationTier || 'ADMIN_VERIFIED',
      familyPhotos: [
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80'
      ],
      avatar: currentUser.avatarUrl,
      lookingForExchangeRegions: ['Europe', 'East Africa', 'South America']
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF385C]/20 border border-[#FF385C]/30 text-[#FF385C]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-display">Register Family Account</h2>
              <p className="text-xs text-slate-400 font-medium">
                Connect your household with global Adventist families for cultural & Sabbath exchange
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              Family Profile Registered!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Your Adventist household account is now active on the Family Exchange network.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto text-xs">
            
            {/* Basic Family Identity */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF385C]" /> Household Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Family Name
                  </label>
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                    placeholder="e.g. The Miller Family"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parents / Guardians Names
                  </label>
                  <input
                    type="text"
                    required
                    value={parentsNames}
                    onChange={e => setParentsNames(e.target.value)}
                    placeholder="e.g. David & Sarah Miller"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Local SDA Church
                  </label>
                  <input
                    type="text"
                    required
                    value={localChurch}
                    onChange={e => setLocalChurch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SDA Conference
                  </label>
                  <input
                    type="text"
                    required
                    value={conference}
                    onChange={e => setConference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Children & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Children Ages (comma-separated)
                </label>
                <input
                  type="text"
                  value={childrenAgesInput}
                  onChange={e => setChildrenAgesInput(e.target.value)}
                  placeholder="e.g. 8 yrs, 12 yrs, 15 yrs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Languages Spoken (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={languagesInput}
                  onChange={e => setLanguagesInput(e.target.value)}
                  placeholder="e.g. English, Swahili, Spanish"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Story & Cultural Background */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Family Story & Fellowship Intent
                </label>
                <textarea
                  rows={3}
                  value={familyStory}
                  onChange={e => setFamilyStory(e.target.value)}
                  placeholder="Tell other Adventist families about your household, mission experiences, and hopes for global exchange..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cultural Background & Local Traditions
                </label>
                <textarea
                  rows={2}
                  value={culturalBackground}
                  onChange={e => setCulturalBackground(e.target.value)}
                  placeholder="Describe your region's Christian culture, local meals, or heritage..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sabbath Traditions & Vespers Rhythm
                </label>
                <textarea
                  rows={2}
                  value={sabbathTraditions}
                  onChange={e => setSabbathTraditions(e.target.value)}
                  placeholder="e.g. Friday sunset singing, Sabbath morning choir, afternoon nature walks..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Availability Months Selector */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Available Months for Hosting / Exchange
              </label>
              <div className="flex flex-wrap gap-1.5">
                {monthsList.map(m => {
                  const active = selectedMonths.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        active 
                          ? 'bg-[#FF385C] border-[#FF385C] text-white font-bold' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold shadow-lg transition-all"
              >
                Create Family Profile
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
