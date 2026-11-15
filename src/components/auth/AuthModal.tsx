'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { CountryPickerSheet } from '@/components/common/CountryPickerSheet';
import { WORLD_COUNTRIES, Country } from '@/lib/countries';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import {
  X,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Briefcase,
  User,
  Check,
  ChevronDown,
  ArrowRight,
  Shield,
  Palette,
  DollarSign,
  MapPin,
  Lock,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuth, login, register } = useAuth();

  const [mode, setMode] = useState<'register' | 'login'>(authModalMode || 'register');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Contact & Verification, Step 2: Profile & Location

  // Contact Method (Default to Nigeria +234 / Worldwide)
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(WORLD_COUNTRIES[0]); // Nigeria (+234)
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [password, setPassword] = useState('');

  // Country Picker Sheet state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'dialCode' | 'location'>('dialCode');

  // Step 2 Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | 'guest'>('creator');
  const [locationCountry, setLocationCountry] = useState<Country>(WORLD_COUNTRIES[0]); // Nigeria
  const [stateCity, setStateCity] = useState('Lagos');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Tech & Gadgets', 'Lifestyle']);
  const [startingRate, setStartingRate] = useState('50');
  const [bio, setBio] = useState('');

  // Login Field
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleCountrySelected = (c: Country) => {
    if (pickerTarget === 'dialCode') {
      setSelectedCountry(c);
      setLocationCountry(c);
    } else {
      setLocationCountry(c);
    }
  };

  // Step 1: Validate contact and advance
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (contactType === 'phone') {
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 6) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    } else {
      if (!emailInput.includes('@') || !emailInput.includes('.')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    // Advance to Step 2
    setStep(2);
  };

  // Step 2: Final Registration
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name or stage name.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Please enter your @username handle.');
      return;
    }

    const contactVal =
      contactType === 'phone'
        ? `${selectedCountry.dialCode}${phoneInput.replace(/[^0-9]/g, '')}`
        : emailInput.trim();

    const fullLocation = stateCity.trim()
      ? `${stateCity.trim()}, ${locationCountry.name}`
      : locationCountry.name;

    setLoading(true);
    const result = await register({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase(),
      contactType,
      contactValue: contactVal,
      country: locationCountry.name,
      location: fullLocation,
      role,
      categories: selectedCategories,
      startingPrice: Number(startingRate) || 50,
      bio: bio.trim(),
    });
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  // Sign In Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your phone number, email, or @username.');
      return;
    }

    setLoading(true);
    const result = await login(loginIdentifier.trim());
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Account not found. Please sign up!');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          onClick={closeAuth}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'register' && step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-300 hover:text-white flex items-center justify-center mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <Kre8torLogo size="md" />
            </div>

            <button
              onClick={closeAuth}
              className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle: Sign Up vs Sign In */}
          <div className="px-5 pt-3">
            <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-2xl border border-neutral-800">
              <button
                onClick={() => {
                  setMode('register');
                  setStep(1);
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {mode === 'register' ? (
              step === 1 ? (
                /* ─── REGISTER STEP 1: Phone / Email & Credentials ─── */
                <form onSubmit={handleProceedToStep2} className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Join KRE8TOR Worldwide</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Connect with brands and get discovered for UGC campaigns worldwide.
                    </p>
                  </div>

                  {/* Contact Type Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                      Verify With:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContactType('phone')}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          contactType === 'phone'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        📱 Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactType('email')}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          contactType === 'email'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        ✉️ Email
                      </button>
                    </div>
                  </div>

                  {/* Phone input with searchable country dial code picker */}
                  {contactType === 'phone' ? (
                    <div>
                      <div className="flex gap-2">
                        {/* Searchable Country Code Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setPickerTarget('dialCode');
                            setIsPickerOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-xs font-bold text-white transition-colors shrink-0"
                        >
                          <span className="text-lg">{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                        </button>

                        {/* Phone Input */}
                        <div className="flex-1 relative">
                          <input
                            type="tel"
                            placeholder="e.g. 0801 234 5678"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="w-full py-3 px-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors font-medium"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Tap {selectedCountry.flag} to search any country (Nigeria, US, UK, Ghana, Kenya, etc.)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          type="email"
                          placeholder="you@domain.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full py-3 pl-10 pr-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Verification Code Simulation (Smooth & Real) */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center justify-between">
                      <span>4-Digit Verification Code:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationCode('8888');
                          setIsCodeSent(true);
                        }}
                        className="text-[10px] text-orange-400 hover:underline font-bold"
                      >
                        {isCodeSent ? 'Code Sent: 8888' : 'Send Code'}
                      </button>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter code (or tap 'Send Code' for 8888)"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full py-3 pl-10 pr-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                      Create Password:
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3 pl-10 pr-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue to Profile Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* ─── REGISTER STEP 2: Profile, Location & Category Setup ─── */
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Complete Your Creator Profile</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      This information appears on your profile and helps brands hire you.
                    </p>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                      Account Type:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('creator')}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'creator'
                            ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        <Palette className="w-4 h-4" />
                        <span className="text-xs font-bold block">Creator</span>
                        <span className="text-[9px] text-neutral-400">Get Hired</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('business')}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'business'
                            ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span className="text-xs font-bold block">Brand</span>
                        <span className="text-[9px] text-neutral-400">Hire Talent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('guest')}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'guest'
                            ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-xs font-bold block">Viewer</span>
                        <span className="text-[9px] text-neutral-400">Watch Only</span>
                      </button>
                    </div>
                  </div>

                  {/* Name & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Full Name / Brand Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jethro Vance"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          if (!username) {
                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                          }
                        }}
                        className="w-full py-2.5 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Handle (@username):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">@</span>
                        <input
                          type="text"
                          placeholder="jethrovance"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full py-2.5 pl-7 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Searchable Country & State/City Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3 text-orange-400" /> Country:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTarget('location');
                          setIsPickerOpen(true);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-orange-500 text-xs text-white flex items-center justify-between text-left transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{locationCountry.flag}</span>
                          <span className="font-semibold truncate">{locationCountry.name}</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" /> State / City:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lagos, Abuja, London, Atlanta"
                        value={stateCity}
                        onChange={(e) => setStateCity(e.target.value)}
                        className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Creator Specifics */}
                  {role === 'creator' && (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                          Select Content Categories:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {MOCK_CATEGORIES.map((cat) => {
                            const isSelected = selectedCategories.includes(cat.name);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => toggleCategory(cat.name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                <span>{cat.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-orange-400" /> Starting Rate ($ USD):
                          </label>
                          <input
                            type="number"
                            min="10"
                            step="5"
                            placeholder="50"
                            value={startingRate}
                            onChange={(e) => setStartingRate(e.target.value)}
                            className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                            Bio / Niche:
                          </label>
                          <input
                            type="text"
                            placeholder="Organic UGC video reviews & conversion hooks..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Activating your live account...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Enter KRE8TOR</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* ─── SIGN IN FORM ─── */
              <form onSubmit={handleLoginSubmit} className="space-y-4 py-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">Welcome Back</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Sign in with your phone number (+234...), email, or @username.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Phone, Email, or @Username:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +2348012345678 or you@domain.com or @username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full py-3 px-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center text-[11px] text-neutral-500 pt-2">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setStep(1);
                    }}
                    className="text-orange-400 font-bold hover:underline"
                  >
                    Create account here →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Worldwide Searchable Country & Dial Code Picker */}
      <CountryPickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleCountrySelected}
        selectedCode={pickerTarget === 'dialCode' ? selectedCountry.code : locationCountry.code}
        title={pickerTarget === 'dialCode' ? 'Select Country Dial Code' : 'Select Your Country'}
      />
    </>
  );
};

export default AuthModal;
