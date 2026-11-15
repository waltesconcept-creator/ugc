'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CountryPickerSheet } from '@/components/common/CountryPickerSheet';
import { WORLD_COUNTRIES, Country } from '@/lib/countries';
import type { ServicePackage } from '@/lib/types';
import {
  X,
  Check,
  Plus,
  Trash2,
  DollarSign,
  MapPin,
  Sparkles,
  Layers,
  Save,
  Clock,
  RotateCcw,
} from 'lucide-react';

const ALL_CATEGORIES = [
  'Tech & Gadgets',
  'Beauty & Skincare',
  'Fitness & Wellness',
  'Fashion & Apparel',
  'Food & Beverage',
  'Lifestyle',
  'Travel & Hospitality',
  'Home & Living',
  'Finance & B2B Apps',
  'Gaming & Entertainment',
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.profile.displayName || '');
  const [bio, setBio] = useState(currentUser?.profile.bio || '');
  const [locationCity, setLocationCity] = useState(
    currentUser?.profile.location?.split(',')[0]?.trim() || 'Lagos'
  );
  const [country, setCountry] = useState<Country>(
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === currentUser?.country?.toLowerCase()) ||
      WORLD_COUNTRIES[0]
  );
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [startingRate, setStartingRate] = useState(
    String(Math.round((currentUser?.details?.startingPriceCents || 5000) / 100))
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.details?.categories || currentUser?.categories || ['Lifestyle']
  );
  const [instagramHandle, setInstagramHandle] = useState(
    currentUser?.details?.instagramHandle || ''
  );
  const [tiktokHandle, setTiktokHandle] = useState(
    currentUser?.details?.tiktokHandle || ''
  );
  const [youtubeHandle, setYoutubeHandle] = useState(
    currentUser?.details?.youtubeHandle || ''
  );
  const [website, setWebsite] = useState(
    currentUser?.profile?.website || ''
  );
  const [services, setServices] = useState<ServicePackage[]>(
    currentUser?.services && currentUser.services.length > 0
      ? currentUser.services
      : [
          {
            id: `svc-${Date.now()}-1`,
            creatorId: currentUser?.id || 'creator',
            title: 'Authentic UGC Short-Form Video',
            description:
              'Organic 30-60s UGC video optimized for TikTok and Reels with authentic hook, storytelling, and call to action.',
            priceCents: (Number(startingRate) || 50) * 100,
            currency: 'USD',
            deliveryDays: 3,
            revisionsAllowed: 1,
            formatTag: 'UGC Video',
            isActive: true,
          },
        ]
  );

  // New package form state
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('75');
  const [newPkgDays, setNewPkgDays] = useState('3');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddPackage = () => {
    if (!newPkgTitle.trim()) return;
    const newPkg: ServicePackage = {
      id: `svc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      creatorId: currentUser.id,
      title: newPkgTitle.trim(),
      description: newPkgDesc.trim() || 'Custom UGC content package with commercial rights.',
      priceCents: Math.round(Number(newPkgPrice || 50) * 100),
      currency: 'USD',
      deliveryDays: Number(newPkgDays) || 3,
      revisionsAllowed: 1,
      formatTag: 'UGC Video',
      isActive: true,
    };
    setServices((prev) => [...prev, newPkg]);
    setNewPkgTitle('');
    setNewPkgDesc('');
    setShowAddPackage(false);
  };

  const handleRemovePackage = (pkgId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== pkgId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty.');
      return;
    }

    const fullLocation = locationCity.trim()
      ? `${locationCity.trim()}, ${country.name}`
      : country.name;

    setSaving(true);
    const res = await updateUserProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      location: fullLocation,
      country: country.name,
      startingPrice: Number(startingRate) || 50,
      categories: selectedCategories,
      services,
      instagramHandle: instagramHandle.trim(),
      tiktokHandle: tiktokHandle.trim(),
      youtubeHandle: youtubeHandle.trim(),
      website: website.trim(),
    });
    setSaving(false);

    if (res.success) {
      setSuccessMsg('✓ Profile & rates saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Failed to save changes.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-fade-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-850 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Edit Profile & Rates</h2>
              <p className="text-[11px] text-neutral-400">Update your creator info, pricing, and services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            {successMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Display Name */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brands what makes your UGC videos stand out..."
              className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
            />
          </div>

          {/* Location: City + Searchable Country */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                State / City
              </label>
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="e.g. Lagos, Abuja, London"
                className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
                Country
              </label>
              <button
                type="button"
                onClick={() => setIsCountryPickerOpen(true)}
                className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white flex items-center justify-between hover:border-orange-500 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{country.flag}</span>
                  <span className="truncate">{country.name}</span>
                </div>
                <span className="text-[10px] text-orange-400 font-bold shrink-0">Change</span>
              </button>
            </div>
          </div>

          {/* Starting Rate */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Starting Rate ($ USD per video)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="number"
                min={10}
                max={10000}
                value={startingRate}
                onChange={(e) => setStartingRate(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Social Profiles & Portfolio Links */}
          <div className="pt-2 border-t border-neutral-850">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Social Accounts & External Links
              </label>
              <span className="text-[10px] text-orange-400 font-semibold">Tapped directly from your profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 block mb-1">TikTok Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                  <input
                    type="text"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="yourtiktok"
                    className="w-full py-2 pl-7 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 block mb-1">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="yourinstagram"
                    className="w-full py-2 pl-7 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 block mb-1">YouTube Handle / Channel</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                  <input
                    type="text"
                    value={youtubeHandle}
                    onChange={(e) => setYoutubeHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="youryoutube"
                    className="w-full py-2 pl-7 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 block mb-1">Website / Portfolio / Linktree</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://myportfolio.com"
                  className="w-full py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Niche Categories */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
              Creator Niches & Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white font-bold shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Packages Section */}
          <div className="border-t border-neutral-850 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Service Packages ({services.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPackage(!showAddPackage)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold hover:bg-orange-500 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Package</span>
              </button>
            </div>

            {/* Add package mini drawer */}
            {showAddPackage && (
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl mb-3 space-y-2.5 animate-fade-in">
                <span className="text-[11px] font-bold text-white block">Create New Offering</span>
                <input
                  type="text"
                  placeholder="e.g. 60s Unboxing + 3 Hook Variations"
                  value={newPkgTitle}
                  onChange={(e) => setNewPkgTitle(e.target.value)}
                  className="w-full py-2 px-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Description of what the brand receives..."
                  value={newPkgDesc}
                  onChange={(e) => setNewPkgDesc(e.target.value)}
                  className="w-full py-2 px-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 text-xs focus:outline-none focus:border-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Price ($ USD)</span>
                    <input
                      type="number"
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(e.target.value)}
                      className="w-full py-1.5 px-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-0.5">Turnaround (Days)</span>
                    <input
                      type="number"
                      value={newPkgDays}
                      onChange={(e) => setNewPkgDays(e.target.value)}
                      className="w-full py-1.5 px-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPackage(false)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPackage}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            )}

            {/* Existing services list */}
            <div className="space-y-2">
              {services.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{pkg.title}</span>
                      <span className="text-orange-400 font-extrabold font-mono">
                        ${Math.round(pkg.priceCents / 100)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{pkg.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pkg.deliveryDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> {pkg.revisionsAllowed} rev
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePackage(pkg.id)}
                    className="w-7 h-7 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
                    title="Remove package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving changes...' : 'Save Profile & Rates'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Country Picker Sheet */}
      <CountryPickerSheet
        isOpen={isCountryPickerOpen}
        onClose={() => setIsCountryPickerOpen(false)}
        selectedCode={country.code}
        title="Select Location Country"
        onSelect={(c) => setCountry(c)}
      />
    </div>
  );
};
export default EditProfileModal;
