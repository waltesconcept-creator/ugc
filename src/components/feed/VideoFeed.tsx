'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/types';
import VideoCard from './VideoCard';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VideoFeedProps {
  posts: Post[];
  onOpenProfile: (creatorId: string) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ posts, onOpenProfile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const panelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  // IntersectionObserver to detect active panel
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Observe panel elements
  const setPanelRef = useCallback(
    (idx: number, el: HTMLDivElement | null) => {
      if (el) {
        panelRefs.current.set(idx, el);
        observerRef.current?.observe(el);
      } else {
        const existing = panelRefs.current.get(idx);
        if (existing) observerRef.current?.unobserve(existing);
        panelRefs.current.delete(idx);
      }
    },
    []
  );

  // Desktop arrow navigation
  const goTo = useCallback(
    (dir: 'prev' | 'next') => {
      const nextIdx = dir === 'prev' ? Math.max(0, activeIndex - 1) : Math.min(posts.length - 1, activeIndex + 1);
      const el = panelRefs.current.get(nextIdx);
      el?.scrollIntoView({ behavior: 'smooth' });
    },
    [activeIndex, posts.length]
  );

  // Determine which posts to render (current ± 1 for performance)
  const renderWindow = 1;
  const shouldRender = (idx: number) =>
    Math.abs(idx - activeIndex) <= renderWindow;

  return (
    <div className="relative w-full h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-3.5rem)]">
      {/* ── Desktop: phone frame wrapper ── */}
      <div className="hidden lg:flex items-center justify-center w-full h-full bg-neutral-950">
        {/* Ambient blur background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {posts[activeIndex] && (
            <img
              src={posts[activeIndex].thumbnailUrl}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110 opacity-20"
            />
          )}
        </div>

        {/* Side arrows */}
        <button
          onClick={() => goTo('prev')}
          disabled={activeIndex === 0}
          className="absolute left-8 z-20 w-12 h-12 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => goTo('next')}
          disabled={activeIndex === posts.length - 1}
          className="absolute right-8 z-20 w-12 h-12 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>

        {/* Phone frame */}
        <div className="relative w-[375px] h-[calc(100%-2rem)] max-h-[820px] rounded-[2.5rem] border-[3px] border-neutral-700 bg-black overflow-hidden shadow-2xl shadow-black/60 z-10">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30" />
          {/* Inner scroll */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {posts.map((post, idx) => (
              <div
                key={post.id}
                ref={(el) => setPanelRef(idx, el)}
                data-index={idx}
                className="w-full h-full snap-start snap-always shrink-0"
              >
                {shouldRender(idx) ? (
                  <VideoCard
                    post={post}
                    isActive={idx === activeIndex}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    onOpenProfile={onOpenProfile}
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover opacity-40"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Bottom home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-white/30 z-30" />
        </div>

        {/* Video counter */}
        <div className="absolute bottom-6 right-8 z-20 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-xs text-neutral-400">
          {activeIndex + 1} / {posts.length}
        </div>
      </div>

      {/* ── Mobile: full-screen scroll-snap ── */}
      <div
        ref={containerRef}
        className="lg:hidden w-full h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {posts.map((post, idx) => (
          <div
            key={post.id}
            ref={(el) => setPanelRef(idx, el)}
            data-index={idx}
            className="w-full h-[calc(100dvh-3.5rem-4rem)] snap-start snap-always shrink-0"
          >
            {shouldRender(idx) ? (
              <VideoCard
                post={post}
                isActive={idx === activeIndex}
                isMuted={isMuted}
                toggleMute={toggleMute}
                onOpenProfile={onOpenProfile}
              />
            ) : (
              <div className="w-full h-full bg-neutral-950" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { VideoFeed };
export default VideoFeed;
