export type UserRole = 'creator' | 'business' | 'admin' | 'guest';

export interface Profile {
  id: string;
  role: UserRole;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  location: string;
  country: string;
  website?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CreatorDetails {
  creatorId: string;
  categories: string[];
  contentFormats: string[];
  languages: string[];
  instagramHandle?: string;
  instagramFollowers?: number;
  tiktokHandle?: string;
  tiktokFollowers?: number;
  youtubeHandle?: string;
  youtubeSubscribers?: number;
  totalSocialViews?: number;
  ratingAvg: number;
  ratingCount: number;
  completedProjectsCount: number;
  onTimeDeliveryRate: number;
  repeatBookingRate?: number;
  qualityScore?: number;
  communicationScore?: number;
  timelinessScore?: number;
  verifiedTransactionsCount?: number;
  isAvailable: boolean;
  startingPriceCents: number;
}

export interface BusinessDetails {
  businessId: string;
  companyName: string;
  industry: string;
  teamSize?: string;
  logoUrl: string;
  companyWebsite: string;
  verified: boolean;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  likesCount: number;
}

export interface Story {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  thumbnailUrl: string;
  mediaUrl: string;
  mediaType: 'video' | 'photo';
  caption: string;
  hasUnseenStory: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  creatorId: string;
  creator: Profile;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  category: string;
  contentFormat: string;
  durationSeconds: number;
  viewsCount: number;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  commentsCount?: number;
  comments?: PostComment[];
  mediaType?: 'video' | 'photo';
  photoUrls?: string[];
  isLiked?: boolean;
  isSaved?: boolean;
  isPortfolioPinned?: boolean;
  isSponsored?: boolean;
  createdAt: string;
}

export interface ServicePackage {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  deliveryDays: number;
  revisionsAllowed: number;
  formatTag: string;
  isActive: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'awaiting_acceptance'
  | 'in_progress'
  | 'submitted'
  | 'revision_requested'
  | 'approved'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  businessId: string;
  businessName: string;
  creatorId: string;
  creatorName: string;
  serviceId?: string;
  serviceTitle: string;
  briefTitle: string;
  briefDescription: string;
  targetPlatform: string;
  referenceUrls: string[];
  totalAmountCents: number;
  currency: string;
  status: BookingStatus;
  deliveryDeadline: string;
  deliverables?: Deliverable[];
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  bookingId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  notes: string;
  versionNumber: number;
  createdAt: string;
}

export interface Review {
  id: string;
  creatorId?: string;
  bookingId: string;
  projectTitle?: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: 'business' | 'creator';
  overallRating: number;
  ratingQuality: number;
  ratingCommunication: number;
  ratingTimeliness: number;
  reviewText: string;
  isVerifiedBooking: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingContextId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  videoCount: number;
}

export type NotificationType = 'like' | 'comment' | 'booking' | 'follow' | 'deliverable' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName: string;
  actorAvatar: string;
  targetTab?: string;
  creatorId?: string;
  isRead: boolean;
  createdAt: string;
}

export type InteractionSignalType =
  | 'watch_start'
  | 'watch_complete'
  | 'replay'
  | 'like'
  | 'save'
  | 'share'
  | 'comment'
  | 'profile_visit'
  | 'skip_fast'
  | 'not_interested';

export interface UserInteraction {
  postId: string;
  creatorId: string;
  category: string;
  signal: InteractionSignalType;
  watchDurationSeconds?: number;
  timestamp: number;
}

