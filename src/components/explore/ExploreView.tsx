'use client';

import React, { useState, useMemo } from 'react';
import type { Post, Category, Product } from '@/lib/types';
import { MOCK_CATEGORIES, MOCK_POSTS, MOCK_CREATORS, MOCK_PRODUCTS } from '@/lib/mock-data';
import { ProductDrawer } from '../commerce/ProductDrawer';
import {
  Search,
  Play,
  X,
  SlidersHorizontal,
  Eye,
  Heart,
  BadgeCheck,
  TrendingUp,
  Sparkles,
  Filter,
  ShoppingBag,
  Users,
  Video,
  Star,
  Package,
} from 'lucide-react';

interface ExploreViewProps {
  onSelectPost: (post: Post) => void;
  onOpenProfile: (creatorId: string) => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const FORMAT_FILTERS = ['All', 'UGC Ad', 'Product Review', 'Unboxing', 'Tutorial', 'Testimonial', 'Lifestyle'];

const ExploreView: React.FC<ExploreViewProps> = ({ onSelectPost, onOpenProfile }) => {
  const [exploreMode, setExploreMode] = useState<'videos' | 'creators' | 'shop'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'popular'>('trending');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredPosts = useMemo(() => {
    let result = [...MOCK_POSTS];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.creator.username.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedFormat !== 'All') {
      result = result.filter((p) => p.contentFormat === selectedFormat);
    }
    if (sortBy === 'popular') result.sort((a, b) => b.likesCount - a.likesCount);
    else if (sortBy === 'recent') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else result.sort((a, b) => b.viewsCount - a.viewsCount);
    return result;
  }, [searchQuery, selectedCategory, selectedFormat, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 lg:pb-8">
      {/* ── Search header ── */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/50 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Search bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search creators, categories, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-neutral-300" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* ── Mode Switcher: Videos | Creators | Shop ── */}
          <div className="flex gap-1.5 p-1 bg-neutral-900 rounded-xl mb-3 border border-neutral-800">
            <button
              onClick={() => setExploreMode('videos')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                exploreMode === 'videos'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Watch</span>
            </button>
            <button
              onClick={() => setExploreMode('creators')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                exploreMode === 'creators'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Creators</span>
            </button>
            <button
              onClick={() => setExploreMode('shop')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                exploreMode === 'shop'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop</span>
            </button>
          </div>

          {/* Category pills – horizontally scrollable */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-3 px-3 pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              Trending
            </button>
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Desktop: format + sort row */}
          <div className="hidden lg:flex items-center gap-3 mt-3">
            <div className="flex gap-1.5">
              {FORMAT_FILTERS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedFormat === fmt
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-500">
              <span>Sort:</span>
              {(['trending', 'popular', 'recent'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded-full capitalize transition-all ${
                    sortBy === s
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid (Videos | Creators | Shop) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        {/* MODE: SHOP & PRODUCTS */}
        {exploreMode === 'shop' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#262626] text-xs text-neutral-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Creator Affiliate Marketplace:</span> Browse brand products, get samples, tag in your videos, and earn direct commissions per sale.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {MOCK_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group p-3.5 rounded-2xl bg-[#121212] border border-[#262626] hover:border-[#3a3a3a] transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black">
                      <img
                        src={prod.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop'}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.sampleAvailable && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold shadow-md">
                          Free Sample
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                      {prod.businessName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5 group-hover:text-neutral-200 transition-colors">
                      {prod.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        ₦{prod.priceNaira.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        Earn {prod.commissionPercent}% (₦{Math.round((prod.priceNaira * prod.commissionPercent) / 100).toLocaleString()})
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-[11px] font-semibold border border-[#333333] transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE: HIRE CREATORS */}
        {exploreMode === 'creators' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_CREATORS.map((c) => (
              <div
                key={c.profile.id}
                onClick={() => onOpenProfile(c.profile.id)}
                className="p-4 rounded-2xl bg-[#121212] border border-[#262626] hover:border-[#3a3a3a] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={c.profile.avatarUrl}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border border-[#262626] shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-neutral-200 transition-colors">
                        {c.profile.displayName}
                      </h4>
                      {c.profile.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-[#0095f6] fill-[#0095f6]/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">@{c.profile.username}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="text-neutral-300 font-semibold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {c.details.ratingAvg || 4.9}
                      </span>
                      <span className="text-neutral-600">&bull;</span>
                      <span className="text-neutral-400">{c.details.categories?.[0] || 'UGC'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-neutral-500 block">Starting at</span>
                  <span className="text-xs font-bold text-white">
                    ₦{(c.details.startingPriceCents ? c.details.startingPriceCents * 10 : 30000).toLocaleString()}
                  </span>
                  <button className="mt-1 px-2.5 py-1 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#333333] text-white text-[10px] font-semibold transition-colors block ml-auto">
                    View Rates
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODE: VIDEOS (DEFAULT) */}
        {exploreMode === 'videos' && (
          filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-12 h-12 text-neutral-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No results found</h3>
              <p className="text-sm text-neutral-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/50 hover:border-orange-500/30 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <img
                    src={post.thumbnailUrl}
                    alt={post.caption}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Play icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Top stats */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white">
                      <Eye className="w-3 h-3" />
                      {formatCount(post.viewsCount)}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white">
                      <Heart className="w-3 h-3" />
                      {formatCount(post.likesCount)}
                    </span>
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-8">
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-tight mb-1.5 text-left">
                      {post.caption}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <img
                        src={post.creator.avatarUrl}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[10px] text-white/70 truncate">
                        @{post.creator.username}
                      </span>
                      {post.creator.isVerified && (
                        <BadgeCheck className="w-3 h-3 text-blue-400 fill-blue-400/20 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Shoppable Product Details Bottom Sheet */}
      {selectedProduct && (
        <ProductDrawer
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Mobile filter drawer ── */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilterDrawer(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-3xl border-t border-neutral-800 pb-[env(safe-area-inset-bottom)] animate-slide-up max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-neutral-700" />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* Format */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-neutral-300 mb-2.5">Content Format</h4>
                <div className="flex flex-wrap gap-2">
                  {FORMAT_FILTERS.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                        selectedFormat === fmt
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-neutral-300 mb-2.5">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {(['trending', 'popular', 'recent'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all min-h-[44px] ${
                        sortBy === s
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {s === 'trending' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {s === 'popular' && <Heart className="w-3 h-3 inline mr-1" />}
                      {s === 'recent' && <Sparkles className="w-3 h-3 inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply */}
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 min-h-[48px]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ExploreView };
export default ExploreView;
