'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Percent,
  Wallet as WalletIcon,
  Link as LinkIcon,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  Building,
  Sparkles,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import type { AffiliateCampaign, AffiliateLink, Wallet, WalletTransaction, Booking } from '@/lib/types';
import { MOCK_BOOKINGS } from '@/lib/mock-data';

interface CreatorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId?: string;
  creatorName?: string;
}

export const CreatorStudioModal: React.FC<CreatorStudioModalProps> = ({
  isOpen,
  onClose,
  creatorId = 'creator-1',
  creatorName = 'Chloe Adams',
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'campaigns' | 'links' | 'wallet'>('wallet');
  const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [appliedCampaigns, setAppliedCampaigns] = useState<Record<string, boolean>>({});

  // Withdrawal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(creatorName);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch campaigns
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.campaigns) setCampaigns(d.campaigns);
      })
      .catch(() => {});

    // Fetch wallet & transactions
    fetch(`/api/wallet?userId=${creatorId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.wallet) setWallet(d.wallet);
          if (d.transactions) setTransactions(d.transactions);
        }
      })
      .catch(() => {});
  }, [isOpen, creatorId]);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    const url = `https://ugc-b3pl.onrender.com/r/${code}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyCampaign = async (campId: string) => {
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          campaignId: campId,
          creatorId,
          creatorName,
          sampleRequested: true,
        }),
      });
      setAppliedCampaigns((prev) => ({ ...prev, [campId]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          userId: creatorId,
          amountNaira: Number(withdrawAmount),
          bankDetails: {
            bankName,
            accountNumber,
            accountName,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawSuccess(true);
        if (data.wallet) setWallet(data.wallet);
        // refresh txs
        fetch(`/api/wallet?userId=${creatorId}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.transactions) setTransactions(d.transactions);
          });
        setTimeout(() => {
          setWithdrawSuccess(false);
          setWithdrawModalOpen(false);
          setWithdrawAmount('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const activeBookings = MOCK_BOOKINGS.filter((b) => b.creatorId === creatorId || b.creatorName.includes('Chloe'));

  return (
    <div className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#121212] border-t sm:border border-[#262626] rounded-t-3xl sm:rounded-2xl z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-white">
        {/* Grab bar on mobile */}
        <div className="w-12 h-1 bg-[#262626] rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4 text-[#a8a8a8]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Creator Studio
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#181818] text-[#a8a8a8] border border-[#262626] font-semibold">
                  Ecosystem
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Manage bookings, affiliate sales & wallet earnings</p>
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
            { id: 'wallet', label: 'Wallet & Payouts', icon: WalletIcon },
            { id: 'campaigns', label: 'Affiliate Market', icon: Percent },
            { id: 'bookings', label: 'UGC Bookings', icon: Briefcase },
            { id: 'links', label: 'My Links', icon: LinkIcon },
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
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* ─────── TAB 1: WALLET & PAYOUTS ─────── */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              {/* Wallet Summary Card */}
              <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Available Balance (Cleared)
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                      ₦{(wallet?.availableBalanceNaira ?? 295000).toLocaleString()}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-neutral-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Clearance: ₦{(wallet?.pendingBalanceNaira ?? 45000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setWithdrawModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Withdraw Funds</span>
                  </button>
                </div>

                {/* Two Streams Breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#262626]">
                  <div className="p-3 rounded-xl bg-[#121212] border border-[#262626]">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">1. UGC Bookings</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      ₦{(wallet?.totalEarnedBookingsNaira ?? 420000).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-neutral-500">Paid content creation</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#121212] border border-[#262626]">
                    <p className="text-[10px] text-neutral-300 uppercase font-semibold">2. Affiliate Sales</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      ₦{(wallet?.totalEarnedAffiliateNaira ?? 258000).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-neutral-500">Shop referrals & commissions</p>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Recent Ledger Activity
                </h4>
                <div className="space-y-2">
                  {transactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between gap-3 hover:border-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'withdrawal'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : tx.type === 'affiliate_commission'
                              ? 'bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {tx.type === 'withdrawal' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : tx.type === 'affiliate_commission' ? (
                            <Percent className="w-4 h-4" />
                          ) : (
                            <Briefcase className="w-4 h-4" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{tx.title}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-bold ${
                            tx.amountNaira < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {tx.amountNaira > 0 ? '+' : ''}₦{Math.abs(tx.amountNaira).toLocaleString()}
                        </p>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            tx.status === 'cleared'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-[#1e1e1e] text-neutral-300 border border-[#333333]'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── TAB 2: AFFILIATE MARKET ─────── */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-neutral-300">
                <span className="font-semibold text-white">TikTok Shop Affiliate Model:</span> Brands provide free samples and pay fixed commissions for every sale your reels drive.
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {campaigns.map((camp) => {
                  const isApplied = appliedCampaigns[camp.id];
                  return (
                    <div
                      key={camp.id}
                      className="p-4 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#333333] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3">
                          <img
                            src={camp.product?.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border border-[#262626] shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                              {camp.businessName}
                            </span>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {camp.product?.title || 'Product'}
                            </h4>
                            <p className="text-xs font-semibold text-[#0095f6] mt-1">
                              Earn ₦{camp.commissionAmountNaira.toLocaleString()}{' '}
                              <span className="text-[10px] text-neutral-400 font-normal">
                                ({camp.commissionPercent}% / sale)
                              </span>
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              Product Price: ₦{(camp.product?.priceNaira || 20000).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-[11px] text-neutral-300 line-clamp-2">
                          {camp.terms}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <Package className="w-3 h-3" /> Free Sample Avail.
                        </span>
                        {isApplied ? (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Sample Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyCampaign(camp.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold transition-colors active:scale-95"
                          >
                            Apply & Get Sample
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────── TAB 3: UGC BOOKINGS ─────── */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-neutral-300">
                <span className="font-semibold text-white">Direct UGC Orders:</span> Businesses book your preset packages (1 video, 3 videos, etc.) and pay for your content creation skills.
              </div>

              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/20 font-semibold uppercase">
                          {b.status.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{b.briefTitle}</h4>
                        <p className="text-xs text-neutral-400">Client: {b.businessName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          ₦{(b.totalAmountCents || 75000).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-neutral-500">Escrow Secured</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 bg-[#121212] p-2.5 rounded-xl border border-[#262626]">
                      &quot;{b.briefDescription}&quot;
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-[#262626]">
                      <span>Deadline: {new Date(b.deliveryDeadline).toLocaleDateString()}</span>
                      <button className="text-[#0095f6] font-semibold hover:underline">
                        Upload Deliverable
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────── TAB 4: MY LINKS ─────── */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-neutral-300">
                Share these referral links in your Instagram bio, TikTok comments, or WhatsApp status. Purchases automatically credit your wallet!
              </div>

              {[
                { code: 'GLOW-CHLOE', product: 'Glow Radiance Vitamin C Body Cream', comm: '₦3,000 / sale', clicks: 1420, orders: 86, total: 258000 },
                { code: 'CURLS-CHLOE', product: 'Afro Curls Moisture Butter', comm: '₦2,500 / sale', clicks: 840, orders: 42, total: 105000 },
              ].map((link) => (
                <div
                  key={link.code}
                  className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{link.product}</p>
                      <span className="text-[11px] text-[#0095f6] font-semibold">{link.comm}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(link.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold border border-neutral-700 transition-colors"
                    >
                      {copiedCode === link.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-850">
                    <div className="bg-neutral-950 p-2 rounded-xl">
                      <p className="text-xs font-bold text-white">{link.clicks.toLocaleString()}</p>
                      <p className="text-[10px] text-neutral-500">Total Clicks</p>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-xl">
                      <p className="text-xs font-bold text-white">{link.orders}</p>
                      <p className="text-[10px] text-neutral-500">Orders</p>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-xl">
                      <p className="text-xs font-bold text-emerald-400">₦{link.total.toLocaleString()}</p>
                      <p className="text-[10px] text-neutral-500">Commission</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Withdrawal Sub-Modal ── */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setWithdrawModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#121212] border border-[#262626] rounded-2xl p-5 z-10 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-white" />
                Transfer to Nigerian Bank
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#181818] border border-[#262626] text-neutral-400 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Transfer Initiated!</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  ₦{Number(withdrawAmount).toLocaleString()} is en route to {bankName} (***{accountNumber.slice(-4)}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold">Amount in Naira (₦)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    max={wallet?.availableBalanceNaira ?? 295000}
                    required
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-white text-sm focus:border-[#0095f6] outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Available: ₦{(wallet?.availableBalanceNaira ?? 295000).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-semibold">Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-white text-xs focus:border-[#0095f6] outline-none"
                  >
                    <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                    <option value="First Bank">First Bank of Nigeria</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-semibold">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="10-digit NUBAN"
                    required
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-white text-sm focus:border-[#0095f6] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-semibold">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-white text-sm focus:border-[#0095f6] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {withdrawLoading ? 'Processing Transfer...' : 'Confirm Bank Payout'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorStudioModal;
