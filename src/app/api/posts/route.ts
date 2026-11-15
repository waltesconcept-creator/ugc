import { NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/server-db';
import type { Post } from '@/lib/types';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Post = await request.json();

    if (!body.creatorId || !body.caption) {
      return NextResponse.json({ error: 'Missing required post fields' }, { status: 400 });
    }

    const saved = await createPost({
      ...body,
      id: body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, post: saved });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
