'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Post, Story } from '@/lib/types';
import { StoryTray } from '@/components/stories/StoryTray';
import { SocialPostCard } from './SocialPostCard';
import { VideoFeed } from './VideoFeed';
import { ImmersiveMediaViewer } from './ImmersiveMediaViewer';
import { recommendationEngine } from '@/lib/recommendation-engine';
import { Sparkles, Users, Flame, Clapperboard, LayoutList } from 'lucide-react';

interface HomeFeedViewProps {
  posts: Post[];
  stories: Story[];
  onOpenProfile: (creatorId: string) => void;
  onStartChat: (creatorId: string) => void;
  onCreateStory: () => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  posts,
  stories,
  onOpenProfile,
  onStartChat,
  onCreateStory,
}) => {
  // Feed view mode: 'social' (Instagram-style standard feed) vs 'reels' (TikTok-style 9:16 immersive)
  const [viewMode, setViewMode] = useState<'social' | 'reels'>('social');

  // Discovery section: 'for_you' (recommendation engine ranked) vs 'following' (chronological)
  const [feedSection, setFeedSection] = useState<'for_you' | 'following'>('for_you');

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
  const displayedPosts = useMemo(() => {
    const visible = posts.filter((p) => !hiddenPostIds.has(p.id));

    if (feedSection === 'following') {
      return recommendationEngine.getFollowingFeed(visible, followingIds);
    }
    // 'for_you': personalized recommendation engine ranking
    return recommendationEngine.rankForYouFeed(visible);
  }, [posts, hiddenPostIds, feedSection, followingIds]);

  const handleNotInterested = (postId: string) => {
    setHiddenPostIds((prev) => new Set([...prev, postId]));
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* ── Top Discovery Header & Mode Switcher Bar ── */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 px-3 sm:px-6 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* For You / Following Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 border border-neutral-800">
            <button
              onClick={() => setFeedSection('for_you')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                feedSection === 'for_you'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reels</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MODE 1: Standard Social Feed (Instagram-style where Stories scroll away naturally!) ── */}
      {viewMode === 'social' && (
        <div className="flex-1 w-full overflow-y-auto pb-20 lg:pb-10">
          {/* 1. Curved Box Stories Tray (Embedded in scroll flow so it moves out of view naturally!) */}
          <StoryTray
            stories={stories}
            onOpenProfile={onOpenProfile}
            onStartChat={onStartChat}
            onCreateStory={onCreateStory}
          />

          {/* 2. Feed Stream Container */}
          <div className="max-w-xl mx-auto px-3 sm:px-4 pt-4">
            {displayedPosts.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800 p-8 my-6">
                <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-white mb-1">No Posts Found</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
                  Follow more creators or explore topics to discover fresh UGC content.
                </p>
                <button
                  onClick={() => setFeedSection('for_you')}
                  className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold"
                >
                  Explore For You
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
