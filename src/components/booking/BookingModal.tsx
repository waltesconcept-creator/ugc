'use client';

import React, { useState } from 'react';
import type { ServicePackage, Booking, BookingStatus } from '@/lib/types';
import {
  X,
  Calendar,
  FileText,
  Globe,
  Link2,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServicePackage;
  creatorName: string;
  onConfirmBooking: (newBooking: Booking) => void;
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  service,
  creatorName,
  onConfirmBooking,
}) => {
  const [briefTitle, setBriefTitle] = useState('');
  const [briefDescription, setBriefDescription] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('Instagram');
  const [referenceUrls, setReferenceUrls] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  if (!isOpen) return null;

  const addReferenceUrl = () => setReferenceUrls((prev) => [...prev, '']);
  const removeReferenceUrl = (idx: number) => setReferenceUrls((prev) => prev.filter((_, i) => i !== idx));
  const updateReferenceUrl = (idx: number, val: string) =>
    setReferenceUrls((prev) => prev.map((u, i) => (i === idx ? val : u)));

  const isFormValid = briefTitle.trim().length >= 3 && briefDescription.trim().length >= 10;

  const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'LinkedIn', 'Website', 'Other'];

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + service.deliveryDays);

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      businessId: 'current_user',
      businessName: 'Your Business',
      creatorId: service.creatorId,
      creatorName,
      serviceId: service.id,
      serviceTitle: service.title,
      briefTitle: briefTitle.trim(),
      briefDescription: briefDescription.trim(),
      targetPlatform,
      referenceUrls: referenceUrls.filter((u) => u.trim()),
      totalAmountCents: service.priceCents,
      currency: service.currency,
      status: 'pending',
      deliveryDeadline: deadline.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      setTimeout(() => {
        onConfirmBooking(newBooking);
        onClose();
        setStep('form');
        setBriefTitle('');
        setBriefDescription('');
        setTargetPlatform('Instagram');
        setReferenceUrls(['']);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full lg:max-w-lg lg:mx-4 h-full lg:h-auto lg:max-h-[90vh] bg-[#121212] lg:rounded-2xl border-t lg:border border-[#262626] flex flex-col overflow-hidden z-10 animate-slide-up lg:animate-none">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#262626]">
          <div>
            <h2 className="text-base font-bold text-white">Book Creator</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{creatorName} · {service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center hover:bg-[#222222] transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 pb-[env(safe-area-inset-bottom)]">
          {step === 'success' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Booking Submitted!</h3>
              <p className="text-sm text-neutral-400">Your project brief has been sent to {creatorName}.</p>
            </div>
          ) : step === 'review' ? (
            <>
              {/* Review step */}
              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-300">{service.title}</span>
                      <span className="text-white font-semibold">{formatPrice(service.priceCents, service.currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Delivery</span>
                      <span>{service.deliveryDays} day{service.deliveryDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Revisions</span>
                      <span>{service.revisionsAllowed} included</span>
                    </div>
                    <div className="border-t border-neutral-700 mt-2 pt-2 flex justify-between text-sm">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-lg font-bold text-white">{formatPrice(service.priceCents, service.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Brief</h4>
                  <p className="text-sm text-white font-medium">{briefTitle}</p>
                  <p className="text-xs text-neutral-400 mt-1">{briefDescription}</p>
                  <p className="text-xs text-neutral-500 mt-2">Platform: {targetPlatform}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-semibold border border-neutral-700 hover:bg-neutral-700 transition-colors min-h-[48px]"
                  >
                    Edit Brief
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Confirm & Pay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Service summary card */}
              <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[#0095f6]/10 text-[10px] font-medium text-[#0095f6] border border-[#0095f6]/20">
                      {service.formatTag}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-2">{service.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{service.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xl font-bold text-white">{formatPrice(service.priceCents, service.currency)}</p>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {service.deliveryDays}d delivery
                    </div>
                  </div>
                </div>
              </div>

              {/* Brief title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Project Title *
                </label>
                <input
                  type="text"
                  value={briefTitle}
                  onChange={(e) => setBriefTitle(e.target.value)}
                  placeholder="e.g., Product Demo for Spring Collection"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#0095f6] focus:ring-1 focus:ring-[#0095f6]/20 transition-colors min-h-[48px]"
                />
              </div>

              {/* Brief description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Project Brief *
                </label>
                <textarea
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  placeholder="Describe what you need, key messages, tone of voice, specific requirements..."
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#0095f6] focus:ring-1 focus:ring-[#0095f6]/20 transition-colors resize-none"
                />
                <p className="text-[10px] text-neutral-600 mt-1">Minimum 10 characters</p>
              </div>

              {/* Target platform */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Target Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setTargetPlatform(p)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                        targetPlatform === p
                          ? 'bg-white text-black border border-white'
                          : 'bg-[#181818] text-neutral-400 border border-[#262626] hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference URLs */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  <Link2 className="w-3 h-3 inline mr-1" />
                  Reference URLs (optional)
                </label>
                <div className="space-y-2">
                  {referenceUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateReferenceUrl(idx, e.target.value)}
                        placeholder="https://example.com/reference"
                        className="flex-1 px-4 py-2.5 bg-[#181818] border border-[#262626] rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#0095f6] min-h-[44px]"
                      />
                      {referenceUrls.length > 1 && (
                        <button
                          onClick={() => removeReferenceUrl(idx)}
                          className="w-11 h-11 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-500" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addReferenceUrl}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors py-1 min-h-[36px]"
                  >
                    <Plus className="w-3 h-3" />
                    Add another reference
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => setStep('review')}
                disabled={!isFormValid}
                className="w-full py-3.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm disabled:opacity-40 min-h-[50px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Review Booking · {formatPrice(service.priceCents, service.currency)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { BookingModal };
export default BookingModal;
