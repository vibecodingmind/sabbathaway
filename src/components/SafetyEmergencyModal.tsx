import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Send 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SafetyEmergencyModal: React.FC = () => {
  const { isSafetyModalOpen, setIsSafetyModalOpen } = useApp();
  const [reportType, setReportType] = useState('LISTING');
  const [reportDetails, setReportDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isSafetyModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSafetyModalOpen]);

  if (!isSafetyModalOpen) return null;

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSafetyModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="safety-dialog"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Safety & Emergency Hub
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300">
                24/7 Support Guidelines & Incident Reporting
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSafetyModalOpen(false)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200">
          
          {/* Global Emergency Hotlines Grid */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">
              24/7 Emergency & ADRA Support Contacts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                  AdventistStay Safety Hotline
                </p>
                <p className="text-slate-500">+1 (800) 555-SDA-STAY (Toll-Free)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  ADRA Global Emergency Helpline
                </p>
                <p className="text-slate-500">+1 (301) 680-6380</p>
              </div>
            </div>
          </div>

          {/* Safety Guidelines List */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Christian Hospitality Safety Protocol:
            </h4>
            <ul className="space-y-1.5 text-amber-950 dark:text-amber-100 list-disc list-inside">
              <li>Always verify pastoral endorsement badges before hosting or traveling.</li>
              <li>Keep all communication within the AdventistStay messaging platform.</li>
              <li>Never exchange money or demand accommodation fees. Hospitality is offered freely.</li>
              <li>Always share travel itineraries with family and your local church pastor.</li>
            </ul>
          </div>

          {/* Report Form */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Report an Incident or Listing Concern
            </h4>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-center">
                Report logged securely. Conference administration will investigate immediately.
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold">Report Category</label>
                  <select 
                    value={reportType} 
                    onChange={e => setReportType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="LISTING">Inaccurate Listing / Non-Compliant Rules</option>
                    <option value="USER">Behavioral / Safety Concern</option>
                    <option value="COMMERCIAL">Solicitation of Unapproved Accommodation Fees</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Details</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Provide specific details..."
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold"
                >
                  Submit Confidential Report
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
