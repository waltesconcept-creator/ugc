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
  Maximize2,
  X,
  ShoppingBag,
} from 'lucide-react';
import { CommentsDrawer } from './CommentsDrawer';
import { ProductDrawer } from '../commerce/ProductDrawer';
import { recommendationEngine } from '@/lib/recommendation-engine';

interface SocialPostCardProps {
  post: Post;
  isMuted: boolean;
  toggleMute: () => void;
  onOpenProfile: (creatorId: string) => void;
  onNotInterested?: (postId: string) => void;
  onExpandPost?: (post: Post) => void;
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
  onExpandPost,
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
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);

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

    // Single tap on media opens immersive fullscreen viewer
    if (onExpandPost) {
      onExpandPost(post);
      return;
    }

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
      className="w-full max-w-lg mx-auto bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden mb-6 transition-colors"
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
          {/* Avatar with subtle ring */}
          <div className="relative w-10 h-10 rounded-full p-[1px] border border-[#333333] transition-transform">
            <img
              src={post.creator.avatarUrl}
              alt={post.creator.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors">
                {post.creator.displayName}
              </span>
              <BadgeCheck className="w-3.5 h-3.5 text-[#0095f6] fill-[#0095f6]/20" />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>@{post.creator.username}</span>
              <span>·</span>
              <span className="text-neutral-400 font-medium">{post.category}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              isFollowing
                ? 'bg-[#262626] text-white border border-[#333333]'
                : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          {/* Overflow Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Menu Mobile Bottom Sheet Drawer */}
          {showMenu && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              {/* Dim Backdrop */}
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMenu(false)}
              />
              {/* Bottom Sheet Drawer */}
              <div className="relative w-full max-w-md bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-4 pb-8 z-10 shadow-2xl animate-fade-in">
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />

                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Post Options</span>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleBoostCategory}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[#0095f6] shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Show more from {post.category}</p>
                      <p className="text-[11px] text-neutral-400">Tune your feed recommendations</p>
                    </div>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-700/60 flex items-center justify-center text-neutral-300 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Share / Copy Post Link</p>
                      <p className="text-[11px] text-neutral-400">Copy URL to clipboard</p>
                    </div>
                  </button>

                  <button
                    onClick={handleNotInterested}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <Ban className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-rose-400">Not interested in this post</p>
                      <p className="text-[11px] text-rose-300/70">Hide similar content from your feed</p>
                    </div>
                  </button>
                </div>
              </div>
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
              <Camera className="w-3 h-3 text-white" />
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
            <Heart className="w-24 h-24 text-[#ed4956] fill-[#ed4956] animate-ping opacity-90 drop-shadow-2xl" />
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

        {/* Top-Right: Fullscreen / Immersive Expand Pill */}
        {onExpandPost && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandPost(post);
            }}
            className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 text-[10px] font-semibold hover:bg-black/80 transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-neutral-300" />
            <span>Full View</span>
          </button>
        )}

        {/* Bottom Format / Shoppable Product Tag Badge */}
        {post.taggedProduct ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProductDrawerOpen(true);
            }}
            className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg active:scale-95 transition-all group"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-neutral-300 group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[120px] text-[11px]">{post.taggedProduct.title}</span>
            <span className="text-white font-bold text-[11px]">₦{post.taggedProduct.priceNaira.toLocaleString()}</span>
          </button>
        ) : (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-neutral-200 border border-white/10">
              {post.contentFormat}
            </span>
          </div>
        )}

        {/* Mute/unmute button */}
        {!isPhotoPost && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-300" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
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
              className="flex items-center gap-1.5 text-white transition-colors group"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-125 ${
                  liked ? 'text-[#ed4956] fill-[#ed4956]' : 'text-neutral-200'
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
            className="text-neutral-200 hover:text-white transition-colors"
          >
            <Bookmark
              className={`w-6 h-6 ${
                saved ? 'text-white fill-white' : 'text-neutral-200'
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
            className="font-bold text-white mr-1.5 cursor-pointer hover:text-[#0095f6]"
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

        {/* Shoppable Product Card (Instagram Shop Style) */}
        {post.taggedProduct && (
          <div
            onClick={() => setProductDrawerOpen(true)}
            className="mt-2.5 mb-3 p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-[#333333] transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={post.taggedProduct.imageUrl}
                alt={post.taggedProduct.title}
                className="w-10 h-10 rounded-xl object-cover border border-neutral-800 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#0095f6] transition-colors">
                  {post.taggedProduct.title}
                </p>
                <p className="text-[11px] text-neutral-400">
                  ₦{post.taggedProduct.priceNaira.toLocaleString()} &bull;{' '}
                  <span className="text-emerald-400 font-semibold">
                    Earn {post.taggedProduct.commissionPercent || 15}% (₦{((post.taggedProduct.priceNaira * (post.taggedProduct.commissionPercent || 15)) / 100).toLocaleString()})
                  </span>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#0095f6] hover:bg-[#1877f2] text-white text-[11px] font-semibold shrink-0 shadow-sm transition-colors">
              Shop / Affiliate
            </span>
          </div>
        )}

        {/* Creator Hire & Portfolio Pill (Connects Social Discovery directly to Creator Hiring) */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0095f6]" />
            <span className="text-[11px] text-neutral-300 font-semibold">Available for UGC Campaigns</span>
          </div>

          <button
            onClick={() => {
              recommendationEngine.recordSignal(post.id, post.creatorId, post.category, 'profile_visit');
              onOpenProfile(post.creatorId);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#262626] text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <span>View Rates</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Copied Feedback Toast */}
      {copiedToast && (
        <div className="text-center py-1 bg-[#181818] text-[#0095f6] text-xs font-semibold border-t border-[#262626]">
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

      {/* Shoppable Product Drawer */}
      {post.taggedProduct && (
        <ProductDrawer
          product={post.taggedProduct}
          creatorName={post.creator.displayName || post.creator.username}
          isOpen={productDrawerOpen}
          onClose={() => setProductDrawerOpen(false)}
        />
      )}
    </article>
  );
};
export default SocialPostCard;
