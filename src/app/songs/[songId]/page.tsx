import { notFound } from "next/navigation";
import { db } from "@/db";
import { songs, artists, artistProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import React from "react";

async function getSongById(songId: string) {
  const [song] = await db
    .select({
      id: songs.id,
      title: songs.title,
      type: songs.type,
      genre: songs.genre,
      cover: songs.cover,
      numberOfTracks: songs.numberOfTracks,
      isFeatured: songs.isFeatured,
      createdAt: songs.createdAt,
      artistId: songs.artistId,
      artistName: songs.artistName,
    })
    .from(songs)
    .where(eq(songs.id, songId));
  if (!song) return null;

  // Get artist info
  const [artist] = await db
    .select({
      slug: artists.slug,
      displayName: artists.displayName,
    })
    .from(artists)
    .innerJoin(artistProfiles, eq(artists.id, artistProfiles.artistId))
    .where(and(eq(artists.userId, song.artistId), eq(artistProfiles.isPublic, true)))
    .limit(1);

  return {
    ...song,
    artistSlug: artist?.slug || null,
    artistDisplayName: artist?.displayName || song.artistName,
  };
}

export default async function SongDetailPage({ params }: { params: { songId: string } }) {
  const { songId } = params;
  const song = await getSongById(songId);
  if (!song) return notFound();

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {song.cover ? (
          <img src={song.cover} alt={song.title} className="w-64 h-64 object-cover rounded" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-muted rounded">
            <span className="text-4xl font-bold text-muted-foreground">🎵</span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
          <p className="text-lg mb-1">Artist: {song.artistDisplayName}</p>
          {song.genre && <p className="mb-1">Genre: {song.genre}</p>}
          {song.numberOfTracks && song.numberOfTracks > 1 && (
            <p className="mb-1">Tracks: {song.numberOfTracks}</p>
          )}
          <p className="text-muted-foreground text-sm mb-2">Song ID: {song.id}</p>
          {/* Add more song details, audio player, etc. here */}
        </div>
      </div>
    </main>
  );
}
