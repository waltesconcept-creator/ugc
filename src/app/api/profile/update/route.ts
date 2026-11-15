import { NextResponse } from 'next/server';
import { updateUser, findUserById } from '@/lib/server-db';
import type { ServicePackage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      displayName,
      bio,
      location,
      country,
      startingPrice,
      categories,
      services,
      instagramHandle,
      tiktokHandle,
      youtubeHandle,
      website,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const cleanHandle = (h?: string) => (h ? h.replace(/^@/, '').trim() : undefined);

    const updatedStartingCents = startingPrice !== undefined
      ? Math.round(Number(startingPrice) * 100)
      : existingUser.details?.startingPriceCents || 5000;

    const updatedUser = await updateUser(userId, {
      profile: {
        ...existingUser.profile,
        displayName: displayName !== undefined ? displayName.trim() : existingUser.profile.displayName,
        bio: bio !== undefined ? bio.trim() : existingUser.profile.bio,
        location: location !== undefined ? location.trim() : existingUser.profile.location,
        country: country !== undefined ? country.trim() : existingUser.profile.country,
        website: website !== undefined ? website.trim() : existingUser.profile.website,
      },
      details: existingUser.details
        ? {
            ...existingUser.details,
            categories: Array.isArray(categories) ? categories : existingUser.details.categories,
            startingPriceCents: updatedStartingCents,
            instagramHandle: instagramHandle !== undefined ? cleanHandle(instagramHandle) : existingUser.details.instagramHandle,
            tiktokHandle: tiktokHandle !== undefined ? cleanHandle(tiktokHandle) : existingUser.details.tiktokHandle,
            youtubeHandle: youtubeHandle !== undefined ? cleanHandle(youtubeHandle) : existingUser.details.youtubeHandle,
          }
        : undefined,
      services: Array.isArray(services) ? services : existingUser.services,
      categories: Array.isArray(categories) ? categories : existingUser.categories,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
