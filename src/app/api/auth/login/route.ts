import { NextResponse } from 'next/server';
import { findUserByIdentifier, getDb } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Please enter your email, phone number, or username.' },
        { status: 400 }
      );
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with that email, phone, or username. Please sign up!' },
        { status: 404 }
      );
    }

    // If account has a password set and password is provided, verify it
    if (user.passwordHash && password && user.passwordHash !== password.trim()) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again or tap "Forgot Password?".' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: `Welcome back, ${user.profile.displayName}!`,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
