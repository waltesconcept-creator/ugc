import { NextResponse } from 'next/server';
import { findUserByIdentifier, updateUser } from '@/lib/server-db';

// In-memory reset code cache (expires in 10 minutes)
const RESET_CODES = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, identifier, code, newPassword } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email, phone number, or username is required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = await findUserByIdentifier(cleanIdentifier);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with that email, phone, or username.' },
        { status: 404 }
      );
    }

    // Step 1: Send Reset Code
    if (action === 'request_code') {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      RESET_CODES.set(cleanIdentifier, {
        code: generatedCode,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return NextResponse.json({
        success: true,
        message: `Reset code generated: ${generatedCode}`,
        code: generatedCode, // Delivered to client for instant simulation/testing
      });
    }

    // Step 2: Verify code and update password
    if (action === 'verify_and_reset') {
      if (!code || !newPassword) {
        return NextResponse.json(
          { error: 'Verification code and new password are required.' },
          { status: 400 }
        );
      }

      const cached = RESET_CODES.get(cleanIdentifier);
      if (!cached || cached.code !== code.trim()) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code. Please request a new one.' },
          { status: 400 }
        );
      }

      if (Date.now() > cached.expiresAt) {
        RESET_CODES.delete(cleanIdentifier);
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Update user password in database
      const updatedUser = await updateUser(user.id, {
        passwordHash: newPassword.trim(),
      });

      RESET_CODES.delete(cleanIdentifier);

      return NextResponse.json({
        success: true,
        user: updatedUser || user,
        message: 'Password reset successfully. You are now logged in.',
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process password reset.' },
      { status: 500 }
    );
  }
}
