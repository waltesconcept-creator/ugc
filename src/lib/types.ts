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
  taggedProductId?: string;
  taggedProduct?: TaggedProductRef;
  createdAt: string;
}

export interface TaggedProductRef {
  id: string;
  title: string;
  priceNaira: number;
  commissionPercent?: number;
  brandName?: string;
  imageUrl?: string;
  affiliateCode?: string;
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

// ───── SOCIAL COMMERCE & AFFILIATE SYSTEM ─────

export interface Product {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  title: string;
  description: string;
  priceNaira: number;
  compareAtPriceNaira?: number;
  mediaUrls: string[];
  category: string;
  stockCount: number;
  isAvailable: boolean;
  sampleAvailable: boolean;
  deliveryInfo: string;
  commissionPercent: number; // default campaign commission %
  createdAt: string;
}

export interface AffiliateCampaign {
  id: string;
  productId: string;
  product: Product;
  businessId: string;
  businessName: string;
  commissionPercent: number;
  commissionAmountNaira: number;
  sampleRequiresApproval: boolean;
  sampleStock: number;
  terms: string;
  active: boolean;
  totalCreatorsCount: number;
  totalSalesCount: number;
  totalRevenueNaira: number;
  createdAt: string;
}

export interface CreatorApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  status: 'pending' | 'approved' | 'rejected';
  sampleRequested: boolean;
  sampleStatus?: 'none' | 'processing' | 'shipped' | 'delivered';
  affiliateCode?: string;
  appliedAt: string;
  notes?: string;
}

export interface AffiliateLink {
  id: string;
  code: string; // e.g. "GLOW-SARAH"
  campaignId: string;
  productId: string;
  creatorId: string;
  totalClicks: number;
  totalOrders: number;
  totalCommissionNaira: number;
  createdAt: string;
}

export interface CommerceOrder {
  id: string;
  productId: string;
  productTitle: string;
  businessId: string;
  businessName: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  creatorId?: string;
  creatorName?: string;
  affiliateCode?: string;
  unitPriceNaira: number;
  quantity: number;
  totalAmountNaira: number;
  commissionEarnedNaira: number;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'booking_payout' | 'affiliate_commission' | 'withdrawal' | 'platform_fee';
  amountNaira: number;
  title: string;
  description: string;
  status: 'pending' | 'cleared' | 'failed';
  referenceId?: string; // bookingId or orderId
  clearedAt?: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  currency: 'NGN';
  availableBalanceNaira: number;
  pendingBalanceNaira: number;
  totalEarnedBookingsNaira: number;
  totalEarnedAffiliateNaira: number;
  totalWithdrawnNaira: number;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
}


