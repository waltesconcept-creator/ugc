'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { VideoFeed } from '@/components/feed/VideoFeed';
import { StoryTray } from '@/components/stories/StoryTray';
import { ExploreView } from '@/components/explore/ExploreView';
import { CreatorProfileView } from '@/components/creator/CreatorProfileView';
import { BookingModal } from '@/components/booking/BookingModal';
import { ProjectDashboard } from '@/components/booking/ProjectDashboard';
import { ChatView } from '@/components/messaging/ChatView';
import { CreatorOnboardingView } from '@/components/onboarding/CreatorOnboardingView';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { MOCK_POSTS, MOCK_CREATORS, MOCK_BOOKINGS, MOCK_STORIES } from '@/lib/mock-data';
import { Post, ServicePackage, Booking, UserRole } from '@/lib/types';
import { Users, ChevronDown } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('creator-1');
  
  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [bookingCreatorName, setBookingCreatorName] = useState<string>('');

  // Handle open creator profile
  const handleOpenProfile = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveTab('profile');
  };

  // Handle selecting a post to watch from explore or portfolio
  const handleSelectPost = (post: Post) => {
    setSelectedCreatorId(post.creatorId);
    setActiveTab('feed');
  };

  // Handle booking request
  const handleBookService = (service: ServicePackage, creatorId: string) => {
    setSelectedService(service);
    const creator = MOCK_CREATORS.find((c: (typeof MOCK_CREATORS)[number]) => c.profile.id === creatorId);
    setBookingCreatorName(creator?.profile.displayName || 'Creator');
    setIsBookingModalOpen(true);
  };

  // Confirm new booking
  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveTab('projects');
  };

  // Chat launcher
  const handleStartChat = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveTab('messages');
  };

  // Approve deliverable
  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
  };

  // Request revision
  const handleRequestRevision = (bookingId: string, notes: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'revision_requested' } : b))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar with Role Simulator */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        unreadCount={1}
      />

      {/* Main Screen Router */}
      <main className="flex-1 w-full flex flex-col">
        {/* Tab: Feed (with Curved Box Stories Tray at top!) */}
        {activeTab === 'feed' && (
          <div className="flex-1 flex flex-col w-full">
            {/* Curved Box Story Carousel */}
            <StoryTray
              stories={MOCK_STORIES}
              onOpenProfile={handleOpenProfile}
              onStartChat={handleStartChat}
              onCreateStory={() => setActiveTab('create')}
            />

            {/* Vertical Video Reel Player */}
            <div className="flex-1 w-full">
              <VideoFeed
                posts={MOCK_POSTS}
                onOpenProfile={handleOpenProfile}
              />
            </div>
          </div>
        )}

        {/* Tab: Explore */}
        {activeTab === 'explore' && (
          <ExploreView
            onSelectPost={handleSelectPost}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {/* Tab: Profile (matches both 'profile' and 'creator_profile') */}
        {(activeTab === 'profile' || activeTab === 'creator_profile') && (
          <div className="flex-1 flex flex-col w-full">
            {/* Quick Creator Account Switcher Bar (allows testing all 16 creators!) */}
            <div className="w-full bg-neutral-900/70 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-neutral-400 font-medium hidden sm:inline">Viewing Creator:</span>
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {MOCK_CREATORS.map((c) => (
                    <option key={c.profile.id} value={c.profile.id}>
                      {c.profile.displayName} (@{c.profile.username}) · {c.details.categories[0]}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] text-orange-400 font-semibold">
                16 Creator Profiles Loaded
              </span>
            </div>

            {/* Profile View Component */}
            <CreatorProfileView
              creatorId={selectedCreatorId}
              onSelectPost={handleSelectPost}
              onBookService={handleBookService}
              onStartChat={handleStartChat}
            />
          </div>
        )}

        {/* Tab: Projects / Bookings (matches both 'projects' and 'bookings') */}
        {(activeTab === 'projects' || activeTab === 'bookings') && (
          <ProjectDashboard
            bookings={bookings}
            onOpenChat={handleStartChat}
            onApproveBooking={handleApproveBooking}
            onRequestRevision={handleRequestRevision}
          />
        )}

        {/* Tab: Messages */}
        {activeTab === 'messages' && (
          <ChatView
            activeCreatorId={selectedCreatorId}
            onOpenProject={() => setActiveTab('projects')}
          />
        )}

        {/* Tab: Create / Onboard (matches both 'create' and 'creator_onboard') */}
        {(activeTab === 'create' || activeTab === 'creator_onboard') && (
          <CreatorOnboardingView
            onComplete={() => {
              setActiveTab('profile');
            }}
          />
        )}

        {/* Tab: Admin */}
        {activeTab === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Booking Checkout Modal */}
      {isBookingModalOpen && selectedService && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          service={selectedService}
          creatorName={bookingCreatorName}
          onConfirmBooking={handleConfirmBooking}
        />
      )}
    </div>
  );
}
