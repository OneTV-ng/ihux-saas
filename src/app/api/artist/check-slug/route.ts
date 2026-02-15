import { NextRequest, NextResponse } from "next/server";
import { checkSlugAvailability } from "@/lib/artist-service";

/**
 * GET /api/artist/check-slug?name=artist-name
 * Check if an artist name/slug is available
 * Used for real-time validation during artist creation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    const result = await checkSlugAvailability(name);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Check slug error:", error);
    return NextResponse.json(
      { error: "Failed to check artist name availability" },
      { status: 500 }
    );
  }
}
