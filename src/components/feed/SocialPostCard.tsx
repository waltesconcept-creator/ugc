'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Post } from '@/lib/types';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  BadgeCheck,
  Sparkles,
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  Eye,
  Camera,
  ExternalLink,
  Ban,
  TrendingUp,
} from 'lucide-react';
import { CommentsDrawer } from './CommentsDrawer';
import { recommendationEngine } from '@/lib/recommendation-engine';

interface SocialPostCardProps {
  post: Post;
  isMuted: boolean;
  toggleMute: () => void;
  onOpenProfile: (creatorId: string) => void;
  onNotInterested?: (postId: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  post,
  isMuted,
  toggleMute,
  onOpenProfile,
  onNotInterested,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [saveCount, setSaveCount] = useState(post.savesCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);

  const lastTapRef = useRef(0);
  const isPhotoPost = post.mediaType === 'photo';

  // IntersectionObserver to auto-play when visible in standard feed
  useEffect(() => {
    if (isPhotoPost) return;
    const vid = videoRef.current;
    if (!vid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          vid.play().catch(() => {});
          setIsPlaying(true);
          recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'watch_start');
        } else {
          vid.pause();
          setIsPlaying(false);
        }
      },
      { threshold: [0.6] }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [post.id, post.creatorId, post.category, isPhotoPost]);

  const handleMediaClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap like
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'like');
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (isPhotoPost) return;

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

  const handleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      if (next) {
        recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'like');
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      setSaveCount((c) => (next ? c + 1 : c - 1));
      if (next) {
        recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'save');
      }
      return next;
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'share');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleNotInterested = () => {
    recommendationEngine.markNotInterested(post.id, post.creatorId);
    setShowMenu(false);
    if (onNotInterested) onNotInterested(post.id);
  };

  const handleBoostCategory = () => {
    recommendationEngine.boostCategory(post.category, 25);
    setShowMenu(false);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <article
      ref={cardRef}
      className="w-full max-w-lg mx-auto bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden mb-6 shadow-xl transition-all"
    >
      {/* ── 1. Creator Header ── */}
      <div className="flex items-center justify-between p-3.5 sm:p-4">
        <div
          onClick={() => {
            recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'profile_visit');
            onOpenProfile(post.creatorId);
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Avatar with orange ring */}
          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-orange-500 to-amber-400 group-hover:scale-105 transition-transform">
            <img
              src={post.creator.avatarUrl}
              alt={post.creator.displayName}
              className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                {post.creator.displayName}
              </span>
              <BadgeCheck className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>@{post.creator.username}</span>
              <span>·</span>
              <span className="text-orange-400/90 font-medium">{post.category}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isFollowing
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                : 'bg-orange-500/15 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-white'
            }`}
          >
            {isFollowing ? 'Following' : '+ Follow'}
          </button>

          {/* Overflow Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-10 w-52 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl py-1.5 z-40 text-xs">
              <button
                onClick={handleBoostCategory}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-300 hover:bg-neutral-900 hover:text-white text-left font-medium"
              >
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span>Show more from {post.category}</span>
              </button>
              <button
                onClick={handleNotInterested}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-300 hover:bg-neutral-900 hover:text-rose-400 text-left font-medium"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Not interested in this post</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-300 hover:bg-neutral-900 hover:text-white text-left font-medium border-t border-neutral-850"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy post link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Media Container (Supports Video & Photo formats) ── */}
      <div
        className="relative w-full aspect-[4/5] bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={handleMediaClick}
      >
        {isPhotoPost ? (
          <div className="relative w-full h-full">
            <img
              src={post.thumbnailUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] text-white">
              <Camera className="w-3 h-3 text-orange-400" />
              <span>Photo Showcase</span>
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
            className="w-full h-full object-cover"
          />
        )}

        {/* Double-tap heart animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 text-orange-500 fill-orange-500 animate-ping opacity-90 drop-shadow-2xl" />
          </div>
        )}

        {/* Play icon when paused */}
        {!isPhotoPost && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
              <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
            </div>
          </div>
        )}

        {/* Bottom Format Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-neutral-200 border border-white/10">
            {post.contentFormat}
          </span>
        </div>

        {/* Mute/unmute button */}
        {!isPhotoPost && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-300" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
          </button>
        )}
      </div>

      {/* ── 3. Engagement Bar ── */}
      <div className="p-3.5 sm:p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-white hover:text-orange-400 transition-colors group"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-125 ${
                  liked ? 'text-orange-500 fill-orange-500' : 'text-neutral-200'
                }`}
              />
              <span className="text-xs font-bold">{formatCount(likeCount)}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 text-neutral-200 hover:text-white transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-bold">{formatCount(post.sharesCount || 38)}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-neutral-200 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Bookmark / Save */}
          <button
            onClick={handleSave}
            className="text-neutral-200 hover:text-amber-400 transition-colors"
          >
            <Bookmark
              className={`w-6 h-6 ${
                saved ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'
              }`}
            />
          </button>
        </div>

        {/* View Count */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-2 font-medium">
          <Eye className="w-3.5 h-3.5 text-neutral-500" />
          <span>{formatCount(post.viewsCount)} views</span>
        </div>

        {/* Caption */}
        <div className="text-xs text-neutral-200 leading-relaxed mb-3">
          <span
            onClick={() => onOpenProfile(post.creatorId)}
            className="font-bold text-white mr-1.5 cursor-pointer hover:text-orange-400"
          >
            @{post.creator.username}
          </span>
          <span className={isExpandedCaption ? '' : 'line-clamp-2 inline'}>
            {post.caption}
          </span>
          {post.caption.length > 90 && !isExpandedCaption && (
            <button
              onClick={() => setIsExpandedCaption(true)}
              className="text-[11px] text-neutral-400 hover:text-white ml-1 font-semibold"
            >
              more
            </button>
          )}
        </div>

        {/* Creator Hire & Portfolio Pill (Connects Social Discovery directly to Creator Hiring) */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] text-neutral-300 font-semibold">Available for UGC Campaigns</span>
          </div>

          <button
            onClick={() => {
              recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'profile_visit');
              onOpenProfile(post.creatorId);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-500/20"
          >
            <span>View Rates</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Copied Feedback Toast */}
      {copiedToast && (
        <div className="text-center py-1 bg-orange-500/10 text-orange-400 text-xs font-semibold border-t border-orange-500/20">
          ✓ Updated recommendations preference
        </div>
      )}

      {/* Slide-Up Comments Drawer */}
      <CommentsDrawer
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postCaption={post.caption}
        creatorUsername={post.creator.username}
        currentRole="guest"
      />
    </article>
  );
};
export default SocialPostCard;
