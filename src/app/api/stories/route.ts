import { NextResponse } from 'next/server';
import { getAllStories, createStory } from '@/lib/server-db';
import type { Story } from '@/lib/types';

export async function GET() {
  try {
    const stories = await getAllStories();
    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Story = await request.json();

    if (!body.creatorId || !body.mediaUrl) {
      return NextResponse.json({ error: 'Missing required story fields' }, { status: 400 });
    }

    const saved = await createStory({
      ...body,
      id: body.id || `story-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: body.createdAt || 'Just now',
    });

    return NextResponse.json({ success: true, story: saved });
  } catch (error: any) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
  }
}
