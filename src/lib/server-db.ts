import fs from 'fs';
import path from 'path';
import type { Profile, CreatorDetails, Post, Story, Booking, ServicePackage, Review } from './types';
import {
  MOCK_PROFILES,
  MOCK_CREATOR_DETAILS,
  MOCK_POSTS,
  MOCK_STORIES,
  MOCK_BOOKINGS,
  MOCK_CREATORS,
} from './mock-data';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';

export interface UserAccount {
  id: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role: 'creator' | 'business' | 'guest';
  profile: Profile;
  details?: CreatorDetails;
  services?: ServicePackage[];
  country: string;
  categories?: string[];
  createdAt: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  posts: Post[];
  stories: Story[];
  bookings: Booking[];
  reviews?: Review[];
  version: number;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory exists
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Generate initial seeded database
function getInitialData(): DatabaseSchema {
  const seededUsers: UserAccount[] = MOCK_CREATORS.map((c) => ({
    id: c.profile.id,
    email: `${c.profile.username}@kre8tor.com`,
    phone: '+1555000000',
    role: 'creator',
    profile: c.profile,
    details: c.details,
    country: c.profile.country || 'United States',
    categories: c.details.categories,
    createdAt: c.profile.createdAt,
  }));

  return {
    users: seededUsers,
    posts: MOCK_POSTS,
    stories: MOCK_STORIES,
    bookings: MOCK_BOOKINGS,
    version: 2,
  };
}

// Read database from disk
export async function getDb(): Promise<DatabaseSchema> {
  ensureDbDir();
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      await saveDb(initial);
      return initial;
    }
    const data = await fs.promises.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as DatabaseSchema;
    return parsed;
  } catch (error) {
    console.error('Error reading db.json, returning initial seed:', error);
    return getInitialData();
  }
}

// Save database atomically
export async function saveDb(data: DatabaseSchema): Promise<void> {
  ensureDbDir();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  await fs.promises.rename(tempFile, DB_FILE);
}

// Auth helpers
export async function findUserByIdentifier(identifier: string): Promise<UserAccount | undefined> {
  const db = await getDb();
  const clean = identifier.trim().toLowerCase();
  return db.users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === clean) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '')) ||
      (u.profile.username && u.profile.username.toLowerCase() === clean)
  );
}

export async function findUserById(id: string): Promise<UserAccount | undefined> {
  const db = await getDb();
  return db.users.find((u) => u.id === id);
}

// Safe background Supabase sync helper
async function syncToSupabase(table: string, data: Record<string, any>) {
  if (!isSupabaseConfigured || !supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from(table).upsert(data);
    if (error) {
      console.warn(`Supabase ${table} sync:`, error.message);
    }
  } catch (err: any) {
    console.warn(`Supabase ${table} error:`, err?.message || err);
  }
}

export async function createUser(user: UserAccount): Promise<UserAccount> {
  const db = await getDb();
  // Check if already exists
  const existingIndex = db.users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    db.users[existingIndex] = user;
  } else {
    db.users.unshift(user);
  }
  await saveDb(db);

  // Cloud Supabase sync
  syncToSupabase('users', {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile: user.profile,
    details: user.details,
    services: user.services,
    country: user.country,
    categories: user.categories,
    created_at: user.createdAt,
  });

  return user;
}

export async function updateUser(
  userId: string,
  partial: Partial<UserAccount>
): Promise<UserAccount | null> {
  const db = await getDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...partial,
    profile: {
      ...db.users[index].profile,
      ...(partial.profile || {}),
    },
    details: db.users[index].details
      ? {
          ...db.users[index].details!,
          ...(partial.details || {}),
        }
      : partial.details,
    services: partial.services !== undefined ? partial.services : db.users[index].services,
  };

  await saveDb(db);

  syncToSupabase('users', {
    id: db.users[index].id,
    email: db.users[index].email,
    phone: db.users[index].phone,
    role: db.users[index].role,
    profile: db.users[index].profile,
    details: db.users[index].details,
    services: db.users[index].services,
    country: db.users[index].country,
    categories: db.users[index].categories,
  });

  return db.users[index];
}

