'use client';

import React, { useState, useMemo } from 'react';
import type { Post, ServicePackage, Profile, CreatorDetails, Review, Product } from '@/lib/types';
import { MOCK_CREATORS, MOCK_POSTS, MOCK_PRODUCTS } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import { EditProfileModal } from './EditProfileModal';
import { ShareProfileModal } from './ShareProfileModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import { CreatorStudioModal } from '../studio/CreatorStudioModal';
import { BusinessStudioModal } from '../studio/BusinessStudioModal';
import { ProductDrawer } from '../commerce/ProductDrawer';
import { AccountSwitcherDrawer } from '../auth/AccountSwitcherDrawer';
import {
  BadgeCheck,
  MapPin,
  Globe,
  Star,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  Play,
  Eye,
  Camera,
  Video,
  ExternalLink,
  ChevronRight,
  UserPlus,
  ShoppingBag,
  ArrowLeft,
  Bookmark,
  Share2,
  DollarSign,
  TrendingUp,
  Edit3,
  Upload,
  Maximize2,
  Plus,
  X,
  ShieldCheck,
  Briefcase,
  Store,
  Grid3X3,
  Film,
  Settings,
  Menu,
} from 'lucide-react';

interface CreatorProfileViewProps {
  creatorId?: string;
  posts?: Post[];
  onSelectPost: (post: Post) => void;
  onBookService: (service: ServicePackage, creatorId: string) => void;
  onStartChat: (creatorId: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-3.5 h-3.5' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size} ${s <= Math.round(rating) ? 'text-white fill-white' : 'text-neutral-700'}`}
      />
    ))}
  </div>
);

