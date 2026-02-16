import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendPinEmail } from '@/lib/email';

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      // Don't reveal if email exists (security)
      return NextResponse.json({
        success: true,
        message: 'If email exists, password reset link has been sent',
      });
    }

    // Generate reset PIN
    const resetPin = Math.random().toString().slice(2, 8); // 6 digit code

    // TODO: Store PIN in database with expiration (15 minutes)
    // For now, we'll just send it via email

    // Send reset PIN email
    await sendPinEmail({
      to: user[0].email,
      pin: resetPin,
      type: 'reset'
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
