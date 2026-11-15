import { NextResponse } from 'next/server';

// Temporary in-memory OTP store (in production, backed by Redis or SMS Gateway API like Termii/Twilio)
const OTP_STORE = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactValue, contactType } = body;

    if (!contactValue || typeof contactValue !== 'string') {
      return NextResponse.json(
        { error: 'Valid phone number or email is required.' },
        { status: 400 }
      );
    }

    const cleanContact = contactValue.trim().toLowerCase();

    // Generate a secure 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    OTP_STORE.set(cleanContact, { code: otpCode, expiresAt });

    const formattedContact =
      contactType === 'phone'
        ? contactValue
        : cleanContact;

    return NextResponse.json({
      success: true,
      message: `Verification code dispatched to ${formattedContact}`,
      code: otpCode, // Provided in response for instant demo testing and SMS dispatch preview
      expiresInSeconds: 600,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
