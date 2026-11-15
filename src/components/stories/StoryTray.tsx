'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { Story } from '@/lib/types';
import { StoryModal } from './StoryModal';
import { useAuth } from '@/context/AuthContext';

interface StoryTrayProps {
  stories: Story[];
  onOpenProfile: (creatorId: string) => void;
  onStartChat: (creatorId: string) => void;
  onCreateStory?: () => void;
}

export const StoryTray: React.FC<StoryTrayProps> = ({
  stories,
  onOpenProfile,
  onStartChat,
  onCreateStory,
}) => {
  const { currentUser } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  return (
    <>
      <div className="w-full bg-neutral-950/95 border-b border-neutral-850 px-3 sm:px-4 py-1.5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Stories & BTS
            </span>
            <span className="text-[9px] text-orange-400 font-semibold cursor-pointer hover:underline">
              Daily Updates
            </span>
          </div>

          {/* Horizontal Story Carousel (Compact Curved Rectangular Boxes) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-0.5 pt-0.5">
            {/* 1. Add Story Box */}
            <div
              onClick={onCreateStory}
              className="group relative w-[58px] h-[82px] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-dashed border-neutral-700 hover:border-orange-500 cursor-pointer transition-all flex flex-col items-center justify-between p-1.5 shadow-sm"
            >
              <div className="w-full flex justify-end">
                <span className="text-[8px] px-1 rounded bg-orange-500/20 text-orange-400 font-extrabold leading-none py-0.5">YOU</span>
              </div>

              <div className="relative">
                {currentUser?.profile?.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={currentUser.profile.avatarUrl}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-orange-500"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-orange-500 text-white flex items-center justify-center text-[8px] font-bold shadow">
                      +
                    </div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <span className="text-[9px] font-semibold text-neutral-300 group-hover:text-white text-center leading-tight">
                Add BTS
              </span>
            </div>

            {/* 2. Creator Curved Boxes */}
            {stories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setSelectedStoryIndex(idx)}
                className={`group relative w-[58px] h-[82px] shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all transform hover:scale-[1.03] active:scale-95 shadow-md ${
                  story.hasUnseenStory
                    ? 'p-[1.5px] bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-orange-500/20'
                    : 'border border-neutral-800'
                }`}
              >
                {/* Inner Card Container */}
                <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-neutral-900">
                  {/* Background Story Preview */}
                  <img
                    src={story.thumbnailUrl}
                    alt={story.creatorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

                  {/* Top Creator Mini Avatar */}
                  <div className="absolute top-1 left-1 z-10">
                    <img
                      src={story.creatorAvatar}
                      alt={story.creatorName}
                      className="w-5 h-5 rounded-md object-cover ring-1 ring-orange-500 shadow-sm"
                    />
                  </div>

                  {/* Bottom Creator First Name */}
                  <div className="absolute bottom-1 left-1 right-1 z-10 text-center">
                    <span className="text-[9px] font-bold text-white drop-shadow-md truncate block">
                      {story.creatorName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          isOpen={selectedStoryIndex !== null}
          onClose={() => setSelectedStoryIndex(null)}
          onOpenProfile={onOpenProfile}
          onStartChat={onStartChat}
        />
      )}
    </>
  );
};
