'use client';

import React, { useState } from 'react';
import type { Review } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Star,
  Sparkles,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  onReviewSubmitted: (review: Review) => void;
}

const StarInput: React.FC<{
  label: string;
  rating: number;
  onChange: (val: number) => void;
}> = ({ label, rating, onChange }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-neutral-300 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-1 text-white hover:scale-110 active:scale-95 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                s <= rating ? 'fill-white text-white' : 'text-neutral-700'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth();

  const [reviewerName, setReviewerName] = useState(
    currentUser?.profile?.displayName || ''
  );
  const [projectTitle, setProjectTitle] = useState('UGC Video Ad & Commercial Rights');
  const [overallRating, setOverallRating] = useState(5);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingTimeliness, setRatingTimeliness] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reviewerName.trim()) {
      setErrorMessage('Please enter your client or brand name.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMessage('Please write your feedback about working with this creator.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          reviewerName: reviewerName.trim(),
          reviewerAvatar:
            currentUser?.profile?.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
          reviewerRole: (currentUser?.role as any) === 'business' ? 'business' : 'business',
          projectTitle: projectTitle.trim() || 'Verified UGC Collaboration',
          overallRating,
          ratingQuality,
          ratingCommunication,
          ratingTimeliness,
          reviewText: reviewText.trim(),
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success && data.review) {
        setSuccess(true);
        onReviewSubmitted(data.review);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Network error submitting review.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-fade-in text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-850 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#0095f6]/40"
            />
            <div>
              <h2 className="text-sm font-bold text-white">Review {creatorName}</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Verified Client Review</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            ⚠️ {errorMessage}
          </div>
        )}
        {success && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Verified review published! Creator reputation updated.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Reviewer Name */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Your Name or Brand / Company Name *
            </label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. Nova Brand / Alex Rivers"
              className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] text-xs"
            />
          </div>

          {/* Project Title */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              UGC Deliverable / Campaign Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. 30s Product Review Video, Organic Brand Reel"
              className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] text-xs"
            />
          </div>

          {/* Rating Breakdown */}
          <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800/80 p-3.5 space-y-1">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
              Performance Scores
            </div>

            <StarInput
              label="Overall Experience (Main Rating)"
              rating={overallRating}
              onChange={setOverallRating}
            />
            <StarInput
              label="Deliverable Quality & Hook"
              rating={ratingQuality}
              onChange={setRatingQuality}
            />
            <StarInput
              label="Communication & Responsiveness"
              rating={ratingCommunication}
              onChange={setRatingCommunication}
            />
            <StarInput
              label="Turnaround & Punctuality"
              rating={ratingTimeliness}
              onChange={setRatingTimeliness}
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-1">
              Detailed Client Feedback *
            </label>
            <textarea
              rows={4}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Describe your experience: video quality, script adherence, audience engagement, conversion results..."
              className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0095f6] text-xs resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full py-3.5 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>Publishing review...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Verified Client Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
