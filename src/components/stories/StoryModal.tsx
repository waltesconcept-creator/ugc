'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, User, MessageCircle } from 'lucide-react';
import type { Story } from '@/lib/types';

interface StoryModalProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: (creatorId: string) => void;
  onStartChat: (creatorId: string) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onOpenProfile,
  onStartChat,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Auto-progress timer for stories (6 seconds per story)
  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const interval = 50; // ms
    const step = (interval / 6000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, onClose]);

  if (!isOpen || !stories[currentIndex]) return null;

  const story = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center animate-fade-in select-none">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl scale-125 pointer-events-none"
        style={{
          backgroundImage: `url(${story.thumbnailUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Main Story Container: Centered 9:16 portrait on desktop, full screen on mobile */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[90vh] sm:max-h-[820px] sm:rounded-3xl overflow-hidden bg-black flex flex-col shadow-2xl border-0 sm:border sm:border-neutral-800">
        
        {/* Progress Bar Header */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Creator Header Info */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
          <div
            onClick={() => {
              onClose();
              onOpenProfile(story.creatorId);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-md">
              <img
                src={story.creatorAvatar}
                alt={story.creatorName}
                className="w-full h-full rounded-[10px] object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors">
                  @{story.creatorUsername}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">
                  UGC
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">{story.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-300" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {story.mediaType === 'video' ? (
            <video
              src={story.mediaUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={story.thumbnailUrl}
              alt={story.caption}
              className="w-full h-full object-cover"
            />
          )}

          {/* Left / Right Tap zones */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
          />
        </div>

        {/* Bottom Story Caption & Actions */}
        <div className="absolute bottom-4 left-3 right-3 z-30 space-y-3">
          <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed drop-shadow-md bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            {story.caption}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartChat(story.creatorId);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-orange-400" />
              Reply to Story
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenProfile(story.creatorId);
              }}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/30 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Prev/Next Buttons */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-900/80 border border-neutral-700 text-white items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === stories.length - 1}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-neutral-900/80 border border-neutral-700 text-white items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
