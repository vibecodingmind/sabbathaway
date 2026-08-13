import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Globe, 
  Heart,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useApp, DEMO_PASSWORD } from '../context/AppContext';
import { SubscriptionPlan, PaymentProvider, UserRole } from '../types';
import { PLAN_PRICING } from '../lib/membershipEngine';
import { initialProfiles } from '../data/mockData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    login,
    demoLogin,
    registerUserWithSubscription 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>(
    authModalMode === 'LOGIN' ? 'LOGIN' : 'REGISTER'
  );

  // Form state for registration
  const [role, setRole] = useState<UserRole>(
    authModalMode === 'REGISTER_HOST' ? 'HOST' : 'GUEST'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [homeChurchName, setHomeChurchName] = useState('');
  const [householdName, setHouseholdName] = useState('');

  // Sign-in form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Package Selection & Payment State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    role === 'HOST' ? 'FAMILY_EXCHANGE' : 'SABBATH_MEMBER'
  );
  const [provider, setProvider] = useState<PaymentProvider>('stripe');
  
  // Mock Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [phoneNumberMobile, setPhoneNumberMobile] = useState('+254 700 123456');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleDemoLogin = async (profileId: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await demoLogin(profileId);
      if (result.success) closeAuthModal();
      else setErrorMsg(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(loginEmail.trim(), loginPassword);
      if (result.success) closeAuthModal();
      else setErrorMsg(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Please choose a password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUserWithSubscription({
        name,
        email,
        password,
        phone: phone || '+1 555 0192',
        role,
        homeChurchName: homeChurchName || 'Local Seventh-day Adventist Church',
        householdName: householdName || `${name} Family`,
        plan: selectedPlan,
        provider
      });

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Registration failed. Payment is required.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF385C] flex items-center justify-center text-white font-bold">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-display">
                Welcome to AdventistStay
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sabbath Hospitality & Family Exchange Platform
              </p>
            </div>
          </div>

          <button 
            onClick={closeAuthModal} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => { setActiveTab('LOGIN'); setAuthModalMode('LOGIN'); }}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'LOGIN' 
                ? 'bg-white dark:bg-slate-900 text-[#FF385C] shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign In / Demo Login
          </button>
          <button
            onClick={() => { setActiveTab('REGISTER'); }}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'REGISTER' 
                ? 'bg-[#FF385C] text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Register & Pay Package
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">

          {/* TAB 1: LOGIN */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-6">

              {/* Email / Password Sign In */}
              <form onSubmit={handleCredentialLogin} className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sign In With Email</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.org"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-black text-sm shadow-lg transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Demo Login Profiles */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instant Demo Profiles</p>
                <p className="text-[11px] text-slate-400">Sample accounts (password: <span className="font-mono font-bold">{DEMO_PASSWORD}</span>)</p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleDemoLogin('user-guest-1')}
                    disabled={isSubmitting}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 text-left flex items-center justify-between transition-all group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <img src={initialProfiles[0].avatarUrl} alt="Guest" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#FF385C]">
                          David &amp; Sarah Miller (Guest Member)
                        </p>
                        <p className="text-[11px] text-slate-500">Pioneer Memorial Church • Verified Member</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FF385C] text-white text-[10px] font-bold">Login Guest</span>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('user-host-1')}
                    disabled={isSubmitting}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 text-left flex items-center justify-between transition-all group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <img src={initialProfiles[2].avatarUrl} alt="Host" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#FF385C]">
                          Marcus &amp; Ellen Vance (Host Family)
                        </p>
                        <p className="text-[11px] text-slate-500">Loma Linda University Church • Host Family</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold">Login Host</span>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('user-admin-1')}
                    disabled={isSubmitting}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-300 text-left flex items-center justify-between transition-all group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <img src={initialProfiles[3].avatarUrl} alt="Admin" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600">
                          Platform Admin (Conference Operations)
                        </p>
                        <p className="text-[11px] text-slate-500">General Conference • Platform Administrator</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold">Login Admin</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: REGISTER & PAY SUBSCRIPTION */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Mandatory Pay Notice Banner */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#FF385C] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                  <p className="font-extrabold">Mandatory Subscription Registration Policy</p>
                  <p className="leading-relaxed">
                    To maintain safety, pastoral verification, and support our non-profit mission, all members must select and pay for a membership package upon registration. Unpaid registrations cannot be created.
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  I am Registering As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setRole('GUEST'); setSelectedPlan('SABBATH_MEMBER'); }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      role === 'GUEST'
                        ? 'border-[#FF385C] bg-rose-50 dark:bg-rose-950/50 text-[#FF385C] font-extrabold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <User className="w-5 h-5 text-[#FF385C]" />
                    <div>
                      <p className="text-xs font-bold">Join as Guest</p>
                      <p className="text-[10px] text-slate-500 font-normal">Stay with Adventist hosts</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('HOST'); setSelectedPlan('FAMILY_EXCHANGE'); }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      role === 'HOST'
                        ? 'border-[#FF385C] bg-rose-50 dark:bg-rose-950/50 text-[#FF385C] font-extrabold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#FF385C]" />
                    <div>
                      <p className="text-xs font-bold">Join as Host</p>
                      <p className="text-[10px] text-slate-500 font-normal">Host Adventist travelers</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel & Hannah Baker"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="samuel@example.org"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Home Church Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Spencerville SDA Church"
                    value={homeChurchName}
                    onChange={e => setHomeChurchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Household / Family Name</label>
                  <input
                    type="text"
                    placeholder="e.g. The Baker Household"
                    value={householdName}
                    onChange={e => setHouseholdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Select Membership Package *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'SABBATH_MEMBER' as SubscriptionPlan,
                      name: 'Sabbath Member Package',
                      price: '$39/yr',
                      desc: 'Unlimited guest stays & Sabbath vespers'
                    },
                    {
                      id: 'FAMILY_EXCHANGE' as SubscriptionPlan,
                      name: 'Family Exchange Package',
                      price: '$59/yr',
                      desc: 'Host listings + cultural family exchanges'
                    },
                    {
                      id: 'GLOBAL_FAMILY' as SubscriptionPlan,
                      name: 'Global Family Package',
                      price: '$79/yr',
                      desc: 'All features + priority pastor verification'
                    }
                  ].map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPlan(pkg.id)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        selectedPlan === pkg.id
                          ? 'border-[#FF385C] bg-rose-50 dark:bg-rose-950/60 ring-2 ring-[#FF385C] shadow-md'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white">{pkg.name}</p>
                          {selectedPlan === pkg.id && <CheckCircle2 className="w-4 h-4 text-[#FF385C]" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{pkg.desc}</p>
                      </div>
                      <p className="text-sm font-black text-[#FF385C] mt-3">{pkg.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Payment Method *
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('stripe')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      provider === 'stripe' ? 'bg-[#FF385C] text-white border-[#FF385C]' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('paypal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      provider === 'paypal' ? 'bg-[#FF385C] text-white border-[#FF385C]' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    PayPal
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('pesapal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      provider === 'pesapal' ? 'bg-[#FF385C] text-white border-[#FF385C]' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Pesapal / Mobile
                  </button>
                </div>

                {/* Card Fields */}
                {provider === 'stripe' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {provider === 'pesapal' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">M-Pesa / Mobile Money Phone Number</label>
                    <input
                      type="text"
                      value={phoneNumberMobile}
                      onChange={e => setPhoneNumberMobile(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 text-xs font-bold border border-red-200 dark:border-red-900">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-900">
                  {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Payment & Registering...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${PLAN_PRICING[selectedPlan]} & Register Account</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
