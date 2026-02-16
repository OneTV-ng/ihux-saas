import { NextRequest, NextResponse } from 'next/server';
import { getProfileDefaults, createSongDefaults } from '@/lib/profile-service';

/**
 * GET /api/profile/defaults
 * Get default values for song/track submission based on user and artist
 *
 * Query params:
 * - userId: required (user ID)
 * - artistId: optional (artist ID for cascading defaults)
 * - coverFileName: optional (to extract song title)
 * - mp3FileName: optional (to extract track title)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const artistId = searchParams.get('artistId');
    const coverFileName = searchParams.get('coverFileName');
    const mp3FileName = searchParams.get('mp3FileName');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get profile defaults with cascade
    const defaults = await getProfileDefaults(userId, artistId || undefined);

    // If filenames provided, extract titles
    if (coverFileName || mp3FileName) {
      const songDefaults = await createSongDefaults(
        userId,
        artistId || '',
        coverFileName || undefined,
        mp3FileName || undefined
      );
      return NextResponse.json({
        success: true,
        defaults: songDefaults,
      });
    }

    return NextResponse.json({
      success: true,
      defaults,
    });
  } catch (error) {
    console.error('Error fetching profile defaults:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile defaults' },
      { status: 500 }
    );
  }
}
