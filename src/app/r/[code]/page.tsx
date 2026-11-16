'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Check,
  Sparkles,
  ArrowLeft,
  Share2,
  Percent,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/lib/types';

function ReferralProductContent() {
  const params = useParams();
  const code = (params?.code as string) || 'REFERRAL';

  // Find product by code heuristic or fallback to prod-1
  const product: Product =
    code.toUpperCase().includes('CURL')
      ? MOCK_PRODUCTS[1]
      : code.toUpperCase().includes('TECH')
      ? MOCK_PRODUCTS[2]
      : MOCK_PRODUCTS[0];

  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const commissionAmount = Math.round((product.priceNaira * product.commissionPercent) / 100);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_purchase',
          productId: product.id,
          productTitle: product.title,
          businessName: product.businessName,
          customerName: customerName || 'Valued Customer',
          creatorId: 'creator-1',
          creatorName: 'Chloe Adams',
          affiliateCode: code,
          unitPriceNaira: product.priceNaira,
          commissionEarnedNaira: commissionAmount,
        }),
      });
      setPurchased(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Back to Creator Feed</span>
        </Link>
        <span className="text-[11px] font-bold text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          Ref: {code}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Creator Recommendation Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-neutral-900 to-amber-500/15 border border-orange-500/30 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-orange-500 shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white">Recommended by @chloeadams</p>
            <p className="text-[11px] text-neutral-400">
              Verified Creator Partner for {product.businessName}
            </p>
          </div>
        </div>

        {/* Product Media & Showcase */}
        <div className="rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl">
          <img
            src={product.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop'}
            alt={product.title}
            className="w-full aspect-square object-cover"
          />
          <div className="p-5">
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
              {product.businessName}
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
              {product.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-black text-white">
                ₦{product.priceNaira.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500 line-through">
                ₦{(product.priceNaira * 1.25).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                In Stock
              </span>
            </div>

            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Truck className="w-4 h-4" /> 2-3 Day Nationwide Delivery
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Buyer Protection
              </span>
            </div>
          </div>
        </div>

        {/* Purchase Form or Success State */}
        {purchased ? (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center animate-fade-in space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Order Placed Successfully!</h2>
            <p className="text-xs text-neutral-300">
              Thank you, {customerName || 'Friend'}! Your order for {product.title} has been received by {product.businessName}.
            </p>
            <p className="text-[11px] text-orange-400 font-semibold bg-neutral-900 p-2 rounded-xl">
              ₦{commissionAmount.toLocaleString()} affiliate reward automatically attributed to Creator via code {code}!
            </p>
            <Link
              href="/"
              className="inline-block mt-3 px-6 py-2.5 rounded-full bg-orange-500 text-white font-bold text-xs"
            >
              Explore More Content on Creator
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3.5 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Express Delivery Checkout</span>
            </h3>

            <div>
              <label className="text-[11px] text-neutral-400 font-semibold">Your Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Bisi Adeyemi"
                required
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 font-semibold">WhatsApp / Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                required
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 font-semibold">Delivery Address (State & City)</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="e.g. Victoria Island, Lagos"
                required
                className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Confirming Order...' : `Complete Order • ₦${product.priceNaira.toLocaleString()}`}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function ReferralProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReferralProductContent />
    </Suspense>
  );
}
