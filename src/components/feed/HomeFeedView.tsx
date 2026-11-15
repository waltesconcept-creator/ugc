'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Post, Story } from '@/lib/types';
import { StoryTray } from '@/components/stories/StoryTray';
import { SocialPostCard } from './SocialPostCard';
import { VideoFeed } from './VideoFeed';
import { ImmersiveMediaViewer } from './ImmersiveMediaViewer';
import { recommendationEngine } from '@/lib/recommendation-engine';
import { MOCK_CREATORS } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Users,
  Flame,
  Clapperboard,
  LayoutList,
  ShieldCheck,
  Star,
  Zap,
  ArrowRight,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';

interface HomeFeedViewProps {
  posts: Post[];
  stories: Story[];
  onOpenProfile: (creatorId: string) => void;
  onStartChat: (creatorId: string) => void;
  onCreateStory: () => void;
}

const NICHE_TABS = [
  { id: 'all', label: '🔥 All Feeds' },
  { id: 'tech', label: '📱 Tech & Gadgets' },
  { id: 'beauty', label: '💄 Beauty & Skincare' },
  { id: 'fashion', label: '👗 Fashion & Style' },
  { id: 'food', label: '🍔 Food & Beverage' },
  { id: 'fitness', label: '💪 Fitness & Health' },
  { id: 'lifestyle', label: '✨ Lifestyle' },
];

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  posts,
  stories,
  onOpenProfile,
  onStartChat,
  onCreateStory,
}) => {
  const { currentUser, isAuthenticated, openAuth } = useAuth();

  // Feed view mode: 'social' (Instagram-style standard feed) vs 'reels' (TikTok-style 9:16 immersive)
  const [viewMode, setViewMode] = useState<'social' | 'reels'>('social');

  // Discovery section: 'for_you' (recommendation engine ranked) vs 'following' (chronological)
  const [feedSection, setFeedSection] = useState<'for_you' | 'following'>('for_you');

  // Selected Category Niche
  const [selectedNiche, setSelectedNiche] = useState<string>('all');

  // State to support removing "not interested" posts optimistically
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());

  // Global audio mute state shared across cards
  const [isMuted, setIsMuted] = useState(true);
  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  // Immersive Fullscreen Media Viewer state
  const [expandedPostIndex, setExpandedPostIndex] = useState<number | null>(null);

  // Set of following creator IDs (default to following 4 top creators for testing)
  const [followingIds] = useState<Set<string>>(
    new Set(['creator-1', 'creator-2', 'creator-3', 'creator-6'])
  );

  // Compute feed posts based on recommendation engine
  const basePosts = useMemo(() => {
    const visible = posts.filter((p) => !hiddenPostIds.has(p.id));

    if (feedSection === 'following') {
      return recommendationEngine.getFollowingFeed(visible, followingIds);
    }
    // 'for_you': personalized recommendation engine ranking
    return recommendationEngine.rankForYouFeed(visible);
  }, [posts, hiddenPostIds, feedSection, followingIds]);

  // Apply Category Niche filtering
  const displayedPosts = useMemo(() => {
    if (selectedNiche === 'all') return basePosts;
    return basePosts.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const niche = selectedNiche.toLowerCase();
      if (niche === 'beauty') return cat.includes('beauty') || cat.includes('skincare') || cat.includes('hair');
      if (niche === 'tech') return cat.includes('tech') || cat.includes('gadget');
      if (niche === 'fashion') return cat.includes('fashion') || cat.includes('style');
      if (niche === 'food') return cat.includes('food') || cat.includes('beverage') || cat.includes('recipe');
      if (niche === 'fitness') return cat.includes('fitness') || cat.includes('health') || cat.includes('wellness');
      if (niche === 'lifestyle') return cat.includes('lifestyle') || cat.includes('travel') || cat.includes('home');
      return cat.includes(niche);
    });
  }, [basePosts, selectedNiche]);

  const handleNotInterested = (postId: string) => {
    setHiddenPostIds((prev) => new Set([...prev, postId]));
  };

  // Curate Spotlight creators with diverse global & Nigerian representation
  const spotlightCreators = useMemo(() => {
    const creatorIds = ['creator-6', 'creator-1', 'creator-2', 'creator-4', 'creator-3', 'creator-5'];
    return creatorIds
      .map((id) => MOCK_CREATORS.find((c) => c.profile.id === id))
      .filter((c): c is (typeof MOCK_CREATORS)[0] => Boolean(c));
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col bg-neutral-950">
      {/* ── Top Discovery Header & Mode Switcher Bar ── */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 px-3 sm:px-6 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* For You / Following Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 border border-neutral-800">
            <button
              onClick={() => setFeedSection('for_you')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                feedSection === 'for_you'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-orange-200" />
              <span>For You</span>
            </button>

            <button
              onClick={() => setFeedSection('following')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                feedSection === 'following'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Following</span>
            </button>
          </div>

          {/* Feed Format Toggle: Standard Feed vs Full-Screen Reels */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode('social')}
              title="Classic Social Feed"
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === 'social'
                  ? 'bg-neutral-800 text-orange-400 shadow-sm border border-neutral-700'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button
              onClick={() => setViewMode('reels')}
              title="Full-Screen 9:16 Reels"
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all ${
                viewMode === 'reels'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reels</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MODE 1: Standard Social Feed ── */}
      {viewMode === 'social' && (
        <div className="flex-1 w-full overflow-y-auto pb-20 lg:pb-10">
          {/* 1. Curved Box Stories Tray (Embedded in natural scroll flow) */}
          <StoryTray
            stories={stories}
            onOpenProfile={onOpenProfile}
            onStartChat={onStartChat}
            onCreateStory={onCreateStory}
          />

          {/* 2. Feed Stream Container */}
          <div className="max-w-xl mx-auto px-3 sm:px-4 pt-4">
            {/* ── KRE8TOR Signature Brand Hero Showcase ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900/90 via-neutral-950 to-neutral-900/80 border border-orange-500/25 p-4 sm:p-5 mb-5 shadow-2xl shadow-orange-500/10 backdrop-blur-md">
              {/* Subtle Ambient Glowing Orbs */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[11px] font-extrabold uppercase tracking-wider mb-2.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  <span>KRE8TOR CREATOR NETWORK</span>
                </div>

                {/* Main Headline */}
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Where Authentic UGC Creators <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                    Build, Connect & Get Hired
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed max-w-lg">
                  Watch genuine creator reels, inspect 100% verified client reviews & on-time stats, and book campaigns securely with escrow protection.
                </p>

                {/* 4 Trust Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-neutral-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                    <span className="text-base">🇳🇬</span>
                    <span>Nigeria & Worldwide</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Escrow Protected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>Verified Reviews</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Direct Brand Hire</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => openAuth('register')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
                      >
                        <span>Join as Creator Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openAuth('login')}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-white text-xs font-bold transition-colors"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onCreateStory}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Upload UGC Reel / Post</span>
                      </button>
                      <button
                        onClick={() => onOpenProfile(currentUser?.profile?.id || currentUser?.id || 'creator-1')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-orange-500/40 text-orange-400 hover:bg-neutral-800 text-xs font-bold transition-all"
                      >
                        <span>My Creator Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Trending Creators Spotlight Carousel ── */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <h3 className="text-xs font-bold text-white tracking-wider uppercase">
                    Featured Creators
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-orange-400">
                  Direct Hire Available
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none pb-2 pt-0.5 -mx-1 px-1">
                {spotlightCreators.map((creator) => {
                  const isNig = creator.profile.country === 'Nigeria' || creator.profile.location?.toLowerCase().includes('lagos');
                  const isUK = creator.profile.country === 'United Kingdom' || creator.profile.location?.toLowerCase().includes('london');
                  const isCA = creator.profile.country === 'Canada';
                  const isDE = creator.profile.country === 'Germany';
                  const isUS = creator.profile.country === 'United States';
                  const flag = isNig ? '🇳🇬' : isUK ? '🇬🇧' : isCA ? '🇨🇦' : isDE ? '🇩🇪' : isUS ? '🇺🇸' : '🌎';

                  return (
                    <div
                      key={creator.profile.id}
                      onClick={() => onOpenProfile(creator.profile.id)}
                      className="group shrink-0 w-60 bg-neutral-900/90 border border-neutral-800 hover:border-orange-500/50 rounded-2xl p-3 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-98 shadow-md hover:shadow-orange-500/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={creator.profile.avatarUrl}
                            alt={creator.profile.displayName}
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-orange-500/40 group-hover:ring-orange-500 transition-all shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 text-xs">{flag}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                              {creator.profile.displayName}
                            </h4>
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20 shrink-0" />
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate">@{creator.profile.username}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 font-semibold text-[9px] border border-orange-500/20">
                            {creator.details.categories[0]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-neutral-500 block">Starting rate</span>
                          <span className="text-xs font-bold text-amber-400">
                            ${(creator.details.startingPriceCents / 100).toFixed(0)}/video
                          </span>
                        </div>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white transition-all shadow-sm">
                          <span>Portfolio</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Category Niche Filter Strip ── */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 -mx-1 px-1">
                {NICHE_TABS.map((niche) => {
                  const isSelected = selectedNiche === niche.id;
                  return (
                    <button
                      key={niche.id}
                      onClick={() => setSelectedNiche(niche.id)}
                      className={`shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 border-transparent'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850 border border-neutral-800'
                      }`}
                    >
                      {niche.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Posts Stream ── */}
            {displayedPosts.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800 p-8 my-6">
                <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">No Posts in This Category</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
                  Try exploring other niches or check back soon for newly published creator videos.
                </p>
                <button
                  onClick={() => setSelectedNiche('all')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  View All Feeds
                </button>
              </div>
            ) : (
              displayedPosts.map((post, idx) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  isMuted={isMuted}
                  toggleMute={toggleMute}
                  onOpenProfile={onOpenProfile}
                  onNotInterested={handleNotInterested}
                  onExpandPost={() => setExpandedPostIndex(idx)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODE 2: Immersive 9:16 Full-Bleed Vertical Reels (TikTok-style swipe) ── */}
      {viewMode === 'reels' && (
        <div className="flex-1 w-full h-[calc(100dvh-7.5rem)]">
          <VideoFeed
            posts={displayedPosts}
            onOpenProfile={onOpenProfile}
          />
        </div>
      )}

      {/* ── Immersive Media Viewer (opens uncropped when any video/photo is tapped!) ── */}
      {expandedPostIndex !== null && (
        <ImmersiveMediaViewer
          isOpen={expandedPostIndex !== null}
          initialPostIndex={expandedPostIndex}
          posts={displayedPosts}
          onClose={() => setExpandedPostIndex(null)}
          onOpenProfile={onOpenProfile}
        />
      )}
    </div>
  );
};

export default HomeFeedView;
