'use client';

import React, { useState } from 'react';
import type { Profile } from '@/lib/types';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ugc-b3pl.onrender.com';
  const shareUrl = `${origin}/?creator=${profile.username}`;
  const shareText = `Check out @${profile.username}'s UGC creator portfolio on Creator! 🎬✨`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} on Creator`,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Native share canceled/failed');
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Sheet / Dialog */}
      <div className="relative w-full sm:max-w-md bg-neutral-950 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Share Creator Portfolio</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Creator Mini Card Preview */}
          <div className="flex items-center gap-3 p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-12 h-12 rounded-full object-cover border border-[#262626]"
            />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-white text-sm block truncate">
                {profile.displayName}
              </span>
              <span className="text-xs text-neutral-400 block truncate">@{profile.username}</span>
              <span className="text-[10px] text-neutral-400 font-medium mt-0.5 block truncate">
                {profile.location || 'Global Creator'}
              </span>
            </div>
          </div>

          {/* Share URL copy field */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Portfolio Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-neutral-300 font-mono px-2 outline-none select-all truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Shortcuts */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Share Direct
            </label>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-semibold text-emerald-400 gap-1 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px]">WhatsApp</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-semibold text-sky-400 gap-1 transition-colors"
              >
                <span className="text-base font-bold">𝕏</span>
                <span className="text-[11px]">Twitter / X</span>
              </a>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-semibold text-neutral-300 gap-1 transition-colors"
              >
                <Share2 className="w-5 h-5 text-neutral-300" />
                <span className="text-[11px]">More Apps</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShareProfileModal;
