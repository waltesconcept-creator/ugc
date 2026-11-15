import { NextResponse } from 'next/server';
import { createUser, findUserByIdentifier, UserAccount } from '@/lib/server-db';
import type { Profile, CreatorDetails } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      displayName,
      username,
      contactType, // 'email' | 'phone'
      contactValue, // email or phone
      country = 'United States',
      location = '',
      role = 'creator',
      categories = ['Lifestyle'],
      bio = '',
      avatarUrl = '',
      startingPrice = 50,
    } = body;

    if (!displayName || !username || !contactValue) {
      return NextResponse.json(
        { error: 'Display name, username, and contact info (email or phone) are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

    // Check if user already exists
    const existing = await findUserByIdentifier(contactValue);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalAvatar =
      avatarUrl ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face`;

    const newProfile: Profile = {
      id: userId,
      role: role as 'creator' | 'business' | 'guest',
      username: cleanUsername,
      displayName: displayName.trim(),
      avatarUrl: finalAvatar,
      bio: bio.trim() || `Global UGC creator based in ${location || country}. Let's create impactful content! 🎬✨`,
      location: location.trim() || country,
      country: country,
      website: '',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    const newDetails: CreatorDetails = {
      creatorId: userId,
      categories: Array.isArray(categories) && categories.length > 0 ? categories : ['Lifestyle'],
      contentFormats: ['UGC Ad', 'Product Review', 'Unboxing'],
      languages: ['English'],
      ratingAvg: 5.0,
      ratingCount: 1,
      completedProjectsCount: 0,
      onTimeDeliveryRate: 100,
      repeatBookingRate: 0,
      qualityScore: 5.0,
      communicationScore: 5.0,
      timelinessScore: 5.0,
      verifiedTransactionsCount: 0,
      isAvailable: true,
      startingPriceCents: Math.round(Number(startingPrice || 50) * 100),
      totalSocialViews: 1200,
    };

    const newAccount: UserAccount = {
      id: userId,
      email: contactType === 'email' ? contactValue.trim().toLowerCase() : undefined,
      phone: contactType === 'phone' ? contactValue.trim() : undefined,
      role: role as 'creator' | 'business' | 'guest',
      profile: newProfile,
      details: role === 'creator' ? newDetails : undefined,
      country,
      categories: Array.isArray(categories) ? categories : ['Lifestyle'],
      createdAt: new Date().toISOString(),
    };

    const created = await createUser(newAccount);

    return NextResponse.json({
      success: true,
      user: created,
      message: 'Account successfully created!',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
