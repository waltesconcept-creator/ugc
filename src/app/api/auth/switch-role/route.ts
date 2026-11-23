import { NextResponse } from 'next/server';
import { findUserById, updateUser } from '@/lib/server-db';
import type { CreatorDetails, ServicePackage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole || !['creator', 'business', 'guest'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Valid userId and newRole (creator, business, or guest) are required.' },
        { status: 400 }
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updates: any = {
      role: newRole,
      profile: {
        ...user.profile,
        role: newRole,
      },
    };

    // If switching to creator and details don't exist yet, initialize them
    if (newRole === 'creator' && !user.details) {
      const defaultDetails: CreatorDetails = {
        creatorId: user.id,
        categories: user.categories || ['Lifestyle'],
        contentFormats: ['UGC Video', 'Product Review'],
        languages: ['English'],
        ratingAvg: 5.0,
        ratingCount: 1,
        completedProjectsCount: 1,
        onTimeDeliveryRate: 100,
        repeatBookingRate: 50,
        qualityScore: 5.0,
        communicationScore: 5.0,
        timelinessScore: 5.0,
        verifiedTransactionsCount: 1,
        isAvailable: true,
        startingPriceCents: 5000,
        totalSocialViews: 1000,
      };

      const defaultServices: ServicePackage[] = [
        {
          id: `svc-${Date.now()}-1`,
          creatorId: user.id,
          title: 'Standard UGC Video',
          description: 'High-energy authentic vertical UGC video for social feeds, reels, and ads.',
          priceCents: 5000,
          currency: 'NGN',
          deliveryDays: 3,
          revisionsAllowed: 1,
          formatTag: 'UGC Video',
          isActive: true,
        },
      ];

      updates.details = defaultDetails;
      updates.services = defaultServices;
    }

    const updated = await updateUser(userId, updates);

    return NextResponse.json({
      success: true,
      user: updated,
      message: `Account switched to ${newRole === 'creator' ? 'Creator' : newRole === 'business' ? 'Business' : 'Consumer'} mode!`,
    });
  } catch (error: any) {
    console.error('Role switch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to switch account role.' },
      { status: 500 }
    );
  }
}