// Post helpers
export async function getAllPosts(): Promise<Post[]> {
  const db = await getDb();
  return db.posts;
}

export async function createPost(post: Post): Promise<Post> {
  const db = await getDb();
  db.posts.unshift(post);
  await saveDb(db);

  // Cloud Supabase sync
  syncToSupabase('posts', {
    id: post.id,
    creator_id: post.creatorId,
    caption: post.caption,
    media_type: post.mediaType || 'video',
    media_url: post.videoUrl,
    thumbnail_url: post.thumbnailUrl,
    likes_count: post.likesCount,
    saves_count: post.savesCount,
    comments_count: post.commentsCount || 0,
    views_count: post.viewsCount,
    category: post.category,
    content_format: post.contentFormat,
    creator: post.creator,
    created_at: post.createdAt,
  });

  return post;
}

// Story helpers
export async function getAllStories(): Promise<Story[]> {
  const db = await getDb();
  return db.stories;
}

export async function createStory(story: Story): Promise<Story> {
  const db = await getDb();
  db.stories.unshift(story);
  await saveDb(db);

  // Cloud Supabase sync
  syncToSupabase('stories', {
    id: story.id,
    creator_id: story.creatorId,
    creator_name: story.creatorName,
    creator_avatar: story.creatorAvatar,
    video_url: story.mediaUrl,
    thumbnail_url: story.thumbnailUrl,
    caption: story.caption,
    created_at: story.createdAt,
  });

  return story;
}

// Review helpers
export async function getReviewsByCreatorId(creatorId: string): Promise<Review[]> {
  const db = await getDb();
  if (!db.reviews || !Array.isArray(db.reviews)) return [];
  return db.reviews.filter((r) => r.creatorId === creatorId);
}

export async function createReview(review: Review): Promise<Review> {
  const db = await getDb();
  if (!db.reviews || !Array.isArray(db.reviews)) {
    db.reviews = [];
  }
  db.reviews.unshift(review);

  // If target creator exists, recompute reputation stats
  if (review.creatorId) {
    const creatorIndex = db.users.findIndex((u) => u.id === review.creatorId);
    if (creatorIndex >= 0 && db.users[creatorIndex].details) {
      const creatorReviews = db.reviews.filter((r) => r.creatorId === review.creatorId);
      const totalReviews = creatorReviews.length;
      const avgOverall =
        creatorReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews;
      const avgQuality =
        creatorReviews.reduce(
          (sum, r) => sum + (r.ratingQuality || r.overallRating),
          0
        ) / totalReviews;
      const avgComm =
        creatorReviews.reduce(
          (sum, r) => sum + (r.ratingCommunication || r.overallRating),
          0
        ) / totalReviews;
      const avgTime =
        creatorReviews.reduce(
          (sum, r) => sum + (r.ratingTimeliness || r.overallRating),
          0
        ) / totalReviews;

      db.users[creatorIndex].details = {
        ...db.users[creatorIndex].details!,
        ratingAvg: Math.round(avgOverall * 10) / 10,
        ratingCount: totalReviews,
        qualityScore: Math.round(avgQuality * 10) / 10,
        communicationScore: Math.round(avgComm * 10) / 10,
        timelinessScore: Math.round(avgTime * 10) / 10,
        completedProjectsCount: Math.max(
          db.users[creatorIndex].details!.completedProjectsCount || 0,
          totalReviews
        ),
      };
    }
  }

  await saveDb(db);

  // Cloud Supabase sync
  syncToSupabase('reviews', {
    id: review.id,
    creator_id: review.creatorId,
    booking_id: review.bookingId,
    project_title: review.projectTitle,
    reviewer_name: review.reviewerName,
    reviewer_avatar: review.reviewerAvatar,
    reviewer_role: review.reviewerRole,
    overall_rating: review.overallRating,
    rating_quality: review.ratingQuality,
    rating_communication: review.ratingCommunication,
    rating_timeliness: review.ratingTimeliness,
    review_text: review.reviewText,
    is_verified_booking: review.isVerifiedBooking,
    created_at: review.createdAt,
  });

  return review;
}
