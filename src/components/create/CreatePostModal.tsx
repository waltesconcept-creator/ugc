'use client';

import React, { useState, useRef } from 'react';
import type { Post, Story, Profile } from '@/lib/types';
import { SAMPLE_VIDEOS, MOCK_CATEGORIES, MOCK_PROFILES } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
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
  FolderOpen,
  AlertCircle,
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
  const { currentUser, openAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createType, setCreateType] = useState<'post' | 'story'>('post');
  const [sourceMode, setSourceMode] = useState<'upload' | 'preset'>('upload');
  const [mediaType, setMediaType] = useState<'video' | 'photo'>('video');

  // Real uploaded file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');

  // Preset fallback
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(SAMPLE_VIDEOS[0]);
  const [selectedThumbnailUrl, setSelectedThumbnailUrl] = useState(SAMPLE_POST_THUMBNAILS[0]);

  // Form inputs
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(MOCK_CATEGORIES[0]?.name || 'Beauty & Skincare');
  const [contentFormat, setContentFormat] = useState(FORMAT_OPTIONS[0]);
  const [isPortfolioPinned, setIsPortfolioPinned] = useState(true);

  // Status
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Author priority: Logged in real user -> Passed creator -> Default seeded
  const author: Profile = currentUser?.profile || currentCreator || MOCK_PROFILES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const isImg = file.type.startsWith('image/');
    setMediaType(isImg ? 'photo' : 'video');

    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
    setErrorMessage('');
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsUploading(true);

    try {
      let finalMediaUrl = selectedVideoUrl;
      let finalThumbnailUrl = selectedThumbnailUrl;
      let detectedMediaType = mediaType;

      // 1. If user uploaded a real file from phone/PC, upload it to /api/upload
      if (sourceMode === 'upload' && selectedFile) {
        setStatusMessage('Uploading video/picture to server...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload media file');
        }

        finalMediaUrl = uploadData.url;
        detectedMediaType = uploadData.mediaType || mediaType;
        // For photos, thumbnail is the photo itself; for video, default to preview or preset
        finalThumbnailUrl = detectedMediaType === 'photo' ? uploadData.url : selectedThumbnailUrl;
      }

      setStatusMessage('Saving post to KRE8TOR network...');

      if (createType === 'story') {
        const newStory: Story = {
          id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          creatorId: author.id,
          creatorName: author.displayName,
          creatorUsername: author.username,
          creatorAvatar: author.avatarUrl,
          thumbnailUrl: finalThumbnailUrl,
          mediaUrl: finalMediaUrl,
          mediaType: detectedMediaType,
          caption: caption || 'Daily behind-the-scenes update ✨',
          hasUnseenStory: true,
          createdAt: 'Just now',
        };

        // Persist to server API
        await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStory),
        }).catch((err) => console.warn('Server story sync error:', err));

        onPublishStory(newStory);
      } else {
        const newPost: Post = {
          id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          creatorId: author.id,
          creator: author,
          videoUrl: finalMediaUrl,
          thumbnailUrl: finalThumbnailUrl,
          caption: caption || 'Fresh UGC showcase piece produced for brand portfolio! 🔥✨ #ugccreator #ugc',
          category: category,
          contentFormat: contentFormat,
          durationSeconds: 24,
          viewsCount: 1,
          likesCount: 0,
          savesCount: 0,
          sharesCount: 0,
          commentsCount: 0,
          mediaType: detectedMediaType,
          isLiked: false,
          isSaved: false,
          isPortfolioPinned: isPortfolioPinned,
          createdAt: new Date().toISOString(),
        };

        // Persist to server API
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        }).catch((err) => console.warn('Server post sync error:', err));

        onPublishPost(newPost);
      }

      setIsUploading(false);
      onClose();
    } catch (err: any) {
      console.error('Publishing failed:', err);
      setErrorMessage(err?.message || 'Failed to publish. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create & Upload Content</h2>
              <p className="text-[11px] text-neutral-400">
                Publishing as <span className="text-orange-400 font-bold">@{author.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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

          {/* Source Picker: Phone/PC Upload vs Preset Library */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                sourceMode === 'upload'
                  ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video / Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceMode('preset')}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                sourceMode === 'preset'
                  ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>UGC Presets</span>
            </button>
          </div>

          {/* 1. Real Upload Mode */}
          {sourceMode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-neutral-700 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-neutral-900/60 group"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 group-hover:text-orange-400 text-neutral-400 flex items-center justify-center transition-colors mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-orange-400">
                    Tap to select video or picture from your phone
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-1">
                    Supports MP4, MOV, WebM, JPEG, PNG, WebP
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-3">
                  <div className="flex items-center gap-3">
                    {/* Media Thumbnail / Video Preview */}
                    <div className="w-16 h-20 rounded-xl bg-black overflow-hidden relative shrink-0">
                      {mediaType === 'video' ? (
                        <video
                          src={filePreviewUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={filePreviewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase">
                          {mediaType}
                        </span>
                        <span className="text-[11px] text-neutral-400 truncate">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreviewUrl('');
                        }}
                        className="text-[11px] text-orange-400 hover:underline mt-1 font-semibold block"
                      >
                        Change file
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Preset Library Mode */}
          {sourceMode === 'preset' && (
            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                Select Creative Footage Preset:
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
          )}

          {/* Caption Field */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
              Caption & Creative Hook:
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell brands what makes this UGC piece convert (hook, angle, product problem & solution)..."
              className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category & Format (Post Only) */}
          {createType === 'post' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
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
                <label className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                  UGC Format:
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
                <span className="text-[11px] text-neutral-400">
                  Feature this on your profile when brands view your service rate card
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading || (sourceMode === 'upload' && !selectedFile)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <span>{statusMessage || 'Publishing to KRE8TOR...'}</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    Publish {createType === 'post' ? 'UGC Feed Reel' : 'Creator Story'}
                  </span>
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
