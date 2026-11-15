'use client';

import React, { useState } from 'react';
import type { Post, Story, Profile } from '@/lib/types';
import { SAMPLE_VIDEOS, MOCK_CATEGORIES, MOCK_PROFILES } from '@/lib/mock-data';
import {
  X,
  Upload,
  Video,
  Camera,
  Sparkles,
  Check,
  Film,
  Plus,
  Play,
  Bookmark,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishPost: (newPost: Post) => void;
  onPublishStory: (newStory: Story) => void;
  currentCreator?: Profile;
}

const SAMPLE_POST_THUMBNAILS = [
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=1200&fit=crop',
];

const FORMAT_OPTIONS = [
  'UGC Ad',
  'Product Review',
  'Unboxing',
  'Tutorial & Demo',
  'Testimonial',
  'Lifestyle Aesthetic',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPublishPost,
  onPublishStory,
  currentCreator,
}) => {
  const [createType, setCreateType] = useState<'post' | 'story'>('post');
  const [mediaType, setMediaType] = useState<'video' | 'photo'>('video');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(SAMPLE_VIDEOS[0]);
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState(SAMPLE_POST_THUMBNAILS[0]);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(MOCK_CATEGORIES[0]?.name || 'Beauty & Skincare');
  const [contentFormat, setContentFormat] = useState(FORMAT_OPTIONS[0]);
  const [isPortfolioPinned, setIsPortfolioPinned] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const author = currentCreator || MOCK_PROFILES[0];

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    setTimeout(() => {
      if (createType === 'story') {
        const newStory: Story = {
          id: `story-${Date.now()}`,
          creatorId: author.id,
          creatorName: author.displayName,
          creatorUsername: author.username,
          creatorAvatar: author.avatarUrl,
          thumbnailUrl: selectedThumbnailUrl,
          mediaUrl: selectedVideoUrl,
          mediaType: mediaType,
          caption: caption || 'Daily behind-the-scenes UGC update ✨',
          hasUnseenStory: true,
          createdAt: 'Just now',
        };
        onPublishStory(newStory);
      } else {
        const newPost: Post = {
          id: `post-${Date.now()}`,
          creatorId: author.id,
          creator: author,
          videoUrl: selectedVideoUrl,
          thumbnailUrl: selectedThumbnailUrl,
          caption: caption || 'Fresh UGC showcase piece produced for brand portfolio! 🔥✨ #ugccreator #ugc',
          category: category,
          contentFormat: contentFormat,
          durationSeconds: 24,
          viewsCount: 1,
          likesCount: 0,
          savesCount: 0,
          sharesCount: 0,
          commentsCount: 0,
          mediaType: mediaType,
          isLiked: false,
          isSaved: false,
          isPortfolioPinned: isPortfolioPinned,
          createdAt: new Date().toISOString(),
        };
        onPublishPost(newPost);
      }

      setIsPublishing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Content</h2>
              <p className="text-[11px] text-neutral-400">Publish to discovery feed & creator portfolio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Post vs Story Selector */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setCreateType('post')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                createType === 'post'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Feed Post / Reel</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateType('story')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                createType === 'story'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator Story</span>
            </button>
          </div>

          {/* Media Format Picker (Video vs High-Res Photo) */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Select Media Format:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mediaType === 'video'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>9:16 Video Clip</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType('photo')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mediaType === 'photo'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo Showcase</span>
              </button>
            </div>
          </div>

          {/* Media Preview & Sample Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Choose Sample Footage / Clip:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_POST_THUMBNAILS.slice(0, 3).map((thumb, idx) => (
                <div
                  key={thumb}
                  onClick={() => {
                    setSelectedThumbnailUrl(thumb);
                    setSelectedVideoUrl(SAMPLE_VIDEOS[idx % SAMPLE_VIDEOS.length]);
                  }}
                  className={`relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedThumbnailUrl === thumb
                      ? 'border-orange-500 scale-[1.02] shadow-lg shadow-orange-500/30'
                      : 'border-neutral-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                  {selectedThumbnailUrl === thumb && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Caption Field */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Caption & Hashtags:
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your UGC piece, hook, product featured, and creative angle..."
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category & Content Format (Post only) */}
          {createType === 'post' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Content Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Format Type:
                </label>
                <select
                  value={contentFormat}
                  onChange={(e) => setContentFormat(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Pin to Portfolio Checkbox */}
          {createType === 'post' && (
            <div
              onClick={() => setIsPortfolioPinned(!isPortfolioPinned)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                  isPortfolioPinned ? 'bg-orange-500 text-white' : 'border border-neutral-700'
                }`}
              >
                {isPortfolioPinned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Pin to Creator Portfolio & Rates</span>
                <span className="text-[11px] text-neutral-400">Showcase this piece to brands viewing your rate cards</span>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <span>Publishing to Network...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish {createType === 'post' ? 'UGC Post' : 'Creator Story'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
