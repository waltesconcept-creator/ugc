'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { Story } from '@/lib/types';
import { StoryModal } from './StoryModal';

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
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  return (
    <>
      <div className="w-full bg-neutral-950/95 border-b border-neutral-850 px-3 sm:px-4 py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Creator Stories & BTS
            </span>
            <span className="text-[10px] text-orange-400 font-semibold cursor-pointer hover:underline">
              Daily Updates
            </span>
          </div>

          {/* Horizontal Story Carousel (Original Curved Rectangular Boxes) */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 pt-0.5">
            {/* 1. Add Story Box */}
            <div
              onClick={onCreateStory}
              className="group relative w-[72px] h-[100px] shrink-0 rounded-2xl overflow-hidden bg-neutral-900 border border-dashed border-neutral-700 hover:border-orange-500 cursor-pointer transition-all flex flex-col items-center justify-between p-2 shadow-sm"
            >
              <div className="w-full flex justify-end">
                <span className="text-[9px] px-1 rounded bg-orange-500/20 text-orange-400 font-bold">YOU</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>

              <span className="text-[10px] font-semibold text-neutral-300 group-hover:text-white text-center leading-tight">
                Add Story
              </span>
            </div>

            {/* 2. Creator Curved Boxes */}
            {stories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setSelectedStoryIndex(idx)}
                className={`group relative w-[74px] h-[102px] shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all transform hover:scale-[1.03] active:scale-95 shadow-md ${
                  story.hasUnseenStory
                    ? 'p-[2px] bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-orange-500/20'
                    : 'border border-neutral-800'
                }`}
              >
                {/* Inner Card Container */}
                <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-neutral-900">
                  {/* Background Story Preview */}
                  <img
                    src={story.thumbnailUrl}
                    alt={story.creatorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

                  {/* Top Creator Mini Avatar (Curved Rounded Rect) */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <img
                      src={story.creatorAvatar}
                      alt={story.creatorName}
                      className="w-6 h-6 rounded-lg object-cover ring-1.5 ring-orange-500 shadow-sm"
                    />
                  </div>

                  {/* Bottom Creator First Name */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 text-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md truncate block">
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
