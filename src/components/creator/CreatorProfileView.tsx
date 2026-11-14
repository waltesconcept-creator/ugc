'use client';

import React, { useState, useMemo } from 'react';
import type { Post, ServicePackage, Profile, CreatorDetails, Review } from '@/lib/types';
import { MOCK_CREATORS, MOCK_POSTS } from '@/lib/mock-data';
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
} from 'lucide-react';

interface CreatorProfileViewProps {
  creatorId?: string;
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
        className={`${size} ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`}
      />
    ))}
  </div>
);

const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({
  creatorId,
  onSelectPost,
  onBookService,
  onStartChat,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'reviews'>('portfolio');
  const [isFollowing, setIsFollowing] = useState(false);

  const creatorData = useMemo(() => {
    const id = creatorId || MOCK_CREATORS[0]?.profile.id || '';
    return MOCK_CREATORS.find((c) => c.profile.id === id) || MOCK_CREATORS[0];
  }, [creatorId]);

  const creatorPosts = useMemo(() => {
    if (!creatorData) return [];
    return MOCK_POSTS.filter((p) => p.creatorId === creatorData.profile.id);
  }, [creatorData]);

  if (!creatorData) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Creator not found</p>
      </div>
    );
  }

  const { profile, details, services, reviews } = creatorData;

  const TABS = [
    { key: 'portfolio' as const, label: 'Portfolio', count: creatorPosts.length },
    { key: 'services' as const, label: 'Services', count: services.length },
    { key: 'reviews' as const, label: 'Reviews', count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* ── Cover / header area ── */}
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-28 sm:h-36 bg-gradient-to-br from-rose-500/30 via-pink-500/20 to-purple-500/30" />

          {/* Avatar + info */}
          <div className="px-4 sm:px-6 -mt-12 sm:-mt-14">
            <div className="flex items-end gap-4 sm:gap-5">
              <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-neutral-950 overflow-hidden shadow-xl">
                <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">{profile.displayName}</h1>
                  {profile.isVerified && <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-400/20 shrink-0" />}
                </div>
                <p className="text-sm text-neutral-400">@{profile.username}</p>
              </div>
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed">{profile.bio}</p>

            {/* Location + website */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-rose-400 hover:underline">
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
              {details.isAvailable && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> Available for hire
                </span>
              )}
            </div>

            {/* Category tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {details.categories.map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-full bg-neutral-900 text-[11px] font-medium text-neutral-400 border border-neutral-800">
                  {cat}
                </span>
              ))}
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-all ${
                  isFollowing
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => onStartChat(profile.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={() => services[0] && onBookService(services[0], profile.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 min-h-[44px]"
              >
                <ShoppingBag className="w-4 h-4" />
                Book
              </button>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {[
                { label: 'Rating', value: `${details.ratingAvg.toFixed(1)}`, sub: `${details.ratingCount} reviews`, icon: <Star className="w-4 h-4 text-amber-400" /> },
                { label: 'Projects', value: String(details.completedProjectsCount), sub: `${Math.round(details.onTimeDeliveryRate * 100)}% on time`, icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                { label: 'Starting at', value: formatPrice(details.startingPriceCents), sub: 'per project', icon: <DollarSign className="w-4 h-4 text-rose-400" /> },
                { label: 'Social Reach', value: formatCount(details.totalSocialViews || 0), sub: 'total views', icon: <TrendingUp className="w-4 h-4 text-blue-400" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-neutral-900 rounded-xl border border-neutral-800 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {stat.icon}
                    <span className="text-[11px] text-neutral-500 font-medium">{stat.label}</span>
                  </div>
                  <p className="text-base font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-neutral-500">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Social handles */}
            <div className="flex flex-wrap gap-2 mt-4">
              {details.instagramHandle && (
                <a href={`https://instagram.com/${details.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white transition-colors min-h-[36px]">
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  @{details.instagramHandle}
                  {details.instagramFollowers && <span className="text-neutral-600 ml-1">{formatCount(details.instagramFollowers)}</span>}
                </a>
              )}
              {details.tiktokHandle && (
                <a href={`https://tiktok.com/@${details.tiktokHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white transition-colors min-h-[36px]">
                  <Play className="w-3.5 h-3.5 text-rose-500" />
                  @{details.tiktokHandle}
                  {details.tiktokFollowers && <span className="text-neutral-600 ml-1">{formatCount(details.tiktokFollowers)}</span>}
                </a>
              )}
              {details.youtubeHandle && (
                <a href={`https://youtube.com/@${details.youtubeHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:text-white transition-colors min-h-[36px]">
                  <Video className="w-3.5 h-3.5 text-red-500" />
                  @{details.youtubeHandle}
                  {details.youtubeSubscribers && <span className="text-neutral-600 ml-1">{formatCount(details.youtubeSubscribers)}</span>}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="sticky top-14 z-20 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/50 mt-5">
          <div className="flex px-4 sm:px-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all min-h-[44px] ${
                  activeTab === tab.key
                    ? 'border-rose-500 text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="px-4 sm:px-6 pt-4">
          {/* Portfolio */}
          {activeTab === 'portfolio' && (
            <div>
              {creatorPosts.length === 0 ? (
                <div className="py-16 text-center">
                  <Play className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No portfolio items yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {creatorPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/50 hover:border-rose-500/30 transition-all"
                    >
                      <img src={post.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] text-white/80">
                          <Eye className="w-3 h-3" />
                          {formatCount(post.viewsCount)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/80">
                          <Heart className="w-3 h-3" />
                          {formatCount(post.likesCount)}
                        </span>
                      </div>
                      {post.isPortfolioPinned && (
                        <div className="absolute top-2 right-2">
                          <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {services.filter((s) => s.isActive).map((service) => (
                <div key={service.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 sm:p-5 hover:border-neutral-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                          {service.formatTag}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{service.title}</h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{service.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.deliveryDays} day{service.deliveryDays !== 1 ? 's' : ''} delivery
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {service.revisionsAllowed} revision{service.revisionsAllowed !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-white">{formatPrice(service.priceCents, service.currency)}</p>
                      <button
                        onClick={() => onBookService(service, profile.id)}
                        className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 min-h-[40px] hover:shadow-rose-500/40 transition-shadow"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{details.ratingAvg.toFixed(1)}</p>
                    <StarRating rating={details.ratingAvg} />
                    <p className="text-[11px] text-neutral-500 mt-1">{details.ratingCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 ml-4">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = reviews.filter((r) => Math.round(r.overallRating) === s).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-500 w-2">{s}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-neutral-600 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual reviews */}
              {reviews.map((review) => (
                <div key={review.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <img src={review.reviewerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{review.reviewerName}</span>
                        {review.isVerifiedBooking && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified
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
                    <span>Quality: {review.ratingQuality}/5</span>
                    <span>Communication: {review.ratingCommunication}/5</span>
                    <span>Timeliness: {review.ratingTimeliness}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CreatorProfileView };
export default CreatorProfileView;
