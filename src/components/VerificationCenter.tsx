import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileCheck, 
  Building2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Church,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VerificationCenter: React.FC = () => {
  const { currentUser, verifications, submitVerificationRequest } = useApp();

  const [churchName, setChurchName] = useState(currentUser.homeChurchName);
  const [conference, setConference] = useState(currentUser.conferenceName);
  const [pastorName, setPastorName] = useState(currentUser.pastorName);
  const [pastorEmail, setPastorEmail] = useState('pastor.nelson@andrews.edu');
  const [documentType, setDocumentType] = useState<'PASTOR_LETTER' | 'BAPTISM_CERTIFICATE' | 'MEMBERSHIP_LETTER'>('PASTOR_LETTER');
  const [submitted, setSubmitted] = useState(false);

  const myVerifications = (verifications || []).filter(v => v.userId === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerificationRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      churchName,
      conference,
      pastorName,
      pastorEmail,
      pastorPhone: '+1 (269) 555-0199',
      documentType
    });
    setSubmitted(true);
  };

  return (
    <div id="verification-center-view" className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Seventh-day Adventist Member Verification Standard
          </div>
          <h1 className="text-3xl font-extrabold font-display">
            Trust & Member Verification Center
          </h1>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            AdventistStay relies on authentic Christian trust. Upgrade your verification status by linking your home church membership or obtaining a Pastoral Endorsement letter.
          </p>
        </div>
      </div>

      {/* Current Tier Badge Summary Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Current Tier: {currentUser.verificationTier.replace('_', ' ')}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser.homeChurchName} • Member since {currentUser.membershipYear}
            </p>
          </div>
        </div>

        {/* Verification Levels Matrix */}
        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
            <p className="font-bold text-slate-400">Level 1</p>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Member</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-center min-w-[100px]">
            <p className="font-bold text-amber-600">Level 2</p>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Pastor Verified</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center min-w-[100px]">
            <p className="font-bold text-emerald-600">Level 3</p>
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Conference Badge</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Verification Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              Submit pastoral Endorsement / Proof of Membership
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Request endorsement directly from your local church pastor or clerk.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Verification Request Logged
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                An official verification request has been dispatched to <strong>Pastor {pastorName}</strong> ({pastorEmail}). Once confirmed by your church clerk, your profile tier will update automatically.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Home SDA Church Name</label>
                <input 
                  type="text" 
                  required 
                  value={churchName} 
                  onChange={e => setChurchName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Conference / Mission</label>
                <input 
                  type="text" 
                  required 
                  value={conference} 
                  onChange={e => setConference(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Church Elder / Clerk Name</label>
                  <input 
                    type="text" 
                    required 
                    value={pastorName} 
                    onChange={e => setPastorName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Church Officer Email</label>
                  <input 
                    type="email" 
                    required 
                    value={pastorEmail} 
                    onChange={e => setPastorEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Verification Document Type</label>
                <select 
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
                >
                  <option value="MEMBERSHIP_LETTER">Church Clerk Membership Letter</option>
                  <option value="BAPTISM_CERTIFICATE">Baptism Certificate Copy</option>
                  <option value="PASTOR_LETTER">Church Elder Endorsement Letter</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Upload Verification Document (Optional PDF/JPG)</p>
                    <p className="text-[11px] text-slate-500">Maximum file size: 10MB</p>
                  </div>
                </div>
                <button type="button" className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs">
                  Choose File
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg transition-colors"
              >
                Submit Verification Request
              </button>

            </form>
          )}

        </div>

        {/* Verification Requests History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Verification Status & Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of your submitted church endorsements.
            </p>
          </div>

          {myVerifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No verification requests recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {myVerifications.map((v) => (
                <div 
                  key={v.id} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{v.churchName}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400">
                    Pastor: {v.pastorName} ({v.pastorEmail})
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Type: {v.documentType.replace('_', ' ')}</span>
                    <span>Submitted: {new Date(v.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {v.notes && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                      Auditor Note: "{v.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
