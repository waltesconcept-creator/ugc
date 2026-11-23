'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BadgeCheck,
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Camera,
} from 'lucide-react';
import { CommentsDrawer } from './CommentsDrawer';

interface ImmersiveMediaViewerProps {
  isOpen: boolean;
  initialPostIndex: number;
  posts: Post[];
  onClose: () => void;
  onOpenProfile: (creatorId: string) => void;
}

export const ImmersiveMediaViewer: React.FC<ImmersiveMediaViewerProps> = ({
  isOpen,
  initialPostIndex,
  posts,
  onClose,
  onOpenProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  // Sync index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPostIndex);
    }
  }, [isOpen, initialPostIndex]);

  const currentPost = posts[currentIndex] || posts[0];
  const isPhoto = currentPost?.mediaType === 'photo';

  // Sync post state when index changes
  useEffect(() => {
    if (!currentPost) return;
    setLiked(currentPost.isLiked ?? false);
    setLikeCount(currentPost.likesCount);
    setSaved(currentPost.isSaved ?? false);
    setSaveCount(currentPost.savesCount);
    setIsCaptionExpanded(false);
    setIsPlaying(true);
  }, [currentPost]);

  // Handle play/pause on current post change
  useEffect(() => {
    if (!isOpen || isPhoto) return;
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentIndex, isOpen, isPhoto]);

  // Handle next / prev navigation (Infinite loop for continuous feed flow)
  const goNext = useCallback(() => {
    if (posts.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }
  }, [posts.length]);

  const goPrev = useCallback(() => {
    if (posts.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    }
  }, [posts.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowUp') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev]);

  // Touch Swipe navigation (Up / Down)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    if (deltaY > 50) {
      // Swiped UP -> Next video
      goNext();
    } else if (deltaY < -50) {
      // Swiped DOWN -> Prev video
      goPrev();
    }
  };

  const togglePlayPause = () => {
    if (isPhoto) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap heart
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    togglePlayPause();
  };

  const handleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  const handleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      setSaveCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${currentPost.creator.displayName} on KRE8TOR`,
        text: currentPost.caption,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  if (!isOpen || !currentPost) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between select-none overflow-hidden animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Header Controls ── */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0095f6] animate-pulse" />
          <span>Watch Feed</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-neutral-300" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* ── Central Media Area (Uncropped Full Screen View) ── */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center bg-black cursor-pointer"
        onClick={handleMediaTap}
      >
        {isPhoto ? (
          <img
            src={currentPost.thumbnailUrl}
            alt={currentPost.caption}
            className="w-full h-full object-contain max-h-[92vh]"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentPost.videoUrl}
            poster={currentPost.thumbnailUrl}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
            className="w-full h-full object-contain max-h-[92vh]"
          />
        )}

        {/* Double tap heart burst */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-28 h-28 text-[#ed4956] fill-[#ed4956] animate-ping opacity-90 drop-shadow-2xl" />
          </div>
        )}

        {/* Play/Pause state icon */}
        {!isPhoto && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop Prev / Next Floating Arrows ── */}
      <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
        <button
          onClick={goPrev}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#0095f6] hover:border-[#0095f6] transition-colors"
          title="Previous post (Up)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#0095f6] hover:border-[#0095f6] transition-colors"
          title="Next post (Down)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* ── Overlay: Creator Information & Caption (Bottom Left) ── */}
      <div className="absolute bottom-4 left-4 right-16 z-30 pointer-events-none">
        <div className="pointer-events-auto max-w-lg space-y-2">
          {/* Creator Pill */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onOpenProfile(currentPost.creatorId);
            }}
            className="inline-flex items-center gap-2.5 p-1 pr-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#0095f6] transition-colors cursor-pointer group"
          >
            <img
              src={currentPost.creator.avatarUrl}
              alt={currentPost.creator.displayName}
              className="w-8 h-8 rounded-full object-cover border border-[#262626]"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[#0095f6] transition-colors">
                {currentPost.creator.displayName}
              </span>
              <BadgeCheck className="w-3.5 h-3.5 text-[#0095f6] fill-[#0095f6]/20" />
              <span className="text-[11px] text-neutral-400">@{currentPost.creator.username}</span>
            </div>
          </div>

          {/* Caption with expand toggle */}
          <div className="bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/5">
            <p className={`text-xs text-neutral-200 leading-relaxed ${isCaptionExpanded ? '' : 'line-clamp-2'}`}>
              {currentPost.caption}
            </p>
            {currentPost.caption.length > 70 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded(!isCaptionExpanded);
                }}
                className="text-[10px] text-[#0095f6] font-semibold hover:underline mt-1 block"
              >
                {isCaptionExpanded ? 'Show less' : '...more'}
              </button>
            )}
          </div>

          {/* Format and category tags */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-neutral-300 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10">
              {currentPost.category}
            </span>
            <span className="text-[10px] font-semibold text-white px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#262626]">
              {currentPost.contentFormat}
            </span>
          </div>
        </div>
      </div>

      {/* ── Overlay: Vertical Action Rail (Bottom Right) ── */}
      <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-4">
        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className="flex flex-col items-center gap-1 text-white group"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
            liked
              ? 'bg-[#ed4956]/20 border-[#ed4956]/40 text-[#ed4956] scale-110'
              : 'bg-black/50 border-white/10 text-white hover:text-[#ed4956]'
          }`}>
            <Heart className={`w-5 h-5 ${liked ? 'fill-[#ed4956]' : ''}`} />
          </div>
          <span className="text-[10px] font-bold drop-shadow">{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCommentsOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-white group"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-white transition-colors">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold drop-shadow">{currentPost.commentsCount}</span>
        </button>

        {/* Save / Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          className="flex flex-col items-center gap-1 text-white group"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
            saved
              ? 'bg-white/20 border-white/40 text-white'
              : 'bg-black/50 border-white/10 text-white hover:text-white'
          }`}>
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[10px] font-bold drop-shadow">{saveCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center gap-1 text-white group"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold drop-shadow">Share</span>
        </button>
      </div>

      {/* Copy link toast feedback */}
      {copiedToast && (
        <div className="absolute top-20 inset-x-0 mx-auto w-max px-4 py-2 rounded-full bg-[#0095f6] text-white text-xs font-semibold shadow-xl animate-fade-in z-50">
          ✓ Link copied to clipboard!
        </div>
      )}

      {/* Comments Drawer */}
      <CommentsDrawer
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={currentPost.id}
      />
    </div>
  );
};
export default ImmersiveMediaViewer;
