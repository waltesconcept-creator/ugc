'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Plus,
  Percent,
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  Check,
  Upload,
  ArrowRight,
  Sparkles,
  Truck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Product, AffiliateCampaign, CommerceOrder, CreatorApplication } from '@/lib/types';

interface BusinessStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  businessName?: string;
  onOpenCreatorDiscovery?: () => void;
}

export const BusinessStudioModal: React.FC<BusinessStudioModalProps> = ({
  isOpen,
  onClose,
  businessId = 'biz-1',
  businessName = 'GlowSkin Organics',
  onOpenCreatorDiscovery,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'campaigns' | 'applications' | 'sales'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(false);

  // New product form
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [category, setCategory] = useState('Skincare');
  const [mediaUrl, setMediaUrl] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('15');
  const [sampleAvailable, setSampleAvailable] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch(`/api/campaigns?businessId=${businessId}`).then((r) => r.json()),
    ])
      .then(([prodData, campData]) => {
        if (prodData.success && prodData.products) setProducts(prodData.products);
        if (campData.success) {
          if (campData.campaigns) setCampaigns(campData.campaigns);
          if (campData.applications) setApplications(campData.applications);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceNaira) return;
    setCreateLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          businessName,
          title,
          description,
          priceNaira: Number(priceNaira),
          category,
          mediaUrls: [mediaUrl || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop'],
          commissionPercent: Number(commissionPercent) || 15,
          sampleAvailable,
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);

        // Automatically create an affiliate campaign for it
        const campRes = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_campaign',
            productId: data.product.id,
            commissionPercent: Number(commissionPercent) || 15,
            sampleRequiresApproval: true,
          }),
        });
        const campData = await campRes.json();
        if (campData.success && campData.campaign) {
          setCampaigns((prev) => [campData.campaign, ...prev]);
        }

        // Reset
        setTitle('');
        setDescription('');
        setPriceNaira('');
        setMediaUrl('');
        setAddProductOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setActionLoadingId(applicationId);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_application',
          applicationId,
        }),
      });
      const data = await res.json();
      if (data.success && data.application) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? data.application : a))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setActionLoadingId(applicationId);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_application',
          applicationId,
          notes: 'Sample inventory currently reserved.',
        }),
      });
      const data = await res.json();
      if (data.success && data.application) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? data.application : a))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingAppsCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#121212] border-t sm:border border-[#262626] rounded-t-3xl sm:rounded-2xl z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-white">
        <div className="w-12 h-1 bg-[#262626] rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-center text-white">
              <Store className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Business Studio
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Brand Merchant
                </span>
              </h2>
              <p className="text-xs text-neutral-400">{businessName} &bull; Manage products & creator sales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#262626] bg-[#141414] px-3 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'products', label: 'My Products', icon: Package },
            { id: 'campaigns', label: 'Affiliate Campaigns', icon: Percent },
            {
              id: 'applications',
              label: 'Creator Requests & Samples',
              icon: Users,
              badge: pendingAppsCount > 0 ? pendingAppsCount : undefined,
            },
            { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-white text-white font-bold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-[#0095f6] text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Active Product Catalog</h3>
                  <p className="text-xs text-neutral-400">Products eligible for UGC videos and affiliate tagging</p>
                </div>
                <button
                  onClick={() => setAddProductOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List New Product</span>
                </button>
              </div>

              {/* Add Product Inline Modal */}
              {addProductOpen && (
                <form
                  onSubmit={handleAddProduct}
                  className="p-4 rounded-2xl bg-[#181818] border border-[#262626] space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                    <span className="text-xs font-semibold text-white">Add Product to Shop</span>
                    <button
                      type="button"
                      onClick={() => setAddProductOpen(false)}
                      className="text-neutral-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 font-semibold">Product Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Glow Vitamin C Serum"
                        required
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs outline-none focus:border-[#0095f6]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 font-semibold">Retail Price (₦)</label>
                      <input
                        type="number"
                        value={priceNaira}
                        onChange={(e) => setPriceNaira(e.target.value)}
                        placeholder="20000"
                        required
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs outline-none focus:border-[#0095f6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 font-semibold">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Product highlights and benefits..."
                      rows={2}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs outline-none focus:border-[#0095f6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-400 font-semibold">Creator Commission (%)</label>
                      <input
                        type="number"
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(e.target.value)}
                        placeholder="15"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs outline-none focus:border-[#0095f6]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 font-semibold">Product Photo URL</label>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs outline-none focus:border-[#0095f6]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full py-2.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                  >
                    {createLoading ? 'Publishing...' : 'Publish Product & Launch Campaign'}
                  </button>
                </form>
              )}

              {/* Products List */}
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={p.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop'}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-[#262626] shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <p className="text-xs font-bold text-[#0095f6] mt-0.5">
                          ₦{p.priceNaira.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {p.commissionPercent}% Commission &bull; Stock: {p.stockCount}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#0095f6]">
                        Campaign #{camp.id.slice(-4)}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {camp.product?.title || 'Skincare Campaign'}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Commission: <span className="text-white font-bold">{camp.commissionPercent}% (₦{camp.commissionAmountNaira.toLocaleString()})</span>
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Open to Creators
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#262626] text-center">
                    <div className="p-2 bg-[#121212] rounded-xl border border-[#262626]">
                      <p className="text-xs font-bold text-white">{camp.totalCreatorsCount || 38}</p>
                      <p className="text-[10px] text-neutral-500">Creators Enrolled</p>
                    </div>
                    <div className="p-2 bg-[#121212] rounded-xl border border-[#262626]">
                      <p className="text-xs font-bold text-white">{camp.totalSalesCount || 420}</p>
                      <p className="text-[10px] text-neutral-500">Orders Sold</p>
                    </div>
                    <div className="p-2 bg-[#121212] rounded-xl border border-[#262626]">
                      <p className="text-xs font-bold text-emerald-400">
                        ₦{(camp.totalRevenueNaira || 8400000).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CREATOR APPLICATIONS & SAMPLE REQUESTS (TikTok Shop Model) */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-neutral-300">
                <span className="font-semibold text-white">Creator Partnership Requests:</span> Review creators who requested free product samples to produce promotional reels. Once approved, samples ship and the creator can tag your product in their videos.
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs bg-[#181818] rounded-xl border border-[#262626]">
                  No pending creator sample requests at this moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.creatorAvatar}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover border border-[#262626]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{app.creatorName}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#121212] text-neutral-300 border border-[#262626]">
                                {app.creatorCategory || 'Beauty Creator'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {app.creatorFollowers || '18.4K'} audience reach &bull; Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/20'
                          }`}
                        >
                          {app.status === 'approved' ? 'Approved & Sample Shipped' : app.status}
                        </span>
                      </div>

                      <div className="bg-[#121212] p-3 rounded-xl border border-[#262626] text-xs space-y-1.5">
                        <p className="text-neutral-300">
                          <span className="text-neutral-500 font-medium">Pitch / Note: </span>
                          &quot;{app.notes || 'Excited to review this product in authentic UGC video reels.'}&quot;
                        </p>
                        {app.shippingAddress && (
                          <p className="text-neutral-400 text-[11px] flex items-center gap-1.5 pt-1">
                            <Truck className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Sample Ship Destination: {app.shippingAddress}</span>
                          </p>
                        )}
                        {app.trackingCode && (
                          <p className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 pt-0.5">
                            <Package className="w-3.5 h-3.5" />
                            <span>Dispatch Tracking: {app.trackingCode}</span>
                          </p>
                        )}
                        {app.affiliateCode && (
                          <p className="text-[#0095f6] text-[11px] font-semibold">
                            Creator Affiliate Tag: {app.affiliateCode}
                          </p>
                        )}
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            disabled={actionLoadingId === app.id}
                            className="px-3 py-1.5 rounded-xl bg-[#121212] hover:bg-[#1f1f1f] border border-[#262626] text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={actionLoadingId === app.id}
                            className="px-4 py-1.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Sample & Partner</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SALES & REVENUE */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  Total Creator-Driven Revenue
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">₦8,400,000</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Generated across 420 sales by 38 approved creators
                </p>
              </div>

              {/* Creator discovery callout */}
              <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Need UGC Videos for Brand Ads?</h4>
                  <p className="text-[11px] text-neutral-400">
                    Hire verified creators on fixed packages starting from ₦30,000.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCreatorDiscovery) onOpenCreatorDiscovery();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  Discover Creators
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessStudioModal;