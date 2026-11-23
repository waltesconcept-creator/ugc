'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { CountryPickerSheet } from '@/components/common/CountryPickerSheet';
import { WORLD_COUNTRIES, Country } from '@/lib/countries';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import {
  ChevronDown,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface AuthPageContentProps {
  initialMode?: 'register' | 'login' | 'forgot';
}

export const AuthPageContent: React.FC<AuthPageContentProps> = ({ initialMode = 'register' }) => {
  const router = useRouter();
  const { currentUser, isAuthenticated, login, register, forgotPassword } = useAuth();

  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>(initialMode);
  const [step, setStep] = useState<1 | 2>(1);

  // Contact Method
  const [contactType, setContactType] = useState<'phone' | 'email'>('email');
  const [selectedCountry, setSelectedCountry] = useState<Country>(WORLD_COUNTRIES[0]); // Nigeria (+234)
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');

  // Country Picker Sheet state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'dialCode' | 'location'>('dialCode');

  // Step 2 Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'creator' | 'business' | 'guest'>('creator');
  const [locationCountry, setLocationCountry] = useState<Country>(WORLD_COUNTRIES[0]);
  const [stateCity, setStateCity] = useState('Lagos');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Tech', 'Lifestyle']);
  const [startingRate, setStartingRate] = useState('30000');
  const [bio, setBio] = useState('');

  // Login Field
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password Fields
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.push('/');
    }
  }, [isAuthenticated, currentUser, router]);

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

    if (contactType === 'email') {
      if (!emailInput.trim() || !emailInput.includes('@') || !emailInput.includes('.')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    } else {
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 6) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('Please create a password of at least 4 characters.');
      return;
    }

    setStep(2);
  };

  // Step 2: Final Registration
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Please enter your full name or brand name.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Please enter your @username handle.');
      return;
    }

    const contactVal =
      contactType === 'phone'
        ? `${selectedCountry.dialCode} ${phoneInput.replace(/[^0-9]/g, '')}`
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
      startingPrice: Number(startingRate) || 30000,
      bio: bio.trim(),
      password: password.trim(),
    });
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  // Sign In Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email, phone, or username.');
      return;
    }

    setLoading(true);
    const result = await login(loginIdentifier.trim(), loginPassword.trim());
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Account not found. Please sign up or verify credentials.');
    }
  };

  // Forgot Password: Send Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your registered email, phone, or username.');
      return;
    }

    setLoading(true);
    const result = await forgotPassword('request_code', forgotIdentifier.trim());
    setLoading(false);

    if (result.success) {
      setResetCodeSent(true);
      if (result.code) {
        setResetNotice(`Verification code: [ ${result.code} ]`);
        setResetCode(result.code);
      }
      setSuccessMessage('Verification code sent. Enter it below with your new password.');
    } else {
      setErrorMessage(result.error || 'Account not found.');
    }
  };

  // Forgot Password: Confirm Reset
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetCode.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMessage('Please enter a new password of at least 4 characters.');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(
      'verify_and_reset',
      forgotIdentifier.trim(),
      resetCode.trim(),
      newPassword.trim()
    );
    setLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setErrorMessage(result.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-3 sm:p-6 relative">
      {/* Top Bar: Back to Feed */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-sm bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          {mode === 'register' && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="self-start text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <Kre8torLogo size="lg" />
          <p className="text-xs text-neutral-400 mt-2 font-normal">
            {mode === 'register'
              ? step === 1
                ? 'Sign up to watch, book creators & shop'
                : 'Complete your profile'
              : mode === 'forgot'
              ? 'Reset your account password'
              : 'Sign in to your Creator account'}
          </p>
        </div>

        {/* Mode Switch Tabs (Sign In vs Register) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-[#181818] rounded-xl mb-5 border border-[#262626]">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStep(1);
                setErrorMessage('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'register' ? 'bg-[#262626] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login' ? 'bg-[#262626] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
            {successMessage}
          </div>
        )}

        {/* ─── 1. REGISTER STEP 1 ─── */}
        {mode === 'register' && step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-3.5">
            {/* Phone vs Email Toggle */}
            <div className="flex bg-[#181818] rounded-lg p-0.5 border border-[#262626] text-xs">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                  contactType === 'email' ? 'bg-[#262626] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                  contactType === 'phone' ? 'bg-[#262626] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Input by Contact Type */}
            {contactType === 'email' ? (
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget('dialCode');
                    setIsPickerOpen(true);
                  }}
                  className="w-24 h-11 shrink-0 flex items-center justify-center gap-1 bg-[#181818] border border-[#262626] rounded-xl text-xs font-medium text-white hover:border-neutral-500 transition-colors"
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1 h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors mt-2"
            >
              Continue
            </button>
          </form>
        )}

        {/* ─── 2. REGISTER STEP 2 (Complete Profile) ─── */}
        {mode === 'register' && step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-3.5">
            {/* Account Type Selector */}
            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'creator' as const, label: 'Creator' },
                  { key: 'business' as const, label: 'Business' },
                  { key: 'guest' as const, label: 'Consumer' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      role === item.key
                        ? 'bg-[#262626] border-white text-white'
                        : 'bg-[#181818] border-[#262626] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <input
                type="text"
                placeholder={role === 'business' ? 'Business / Brand Name' : 'Full Name'}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (!username) {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }
                }}
                className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            {/* Username */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">@</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full h-11 pl-8 pr-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickerTarget('location');
                  setIsPickerOpen(true);
                }}
                className="w-full h-11 px-3 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white flex items-center justify-between text-left hover:border-neutral-500 transition-colors"
              >
                <span className="truncate">{locationCountry.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>

              <input
                type="text"
                placeholder="City (e.g. Lagos)"
                value={stateCity}
                onChange={(e) => setStateCity(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            {/* Categories (for creators) */}
            {role === 'creator' && (
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                  Categories
                </label>
                <div className="flex flex-wrap gap-1">
                  {['Tech', 'Beauty', 'Fashion', 'Food', 'Fitness', 'Lifestyle'].map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-white text-black font-semibold'
                            : 'bg-[#181818] text-neutral-400 border border-[#262626]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>
        )}

        {/* ─── 3. SIGN IN ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                placeholder="Email, phone number, or username"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* ─── 4. FORGOT PASSWORD ─── */}
        {mode === 'forgot' && (
          <div className="space-y-3.5">
            {!resetCodeSent ? (
              <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enter your email, phone number, or username and we'll send you a verification code to reset your password.
                </p>

                <input
                  type="text"
                  placeholder="Email, phone, or username"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3.5">
                {resetNotice && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl font-mono">
                    {resetNotice}
                  </p>
                )}

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit verification code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 text-center font-mono tracking-widest text-sm focus:outline-none focus:border-[#0095f6] transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#181818] border border-[#262626] rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating password...' : 'Reset Password & Log In'}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetCodeSent(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Country Picker Bottom Sheet */}
      <CountryPickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectCountry={handleCountrySelected}
        selectedCountry={pickerTarget === 'dialCode' ? selectedCountry : locationCountry}
      />
    </div>
  );
};

export default AuthPageContent;
