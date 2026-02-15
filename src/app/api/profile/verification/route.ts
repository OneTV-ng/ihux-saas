import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserVerification } from '@/lib/user-verification';

/**
 * GET /api/profile/verification
 * Get user's verification status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const verification = await getUserVerification(session.user.id);

    return NextResponse.json({
      success: true,
      data: verification || {
        status: 'updating',
        completionPercentage: '0',
      },
    });
  } catch (error) {
    console.error('Verification fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
