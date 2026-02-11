import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { songs, tracks } from "@/db/music-schema";
import { eq, and, desc, sql, like, or, isNull } from "drizzle-orm";
import { DxlApiHandler, DxlApiContext, DxlApiResponse } from "@/lib/dxl-api-handler";

export class SongsHandler extends DxlApiHandler {
  async process(request: NextRequest, operation: string): Promise<DxlApiResponse> {
    const context = await this.extractContext(request);

    switch (operation) {
      case "list":
        return this.listSongs(request, context);
      case "get":
        return this.getSong(request, context);
      case "create":
        return this.createSong(request, context);
      case "update":
        return this.updateSong(request, context);
      case "delete":
        return this.deleteSong(request, context);
      default:
        return this.errorResponse(
          `songs.${operation}`,
          "songs",
          "Invalid operation",
          400,
          "BadRequest"
        );
    }
  }

  private async listSongs(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const { page, limit, offset } = this.getPaginationParams(request);
      
      const artist = url.searchParams.get("artist");
      const status = url.searchParams.get("status");
      const genre = url.searchParams.get("genre");
      const type = url.searchParams.get("type");
      const search = url.searchParams.get("search");

      // Build where conditions
      const conditions: any[] = [isNull(songs.deletedAt)];
      
      if (artist) conditions.push(like(songs.artistName, `%${artist}%`));
      if (status) conditions.push(eq(songs.status, status));
      if (genre) conditions.push(eq(songs.genre, genre));
      if (type) conditions.push(eq(songs.type, type));
      if (search) {
        conditions.push(
          or(
            like(songs.title, `%${search}%`),
            like(songs.artistName, `%${search}%`)
          )
        );
      }

      // User-specific filtering
      if (!this.checkAdminPermission(context) && context.userId) {
        conditions.push(eq(songs.artistId, context.userId));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      // Get total count (only for admin users with api_class >= 20)
      let total: number | undefined;
      if (this.checkPermission(context, 20)) {
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(songs)
          .where(whereClause);
        total = Number(countResult[0]?.count || 0);
      }

      // Get paginated results
      const results = await db
        .select()
        .from(songs)
        .where(whereClause)
        .orderBy(desc(songs.createdAt))
        .limit(limit)
        .offset(offset);

      const hasNext = results.length === limit;

      return this.successResponse(
        "songs.list",
        "songs",
        {
          ...(total !== undefined && { total }),
          page,
          limit,
          has_next: hasNext,
          items: results,
        },
        "Songs retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "songs.list",
        "songs",
        error.message || "Failed to retrieve songs",
        500,
        "InternalError"
      );
    }
  }

