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
import { Users, Sparkles } from 'lucide-react';

export default function Home() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('creator-1');

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

  // When a user registers or logs in, sync role and select their profile
  useEffect(() => {
    if (currentUser?.profile?.id) {
      setSelectedCreatorId(currentUser.profile.id);
      if (currentUser.role) {
        setCurrentRole(currentUser.role as UserRole);
      }
    }
  }, [currentUser]);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

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
      if (notif.creatorId) setSelectedCreatorId(notif.creatorId);
      setActiveTab(notif.targetTab);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const activeCreatorProfile =
    MOCK_PROFILES.find((p) => p.id === selectedCreatorId) || MOCK_PROFILES[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar with Role Simulator & Notifications */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
            {/* Quick Creator Account Switcher Bar (allows testing all 16 international creators + your real profile!) */}
            <div className="w-full bg-neutral-900/80 border-b border-neutral-800 px-3 sm:px-6 py-2 flex items-center justify-between text-xs sticky top-14 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-neutral-400 font-medium hidden sm:inline">Inspect Creator:</span>
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {currentUser && (
                    <option value={currentUser.profile.id}>
                      ★ {currentUser.profile.displayName} (@{currentUser.profile.username}) [YOUR PROFILE]
                    </option>
                  )}
                  {MOCK_CREATORS.map((c) => (
                    <option key={c.profile.id} value={c.profile.id}>
                      {c.profile.displayName} (@{c.profile.username}) · {c.details.categories[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-orange-400 font-bold hidden sm:inline">
                  {currentUser ? 'Your Account Active' : '16 Creators Loaded'}
                </span>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[11px] font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Upload Content</span>
                </button>
              </div>
            </div>

            {/* Profile View Component */}
            <CreatorProfileView
              creatorId={selectedCreatorId}
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
