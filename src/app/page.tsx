'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { VideoFeed } from '@/components/feed/VideoFeed';
import { ExploreView } from '@/components/explore/ExploreView';
import { CreatorProfileView } from '@/components/creator/CreatorProfileView';
import { BookingModal } from '@/components/booking/BookingModal';
import { ProjectDashboard } from '@/components/booking/ProjectDashboard';
import { ChatView } from '@/components/messaging/ChatView';
import { CreatorOnboardingView } from '@/components/onboarding/CreatorOnboardingView';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { MOCK_POSTS, MOCK_CREATORS, MOCK_BOOKINGS } from '@/lib/mock-data';
import { Post, ServicePackage, Booking, UserRole } from '@/lib/types';

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
    setActiveTab('creator_profile');
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
    setBookings(prev => [newBooking, ...prev]);
    setActiveTab('bookings');
  };

  // Chat launcher
  const handleStartChat = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveTab('messages');
  };

  // Approve deliverable
  const handleApproveBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
  };

  // Request revision
  const handleRequestRevision = (bookingId: string, notes: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'revision_requested' } : b))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none selection:bg-rose-500 selection:text-white">
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
        {activeTab === 'feed' && (
          <VideoFeed
            posts={MOCK_POSTS}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            onSelectPost={handleSelectPost}
            onOpenProfile={handleOpenProfile}
          />
        )}

        {activeTab === 'creator_profile' && (
          <CreatorProfileView
            creatorId={selectedCreatorId}
            onSelectPost={handleSelectPost}
            onBookService={handleBookService}
            onStartChat={handleStartChat}
          />
        )}

        {activeTab === 'bookings' && (
          <ProjectDashboard
            bookings={bookings}
            onOpenChat={handleStartChat}
            onApproveBooking={handleApproveBooking}
            onRequestRevision={handleRequestRevision}
          />
        )}

        {activeTab === 'messages' && (
          <ChatView
            activeCreatorId={selectedCreatorId}
            onOpenProject={() => setActiveTab('bookings')}
          />
        )}

        {activeTab === 'creator_onboard' && (
          <CreatorOnboardingView
            onComplete={() => {
              setActiveTab('creator_profile');
            }}
          />
        )}

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
