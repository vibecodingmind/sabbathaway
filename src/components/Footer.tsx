import React from 'react';
import { Home, Heart, ShieldCheck, Church, FileText, Globe2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsSafetyModalOpen } = useApp();

  return (
    <footer id="main-footer" className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 text-xs transition-colors mt-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* 4 Multi-column Links Grid (Airbnb style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          
          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Support & Safety</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => setIsSafetyModalOpen(true)} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Help Center & Emergency Hotline
                </button>
              </li>
              <li>
                <button onClick={() => setIsSafetyModalOpen(true)} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Safety Protocol & Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('VERIFICATION')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Church Member Verification Process
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('DOCS_SRS')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  System Specs & Security Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Hosting</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => setActiveTab('HOST_MANAGE')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Open Your Home to Brethren
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('HOST_MANAGE')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Hosting Sabbath Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('HOST_MANAGE')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Host Protection & Member Support
                </button>
              </li>
            </ul>
          </div>

          {/* Family Exchange & Stays */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Family Exchange & Stays</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => setActiveTab('FAMILY_EXCHANGE')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Family Exchange Program
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('MAP')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Interactive Map of Host Homes
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('PRICING')} className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors">
                  Membership Packages & Billing
                </button>
              </li>
            </ul>
          </div>

          {/* AdventistStay Mission */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-[#FF385C]">AdventistStay</span>
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              A non-commercial Christian hospitality network connecting Seventh-day Adventist members worldwide for church events, mission trips, education, and fellowship.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
              <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              100% Free Member Accommodation
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} AdventistStay Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
