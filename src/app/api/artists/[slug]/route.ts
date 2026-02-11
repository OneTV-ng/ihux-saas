import { NextRequest, NextResponse } from "next/server";
import { getArtistBySlug } from "@/lib/artist-service";

// GET - Fetch artist by slug (public profile)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Artist slug is required" },
        { status: 400 }
      );
    }

    const artist = await getArtistBySlug(slug);

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Only return public artists
    if (!artist.profile.isPublic) {
      return NextResponse.json(
        { error: "Artist profile is not public" },
        { status: 404 }
      );
    }

    // Return only public information
    const publicData = {
      id: artist.id,
      displayName: artist.displayName,
      slug: artist.slug,
      bio: artist.bio,
      city: artist.city,
      country: artist.country,
      genre: artist.genre,
      recordLabel: artist.recordLabel,
      profile: {
        picture: artist.profile.picture,
        thumbnails: artist.profile.thumbnails,
        gallery: artist.profile.gallery,
        mediaPlatform: artist.profile.mediaPlatform,
        socialMedia: artist.profile.socialMedia,
        fanNews: artist.profile.fanNews,
        press: artist.profile.press,
        isPublic: artist.profile.isPublic,
        isVerified: artist.profile.isVerified,
        totalSongs: artist.profile.totalSongs,
        totalPlays: artist.profile.totalPlays,
        totalFollowers: artist.profile.totalFollowers,
      },
    };

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error: any) {
    console.error("Error fetching artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch artist" },
      { status: 500 }
    );
  }
}
