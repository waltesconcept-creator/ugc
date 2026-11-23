'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import {
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  MessageCircle,
  ChevronRight,
  BadgeCheck,
  Eye,
  Sparkles,
  Camera,
  ShoppingBag,
} from 'lucide-react';
import { CommentsDrawer } from './CommentsDrawer';
import { ProductDrawer } from '../commerce/ProductDrawer';

interface VideoCardProps {
  post: Post;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onOpenProfile: (creatorId: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const VideoCard: React.FC<VideoCardProps> = ({
  post,
  isActive,
  isMuted,
  toggleMute,
  onOpenProfile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [saveCount, setSaveCount] = useState(post.savesCount);
  const [showHeart, setShowHeart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const lastTapRef = useRef(0);
  const heartTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isPhotoPost = post.mediaType === 'photo';

  // Play / pause based on isActive
  useEffect(() => {
    if (isPhotoPost) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      vid.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, isPhotoPost]);

  // Update progress bar
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  }, []);

  // Toggle play/pause on single tap
  const handleVideoClick = () => {
    if (isPhotoPost) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Like
      triggerDoubleTapLike();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Single tap toggle
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
      setShowPause(false);
    } else {
      vid.pause();
      setIsPlaying(false);
      setShowPause(true);
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => setShowPause(false), 800);
    }
  };

  const triggerDoubleTapLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    setShowHeart(true);
    clearTimeout(heartTimeoutRef.current);
    heartTimeoutRef.current = setTimeout(() => setShowHeart(false), 800);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((prev) => {
      setSaveCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <>
      <div
        className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={handleVideoClick}
      >
        {/* Media: Video or High-Res Photo Post */}
        {isPhotoPost ? (
          <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
            <img
              src={post.thumbnailUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
            {/* Tag badge for photo */}
            <div className="absolute top-16 left-4 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] text-white">
              <Camera className="w-3 h-3 text-orange-400" />
              <span>UGC Photo Showcase</span>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={post.videoUrl}
            poster={post.thumbnailUrl}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          />
        )}

        {/* Ambient top and bottom dark gradient shadows */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Heart animation on double-tap (Red Heart) */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 text-[#ed4956] fill-[#ed4956] animate-ping opacity-90 drop-shadow-2xl" />
          </div>
        )}

        {/* Pause icon */}
        {showPause && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Top category pill */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
            {post.category}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-900/70 backdrop-blur-md text-[10px] font-medium text-neutral-300 border border-neutral-700/60 hidden sm:inline-block">
            {post.contentFormat}
          </span>
        </div>

        {/* ── Right action rail ── */}
        <div className="absolute right-3 top-20 sm:top-24 z-20 flex flex-col items-center gap-4">
          {/* Creator Avatar with Follow button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(post.creatorId);
            }}
            className="relative group min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <div className="w-11 h-11 rounded-full border-2 border-white/80 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              <img
                src={post.creator.avatarUrl}
                alt={post.creator.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#0095f6] text-white flex items-center justify-center shadow-md">
              <span className="text-[11px] font-bold leading-none">+</span>
            </div>
          </button>

          {/* Like */}
          <button
            onClick={toggleLike}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              liked ? 'bg-[#ed4956]/20 text-[#ed4956] scale-110' : 'bg-black/50 text-white hover:bg-black/70'
            }`}>
              <Heart
                className={`w-5 h-5 transition-transform duration-200 ${
                  liked ? 'text-[#ed4956] fill-[#ed4956]' : 'text-white'
                }`}
              />
            </div>
            <span className="text-[11px] text-white font-bold mt-1 drop-shadow-md">
              {formatCount(likeCount)}
            </span>
          </button>

          {/* Comment Bubble */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCommentsOpen(true);
            }}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] text-white font-bold mt-1 drop-shadow-md">
              {formatCount(post.sharesCount || 42)}
            </span>
          </button>

          {/* Save */}
          <button
            onClick={toggleSave}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              saved ? 'bg-white/20 text-white scale-110' : 'bg-black/50 text-white hover:bg-black/70'
            }`}>
              <Bookmark
                className={`w-5 h-5 transition-transform duration-200 ${
                  saved ? 'text-white fill-white' : 'text-white'
                }`}
              />
            </div>
            <span className="text-[11px] text-white font-bold mt-1 drop-shadow-md">
              {formatCount(saveCount)}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] text-white font-semibold mt-1 drop-shadow-md">Share</span>
          </button>

          {/* Mute/unmute */}
          {!isPhotoPost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-300" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
            </button>
          )}
        </div>

        {/* Share Copied Toast */}
        {copiedToast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-neutral-900/90 text-white px-4 py-2 rounded-xl border border-neutral-700 text-xs font-semibold backdrop-blur-md shadow-2xl">
            ✓ Link copied to clipboard
          </div>
        )}

        {/* ── Bottom overlay: creator info & rates CTA ── */}
        <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-6 text-left">
          {/* ── Shoppable Tagged Product Badge ── */}
          {post.taggedProduct && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProductDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121212]/95 hover:bg-[#1c1c1c] border border-[#262626] text-white backdrop-blur-md shadow-lg mb-2 active:scale-95 transition-all text-xs font-semibold group max-w-xs"
              >
                <div className="w-4 h-4 rounded-full bg-[#262626] flex items-center justify-center text-neutral-300 shrink-0">
                  <ShoppingBag className="w-2.5 h-2.5" />
                </div>
                <span className="truncate max-w-[120px] text-white font-medium text-[11px]">
                  {post.taggedProduct.title}
                </span>
                <span className="text-white font-bold text-[11px] shrink-0">
                  ₦{post.taggedProduct.priceNaira.toLocaleString()}
                </span>
                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-white shrink-0" />
              </button>
            </div>
          )}

          {/* Creator handle */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(post.creatorId);
            }}
            className="inline-flex items-center gap-1.5 cursor-pointer group mb-1.5"
          >
            <span className="font-bold text-sm sm:text-base text-white group-hover:text-neutral-200 transition-colors drop-shadow">
              @{post.creator.username}
            </span>
            <BadgeCheck className="w-4 h-4 text-[#0095f6] fill-[#0095f6]/20" />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#181818] text-neutral-300 font-semibold border border-[#262626]">
              Creator
            </span>
          </div>

          {/* Caption */}
          <p className="text-xs sm:text-sm text-white/95 line-clamp-2 leading-relaxed mb-3 drop-shadow font-normal max-w-md">
            {post.caption}
          </p>

          {/* Action Link: View Creator Portfolio & Rates */}
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenProfile(post.creatorId);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#262626] hover:bg-[#333333] border border-[#333333] px-3.5 py-1.5 rounded-lg transition-colors group shadow-lg"
            >
              <span>View Creator Portfolio & Rates</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-neutral-300" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!isPhotoPost && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-20">
            <div
              className="h-full bg-white transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Slide-Up Comments Drawer */}
      <CommentsDrawer
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postCaption={post.caption}
        creatorUsername={post.creator.username}
        currentRole="guest"
      />

      {/* Shoppable Product Bottom Sheet Drawer */}
      {post.taggedProduct && (
        <ProductDrawer
          product={post.taggedProduct}
          isOpen={productDrawerOpen}
          onClose={() => setProductDrawerOpen(false)}
          creatorId={post.creatorId}
          creatorName={post.creator.displayName || post.creator.username}
        />
      )}
    </>
  );
};

export { VideoCard };
export default VideoCard;
