'use client';

import React, { useState, useMemo } from 'react';
import type { Booking, BookingStatus, Deliverable } from '@/lib/types';
import { MOCK_BOOKINGS } from '@/lib/mock-data';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  RotateCcw,
  ThumbsUp,
  X,
  Package,
  ArrowRight,
  Loader2,
  Globe,
} from 'lucide-react';

interface ProjectDashboardProps {
  bookings: Booking[];
  onOpenChat: (creatorId: string) => void;
  onApproveBooking: (bookingId: string) => void;
  onRequestRevision: (bookingId: string, notes: string) => void;
}

function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(cents / 100);
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20', icon: <Clock className="w-3.5 h-3.5" /> },
  awaiting_acceptance: { label: 'Awaiting', color: 'text-amber-400', bgColor: 'bg-amber-400/10 border-amber-400/20', icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20', icon: <Loader2 className="w-3.5 h-3.5" /> },
  submitted: { label: 'Review', color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20', icon: <Eye className="w-3.5 h-3.5" /> },
  revision_requested: { label: 'Revision', color: 'text-orange-400', bgColor: 'bg-orange-400/10 border-orange-400/20', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  approved: { label: 'Approved', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10 border-emerald-400/20', icon: <ThumbsUp className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/20', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const MILESTONE_STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'pending', label: 'Submitted' },
  { key: 'awaiting_acceptance', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'submitted', label: 'Delivered' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_ORDER: BookingStatus[] = ['pending', 'awaiting_acceptance', 'in_progress', 'submitted', 'revision_requested', 'approved', 'completed'];

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  bookings,
  onOpenChat,
  onApproveBooking,
  onRequestRevision,
}) => {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revisionModalId, setRevisionModalId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const allBookings = bookings.length > 0 ? bookings : MOCK_BOOKINGS;

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return allBookings;
    return allBookings.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allBookings.length };
    allBookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  }, [allBookings]);

  const getStepIndex = (status: BookingStatus) => {
    if (status === 'cancelled') return -1;
    if (status === 'revision_requested') return 3;
    return STATUS_ORDER.indexOf(status);
  };

  const handleRevisionSubmit = (bookingId: string) => {
    if (revisionNotes.trim()) {
      onRequestRevision(bookingId, revisionNotes.trim());
      setRevisionModalId(null);
      setRevisionNotes('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 lg:pb-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{allBookings.length} total projects</p>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-3 px-3 mb-5 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[40px] ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 font-bold'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            All ({statusCounts.all || 0})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = statusCounts[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key as BookingStatus)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all min-h-[40px] flex items-center gap-1.5 ${
                  statusFilter === key
                    ? `${cfg.bgColor} ${cfg.color} border`
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                {cfg.icon}
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Bookings list */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-neutral-700 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No projects found</h3>
            <p className="text-sm text-neutral-500">Try changing the filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status];
              const isExpanded = expandedId === booking.id;
              const stepIdx = getStepIndex(booking.status);
              const daysLeft = Math.ceil((new Date(booking.deliveryDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={booking.id}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors"
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="w-full text-left p-4 flex items-start gap-3 min-h-[64px]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCfg.bgColor} ${statusCfg.color}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                        {daysLeft > 0 && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-neutral-500'}`}>
                            {daysLeft}d left
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate">{booking.briefTitle}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {booking.creatorName} · {booking.serviceTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-white">{formatPrice(booking.totalAmountCents, booking.currency)}</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-neutral-800/50 pt-4 space-y-4">
                      {/* Milestone tracker */}
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Progress</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {MILESTONE_STEPS.map((ms, i) => {
                            const isCompleted = stepIdx >= i;
                            const isCurrent = stepIdx === i;
                            return (
                              <div key={ms.key} className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                                  isCurrent
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                    : isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-neutral-800 text-neutral-600'
                                }`}>
                                  {isCompleted && !isCurrent ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <span className="text-[10px] font-bold">{i + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-neutral-600'}`}>
                                  {ms.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Brief details */}
                      <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
                        <h4 className="text-xs font-semibold text-neutral-400 mb-2">Brief</h4>
                        <p className="text-xs text-neutral-300 leading-relaxed">{booking.briefDescription}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-neutral-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due {new Date(booking.deliveryDeadline).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {booking.targetPlatform}</span>
                        </div>
                      </div>

                      {/* Deliverables */}
                      {booking.deliverables && booking.deliverables.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Deliverables</h4>
                          <div className="space-y-2">
                            {booking.deliverables.map((del) => (
                              <div key={del.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden">
                                <div className="aspect-video bg-black relative">
                                  <video
                                    src={del.videoUrl}
                                    poster={del.thumbnailUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="p-3">
                                  <p className="text-xs text-neutral-300">{del.notes}</p>
                                  <p className="text-[10px] text-neutral-500 mt-1">
                                    Version {del.versionNumber} · {new Date(del.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onOpenChat(booking.creatorId)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-medium border border-neutral-700 hover:bg-neutral-700 transition-colors min-h-[44px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat
                        </button>
                        {booking.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => onApproveBooking(booking.id)}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 min-h-[44px]"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRevisionModalId(booking.id)}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20 hover:bg-orange-500/20 transition-colors min-h-[44px]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Request Revision
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Revision modal ── */}
      {revisionModalId && (
        <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRevisionModalId(null)} />
          <div className="relative w-full lg:max-w-md lg:mx-4 bg-neutral-900 rounded-t-3xl lg:rounded-2xl border-t lg:border border-neutral-800 p-5 pb-[env(safe-area-inset-bottom)] z-10">
            <div className="flex justify-center lg:hidden mb-3">
              <div className="w-10 h-1 rounded-full bg-neutral-700" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Request Revision</h3>
              <button onClick={() => setRevisionModalId(null)} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center min-w-[44px] min-h-[44px]">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe what changes you need..."
              rows={4}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 resize-none mb-4"
            />
            <button
              onClick={() => handleRevisionSubmit(revisionModalId)}
              disabled={!revisionNotes.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm shadow-lg disabled:opacity-40 min-h-[48px] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Revision Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { ProjectDashboard };
export default ProjectDashboard;
