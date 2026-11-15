import { NextResponse } from 'next/server';
import { getReviewsByCreatorId, createReview } from '@/lib/server-db';
import type { Review } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const reviews = await getReviewsByCreatorId(creatorId);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      creatorId,
      bookingId,
      projectTitle,
      reviewerName,
      reviewerAvatar,
      reviewerRole,
      overallRating,
      ratingQuality,
      ratingCommunication,
      ratingTimeliness,
      reviewText,
    } = body;

    if (!creatorId || !reviewerName || !reviewText || !overallRating) {
      return NextResponse.json(
        { error: 'Creator ID, reviewer name, rating, and feedback are required.' },
        { status: 400 }
      );
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      creatorId,
      bookingId: bookingId || `bk-ext-${Date.now()}`,
      projectTitle: projectTitle || 'Verified UGC Campaign',
      reviewerName: reviewerName.trim(),
      reviewerAvatar:
        reviewerAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
      reviewerRole: reviewerRole || 'business',
      overallRating: Math.min(5, Math.max(1, Number(overallRating))),
      ratingQuality: Math.min(5, Math.max(1, Number(ratingQuality || overallRating))),
      ratingCommunication: Math.min(
        5,
        Math.max(1, Number(ratingCommunication || overallRating))
      ),
      ratingTimeliness: Math.min(
        5,
        Math.max(1, Number(ratingTimeliness || overallRating))
      ),
      reviewText: reviewText.trim(),
      isVerifiedBooking: true,
      createdAt: new Date().toISOString(),
    };

    const saved = await createReview(newReview);

    return NextResponse.json({
      success: true,
      message: 'Verified review submitted successfully!',
      review: saved,
    });
  } catch (error: any) {
    console.error('Error saving review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