  private async getSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return this.errorResponse(
          "songs.get",
          "songs",
          "Song ID is required",
          400,
          "BadRequest",
          { field: "id" }
        );
      }

      const [song] = await db
        .select()
        .from(songs)
        .where(and(eq(songs.id, id), sql`${songs.deletedAt} IS NULL`));

      if (!song) {
        return this.errorResponse(
          "songs.get",
          "songs",
          "Song not found",
          404,
          "NotFound",
          { resource: "song", id }
        );
      }

      // Check permission for non-admin users
      if (!this.checkAdminPermission(context) && song.artistId !== context.userId) {
        return this.errorResponse(
          "songs.get",
          "songs",
          "Access denied",
          403,
          "Forbidden"
        );
      }

      // Get tracks
      const songTracks = await db
        .select()
        .from(tracks)
        .where(eq(tracks.songId, id))
        .orderBy(tracks.trackNumber);

      return this.successResponse(
        "songs.get",
        "songs",
        {
          ...song,
          tracks: songTracks,
        },
        "Song retrieved successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "songs.get",
        "songs",
        error.message || "Failed to retrieve song",
        500,
        "InternalError"
      );
    }
  }

  private async createSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "songs.create",
          "songs",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const body = await request.json();
      const {
        type,
        title,
        artist_id,
        genre,
        language = "en",
        upc,
        cover,
        tracks: trackData,
      } = body;

      // Validation
      if (!type || !title || !artist_id || !trackData || !Array.isArray(trackData)) {
        return this.errorResponse(
          "songs.create",
          "songs",
          "Missing required fields",
          422,
          "ValidationError",
          {
            required: ["type", "title", "artist_id", "tracks"],
          }
        );
      }

      // Get artist name from user table
      const artistUser = await db.query.user.findFirst({
        where: (users: any, { eq }: { eq: any }) => eq(users.id, artist_id),
      });

      if (!artistUser) {
        return this.errorResponse(
          "songs.create",
          "songs",
          "Artist not found",
          404,
          "NotFound",
          { field: "artist_id" }
        );
      }

      // Create song
      const songId = randomUUID();
      await db
        .insert(songs)
        .values({
          id: songId,
          title,
          artistId: artist_id,
          artistName: artistUser.name,
          type,
          genre,
          language,
          upc,
          cover,
          numberOfTracks: trackData.length,
          status: "new",
          createdBy: context.userId,
        });

      const [newSong] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, songId));

      // Create tracks
      const trackIds = trackData.map(() => randomUUID());
      await db
        .insert(tracks)
        .values(
          trackData.map((track: any, index: number) => ({
            id: trackIds[index],
            songId: newSong.id,
            trackNumber: track.track_number || index + 1,
            title: track.title,
            isrc: track.isrc,
            mp3: track.mp3,
            explicit: track.explicit || "no",
            lyrics: track.lyrics,
            leadVocal: track.lead_vocal,
            producer: track.producer,
            writer: track.writer,
          }))
        );

      const newTracks = await db
        .select()
        .from(tracks)
        .where(eq(tracks.songId, newSong.id));

      return this.successResponse(
        "songs.create",
        "songs",
        {
          id: newSong.id,
          title: newSong.title,
          artist_id: newSong.artistId,
          type: newSong.type,
          status: newSong.status,
          created_at: newSong.createdAt,
          tracks_count: newTracks.length,
        },
        "Song created successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "songs.create",
        "songs",
        error.message || "Failed to create song",
        500,
        "InternalError"
      );
    }
  }

  private async updateSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "songs.update",
          "songs",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return this.errorResponse(
          "songs.update",
          "songs",
          "Song ID is required",
          400,
          "BadRequest"
        );
      }

      // Check if song exists and user has permission
      const [existingSong] = await db
        .select()
        .from(songs)
        .where(and(eq(songs.id, id), sql`${songs.deletedAt} IS NULL`));

      if (!existingSong) {
        return this.errorResponse(
          "songs.update",
          "songs",
          "Song not found",
          404,
          "NotFound"
        );
      }

      if (!this.checkAdminPermission(context) && existingSong.artistId !== context.userId) {
        return this.errorResponse(
          "songs.update",
          "songs",
          "Access denied",
          403,
          "Forbidden"
        );
      }

      // Update song
      await db
        .update(songs)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(songs.id, id));

      const [updatedSong] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, id));

      return this.successResponse(
        "songs.update",
        "songs",
        {
          id: updatedSong.id,
          title: updatedSong.title,
          updated_at: updatedSong.updatedAt,
        },
        "Song updated successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "songs.update",
        "songs",
        error.message || "Failed to update song",
        500,
        "InternalError"
      );
    }
  }

  private async deleteSong(request: NextRequest, context: DxlApiContext): Promise<DxlApiResponse> {
    try {
      if (!context.userId) {
        return this.errorResponse(
          "songs.delete",
          "songs",
          "Authentication required",
          401,
          "Unauthorized"
        );
      }

      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return this.errorResponse(
          "songs.delete",
          "songs",
          "Song ID is required",
          400,
          "BadRequest"
        );
      }

      // Check if song exists and user has permission
      const [existingSong] = await db
        .select()
        .from(songs)
        .where(and(eq(songs.id, id), sql`${songs.deletedAt} IS NULL`));

      if (!existingSong) {
        return this.errorResponse(
          "songs.delete",
          "songs",
          "Song not found",
          404,
          "NotFound"
        );
      }

      if (!this.checkAdminPermission(context) && existingSong.artistId !== context.userId) {
        return this.errorResponse(
          "songs.delete",
          "songs",
          "Access denied",
          403,
          "Forbidden"
        );
      }

      // Soft delete
      await db
        .update(songs)
        .set({
          status: "deleted",
          deletedAt: new Date(),
        })
        .where(eq(songs.id, id));

      const [deletedSong] = await db
        .select()
        .from(songs)
        .where(eq(songs.id, id));

      return this.successResponse(
        "songs.delete",
        "songs",
        {
          id: deletedSong.id,
          status: "deleted",
          deleted_at: deletedSong.deletedAt,
        },
        "Song deleted successfully"
      );
    } catch (error: any) {
      return this.errorResponse(
        "songs.delete",
        "songs",
        error.message || "Failed to delete song",
        500,
        "InternalError"
      );
    }
  }
}
