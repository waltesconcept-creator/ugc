'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, UploadCloud, User, Sliders, DollarSign, Share2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

interface CreatorOnboardingViewProps {
  onComplete: () => void;
}

export const CreatorOnboardingView: React.FC<CreatorOnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Skincare', 'Beauty']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Product Review', 'Unboxing']);
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [startingRate, setStartingRate] = useState('45');
  const [serviceTitle, setServiceTitle] = useState('30-Second UGC Video Ad');

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const toggleFormat = (formatName: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatName) ? prev.filter(f => f !== formatName) : [...prev, formatName]
    );
  };

  const formatsList = [
    'Product Review',
    'Unboxing',
    'Testimonials',
    'Product Demonstrations',
    'Talking-head videos',
    'Tutorials',
    'Lifestyle videos',
    'Short-form advertisements',
    'Comedy and skits'
  ];

  return (
    <div className="w-full min-h-[calc(100vh-3.8rem)] bg-neutral-950 text-white pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span className="text-[#0095f6] font-bold">
              {step === 1 && 'Basic Profile'}
              {step === 2 && 'Niches & Content Formats'}
              {step === 3 && 'Social Proof & External Reach'}
              {step === 4 && 'Services & Starting Rates'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0095f6] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Profile */}
        {step === 1 && (
          <div className="rounded-2xl bg-[#121212] border border-[#262626] p-6 sm:p-8 space-y-5 animate-fade-in text-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Create Your Creator Profile</h2>
              <p className="text-neutral-400 mt-1">
                Showcase your creative style. You do not need thousands of followers to earn here.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-full bg-[#181818] border-2 border-dashed border-[#333333] flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:border-[#0095f6] transition-colors">
                <UploadCloud className="w-5 h-5 text-neutral-400" />
                <span className="text-[9px] mt-0.5">Avatar</span>
              </div>
              <div className="text-neutral-400 text-[11px]">
                <p className="font-semibold text-neutral-200">Profile Picture</p>
                <p>Upload a clear, friendly photo or creator logo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Full Name / Creator Name *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Jessica Taylor"
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Username / Handle *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="jessicaugc"
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl pl-8 pr-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Short Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="What type of videos do you create best? (e.g. Aesthetic beauty unboxings, comedic reviews, crisp product demos)"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Location & Country</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. London, United Kingdom or Lagos, Nigeria"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Niches & Formats */}
        {step === 2 && (
          <div className="rounded-2xl bg-[#121212] border border-[#262626] p-6 sm:p-8 space-y-6 animate-fade-in text-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Select Your Content Niches</h2>
              <p className="text-neutral-400 mt-1">
                Choose the categories of products you enjoy reviewing and creating content for.
              </p>
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-2">Categories (Pick at least 1)</label>
              <div className="flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#181818] text-neutral-300 border border-[#262626] hover:bg-[#222222]'
                      }`}
                    >
                      {cat.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#262626]">
              <label className="font-semibold text-neutral-300 block mb-2">Content Formats You Produce</label>
              <div className="flex flex-wrap gap-2">
                {formatsList.map(fmt => {
                  const isSelected = selectedFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#0095f6] text-white font-semibold'
                          : 'bg-[#181818] text-neutral-400 border border-[#262626] hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Social Reach Proof */}
        {step === 3 && (
          <div className="rounded-2xl bg-[#121212] border border-[#262626] p-6 sm:p-8 space-y-5 animate-fade-in text-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Social Media Reach (Optional)</h2>
              <p className="text-neutral-400 mt-1">
                If you have an existing audience on social platforms, connect your profiles here so brands can discover your reach. If you are starting fresh, you can skip this step!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Primary Video Profile</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={tiktokHandle}
                    onChange={e => setTiktokHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                  />
                  <input
                    type="text"
                    value={tiktokFollowers}
                    onChange={e => setTiktokFollowers(e.target.value)}
                    placeholder="Approx follower count (e.g. 5,000)"
                    className="bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Secondary Social Profile</label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={e => setInstagramHandle(e.target.value)}
                  placeholder="@yourprofile"
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Services & Rate Card */}
        {step === 4 && (
          <div className="rounded-2xl bg-[#121212] border border-[#262626] p-6 sm:p-8 space-y-5 animate-fade-in text-xs">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Set Your Service Packages & Rates</h2>
              <p className="text-neutral-400 mt-1">
                Define what you charge brands for your video deliverables. You can change this anytime.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3">
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Initial Service Title</label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-[#262626] rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-[#0095f6]"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Price in USD ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                  <input
                    type="number"
                    value={startingRate}
                    onChange={e => setStartingRate(e.target.value)}
                    className="w-full bg-[#121212] border border-[#262626] rounded-xl pl-8 pr-3.5 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#0095f6]"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Typical UGC rates range from $35 to $150 per video depending on complexity.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[#333333] bg-[#181818]/60 text-center space-y-2 cursor-pointer hover:border-[#0095f6] transition-colors">
              <UploadCloud className="w-8 h-8 text-neutral-500 mx-auto" />
              <div className="text-neutral-300 font-medium">Upload 1-3 Sample Videos to Your Portfolio</div>
              <p className="text-[10px] text-neutral-500">Supports MP4, MOV up to 100MB (will appear on your profile)</p>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-neutral-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="px-7 py-2.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Complete & Publish Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboardingView;