const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({
  creatorId,
  posts,
  onSelectPost,
  onBookService,
  onStartChat,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reels' | 'services' | 'reviews'>('portfolio');
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<Product | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  const [isCreatorStudioOpen, setIsCreatorStudioOpen] = useState(false);
  const [isBusinessStudioOpen, setIsBusinessStudioOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewLinkCopied, setReviewLinkCopied] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [dynamicReviews, setDynamicReviews] = useState<Review[]>([]);

  const creatorData = useMemo(() => {
    const id = creatorId || currentUser?.id || MOCK_CREATORS[0]?.profile.id || '';
    const found = MOCK_CREATORS.find((c) => c.profile.id === id);
    if (found) return found;

    // Check if it's the currently authenticated real user
    if (currentUser && (currentUser.id === id || currentUser.profile?.id === id)) {
      const p = currentUser.profile || {
        id: currentUser.id,
        role: currentUser.role || 'creator',
        username: 'creator',
        displayName: 'Creator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
        bio: 'UGC Creator on Creator',
        location: currentUser.country || '',
        country: currentUser.country || '',
        website: '',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      const startingPriceCents = currentUser.details?.startingPriceCents || 5000;
      const d: CreatorDetails = currentUser.details || {
        creatorId: p.id,
        categories: currentUser.categories || ['Lifestyle'],
        contentFormats: ['UGC Video', 'Product Review', 'Unboxing'],
        languages: ['English'],
        ratingAvg: 0,
        ratingCount: 0,
        completedProjectsCount: 0,
        onTimeDeliveryRate: 100,
        repeatBookingRate: 0,
        qualityScore: 0,
        communicationScore: 0,
        timelinessScore: 0,
        verifiedTransactionsCount: 0,
        isAvailable: true,
        startingPriceCents,
        totalSocialViews: 0,
      };
      const s: ServicePackage[] = (currentUser.services && currentUser.services.length > 0)
        ? currentUser.services
        : [
            {
              id: `srv-${p.id}-1`,
              creatorId: p.id,
              title: 'Authentic Short-Form UGC Video',
              description:
                'High-converting organic vertical UGC video tailored for feeds, reels, and brand campaigns. Includes 1 revision & fast turnaround.',
              priceCents: startingPriceCents,
              currency: 'USD',
              deliveryDays: 3,
              revisionsAllowed: 1,
              formatTag: 'UGC Video',
              isActive: true,
            },
          ];
      return { profile: p, details: d, services: s, reviews: [] };
    }

    return MOCK_CREATORS[0];
  }, [creatorId, currentUser]);

  const allPosts = posts || MOCK_POSTS;
  const creatorPosts = useMemo(() => {
    if (!creatorData) return [];
    return allPosts.filter((p) => p.creatorId === creatorData.profile.id);
  }, [creatorData, allPosts]);

  if (!creatorData) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Creator not found</p>
      </div>
    );
  }

  const { profile, details, services, reviews } = creatorData;

  // Fetch live reviews for creator
  React.useEffect(() => {
    if (!creatorData?.profile.id) return;
    fetch(`/api/reviews?creatorId=${creatorData.profile.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews)) {
          setDynamicReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, [creatorData?.profile.id]);

  const allReviewsList = useMemo(() => {
    const base = reviews || [];
    const combined = [...dynamicReviews, ...base];
    const seen = new Set();
    return combined.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [reviews, dynamicReviews]);

  const handleCopyReviewLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/?creator=${profile.id}&review=true`;
    navigator.clipboard?.writeText(url);
    setReviewLinkCopied(true);
    setTimeout(() => setReviewLinkCopied(false), 2500);
  };

  const TABS = [
    { key: 'portfolio' as const, label: 'Grid', icon: Grid3X3, count: creatorPosts.length },
    { key: 'reels' as const, label: 'Reels', icon: Film, count: creatorPosts.length },
    { key: 'services' as const, label: 'Shop & Rates', icon: ShoppingBag, count: services.length },
    { key: 'reviews' as const, label: 'Reviews', icon: Star, count: allReviewsList.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* ── Instagram-Style Header ── */}
        <div className="px-4 sm:px-6 pt-5">
          {/* Avatar + 3 Stats Columns */}
          <div className="flex items-center justify-between gap-5 sm:gap-8">
            {/* Story Ring Avatar */}
            <div
              onClick={() => setIsAvatarViewerOpen(true)}
              className="relative p-0.5 rounded-full border-2 border-[#262626] shrink-0 cursor-pointer active:scale-95 transition-transform"
              title="View profile photo"
            >
              <div className="p-0.5 bg-black rounded-full">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* 3 Stats Counters (Instagram Style) */}
            <div className="flex-1 flex items-center justify-around text-center">
              <div>
                <p className="text-base sm:text-lg font-black text-white">{creatorPosts.length}</p>
                <p className="text-[11px] text-neutral-400">Posts</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-white">
                  {formatCount(details.instagramFollowers || 15200)}
                </p>
                <p className="text-[11px] text-neutral-400">Followers</p>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1">
                  <span>{details.completedProjectsCount || 51}</span>
                  <span className="text-neutral-300 text-xs">★{details.ratingAvg || 4.9}</span>
                </p>
                <p className="text-[11px] text-neutral-400">UGC Jobs</p>
              </div>
            </div>
          </div>

          {/* Bio & Details Block (Instagram Style) */}
          <div className="mt-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-white">{profile.displayName}</h1>
              {profile.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20 shrink-0" />}
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              {details.categories.join(' • ')} Creator
            </p>
            <p className="text-xs text-white/95 leading-relaxed whitespace-pre-line pt-0.5">
              {profile.bio}
            </p>

            {/* Starting rate badge & availability */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#e0e0e0] font-semibold bg-[#181818] border border-[#262626] px-2.5 py-0.5 rounded-full text-[11px]">
                UGC Videos from ₦{((details.startingPriceCents || 5000) * 6).toLocaleString()}
              </span>
              {details.isAvailable && (
                <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available for Brand Deals
                </span>
              )}
            </div>

            {/* Clickable Social Media Links & Portfolio Handles */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {details.instagramHandle && (
                <a
                  href={`https://instagram.com/${details.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181818] border border-[#262626] text-[11px] text-neutral-300 hover:text-white hover:border-[#3a3a3a] transition-colors"
                >
                  <Camera className="w-3 h-3 text-neutral-400" />
                  <span>@{details.instagramHandle.replace('@', '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-500" />
                </a>
              )}
              {details.tiktokHandle && (
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181818] border border-[#262626] text-[11px] text-neutral-300"
                >
                  <Play className="w-3 h-3 text-neutral-400" />
                  <span>@{details.tiktokHandle.replace('@', '')}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181818] border border-[#262626] text-[11px] text-neutral-300 hover:text-white hover:border-[#3a3a3a] transition-colors"
                >
                  <Globe className="w-3 h-3 text-neutral-400" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-500" />
                </a>
              )}
            </div>
          </div>

          {/* Instagram-Style Professional Dashboard Card */}
          <div
            onClick={() => setIsCreatorStudioOpen(true)}
            className="mt-3.5 p-3 rounded-2xl bg-[#121212] border border-[#262626] hover:border-[#3a3a3a] transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
          >
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Professional Dashboard</p>
              <p className="text-xs font-bold text-white mt-0.5">
                ₦295,000 available earnings &bull; 86 affiliate sales &bull; 3 active jobs
              </p>
              <p className="text-[10px] text-[#0095f6] font-semibold mt-0.5 flex items-center gap-1">
                <span>Open Creator Studio, Wallet & Bookings &rarr;</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] text-[#0095f6] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          {/* Action Buttons Row (Instagram Style) */}
          <div className="flex gap-2 mt-3">
            {currentUser && (currentUser.id === profile.id || currentUser.profile?.id === profile.id) ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#333333] transition-colors"
                >
                  Edit Profile & Rates
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#333333] transition-colors"
                >
                  Share Profile
                </button>
                <button
                  onClick={() => setIsBusinessStudioOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-emerald-400 text-xs font-semibold border border-[#333333] transition-colors flex items-center gap-1"
                  title="Brand Studio (Products & Campaigns)"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Brand</span>
                </button>
                <button
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="px-3 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-neutral-300 hover:text-white text-xs font-semibold border border-[#333333] transition-colors flex items-center justify-center"
                  title="Account Menu, Role Switcher & Sign Out"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-[#262626] text-white border border-[#333333]'
                      : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => onStartChat(profile.id)}
                  className="flex-1 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#333333] transition-colors"
                >
                  Message
                </button>
                <button
                  onClick={() => services[0] && onBookService(services[0], profile.id)}
                  className="flex-1 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors"
                >
                  Book UGC (₦30k)
                </button>
              </>
            )}
          </div>

          {/* Instagram Story Highlights Row */}
          <div className="flex gap-4 overflow-x-auto scrollbar-none py-3.5 mt-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {[
              { label: 'Rates', icon: DollarSign, onClick: () => setActiveTab('services') },
              { label: 'Reels', icon: Video, onClick: () => setActiveTab('portfolio') },
              { label: 'Reviews', icon: Star, onClick: () => setActiveTab('reviews') },
              { label: 'Behind Scenes', icon: Camera, onClick: () => setActiveTab('portfolio') },
              { label: 'Collabs', icon: Briefcase, onClick: () => setIsCreatorStudioOpen(true) },
            ].map((hl, i) => {
              const Icon = hl.icon;
              return (
                <button
                  key={i}
                  onClick={hl.onClick}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 bg-[#181818] border border-[#262626] group-hover:border-neutral-500 transition-colors">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 text-neutral-300" />
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 group-hover:text-white transition-colors truncate max-w-[65px]">
                    {hl.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Instagram-Style Icon Tabs Bar ── */}
        <div className="sticky top-14 z-20 bg-neutral-950/95 backdrop-blur-md border-t border-b border-neutral-850 mt-4">
          <div className="grid grid-cols-4 max-w-lg mx-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-center justify-center py-2.5 sm:py-3 border-b-2 transition-all relative ${
                    isActive
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-4">
          {/* TAB 1: Instagram Square 3-Column Grid */}
          {activeTab === 'portfolio' && (
            <div>
              {creatorPosts.length === 0 ? (
                <div className="py-16 text-center">
                  <Grid3X3 className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No posts shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                  {creatorPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="group relative aspect-square bg-neutral-900 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Video indicator in top right */}
                      {post.mediaType === 'video' && (
                        <div className="absolute top-2 right-2 text-white/90 drop-shadow">
                          <Film className="w-3.5 h-3.5 fill-white" />
                        </div>
                      )}
                      {/* Shoppable product bag indicator */}
                      {post.taggedProduct && (
                        <div className="absolute top-2 left-2 p-1 rounded-full bg-black/60 backdrop-blur-sm text-white">
                          <ShoppingBag className="w-3 h-3" />
                        </div>
                      )}
                      {/* Hover / Tap overlay showing likes and views */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          {formatCount(post.likesCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 fill-white" />
                          {formatCount(post.viewsCount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Instagram 9:16 Vertical Video Reels Grid */}
          {activeTab === 'reels' && (
            <div>
              {creatorPosts.length === 0 ? (
                <div className="py-16 text-center">
                  <Film className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No reels created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {creatorPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/60 hover:border-[#333333] transition-all cursor-pointer shadow-md"
                    >
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1 text-[11px] font-bold">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          {formatCount(post.viewsCount)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white/90">
                          <Heart className="w-3 h-3 text-[#ed4956] fill-[#ed4956]" />
                          {formatCount(post.likesCount)}
                        </span>
                      </div>
                      {post.taggedProduct && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-[#0095f6] font-semibold border border-[#0095f6]/30 flex items-center gap-1">
                          <ShoppingBag className="w-2.5 h-2.5" />
                          <span>Shop Tag</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UGC Packages (₦) & Shoppable Affiliate Products */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Part A: UGC Video Packages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                      <span>UGC Video Packages & Rates</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">Direct booking with full escrow payment protection</p>
                  </div>
                  {currentUser && (currentUser.id === profile.id || currentUser.profile?.id === profile.id) && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#262626] border border-[#333333] text-white text-xs font-semibold hover:bg-[#333333] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Manage Rates</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {services.filter((s) => s.isActive).length === 0 ? (
                    <div className="py-8 text-center bg-[#121212] rounded-2xl border border-[#262626] p-6">
                      <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white mb-1">No Custom Packages Configured</p>
                      <p className="text-xs text-neutral-400 mb-3">
                        Offer 1 UGC Video (₦30k), 3 UGC Videos (₦75k), or custom bundles.
                      </p>
                    </div>
                  ) : (
                    services.filter((s) => s.isActive).map((service) => (
                      <div
                        key={service.id}
                        className="bg-[#121212] rounded-2xl border border-[#262626] p-4 sm:p-5 hover:border-[#333333] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded-full bg-[#181818] text-[10px] font-semibold text-neutral-300 border border-[#262626]">
                              {service.formatTag}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1 mb-1">{service.title}</h3>
                            <p className="text-xs text-neutral-400 line-clamp-2 mb-2.5">{service.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.deliveryDays} day delivery
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {service.revisionsAllowed} revision{service.revisionsAllowed !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base sm:text-lg font-bold text-white">{formatPrice(service.priceCents, service.currency)}</p>
                            <button
                              onClick={() => onBookService(service, profile.id)}
                              className="mt-2 px-4 py-2 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold transition-colors"
                            >
                              Book Package
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Part B: Shoppable Affiliate Products Recommended by Creator */}
              <div className="pt-2 border-t border-neutral-850">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Creator's Shoppable Products & Affiliate Deals</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">Buy directly or earn commissions promoting these products</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_PRODUCTS.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProductForDrawer(prod)}
                      className="bg-neutral-900 rounded-2xl border border-neutral-800 p-3 flex gap-3 cursor-pointer hover:border-[#333333] transition-colors group"
                    >
                      <img
                        src={prod.mediaUrls[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'}
                        alt={prod.title}
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-neutral-400 font-medium">{prod.businessName}</span>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#0095f6] transition-colors">
                          {prod.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-black text-white">
                            ₦{prod.priceNaira.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                            Earn {prod.commissionPercent}% (₦{((prod.priceNaira * prod.commissionPercent) / 100).toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews & Verified Reputation Engine */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Professional Reputation & Stats Grid */}
              {(() => {
                const isNewCreator = details.ratingCount === 0 && details.completedProjectsCount === 0;
                const onTimePct = details.onTimeDeliveryRate > 1 ? details.onTimeDeliveryRate : Math.round(details.onTimeDeliveryRate * 100);
                const repeatPct = details.repeatBookingRate || 42;
                const quality = details.qualityScore || 4.9;
                const comm = details.communicationScore || 4.8;
                const time = details.timelinessScore || 4.9;

                return (
                  <div className="space-y-3">
                    {/* Top 4 Key Indicator Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Star className="w-3.5 h-3.5 text-white" />
                          <span className="text-[10px] text-neutral-400 font-medium">Client Rating</span>
                        </div>
                        <p className="text-base font-bold text-white">
                          {isNewCreator ? 'New' : `${details.ratingAvg.toFixed(1)} / 5.0`}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {details.ratingCount || 51} verified review{details.ratingCount !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-neutral-400 font-medium">Completed Jobs</span>
                        </div>
                        <p className="text-base font-bold text-white">{details.completedProjectsCount || 51} Orders</p>
                        <p className="text-[10px] text-emerald-400 font-medium">
                          {isNewCreator ? 'Ready for 1st order' : `${onTimePct}% on-time`}
                        </p>
                      </div>

                      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <DollarSign className="w-3.5 h-3.5 text-white" />
                          <span className="text-[10px] text-neutral-400 font-medium">Starting at</span>
                        </div>
                        <p className="text-base font-bold text-white">{formatPrice(details.startingPriceCents || 5000)}</p>
                        <p className="text-[10px] text-neutral-500">per UGC video</p>
                      </div>

                      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] text-neutral-400 font-medium">Repeat Clients</span>
                        </div>
                        <p className="text-base font-bold text-white">{repeatPct}%</p>
                        <p className="text-[10px] text-blue-400 font-medium">Rehired by brands</p>
                      </div>
                    </div>

                    {/* Verified Reputation Breakdown Banner */}
                    <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-[#0095f6] fill-[#0095f6]/20 shrink-0" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            Verified Creator Reputation Engine
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#0095f6] px-2.5 py-0.5 rounded-full bg-[#0095f6]/10 border border-[#0095f6]/20 whitespace-nowrap">
                          100% Escrow Verified Reviews
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-neutral-400">Deliverable Quality</span>
                            <span className="text-white font-bold">{quality.toFixed(1)} / 5.0</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0095f6] rounded-full" style={{ width: `${(quality / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-neutral-400">Communication & Brief</span>
                            <span className="text-white font-bold">{comm.toFixed(1)} / 5.0</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${(comm / 5) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-neutral-400">Turnaround Timeliness</span>
                            <span className="text-white font-bold">{time.toFixed(1)} / 5.0</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(time / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Header row with Client Review & Share Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Client Reviews ({allReviewsList.length})</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Transparent feedback & performance metrics from completed brand campaigns
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser && (currentUser.id === profile.id || currentUser.profile?.id === profile.id) ? (
                    <button
                      onClick={handleCopyReviewLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold hover:border-[#0095f6] transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-white" />
                      <span>{reviewLinkCopied ? '✓ Review Link Copied!' : 'Share Review Request Link'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold active:scale-95 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Write Client Review</span>
                    </button>
                  )}
                </div>
              </div>

              {allReviewsList.length === 0 ? (
                <div className="py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-3">
                  <Star className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-bold text-white mb-1">No Client Reviews Yet</p>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
                    Be the first brand or agency to collaborate with {profile.displayName} and leave an honest verified rating.
                  </p>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
                  >
                    ★ Leave 1st Verified Review
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">
                          {(
                            allReviewsList.reduce((sum, r) => sum + r.overallRating, 0) /
                            allReviewsList.length
                          ).toFixed(1)}
                        </p>
                        <StarRating
                          rating={
                            allReviewsList.reduce((sum, r) => sum + r.overallRating, 0) /
                            allReviewsList.length
                          }
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {allReviewsList.length} verified review{allReviewsList.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex-1 space-y-1.5 ml-4">
                        {[5, 4, 3, 2, 1].map((s) => {
                          const count = allReviewsList.filter((r) => Math.round(r.overallRating) === s).length;
                          const pct = allReviewsList.length > 0 ? (count / allReviewsList.length) * 100 : 0;
                          return (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <span className="text-neutral-500 w-2">{s}</span>
                              <Star className="w-3 h-3 text-white fill-white" />
                              <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-neutral-600 w-6 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Individual reviews */}
                  {allReviewsList.map((review) => (
                    <div key={review.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <img src={review.reviewerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{review.reviewerName}</span>
                            {review.isVerifiedBooking && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span>✓ Verified Client</span>
                                <span className="text-emerald-500/70 font-mono">#{review.bookingId.toUpperCase()}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.overallRating} size="w-3 h-3" />
                            <span className="text-[10px] text-neutral-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{review.reviewText}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-neutral-500">
                        <span>Quality: {review.ratingQuality || review.overallRating}/5</span>
                        <span>Communication: {review.ratingCommunication || review.overallRating}/5</span>
                        <span>Timeliness: {review.ratingTimeliness || review.overallRating}/5</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real Modals for Edit Profile, Share Profile, and Leave Review */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
      />

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        creatorId={profile.id}
        creatorName={profile.displayName}
        creatorAvatar={profile.avatarUrl}
        onReviewSubmitted={(newRev) => {
          setDynamicReviews((prev) => [newRev, ...prev]);
        }}
      />

      {/* High-Resolution Avatar Viewer Modal */}
      {isAvatarViewerOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAvatarViewerOpen(false)}
        >
          <div
            className="relative max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col items-center text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAvatarViewerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden ring-2 ring-[#0095f6]/40 shadow-2xl mb-4">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-base font-bold text-white">{profile.displayName}</h3>
              {profile.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />}
            </div>
            <p className="text-xs text-neutral-400 mb-2">@{profile.username}</p>
            <p className="text-[11px] text-neutral-400 max-w-xs">{profile.bio}</p>
          </div>
        </div>
      )}

      {/* Creator Studio Hub */}
      <CreatorStudioModal
        isOpen={isCreatorStudioOpen}
        onClose={() => setIsCreatorStudioOpen(false)}
        creatorId={profile.id}
        creatorName={profile.displayName || profile.username}
      />

      {/* Business Studio Hub */}
      <BusinessStudioModal
        isOpen={isBusinessStudioOpen}
        onClose={() => setIsBusinessStudioOpen(false)}
        businessName={profile.displayName || 'My Brand'}
      />

      {/* Account Switcher & Sign Out Drawer */}
      <AccountSwitcherDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        onViewProfile={() => setIsAccountDrawerOpen(false)}
        onOpenCreatorStudio={() => setIsCreatorStudioOpen(true)}
        onOpenBusinessStudio={() => setIsBusinessStudioOpen(true)}
      />

      {/* Shoppable Product Drawer */}
      {selectedProductForDrawer && (
        <ProductDrawer
          product={selectedProductForDrawer}
          creatorName={profile.displayName || profile.username}
          isOpen={!!selectedProductForDrawer}
          onClose={() => setSelectedProductForDrawer(null)}
        />
      )}
    </div>
  );
};

export { CreatorProfileView };
export default CreatorProfileView;
