-- =========================================================================
-- KRE8TOR CREATOR NETWORK — SUPABASE CLOUD DATABASE SCHEMA
-- =========================================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> Click "Run"

-- 1. USERS & CREATORS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'creator',
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB DEFAULT '{}'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  country TEXT DEFAULT 'Nigeria',
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. UGC POSTS & REELS
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  category TEXT NOT NULL,
  content_format TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  creator JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORIES & BEHIND-THE-SCENES (BTS)
CREATE TABLE IF NOT EXISTS public.stories (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration INT DEFAULT 15,
  caption TEXT,
  is_bts BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VERIFIED CLIENT REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  project_title TEXT,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  reviewer_role TEXT DEFAULT 'business',
  overall_rating NUMERIC NOT NULL DEFAULT 5.0,
  rating_quality NUMERIC NOT NULL DEFAULT 5.0,
  rating_communication NUMERIC NOT NULL DEFAULT 5.0,
  rating_timeliness NUMERIC NOT NULL DEFAULT 5.0,
  review_text TEXT,
  is_verified_booking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BRAND BOOKINGS & ESCROW
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  brief_title TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  package_title TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  escrow_status TEXT NOT NULL DEFAULT 'held',
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all content
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on users') THEN
    CREATE POLICY "Public read access on users" ON public.users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on posts') THEN
    CREATE POLICY "Public read access on posts" ON public.posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on stories') THEN
    CREATE POLICY "Public read access on stories" ON public.stories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on reviews') THEN
    CREATE POLICY "Public read access on reviews" ON public.reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on bookings') THEN
    CREATE POLICY "Public read access on bookings" ON public.bookings FOR SELECT USING (true);
  END IF;
END $$;

-- Allow insert/update with service role key
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role access on users') THEN
    CREATE POLICY "Service role access on users" ON public.users FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role access on posts') THEN
    CREATE POLICY "Service role access on posts" ON public.posts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role access on stories') THEN
    CREATE POLICY "Service role access on stories" ON public.stories FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role access on reviews') THEN
    CREATE POLICY "Service role access on reviews" ON public.reviews FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role access on bookings') THEN
    CREATE POLICY "Service role access on bookings" ON public.bookings FOR ALL USING (true);
  END IF;
END $$;
