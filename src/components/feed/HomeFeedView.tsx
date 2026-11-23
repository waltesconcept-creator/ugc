'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'food', label: 'Food' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'lifestyle', label: 'Lifestyle' },
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
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              For You
            </button>

            <button
              onClick={() => setFeedSection('following')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                feedSection === 'following'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Following
            </button>
          </div>

          {/* Feed Format Toggle: Standard Feed vs Full-Screen Reels */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode('social')}
              title="Classic Social Feed"
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                viewMode === 'social'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feed</span>
            </button>

            <button
              onClick={() => setViewMode('reels')}
              title="Full-Screen 9:16 Reels"
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                viewMode === 'reels'
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
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
          <div className="max-w-xl mx-auto px-3 sm:px-4 pt-3">
            {/* ── Trending Creators Spotlight Carousel ── */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#a8a8a8]" />
                  <h3 className="text-xs font-bold text-white tracking-wider uppercase">
                    Featured Creators
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#a8a8a8]">
                  Available for Hire
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none pb-2 pt-0.5 -mx-1 px-1">
                {spotlightCreators.map((creator) => {
                  return (
                    <div
                      key={creator.profile.id}
                      onClick={() => onOpenProfile(creator.profile.id)}
                      className="group shrink-0 w-60 bg-[#121212] border border-[#262626] hover:border-[#3a3a3a] rounded-2xl p-3 flex flex-col justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={creator.profile.avatarUrl}
                            alt={creator.profile.displayName}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#262626]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-neutral-200 transition-colors">
                              {creator.profile.displayName}
                            </h4>
                            <BadgeCheck className="w-3.5 h-3.5 text-[#0095f6] fill-[#0095f6]/20 shrink-0" />
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate">@{creator.profile.username}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[#181818] text-neutral-300 font-medium text-[9px] border border-[#262626]">
                            {creator.details.categories[0]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#262626] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-neutral-500 block">Starting rate</span>
                          <span className="text-xs font-bold text-white">
                            ₦{((creator.details.startingPriceCents || 5000) * 6).toLocaleString()}
                          </span>
                        </div>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#333333] text-white text-[10px] font-semibold transition-colors">
                          <span>Portfolio</span>
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
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
                      className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-white text-black shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
                <Sparkles className="w-10 h-10 text-neutral-500 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">No Posts in This Category</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
                  Try exploring other niches or check back soon for newly published creator videos.
                </p>
                <button
                  onClick={() => setSelectedNiche('all')}
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200"
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
