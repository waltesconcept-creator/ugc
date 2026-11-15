'use client';

import React, { useState } from 'react';
import { X, Heart, Send, Sparkles } from 'lucide-react';
import type { PostComment, UserRole } from '@/lib/types';
import { DEFAULT_SAMPLE_COMMENTS } from '@/lib/mock-data';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postCaption?: string;
  creatorUsername?: string;
  currentRole?: UserRole;
  postId?: string;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  postCaption = '',
  creatorUsername = 'creator',
  currentRole = 'creator',
  postId,
}) => {
  const [comments, setComments] = useState<PostComment[]>(DEFAULT_SAMPLE_COMMENTS);
  const [inputText, setInputText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: PostComment = {
      id: `comm-${Date.now()}`,
      authorName: currentRole === 'business' ? 'LuxeGlow Brand' : currentRole === 'creator' ? 'You (Creator)' : 'You (Viewer)',
      authorUsername: currentRole === 'business' ? 'luxeglow_hq' : currentRole === 'creator' ? 'your_handle' : 'user_guest',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      authorRole: currentRole,
      text: inputText.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col shadow-2xl text-white overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">Comments</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">
                {comments.length}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              On @{creatorUsername}'s video
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Caption snippet */}
        <div className="px-4 py-2.5 bg-neutral-950/60 border-b border-neutral-800/60 text-xs text-neutral-300 line-clamp-1 italic">
          "{postCaption}"
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-neutral-800/40">
          {comments.map((comm) => {
            const isLiked = likedCommentIds.includes(comm.id);
            return (
              <div key={comm.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <img
                    src={comm.authorAvatar}
                    alt={comm.authorName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-white">
                        {comm.authorName}
                      </span>
                      {comm.authorRole === 'business' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                          Brand
                        </span>
                      )}
                      {comm.authorRole === 'creator' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          Creator
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500">{comm.createdAt}</span>
                    </div>

                    <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
                      {comm.text}
                    </p>
                  </div>
                </div>

                {/* Like comment button */}
                <button
                  onClick={() => handleToggleLike(comm.id)}
                  className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-orange-500 pt-1 shrink-0"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isLiked ? 'fill-orange-500 text-orange-500' : 'text-neutral-500'
                    }`}
                  />
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {comm.likesCount + (isLiked ? 1 : 0)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Add a public comment as ${currentRole}...`}
            className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-40 shadow-md shadow-orange-500/25 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
