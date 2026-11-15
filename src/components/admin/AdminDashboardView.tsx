'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Film, Briefcase, DollarSign, 
  AlertTriangle, Check, X, Star, Sparkles, Filter, 
  Eye, CheckCircle2, Ban, Tag, ArrowUpRight
} from 'lucide-react';
import { MOCK_CREATORS, MOCK_POSTS, MOCK_BOOKINGS, MOCK_CATEGORIES } from '@/lib/mock-data';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'creators' | 'categories' | 'reports'>('overview');
  const [creatorsList, setCreatorsList] = useState(MOCK_CREATORS);
  const [postsList, setPostsList] = useState(MOCK_POSTS);

  // Toggle creator verified badge
  const toggleVerifyCreator = (id: string) => {
    setCreatorsList((prev: typeof MOCK_CREATORS) =>
      prev.map((c: (typeof MOCK_CREATORS)[number]) =>
        c.profile.id === id
          ? { ...c, profile: { ...c.profile, isVerified: !c.profile.isVerified } }
          : c
      )
    );
  };

  // Feature or unfeature post
  const toggleFeaturePost = (id: string) => {
    setPostsList(prev =>
      prev.map(p => (p.id === id ? { ...p, isPortfolioPinned: !p.isPortfolioPinned } : p))
    );
  };

  // Remove flagged post
  const handleRemovePost = (id: string) => {
    setPostsList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.8rem)] bg-neutral-950 text-white pb-24 pt-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Secure Administrative Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              KRE8TOR Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Platform Healthy & Operational
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Content Moderation ({postsList.length})
          </button>

          <button
            onClick={() => setActiveTab('creators')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'creators'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Creator Management ({creatorsList.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Categories & Tags
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Reports Queue (0)
          </button>
        </div>

        {/* Tab 1: Overview & Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400 font-medium">Active Creators</span>
                <span className="text-2xl font-black text-white mt-1 block">142</span>
                <span className="text-emerald-400 text-[11px] font-semibold mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +18% this month
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400 font-medium">Verified Businesses</span>
                <span className="text-2xl font-black text-white mt-1 block">86</span>
                <span className="text-emerald-400 text-[11px] font-semibold mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +24% brand signups
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400 font-medium">Completed Bookings</span>
                <span className="text-2xl font-black text-white mt-1 block">318</span>
                <span className="text-neutral-400 text-[11px] font-medium mt-1 block">
                  100% dispute resolution
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400 font-medium">Platform GMV (Volume)</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">$18,450</span>
                <span className="text-neutral-400 text-[11px] font-medium mt-1 block">
                  Average project: $58.00
                </span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <h3 className="font-bold text-sm text-white">Platform Health & Quick Moderation</h3>
              <p className="text-neutral-400 text-xs">
                All video streams are currently routed via optimized edge caches. Storage bandwidth is operating well within free limits (~3.8% of Cloudinary free quota consumed).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Content Moderation */}
        {activeTab === 'content' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <h2 className="font-bold text-sm text-white">Recent Uploads Queue</h2>
            <div className="divide-y divide-neutral-800 bg-neutral-900/60 rounded-2xl border border-neutral-800 overflow-hidden">
              {postsList.map(post => (
                <div key={post.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption}
                      className="w-12 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <span className="font-bold text-white block text-sm line-clamp-1 max-w-md">
                        {post.caption}
                      </span>
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px] mt-1">
                        <span>@{post.creator.username}</span>
                        <span>•</span>
                        <span className="text-rose-400">{post.category}</span>
                        <span>•</span>
                        <span>{post.contentFormat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFeaturePost(post.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        post.isPortfolioPinned
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {post.isPortfolioPinned ? '★ Featured' : 'Feature'}
                    </button>

                    <button
                      onClick={() => handleRemovePost(post.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-semibold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Creators Management */}
        {activeTab === 'creators' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <h2 className="font-bold text-sm text-white">Creator Directory & Verification</h2>
            <div className="divide-y divide-neutral-800 bg-neutral-900/60 rounded-2xl border border-neutral-800 overflow-hidden">
              {creatorsList.map((item: (typeof MOCK_CREATORS)[number]) => (
                <div key={item.profile.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.profile.avatarUrl}
                      alt={item.profile.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.profile.displayName}</span>
                        <span className="text-neutral-500 font-mono">@{item.profile.username}</span>
                        {item.profile.isVerified && (
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Verified</span>
                        )}
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        {item.profile.location} • {item.details.completedProjectsCount} projects • Starting ${(item.details.startingPriceCents / 100).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVerifyCreator(item.profile.id)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
                    >
                      {item.profile.isVerified ? 'Revoke Badge' : 'Grant Verified Badge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white">Platform Taxonomy & Niches</h2>
              <button className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs">
                + Add New Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {MOCK_CATEGORIES.map(cat => (
                <div key={cat.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                  <p className="text-neutral-400 text-[11px] mt-1">{cat.description}</p>
                  <span className="text-[10px] text-rose-400 font-semibold mt-2 block">
                    {cat.videoCount} active videos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="p-12 text-center text-neutral-500 text-xs bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-neutral-300">Clean Moderation Queue</p>
            <p className="mt-1">Zero reported videos or user accounts pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardView;
