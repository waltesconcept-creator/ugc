'use client';

import React, { useState } from 'react';
import type { AppNotification } from '@/lib/types';
import {
  Bell,
  X,
  Heart,
  MessageCircle,
  Briefcase,
  UserPlus,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectNotification: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onMarkAllRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'bookings' | 'social'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'bookings') return n.type === 'booking' || n.type === 'deliverable';
    if (filter === 'social') return n.type === 'like' || n.type === 'comment' || n.type === 'follow';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'booking':
        return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'deliverable':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col z-10 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifications</h2>
              <p className="text-[11px] text-neutral-400">Activity & project updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              title="Mark all as read"
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-2 py-1 rounded hover:bg-neutral-900 transition-colors"
            >
              Mark read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-neutral-800/80 flex gap-2">
          {[
            { id: 'all' as const, label: 'All Activity' },
            { id: 'bookings' as const, label: 'Bookings & Pay' },
            { id: 'social' as const, label: 'Likes & Comments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 text-xs">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onSelectNotification(notif);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.isRead
                    ? 'bg-neutral-900/60 border-neutral-850 hover:border-neutral-700'
                    : 'bg-gradient-to-r from-orange-500/10 to-neutral-900 border-orange-500/30 hover:border-orange-500/60'
                }`}
              >
                {/* Actor Avatar with Type Badge */}
                <div className="relative shrink-0">
                  <img
                    src={notif.actorAvatar}
                    alt={notif.actorName}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{notif.title}</span>
                    <span className="text-[10px] text-neutral-500 shrink-0">{notif.createdAt}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-snug line-clamp-2">{notif.message}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0 self-center" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDrawer;
