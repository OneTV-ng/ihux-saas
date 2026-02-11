import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserArtists,
  getArtistById,
  createArtist,
  updateArtist,
  updateArtistProfile,
  deleteArtist,
  canUserCreateArtist,
  getUserSelectedArtist,
  setUserSelectedArtist,
  clearUserSelectedArtist,
} from "@/lib/artist-service";

// GET - Fetch all user's artists or specific artist
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("id");
    const checkSelected = searchParams.get("selected") === "true";

    // Get selected artist
    if (checkSelected) {
      const selectedArtist = await getUserSelectedArtist(session.user.id);
      return NextResponse.json({
        success: true,
        data: selectedArtist,
      });
    }

    // Get specific artist
    if (artistId) {
      const artist = await getArtistById(artistId);
      if (!artist || artist.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Artist not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: artist,
      });
    }

    // Get all user's artists
    const artists = await getUserArtists(session.user.id);
    const selectedArtist = await getUserSelectedArtist(session.user.id);

    // Check if user can create more artists
    const canCreate = await canUserCreateArtist(
      session.user.id,
      session.user.role || "new"
    );

    return NextResponse.json({
      success: true,
      data: {
        artists,
        selectedArtist,
        canCreate,
      },
    });
  } catch (error: any) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

// POST - Create new artist
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      artistName,
      displayName,
      bio,
      gender,
      city,
      country,
      genre,
      recordLabel,
      birthday,
      contact,
      picture,
      socialMedia,
      mediaPlatform
    } = body;

    // Validate required fields
    if (!artistName || !displayName) {
      return NextResponse.json(
        { error: "Artist name and display name are required" },
        { status: 400 }
      );
    }

    // Check if user can create artists
    const canCreate = await canUserCreateArtist(
      session.user.id,
      session.user.role || "new"
    );

    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason || "Cannot create more artists" },
        { status: 403 }
      );
    }

    // Create artist
    const artist = await createArtist(session.user.id, {
      artistName,
      displayName,
      bio,
      gender,
      city,
      country,
      genre,
      recordLabel,
      birthday: birthday ? new Date(birthday) : undefined,
      contact,
      picture,
      socialMedia,
      mediaPlatform,
    });

    // If this is the user's first artist, set it as selected
    const artists = await getUserArtists(session.user.id);
    if (artists.length === 1) {
      await setUserSelectedArtist(session.user.id, artist.id);
    }

    return NextResponse.json({
      success: true,
      message: "Artist created successfully",
      data: artist,
    });
  } catch (error: any) {
    console.error("Error creating artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create artist" },
      { status: 500 }
    );
  }
}

// PUT - Update artist
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, picture, gallery, socialMedia, mediaPlatform, thumbnails, ...artistData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    // Update artist business data
    const updatedArtist = await updateArtist(id, session.user.id, artistData);

    // Update profile data if any profile fields are provided
    const profileData: Record<string, any> = {};
    if (picture !== undefined) profileData.picture = picture;
    if (gallery !== undefined) profileData.gallery = gallery;
    if (socialMedia !== undefined) profileData.socialMedia = socialMedia;
    if (mediaPlatform !== undefined) profileData.mediaPlatform = mediaPlatform;
    if (thumbnails !== undefined) profileData.thumbnails = thumbnails;

    let updatedProfile = null;
    if (Object.keys(profileData).length > 0) {
      updatedProfile = await updateArtistProfile(id, session.user.id, profileData);
    }

    // Fetch the full combined artist to return
    const fullArtist = await getArtistById(id);

    return NextResponse.json({
      success: true,
      message: "Artist updated successfully",
      data: fullArtist,
    });
  } catch (error: any) {
    console.error("Error updating artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update artist" },
      { status: 500 }
    );
  }
}

// DELETE - Delete artist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("id");

    if (!artistId) {
      return NextResponse.json(
        { error: "Artist ID is required" },
        { status: 400 }
      );
    }

    await deleteArtist(artistId, session.user.id);

    // If deleted artist was selected, clear selection
    const selectedArtist = await getUserSelectedArtist(session.user.id);
    if (selectedArtist?.id === artistId) {
      await clearUserSelectedArtist(session.user.id);
    }

    return NextResponse.json({
      success: true,
      message: "Artist deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting artist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete artist" },
      { status: 500 }
    );
  }
}
