'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/navigation/Navbar';
import { HomeFeedView } from '@/components/feed/HomeFeedView';
import { ExploreView } from '@/components/explore/ExploreView';
import { CreatorProfileView } from '@/components/creator/CreatorProfileView';
import { BookingModal } from '@/components/booking/BookingModal';
import { ProjectDashboard } from '@/components/booking/ProjectDashboard';
import { ChatView } from '@/components/messaging/ChatView';
import { CreatorOnboardingView } from '@/components/onboarding/CreatorOnboardingView';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';
import { CreatePostModal } from '@/components/create/CreatePostModal';
import {
  MOCK_POSTS,
  MOCK_CREATORS,
  MOCK_BOOKINGS,
  MOCK_STORIES,
  MOCK_NOTIFICATIONS,
  MOCK_PROFILES,
} from '@/lib/mock-data';
import { Post, Story, ServicePackage, Booking, UserRole, AppNotification } from '@/lib/types';
import { ArrowLeft, Sparkles, LogIn } from 'lucide-react';

export default function Home() {
  const { currentUser, openAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [viewingOtherCreatorId, setViewingOtherCreatorId] = useState<string | null>(null);
  const [activeChatCreatorId, setActiveChatCreatorId] = useState<string>('creator-1');

  // Dynamic Content State
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  // Modals & Drawers
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [bookingCreatorName, setBookingCreatorName] = useState<string>('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Live Server Database Synchronization
  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        if (data?.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        }
      })
      .catch((e) => console.warn('Could not fetch server posts:', e));

    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => {
        if (data?.stories && Array.isArray(data.stories) && data.stories.length > 0) {
          setStories(data.stories);
        }
      })
      .catch((e) => console.warn('Could not fetch server stories:', e));
  }, []);

  // When a user registers or logs in, sync role
  useEffect(() => {
    if (currentUser?.role) {
      setCurrentRole(currentUser.role as UserRole);
    }
  }, [currentUser]);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Handle navigation tab changes
  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      setViewingOtherCreatorId(null);
    }
    setActiveTab(tab);
  };

  // Handle open another creator's profile from Feed or Explore
  const handleOpenProfile = (creatorId: string) => {
    setViewingOtherCreatorId(creatorId);
    setActiveTab('profile');
  };

  // Handle selecting a post to watch from explore or portfolio
  const handleSelectPost = (post: Post) => {
    setActiveTab('feed');
  };

  // Handle booking request
  const handleBookService = (service: ServicePackage, creatorId: string) => {
    setSelectedService(service);
    const creator = MOCK_CREATORS.find((c) => c.profile.id === creatorId);
    setBookingCreatorName(creator?.profile.displayName || 'Creator');
    setIsBookingModalOpen(true);
  };

  // Confirm new booking
  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Also push a notification
    const bookingNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Project initiated for "${newBooking.briefTitle}" with ${newBooking.creatorName}`,
      actorName: newBooking.creatorName,
      actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      targetTab: 'projects',
      isRead: false,
      createdAt: 'Just now',
    };
    setNotifications((prev) => [bookingNotif, ...prev]);
    setActiveTab('projects');
  };

  // Chat launcher
  const handleStartChat = (creatorId: string) => {
    setActiveChatCreatorId(creatorId);
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

  // Publishing new content
  const handlePublishPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setActiveTab('feed');
  };

  const handlePublishStory = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveTab('feed');
  };

  // Notifications handlers
  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.targetTab) {
      if (notif.creatorId) {
        setActiveChatCreatorId(notif.creatorId);
        setViewingOtherCreatorId(notif.creatorId);
      }
      setActiveTab(notif.targetTab);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const activeCreatorProfile =
    currentUser?.profile ||
    (viewingOtherCreatorId
      ? MOCK_PROFILES.find((p) => p.id === viewingOtherCreatorId)
      : null) ||
    MOCK_PROFILES[0];

  const activeTargetProfileId =
    viewingOtherCreatorId ||
    currentUser?.profile?.id ||
    MOCK_CREATORS[0]?.profile?.id;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar with Role Simulator & Notifications */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-1 w-full flex flex-col">
        {/* Tab: Feed (Integrated HomeFeedView with Natural-Scroll Stories & Dual-Modes) */}
        {activeTab === 'feed' && (
          <HomeFeedView
            posts={posts}
            stories={stories}
            onOpenProfile={handleOpenProfile}
            onStartChat={handleStartChat}
            onCreateStory={() => setIsCreateModalOpen(true)}
          />
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
            {/* 1. If viewing another creator's profile: show clean "Back to Feed" banner */}
            {viewingOtherCreatorId && (
              <div className="w-full bg-neutral-900/90 border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between sticky top-14 z-20 backdrop-blur-md">
                <button
                  onClick={() => {
                    setViewingOtherCreatorId(null);
                    setActiveTab('feed');
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white group"
                >
                  <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Feed</span>
                </button>

                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Creator Profile
                </span>
              </div>
            )}

            {/* 2. If NOT logged in and on the Profile tab: show clean Creator Sign Up invitation */}
            {!currentUser && !viewingOtherCreatorId && (
              <div className="bg-gradient-to-r from-orange-500/15 via-neutral-900 to-amber-500/15 border-b border-orange-500/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-14 z-20 backdrop-blur-md">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Launch Your Creator Profile on KRE8TOR</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Sign up with your phone number or email to showcase your portfolio and receive brand bookings.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openAuth('register')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-center"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => openAuth('login')}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-all text-center"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Profile View Component */}
            <CreatorProfileView
              creatorId={activeTargetProfileId}
              posts={posts}
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
            activeCreatorId={activeChatCreatorId}
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

      {/* Slide-Over / Slide-Up Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Quick Create Post / Story Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPublishPost={handlePublishPost}
        onPublishStory={handlePublishStory}
        currentCreator={activeCreatorProfile}
      />
    </div>
  );
}
