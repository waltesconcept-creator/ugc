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
} from 'lucide-react';

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
  const lastTapRef = useRef(0);
  const heartTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Play / pause based on isActive
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Mute sync
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  // Progress bar
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTime = () => {
      if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100);
    };
    vid.addEventListener('timeupdate', onTime);
    return () => vid.removeEventListener('timeupdate', onTime);
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (!liked) {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    setShowHeart(true);
    if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
    heartTimeoutRef.current = setTimeout(() => setShowHeart(false), 900);
  }, [liked]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Single tap – toggle play/pause
    setTimeout(() => {
      if (lastTapRef.current === 0) return; // was double-tap
      const vid = videoRef.current;
      if (!vid) return;
      if (vid.paused) {
        vid.play().catch(() => {});
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
        setShowPause(true);
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => setShowPause(false), 1200);
      }
    }, 310);
  }, [handleDoubleTap]);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const toggleSave = () => {
    setSaved((prev) => {
      setSaveCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Video */}
      <video
        ref={videoRef}
        src={post.videoUrl}
        poster={post.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onClick={handleTap}
      />

      {/* Double-tap heart animation */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-ping opacity-80" />
        </div>
      )}

      {/* Pause icon */}
      {showPause && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Top overlay: category badge ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-medium text-white border border-white/10">
          {post.category}
        </span>
        {post.isSponsored && (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[11px] font-medium text-amber-400 border border-amber-500/30">
            Sponsored
          </span>
        )}
      </div>

      {/* ── Right action rail ── */}
      <div className="absolute right-3 bottom-44 sm:bottom-36 z-10 flex flex-col items-center gap-5">
        {/* Avatar */}
        <button
          onClick={() => onOpenProfile(post.creatorId)}
          className="relative"
        >
          <div className="w-11 h-11 rounded-full border-2 border-rose-500 overflow-hidden shadow-lg shadow-rose-500/20">
            <img
              src={post.creator.avatarUrl}
              alt={post.creator.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">+</span>
          </div>
        </button>

        {/* Like */}
        <button onClick={toggleLike} className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center">
          <Heart
            className={`w-7 h-7 transition-all duration-200 ${
              liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white drop-shadow-lg'
            }`}
          />
          <span className="text-[11px] text-white font-medium mt-0.5 drop-shadow">{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center">
          <MessageCircle className="w-6 h-6 text-white drop-shadow-lg" />
          <span className="text-[11px] text-white font-medium mt-0.5 drop-shadow">{formatCount(post.sharesCount)}</span>
        </button>

        {/* Save */}
        <button onClick={toggleSave} className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center">
          <Bookmark
            className={`w-6 h-6 transition-all duration-200 ${
              saved ? 'text-amber-400 fill-amber-400' : 'text-white drop-shadow-lg'
            }`}
          />
          <span className="text-[11px] text-white font-medium mt-0.5 drop-shadow">{formatCount(saveCount)}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center min-w-[44px] min-h-[44px] justify-center">
          <Share2 className="w-6 h-6 text-white drop-shadow-lg" />
          <span className="text-[11px] text-white font-medium mt-0.5 drop-shadow">Share</span>
        </button>

        {/* Mute/unmute */}
        <button onClick={toggleMute} className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm min-w-[44px] min-h-[44px]">
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* ── Bottom overlay: creator info ── */}
      <div className="absolute bottom-0 left-0 right-16 z-10 p-4 pb-5">
        {/* Creator handle */}
        <button
          onClick={() => onOpenProfile(post.creatorId)}
          className="flex items-center gap-1.5 mb-2"
        >
          <span className="text-sm font-bold text-white drop-shadow-lg">
            @{post.creator.username}
          </span>
          {post.creator.isVerified && (
            <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
          )}
        </button>

        {/* Caption */}
        <p className="text-[13px] text-white/90 leading-snug line-clamp-2 mb-3 drop-shadow">
          {post.caption}
        </p>

        {/* View portfolio pill */}
        <button
          onClick={() => onOpenProfile(post.creatorId)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/10 hover:bg-white/25 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white">View Portfolio &amp; Rates</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export { VideoCard };
export default VideoCard;
