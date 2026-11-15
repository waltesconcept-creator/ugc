'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
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
} from 'lucide-react';

const COUNTRY_DIAL_CODES = [
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuth, login, register } = useAuth();

  const [mode, setMode] = useState<'register' | 'login'>(authModalMode || 'register');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [selectedDialCode, setSelectedDialCode] = useState('+1');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Register Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | 'guest'>('creator');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [cityLocation, setCityLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Beauty & Skincare']);
  const [startingRate, setStartingRate] = useState('45');
  const [bio, setBio] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name or stage name.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Please choose a handle/username.');
      return;
    }

    const contactVal =
      contactType === 'phone'
        ? `${selectedDialCode}${phoneInput.replace(/[^0-9]/g, '')}`
        : emailInput.trim();

    if (contactType === 'phone' && phoneInput.trim().length < 5) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (contactType === 'email' && !emailInput.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await register({
      displayName,
      username,
      contactType,
      contactValue: contactVal,
      country: selectedCountry,
      location: cityLocation ? `${cityLocation}, ${selectedCountry}` : selectedCountry,
      role,
      categories: selectedCategories,
      startingPrice: Number(startingRate) || 45,
      bio,
    });
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email, phone, or username.');
      return;
    }

    setLoading(true);
    const result = await login(loginIdentifier.trim());
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Account not found.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuth}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header with KRE8TOR Logo */}
        <div className="p-4 sm:p-5 border-b border-neutral-850 flex items-center justify-between">
          <Kre8torLogo size="md" />

          <button
            onClick={closeAuth}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Sign Up vs Sign In */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-2xl border border-neutral-800">
            <button
              onClick={() => {
                setMode('register');
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Account Role Picker */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Join As:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'creator'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-xs font-bold block">Creator</span>
                    <span className="text-[9px] text-neutral-400 leading-tight">Get Hired</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('business')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'business'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs font-bold block">Brand</span>
                    <span className="text-[9px] text-neutral-400 leading-tight">Hire Talent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('guest')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'guest'
                        ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold block">Viewer</span>
                    <span className="text-[9px] text-neutral-400 leading-tight">Watch Content</span>
                  </button>
                </div>
              </div>

              {/* 2. Contact Method Selector (Phone vs Email) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                    Sign Up With:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setContactType('phone')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        contactType === 'phone'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      📱 Phone Number
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType('email')}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        contactType === 'email'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      ✉️ Email Address
                    </button>
                  </div>
                </div>

                {contactType === 'phone' ? (
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select
                        value={selectedDialCode}
                        onChange={(e) => setSelectedDialCode(e.target.value)}
                        className="w-full py-2.5 pl-2.5 pr-6 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                      >
                        {COUNTRY_DIAL_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
                    </div>

                    <input
                      type="tel"
                      placeholder="801 234 5678"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 py-2.5 px-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      placeholder="you@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* 3. Basic Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                    Full / Brand Name:
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
                    className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
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

              {/* 4. Worldwide Location & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-orange-400" /> Country:
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {COUNTRY_DIAL_CODES.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.flag} {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" /> City / Region:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, London, Los Angeles"
                    value={cityLocation}
                    onChange={(e) => setCityLocation(e.target.value)}
                    className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* 5. Creator Specific Details */}
              {role === 'creator' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                      Select Content Categories (What You Create):
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
                        placeholder="45"
                        value={startingRate}
                        onChange={(e) => setStartingRate(e.target.value)}
                        className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Quick Bio:
                      </label>
                      <input
                        type="text"
                        placeholder="Specializing in viral organic hooks & unboxing..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Creating your live account...</span>
                  ) : (
                    <>
                      <span>Join KRE8TOR Network</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Email, Phone, or @Username:
                </label>
                <input
                  type="text"
                  placeholder="e.g. +2348012345678 or you@domain.com or @username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full py-3 px-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to KRE8TOR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-[11px] text-neutral-500 pt-2">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-orange-400 font-bold hover:underline"
                >
                  Create one now →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
