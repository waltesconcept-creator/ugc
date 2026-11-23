'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  ExternalLink,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Percent,
  Sparkles,
  ArrowRight,
  Copy,
} from 'lucide-react';
import type { TaggedProductRef, Product } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface ProductDrawerProps {
  product: TaggedProductRef | Product;
  isOpen: boolean;
  onClose: () => void;
  creatorId?: string;
  creatorName?: string;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
  creatorId,
  creatorName,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!isOpen) return null;

  const title = product.title;
  const priceNaira = 'priceNaira' in product ? product.priceNaira : 20000;
  const brandName = 'brandName' in product ? product.brandName : ('businessName' in product ? product.businessName : 'Brand');
  const commissionPercent = product.commissionPercent || 15;
  const commissionEarned = Math.round((priceNaira * commissionPercent) / 100);
  const imageUrl =
    'imageUrl' in product
      ? product.imageUrl
      : 'mediaUrls' in product && product.mediaUrls && product.mediaUrls[0]
      ? product.mediaUrls[0]
      : 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop';

  const affiliateCode =
    'affiliateCode' in product && product.affiliateCode
      ? product.affiliateCode
      : `REF-${(creatorName || 'CREATOR').slice(0, 4).toUpperCase()}-99`;

  const referralUrl = `https://ugc-b3pl.onrender.com/r/${affiliateCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSimulatePurchase = async () => {
    setPurchasing(true);
    try {
      await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_purchase',
          productId: product.id,
          productTitle: title,
          businessName: brandName,
          customerName: currentUser?.profile?.displayName || 'Customer',
          creatorId: creatorId || 'creator-1',
          creatorName: creatorName || 'Chloe Adams',
          affiliateCode,
          unitPriceNaira: priceNaira,
          commissionEarnedNaira: commissionEarned,
        }),
      });
      setPurchaseSuccess(true);
    } catch (err) {
      console.error('Purchase simulation error:', err);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-[#121212] border-t sm:border border-[#262626] rounded-t-3xl sm:rounded-2xl p-5 pb-8 z-10 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-[#262626] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#181818] border border-[#262626] text-white text-[11px] font-semibold flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-[#a8a8a8]" />
              Shop
            </span>
            <span className="text-xs text-neutral-400 font-medium">{brandName}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Showcase */}
        <div className="mt-4 flex gap-4 items-start">
          <img
            src={imageUrl}
            alt={title}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover border border-[#262626] shadow-md shrink-0 bg-black"
          />
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
              {title}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-white">
                ₦{priceNaira.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 line-through">
                ₦{(priceNaira * 1.25).toLocaleString()}
              </span>
            </div>

            {/* Creator Attribution Tag */}
            {creatorName && (
              <p className="mt-1 text-[11px] text-neutral-400">
                Recommended by <span className="text-white font-semibold">@{creatorName}</span>
              </p>
            )}

            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Truck className="w-3 h-3" />
              <span>Nationwide 2-3 Day Delivery</span>
            </div>
          </div>
        </div>

        {/* Affiliate Commission Callout */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-neutral-300">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Creator Affiliate Reward</p>
              <p className="text-[11px] text-neutral-400">
                {commissionPercent}% per verified sale (Earn ₦{commissionEarned.toLocaleString()})
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#333333] transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Purchase simulation alert / status */}
        {purchaseSuccess ? (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white">Order Confirmed</p>
            <p className="text-xs text-neutral-300 mt-1">
              ₦{commissionEarned.toLocaleString()} affiliate commission has been credited to @{creatorName || 'Chloe Adams'}&apos;s wallet.
            </p>
          </div>
        ) : (
          /* Action Buttons */
          <div className="mt-5 space-y-2">
            <button
              onClick={handleSimulatePurchase}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{purchasing ? 'Processing Order...' : `Buy Now • ₦${priceNaira.toLocaleString()}`}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#181818] hover:bg-[#262626] text-neutral-300 hover:text-white font-semibold text-xs border border-[#262626] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Share Affiliate Link ({affiliateCode})</span>
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Nigerian Merchant
          </span>
          <span>•</span>
          <span>7-Day Buyer Protection</span>
        </div>
      </div>
    </div>
  );
};

export default ProductDrawer;
